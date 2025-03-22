import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { extractTextFromPDF, identifyCities, textContainsSearchTerm, getTextSnippet, ITALIAN_CITIES } from '../utils/pdfUtils';
import multer from 'multer';
import { prisma } from '../server';

// Rimosso l'import esplicito dei tipi
// I file .d.ts vengono riconosciuti automaticamente da TypeScript
// senza bisogno di importarli esplicitamente

const prismaClient = new PrismaClient();

// Directory per i file caricati
const UPLOADS_DIR = path.resolve(__dirname, '../../../uploads');

// Assicuriamoci che la directory esista
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configurazione di Multer per il caricamento dei file
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Solo i file PDF sono supportati'));
    }
  }
});

// Funzione di utility per normalizzare i percorsi dei file
const normalizeFilePath = (filePath: string): string => {
  // Assicura che tutti i percorsi siano assoluti
  if (!path.isAbsolute(filePath)) {
    const uploadsDir = path.resolve(__dirname, '../../../uploads');
    return path.join(uploadsDir, path.basename(filePath));
  }
  return filePath;
};

// Funzione di utility per ottenere il percorso relativo di un file
const getRelativeFilePath = (filePath: string): string => {
  const uploadsDir = path.resolve(__dirname, '../../../uploads');
  const basename = path.basename(filePath);
  return `/uploads/${basename}`;
};

// GET /api/documents - Ottieni tutti i documenti
export const getAllDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { searchTerm, cities } = req.query;
    
    let documents;

    // Se l'utente è autenticato, mostra tutti i documenti
    if (userId) {
      documents = await prismaClient.document.findMany({
        orderBy: { uploadDate: 'desc' }
      });
    } else {
      // Filtra solo i documenti pubblici per utenti non autenticati
      documents = await prismaClient.document.findMany({
        orderBy: {
          uploadDate: "desc"
        }
      });
    }

    // Filtriamo i documenti in base al searchTerm e alle città, se specificati
    if (searchTerm || cities) {
      const citiesArray = cities ? 
        (Array.isArray(cities) ? cities as string[] : [cities as string]) : 
        [];
      
      const filteredDocuments = await filterDocuments(
        documents, 
        searchTerm as string, 
        citiesArray
      );
      
      res.json({ documents: filteredDocuments });
    } else {
      res.json({ documents });
    }
  } catch (err) {
    console.error('Errore nel recupero dei documenti:', err);
    res.status(500).json({ message: 'Errore nel recupero dei documenti' });
  }
};

// Funzione di filtro avanzata
async function filterDocuments(documents: any[], searchTerm?: string, cities?: string[]): Promise<any[]> {
  if (!searchTerm && (!cities || cities.length === 0)) {
    return documents;
  }
  
  // Filtro per termine di ricerca
  let filteredDocs = documents;
  if (searchTerm) {
    const normalizedSearchTerm = searchTerm.toLowerCase();
    filteredDocs = documents.filter(doc => {
      // Cerca nel titolo
      const titleMatch = doc.title.toLowerCase().includes(normalizedSearchTerm);
      
      // Cerca nella descrizione
      const descriptionMatch = doc.description && 
                               doc.description.toLowerCase().includes(normalizedSearchTerm);
      
      // Cerca nelle parole chiave
      const keywordsMatch = doc.keywords.some((keyword: string) => 
                             keyword.toLowerCase().includes(normalizedSearchTerm));
      
      // Cerca nel contenuto testuale del PDF
      const contentMatch = doc.content && textContainsSearchTerm(doc.content, normalizedSearchTerm);
      
      // Se la corrispondenza è nel contenuto, estrai uno snippet di testo
      if (contentMatch && doc.content) {
        // Aggiungi lo snippet al documento
        doc.textSnippet = getTextSnippet(doc.content, searchTerm, 150);
      }
      
      return titleMatch || descriptionMatch || keywordsMatch || contentMatch;
    });
  }
  
  // Filtro per città
  if (cities && cities.length > 0) {
    filteredDocs = filteredDocs.filter(doc => {
      // Se il documento non ha città associate, escludilo
      if (!doc.cities || doc.cities.length === 0) return false;
      
      // Verifica se almeno una delle città richieste è presente nel documento
      return cities.some((city: string) => 
        doc.cities.includes(city)
      );
    });
  }
  
  return filteredDocs;
}

// GET /api/documents/:id - Ottieni un documento specifico
export const getDocumentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const document = await prismaClient.document.findUnique({
      where: { id }
    });

    if (!document) {
      res.status(404).json({ message: 'Documento non trovato' });
      return;
    }

    // Incrementa il contatore di visualizzazioni
    await prismaClient.document.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    res.status(200).json({ document });
  } catch (error) {
    console.error('Errore durante il recupero del documento:', error);
    res.status(500).json({ message: 'Errore durante il recupero del documento' });
  }
};

/**
 * Pulisce e normalizza un nome file, rimuovendo caratteri speciali e sostituendo spazi
 */
const sanitizeFileName = (fileName: string): string => {
  // Rimuovi caratteri non alfanumerici tranne punti e trattini
  const cleanName = fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Rimuove accenti
    .replace(/[^a-zA-Z0-9_\-\.]/g, '_');  // Sostituisce caratteri speciali con underscore
  
  return cleanName;
};

// POST /api/documents - Carica un nuovo documento
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    console.log("Richiesta di caricamento documento ricevuta");
    if (!req.file) {
      console.log("Nessun file ricevuto");
      return res.status(400).json({ message: 'Nessun file caricato' });
    }

    const userId = (req as any).user?.id;
    if (!userId) {
      console.log("UserID non trovato nella richiesta");
      return res.status(401).json({ message: 'Utente non autenticato' });
    }

    console.log(`File ricevuto: ${req.file.originalname}, Dimensione: ${req.file.size} bytes`);
    
    // Utilizza il nome file originale sanitizzato anziché generare un UUID
    const sanitizedFileName = sanitizeFileName(req.file.originalname);
    const uploadsDir = path.resolve(process.env.UPLOADS_DIR || 'uploads');
    
    // Assicurati che la directory esista
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`Directory uploads creata: ${uploadsDir}`);
    }
    
    const filePath = path.join(uploadsDir, sanitizedFileName);
    const fileUrl = `/uploads/${sanitizedFileName}`;
    
    console.log(`Salvataggio file in: ${filePath}`);
    console.log(`URL del file: ${fileUrl}`);
    
    // Scrivi il file su disco
    fs.writeFileSync(filePath, req.file.buffer);
    
    // Estrai il testo dal PDF se è un file PDF
    let content = '';
    let cities: string[] = [];
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (fileExtension === '.pdf') {
      console.log('Estrazione testo dal PDF...');
      content = await extractTextFromPDF(filePath);
      
      // Estrai il titolo dal nome del file originale
      const title = req.file.originalname.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
      
      // Identifica le città nel testo e nel titolo
      cities = identifyCities(content, title);
      console.log(`Città identificate: ${cities.join(', ')}`);
    }
    
    // Ottieni altri campi dalla richiesta
    const { title, description, keywords } = req.body;
    const keywordArray = keywords ? keywords.split(',').map((k: string) => k.trim()) : [];
    
    // Salva il documento nel database
    const document = await prismaClient.document.create({
      data: {
        title: title || req.file.originalname.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
        description: description || "",
        keywords: keywordArray,
        filePath,
        fileUrl,
        fileSize: req.file.size,
        user: {
          connect: { id: userId }
        },
        content,
        cities
      }
    });
    
    console.log(`Documento salvato nel database con ID: ${document.id}`);
    res.status(201).json({ 
      message: 'Documento caricato con successo',
      document
    });
  } catch (error) {
    console.error('Errore durante il caricamento del documento:', error);
    res.status(500).json({ 
      message: 'Errore durante il caricamento del documento',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// PUT /api/documents/:id - Aggiorna un documento
export const updateDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, keywords } = req.body;
    const userId = (req as any).user?.id;

    // Verifica se l'utente ha i permessi per modificare il documento
    const document = await prismaClient.document.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!document) {
      res.status(404).json({ message: 'Documento non trovato o non autorizzato' });
      return;
    }

    // Aggiorna il documento
    const updatedDocument = await prismaClient.document.update({
      where: { id },
      data: {
        title,
        description,
        keywords
      }
    });

    // Aggiorna le città solo se il titolo è cambiato e abbiamo il contenuto del documento
    if (title !== document.title && document.content) {
      const cities = identifyCities(document.content, title);
      await prismaClient.document.update({
        where: { id },
        data: { cities }
      });
    }

    res.status(200).json({ document: updatedDocument });
  } catch (error) {
    console.error('Errore durante l\'aggiornamento del documento:', error);
    res.status(500).json({ message: 'Errore durante l\'aggiornamento del documento' });
  }
};

// DELETE /api/documents/:id - Elimina un documento
export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    // Ottieni il documento
    const document = await prismaClient.document.findUnique({
      where: { id }
    });

    if (!document) {
      res.status(404).json({ message: 'Documento non trovato' });
      return;
    }

    // Verifica che l'utente sia il proprietario o un admin
    if (document.userId !== userId && userRole !== 'ADMIN') {
      res.status(403).json({ message: 'Non autorizzato' });
      return;
    }

    // Elimina il file fisico
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Elimina il documento dal database
    await prismaClient.document.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Documento eliminato con successo' });
  } catch (error) {
    console.error('Errore durante l\'eliminazione del documento:', error);
    res.status(500).json({ message: 'Errore durante l\'eliminazione del documento' });
  }
};

// POST /api/documents/:id/download - Incrementa il contatore di download e scarica il file
export const incrementDownloadCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`Richiesta download per documento ID: ${id}`);

    const document = await prismaClient.document.update({
      where: { id },
      data: { downloadCount: { increment: 1 } }
    });

    console.log(`Documento trovato:`, JSON.stringify(document, null, 2));

    // Controlla se il file esiste
    if (!document || !document.filePath) {
      console.error(`File non trovato: percorso mancante`);
      res.status(404).json({ message: 'File non trovato: percorso mancante' });
      return;
    }

    // Ottieni il nome del file dal percorso
    const filename = path.basename(document.filePath);
    console.log(`Nome file estratto: ${filename}`);
    
    // Prova a trovare il file in vari percorsi
    // 1. Usa process.cwd() per garantire un percorso assoluto corretto
    const rootUploadsDir = path.resolve(process.cwd(), 'uploads');
    // 2. Usa il percorso relativo alla directory del server
    const serverUploadsDir = path.resolve(process.cwd(), 'server/uploads');
    // 3. Usa il percorso dalla configurazione del controller
    const controllerUploadsDir = path.resolve(__dirname, '../../../uploads');
    
    // Crea un array di possibili percorsi dove cercare il file
    const possiblePaths = [
      // Se il percorso nel DB è assoluto, usalo
      document.filePath,
      // Altrimenti prova varie combinazioni
      path.join(rootUploadsDir, filename),
      path.join(serverUploadsDir, filename),
      path.join(controllerUploadsDir, filename),
      // Prova anche con il solo nome file
      filename
    ];
    
    console.log("Possibili percorsi per trovare il file:");
    possiblePaths.forEach(p => console.log(`- ${p} (esiste: ${fs.existsSync(p)})`));
    
    // Trova il primo percorso che esiste
    const existingPath = possiblePaths.find(p => fs.existsSync(p));
    
    if (existingPath) {
      console.log(`File trovato al percorso: ${existingPath}, invio...`);
      return res.download(existingPath, filename);
    } else {
      console.log(`File non trovato in nessun percorso. Restituisco URL relativo.`);
      // Invece di restituire un errore, restituiamo il percorso relativo
      // Il client lo userà per accedere direttamente al file
      return res.json({ fileUrl: `/uploads/${filename}` });
    }
  } catch (error) {
    console.error('Errore durante l\'incremento del contatore di download:', error);
    res.status(500).json({ message: 'Errore durante l\'incremento del contatore di download' });
  }
};

// GET /api/documents/cities - Ottieni tutte le città disponibili
export const getAllCities = async (_: Request, res: Response) => {
  try {
    // Ottieni tutte le città uniche dai documenti
    const documents = await prismaClient.document.findMany({
      select: {
        cities: true
      }
    });
    
    // Estrai e appiattisci l'array delle città
    const cities = Array.from(
      new Set(
        documents.flatMap(doc => doc.cities)
        .filter(city => !!city)
      )
    ).sort();
    
    res.status(200).json({ cities });
  } catch (error) {
    console.error('Errore durante il recupero delle città:', error);
    res.status(500).json({ message: 'Errore durante il recupero delle città' });
  }
};

// GET /api/documents/favorites - Ottieni i documenti preferiti dell'utente
export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Utente non autenticato' });
      return;
    }

    const favorites = await prismaClient.favorite.findMany({
      where: { userId },
      include: { document: true }
    });

    // Estrai i documenti dai preferiti
    const documents = favorites.map(favorite => favorite.document);

    res.status(200).json({ documents });
  } catch (error) {
    console.error('Errore durante il recupero dei documenti preferiti:', error);
    res.status(500).json({ message: 'Errore durante il recupero dei documenti preferiti' });
  }
};

// POST /api/documents/favorites - Aggiungi un documento ai preferiti
export const addToFavorites = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Utente non autenticato' });
      return;
    }

    // Verifica che il documento esista
    const document = await prismaClient.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      res.status(404).json({ message: 'Documento non trovato' });
      return;
    }

    // Verifica che il documento non sia già nei preferiti
    const existingFavorite = await prismaClient.favorite.findFirst({
      where: {
        userId,
        documentId
      }
    });

    if (existingFavorite) {
      res.status(400).json({ message: 'Documento già nei preferiti' });
      return;
    }

    // Aggiungi ai preferiti
    await prismaClient.favorite.create({
      data: {
        userId,
        documentId
      }
    });

    res.status(201).json({ message: 'Documento aggiunto ai preferiti' });
  } catch (error) {
    console.error('Errore durante l\'aggiunta ai preferiti:', error);
    res.status(500).json({ message: 'Errore durante l\'aggiunta ai preferiti' });
  }
};

// DELETE /api/documents/favorites/:id - Rimuovi un documento dai preferiti
export const removeFromFavorites = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Utente non autenticato' });
      return;
    }

    // Trova il preferito
    const favorite = await prismaClient.favorite.findFirst({
      where: {
        userId,
        documentId: id
      }
    });

    if (!favorite) {
      res.status(404).json({ message: 'Documento non trovato nei preferiti' });
      return;
    }

    // Rimuovi dai preferiti
    await prismaClient.favorite.delete({
      where: { id: favorite.id }
    });

    res.status(200).json({ message: 'Documento rimosso dai preferiti' });
  } catch (error) {
    console.error('Errore durante la rimozione dai preferiti:', error);
    res.status(500).json({ message: 'Errore durante la rimozione dai preferiti' });
  }
};

// GET /api/documents/admin/all - Ottieni tutti i documenti (admin)
export const getAllDocumentsAdmin = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;

    // Solo gli admin possono accedere a questa rotta
    if (userRole !== 'ADMIN') {
      res.status(403).json({ message: 'Non autorizzato' });
      return;
    }

    const documents = await prismaClient.document.findMany({
      orderBy: { uploadDate: 'desc' }
    });

    res.status(200).json({ documents });
  } catch (error) {
    console.error('Errore durante il recupero di tutti i documenti:', error);
    res.status(500).json({ message: 'Errore durante il recupero di tutti i documenti' });
  }
};

// POST /api/documents/bulk-upload - Carica multipli documenti in una volta sola
export const bulkUploadDocuments = async (req: Request, res: Response) => {
  try {
    console.log("Richiesta di caricamento multiplo ricevuta");
    console.log("User:", req.user);
    console.log("Files ricevuti:", req.files ? (Array.isArray(req.files) ? req.files.length : 'non è un array') : 'nessun file');
    
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (!userId || userRole !== 'ADMIN') {
      console.log("Accesso negato: userId o ruolo non validi", { userId, userRole });
      res.status(403).json({ message: 'Solo gli amministratori possono eseguire caricamenti multipli' });
      return;
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      console.log("Nessun file ricevuto o formato non valido");
      res.status(400).json({ message: 'Nessun file caricato' });
      return;
    }

    const results = {
      total: req.files.length,
      successful: 0,
      failed: 0,
      failedFiles: [] as string[]
    };

    console.log(`Elaborazione di ${req.files.length} file iniziata`);
    const uploadsDir = path.resolve(process.env.UPLOADS_DIR || 'uploads');
    
    // Assicurati che la directory esista
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`Directory uploads creata: ${uploadsDir}`);
    }

    // Processa ogni file
    for (const file of req.files as Express.Multer.File[]) {
      try {
        console.log(`Elaborazione file: ${file.originalname}`);
        
        // Utilizza il nome file originale sanitizzato
        const sanitizedFileName = sanitizeFileName(file.originalname);
        const filePath = path.join(uploadsDir, sanitizedFileName);
        const fileUrl = `/uploads/${sanitizedFileName}`;

        // Scrivi il file su disco
        fs.writeFileSync(filePath, file.buffer);
        
        console.log(`File salvato in: ${filePath}`);
        console.log(`URL del file: ${fileUrl}`);
        
        // Estrai il testo dal PDF se è un file PDF
        let content = '';
        let cities: string[] = [];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (fileExtension === '.pdf') {
          console.log('Estrazione testo dal PDF...');
          content = await extractTextFromPDF(filePath);
          
          // Estrai il titolo dal nome del file originale
          const title = file.originalname.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
          
          // Identifica le città nel testo e nel titolo
          cities = identifyCities(content, title);
          console.log(`Città identificate: ${cities.join(', ')}`);
        }

        // Salva il documento nel database
        const document = await prismaClient.document.create({
          data: {
            title: file.originalname.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
            description: "",
            keywords: [],
            filePath,
            fileUrl,
            fileSize: file.size,
            user: {
              connect: { id: userId }
            },
            content,
            cities
          }
        });
        console.log(`Documento salvato nel database con ID: ${document.id}`);

        results.successful++;
      } catch (error) {
        console.error(`Errore durante il caricamento del file ${file.originalname}:`, error);
        results.failed++;
        results.failedFiles.push(file.originalname);
      }
    }

    console.log(`Caricamento completato: ${results.successful} successi, ${results.failed} fallimenti`);
    
    res.status(200).json({ 
      message: `Caricamento multiplo completato. Caricati con successo: ${results.successful}, Falliti: ${results.failed}`,
      results 
    });
  } catch (error) {
    console.error('Errore durante il caricamento multiplo:', error);
    res.status(500).json({ 
      message: 'Errore durante il caricamento multiplo',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
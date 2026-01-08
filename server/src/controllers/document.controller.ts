import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { extractTextFromPDF, identifyCities, textContainsSearchTerm, getTextSnippet, ITALIAN_CITIES, calculateSimilarity } from '../utils/pdfUtils';
import multer from 'multer';
import { prisma } from '../server';

// Directory per i file caricati
const UPLOADS_DIR = path.resolve(__dirname, '../../../server/uploads');

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

const prismaClient = new PrismaClient();

// Funzione di utility per normalizzare i percorsi dei file
const normalizeFilePath = (filePath: string): string => {
  // Assicura che tutti i percorsi siano assoluti
  if (!path.isAbsolute(filePath)) {
    return path.join(UPLOADS_DIR, path.basename(filePath));
  }
  return filePath;
};

// Funzione di utility per ottenere il percorso relativo di un file
const getRelativeFilePath = (filePath: string): string => {
  const basename = path.basename(filePath);
  return `/server/uploads/${basename}`;
};

// GET /api/documents - Ottieni tutti i documenti con paginazione OTTIMIZZATA
export const getAllDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const startTime = Date.now();
    const userId = (req as any).user?.id;
    const { searchTerm, cities, page = '1', pageSize = '10' } = req.query;

    // Se non c'è searchTerm, usa versione semplice
    if (!searchTerm) {
      return await getRecentDocuments(req, res);
    }

    // QUERY OTTIMIZZATA POSTGRESQL FTS
    const citiesArray = cities ? (Array.isArray(cities) ? cities : [cities]) : [];
    
    const sql = `
      SELECT 
        d.id,
        d.title,
        d.description,
        d."fileUrl",
        d."uploadDate",
        d."viewCount", 
        d."downloadCount",
        d."favoriteCount",
        d.cities,
        d.keywords,
        ts_headline(
          'italian',
          COALESCE(d.content, ''),
          websearch_to_tsquery('italian', unaccent($1)),
          'StartSel=<mark>,StopSel=</mark>,MaxFragments=2,MaxWords=25,MinWords=10'
        ) AS snippet
      FROM documents d
      WHERE d.tsv @@ websearch_to_tsquery('italian', unaccent($1))
        AND ($2::text[] IS NULL OR EXISTS (
          SELECT 1 FROM unnest($2::text[]) AS city 
          WHERE d.title ILIKE '%' || city || '%'
        ))
      ORDER BY ts_rank_cd(d.tsv, websearch_to_tsquery('italian', unaccent($1))) DESC, d."uploadDate" DESC
      LIMIT $3 OFFSET $4;
    `;

    const pageNumber = parseInt(page as string, 10);
    const size = parseInt(pageSize as string, 10);
    const offset = (pageNumber - 1) * size;

    console.log(`[OPTIMIZED SEARCH] Query: "${searchTerm}", Cities: ${citiesArray.length}, Page: ${pageNumber}`);

    const documents = await prismaClient.$queryRawUnsafe(sql, 
      searchTerm, 
      citiesArray.length > 0 ? citiesArray : null, 
      size, 
      offset
    ) as any[];

    // Count query separata per performance
    const countSql = `
      SELECT COUNT(*) as total
      FROM documents d
      WHERE d.tsv @@ websearch_to_tsquery('italian', unaccent($1))
        AND ($2::text[] IS NULL OR EXISTS (
          SELECT 1 FROM unnest($2::text[]) AS city 
          WHERE d.title ILIKE '%' || city || '%'
        ));
    `;
    
    const countResult = await prismaClient.$queryRawUnsafe(countSql, 
      searchTerm, 
      citiesArray.length > 0 ? citiesArray : null
    ) as any[];
    
    const totalDocuments = parseInt(countResult[0]?.total || '0');
    const queryTime = Date.now() - startTime;

    // Processa risultati
    const processedDocs = documents.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      fileUrl: doc.fileUrl,
      uploadDate: doc.uploadDate,
      viewCount: doc.viewCount,
      downloadCount: doc.downloadCount,
      favoriteCount: doc.favoriteCount,
      cities: doc.cities,
      keywords: doc.keywords,
      content: doc.snippet
    }));

    console.log(`[OPTIMIZED SEARCH COMPLETE] "${searchTerm}" - ${processedDocs.length} results in ${queryTime}ms`);

    res.status(200).json({
      documents: processedDocs,
      page: pageNumber,
      pageSize: size,
      total: totalDocuments,
      totalPages: Math.ceil(totalDocuments / size),
      queryTime
    });

  } catch (error) {
    console.error(`[OPTIMIZED SEARCH ERROR] Query: "${req.query.searchTerm}":`, error);
    // Fallback alla versione originale
    return await getRecentDocuments(req, res);
  }
};

// GET /api/documents/admin - Controller amministrativo per documenti
export const getAllDocumentsAdmin = async (req: Request, res: Response) => {
  try {
    const { searchTerm, cities, page = '1', pageSize = '10' } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const size = parseInt(pageSize as string, 10);
    const skip = (pageNumber - 1) * size;

    console.log(`[API] GET /api/documents/admin - Parametri di paginazione:`, {
      page: pageNumber,
      pageSize: size,
      skip,
      searchTerm,
      citiesCount: cities ? (Array.isArray(cities) ? cities.length : 1) : 0
    });

    const citiesArray = cities
      ? (Array.isArray(cities) ? cities : [cities])
      : [];

    // SOLUZIONE: query semplificata per evitare errori di conversione
    let whereClause: any = {};
    
    // Aggiungi condizione di ricerca nel contenuto se specificata
    if (searchTerm) {
      whereClause.content = { 
        contains: searchTerm as string, 
        mode: 'insensitive' 
      };
    }
    
    // Aggiungi condizione per le città se specificate
    if (citiesArray.length > 0) {
      // Se abbiamo già un filtro di ricerca, dobbiamo usare AND
      if (searchTerm) {
        whereClause = {
          AND: [
            { content: { contains: searchTerm as string, mode: 'insensitive' } },
            { 
              OR: citiesArray.map((city) => ({ 
                title: { contains: city as string, mode: 'insensitive' } 
              }))
            }
          ]
        };
      } else {
        // Solo filtro per città
        whereClause = {
          OR: citiesArray.map((city) => ({ 
            title: { contains: city as string, mode: 'insensitive' } 
          }))
        };
      }
    }
    
    console.log('[API] Query admin semplificata:', JSON.stringify(whereClause, null, 2));
    
    // Esegui le query separatamente per evitare errori
    let documents;
    let totalDocuments;
    
    try {
      // Prima query: ottieni documenti
      documents = await prismaClient.document.findMany({
        where: whereClause,
        orderBy: { uploadDate: 'desc' },
        skip,
        take: size,
        select: {
          id: true,
          title: true,
          description: true,
          fileUrl: true,
          filePath: true,
          fileSize: true,
          uploadDate: true,
          viewCount: true,
          downloadCount: true,
          favoriteCount: true,
          keywords: true,
          cities: true,
          content: true
        }
      });
      
      // Seconda query: conta documenti
      totalDocuments = await prismaClient.document.count({
        where: whereClause
      });
    } catch (queryError) {
      console.error('[API] Errore nella query Prisma admin:', queryError);
      throw new Error('Errore nell\'esecuzione della query admin al database');
    }

    // Genera snippet migliori che evidenziano tutte le parole cercate
    if (searchTerm && searchTerm.toString().length > 0) {
      const searchWords = (searchTerm as string)
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 1);
        
      for (const doc of documents as any[]) {
        if (doc.content) {
          // Utilizza getTextSnippet con le parole multiple
          doc.content = getTextSnippet(doc.content, searchTerm as string, 200, searchWords);
        }
      }
    }

    res.status(200).json({ 
      documents,
      page: pageNumber,
      pageSize: size,
      total: totalDocuments,
      totalPages: Math.ceil(totalDocuments / size)
    });
  } catch (error) {
    console.error(`[API] Errore nella richiesta GET /api/documents/admin:`, error);
    res.status(500).json({ message: 'Errore nel recupero dei documenti.' });
  }
};

// GET /api/documents/favorites - Ottieni i documenti preferiti dell'utente
export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { page = '1', pageSize = '10' } = req.query;

    if (!userId) {
      return res.status(401).json({ message: 'Utente non autenticato' });
    }

    const pageNumber = parseInt(page as string, 10);
    const size = parseInt(pageSize as string, 10);
    const skip = (pageNumber - 1) * size;

    // Prima conta il totale dei preferiti
    const totalFavorites = await prismaClient.favorite.count({
      where: { userId }
    });

    // Poi ottieni i preferiti con paginazione
    const favorites = await prismaClient.favorite.findMany({
      where: { userId },
      include: { document: true },
      skip,
      take: size,
      orderBy: { createdAt: 'desc' }
    });

    // Estrai i documenti dai preferiti
    const documents = favorites.map(favorite => favorite.document);

    res.status(200).json({
      documents,
      page: pageNumber,
      pageSize: size,
      total: totalFavorites,
      totalPages: Math.ceil(totalFavorites / size)
    });
  } catch (error) {
    console.error('Errore durante il recupero dei documenti preferiti:', error);
    res.status(500).json({ message: 'Errore durante il recupero dei documenti preferiti' });
  }
};

// POST /api/documents - Carica un documento
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({ message: 'Utente non autenticato' });
    }

    if (!file) {
      return res.status(400).json({ message: 'Nessun file caricato' });
    }

    console.log(`[API] POST /api/documents - Caricamento documento:`, {
      filename: file.originalname,
      size: file.size,
      userId
    });

    // Conserva il nome file originale esatto senza modifiche
    const originalFileName = file.originalname;
    const filePath = path.join(UPLOADS_DIR, originalFileName);

    // Verifica se esiste già un documento con lo stesso filePath o nome file
    const existingDoc = await prismaClient.document.findFirst({
      where: {
        OR: [
          { filePath },
          { title: { equals: originalFileName, mode: 'insensitive' } }
        ]
      }
    });

    if (existingDoc) {
      console.log(`[API] Documento già esistente con lo stesso nome:`, {
        filename: originalFileName,
        existingId: existingDoc.id
      });
      return res.status(409).json({ 
        message: 'Un documento con lo stesso nome è già presente nel sistema',
        existingDocument: {
          id: existingDoc.id,
          title: existingDoc.title
        }
      });
    }

    // Salva il file nella directory di upload mantenendo il nome originale
    const destinationPath = path.join(UPLOADS_DIR, originalFileName);
    
    // Crea la directory se non esiste
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    
    // Scrive il file sul disco
    fs.writeFileSync(destinationPath, file.buffer);
    
    // Estrai il testo dal PDF
    const content = await extractTextFromPDF(destinationPath);
    
    // Identifica le città menzionate
    const cities = identifyCities(content, originalFileName);
    
    // Crea un record nel database usando il nome file originale senza modifiche
    const document = await prismaClient.document.create({
      data: {
        title: originalFileName, // Usa il nome completo come titolo (inclusa estensione)
        description: `Documento ${originalFileName}`,
        fileUrl: `/server/uploads/${originalFileName}`,
        filePath: destinationPath,
        fileSize: file.size,
        content,
        cities,
        keywords: cities, // Usa le città come parole chiave di base
        uploadDate: new Date(),
        viewCount: 0,
        downloadCount: 0,
        favoriteCount: 0,
        user: {
          connect: { id: userId }
        }
      }
    });
    
    console.log(`[API] Documento caricato con successo:`, {
      id: document.id,
      title: document.title
    });

    res.status(201).json({ 
      message: 'Documento caricato con successo',
      document: {
        id: document.id,
        title: document.title
      }
    });
  } catch (error) {
    console.error('Errore durante il caricamento del documento:', error);
    res.status(500).json({ message: 'Errore durante il caricamento del documento' });
  }
};

// GET /api/documents/cities - Lista tribunali principali (veloce)
export const getAllCities = async (req: Request, res: Response) => {
  try {
    console.log('[API] GET /api/documents/cities - Lista tribunali principali');
    
    // TUTTE LE CITTÀ CHE HAI ELENCATO - LISTA COMPLETA
    const ALL_TRIBUNALS = [
      'AQUILA', 'SPEZIA', 'AGRIGENTO', 'ALESSANDRIA', 'ANCONA', 'AOSTA', 'AREZZO', 
      'ASCOLI PICENO', 'ASTI', 'AVELLINO', 'AVEZZANO', 'BARCELLONA POZZO DI GOTTO', 'LIPARI',
      'BARI', 'BELLUNO', 'BENEVENTO', 'BERGAMO', 'BIELLA', 'BOLOGNA', 'BOLZANO', 'BRESCIA',
      'BRINDISI', 'BUSTO ARSIZIO', 'CAGLIARI', 'CALTAGIRONE', 'CALTANISSETTA', 'CAMPOBASSO',
      'CASSINO', 'CASTROVILLARI', 'CATANIA', 'CATANZARO', 'CHIETI', 'ORTONA', 'CIVITAVECCHIA',
      'COMO', 'COSENZA', 'CREMONA', 'CROTONE', 'CUNEO', 'ENNA', 'FERMO', 'FERRARA', 'FIRENZE',
      'FOGGIA', 'FORLÌ', 'FROSINONE', 'GELA', 'GENOVA', 'GORIZIA', 'GROSSETO', 'IMPERIA',
      'ISERNIA', 'IVREA', 'LAGONEGRO', 'LAMEZIA TERME', 'LANCIANO', 'ATESSA', 'LANUSEI',
      'LARINO', 'LATINA', 'LECCE', 'LECCO', 'LIVORNO', 'PORTOFERRAIO', 'LOCRI', 'LODI',
      'LUCCA', 'MACERATA', 'MANTOVA', 'MARSALA', 'MASSA', 'MATERA', 'MESSINA', 'MILANO',
      'MODENA', 'MONZA', 'NAPOLI', 'ISCHIA', 'NOCERA INFERIORE', 'NOLA', 'NOVARA', 'NUORO',
      'AVERSA', 'ORISTANO', 'PADOVA', 'PALERMO', 'PALMI', 'PAOLA', 'PARMA', 'PATTI', 'PAVIA',
      'PERUGIA', 'PESARO', 'PESCARA', 'PIACENZA', 'PISA', 'PISTOIA', 'PORDENONE', 'POTENZA',
      'PRATO', 'RAGUSA', 'RAVENNA', 'REGGIO CALABRIA', 'REGGIO EMILIA', 'RIETI', 'RIMINI',
      'ROMA', 'ROVERETO', 'ROVIGO', 'SALERNO', 'SANTA MARIA CAPUA VETERE', 'SASSARI', 'SAVONA',
      'SCIACCA', 'SIENA', 'SIRACUSA', 'SONDRIO', 'SPOLETO', 'SULMONA', 'TARANTO', 
      'TEMPIO PAUSANIA', 'TERAMO', 'TERMINI IMERESE', 'TERNI', 'TIVOLI', 'TORINO',
      'TORRE ANNUNZIATA', 'TRANI', 'TRAPANI', 'TRENTO', 'TREVISO', 'TRIESTE', 'UDINE',
      'URBINO', 'VALLO DELLA LUCANIA', 'VARESE', 'VASTO', 'VELLETRI', 'VENEZIA', 'VERBANIA',
      'VERCELLI', 'VERONA', 'VIBO VALENTIA', 'VICENZA', 'VITERBO'
    ];
    
    console.log(`[API] Restituisco ${ALL_TRIBUNALS.length} tribunali completi`);
    
    res.status(200).json({ cities: ALL_TRIBUNALS.sort() });
  } catch (error) {
    console.error('Errore durante il recupero delle città:', error);
    res.status(500).json({ message: 'Errore durante il recupero delle città' });
  }
};

// POST /api/documents/favorites - Aggiungi un documento ai preferiti
export const addToFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { documentId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Utente non autenticato' });
    }

    if (!documentId) {
      return res.status(400).json({ message: 'ID documento mancante' });
    }

    console.log(`[API] POST /api/documents/favorites - Aggiunta ai preferiti`, {
      userId,
      documentId
    });

    // Verifica che il documento esista
    const documentExists = await prismaClient.document.findUnique({
      where: { id: documentId }
    });

    if (!documentExists) {
      return res.status(404).json({ message: 'Documento non trovato' });
    }

    // Verifica se è già nei preferiti
    const existingFavorite = await prismaClient.favorite.findFirst({
      where: {
        userId,
        documentId
      }
    });

    if (existingFavorite) {
      console.log(`[API] Documento già nei preferiti`, {
        userId,
        documentId
      });
      return res.status(200).json({ message: 'Documento già nei preferiti' });
    }

    // Aggiungi ai preferiti
    await prismaClient.favorite.create({
      data: {
        userId,
        documentId,
        createdAt: new Date()
      }
    });

    // Incrementa il contatore dei preferiti nel documento
    await prismaClient.document.update({
      where: { id: documentId },
      data: { favoriteCount: { increment: 1 } }
    });

    console.log(`[API] Documento aggiunto ai preferiti con successo`, {
      userId,
      documentId
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
    const userId = (req as any).user?.id;
    const documentId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: 'Utente non autenticato' });
    }

    if (!documentId) {
      return res.status(400).json({ message: 'ID documento mancante' });
    }

    console.log(`[API] DELETE /api/documents/favorites/${documentId} - Rimozione dai preferiti`, {
      userId,
      documentId
    });

    // Verifica se esiste nei preferiti
    const existingFavorite = await prismaClient.favorite.findFirst({
      where: {
        userId,
        documentId
      }
    });

    if (!existingFavorite) {
      console.log(`[API] Documento non trovato nei preferiti`, {
        userId,
        documentId
      });
      return res.status(404).json({ message: 'Documento non trovato nei preferiti' });
    }

    // Rimuovi dai preferiti
    await prismaClient.favorite.deleteMany({
      where: {
        userId,
        documentId
      }
    });

    // Decrementa il contatore dei preferiti nel documento
    await prismaClient.document.update({
      where: { id: documentId },
      data: { favoriteCount: { decrement: 1 } }
    });

    console.log(`[API] Documento rimosso dai preferiti con successo`, {
      userId,
      documentId
    });

    res.status(200).json({ message: 'Documento rimosso dai preferiti' });
  } catch (error) {
    console.error('Errore durante la rimozione dai preferiti:', error);
    res.status(500).json({ message: 'Errore durante la rimozione dai preferiti' });
  }
};

// POST /api/documents/bulk - Carica documenti in massa
export const bulkUploadDocuments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const files = req.files as Express.Multer.File[];

    if (!userId) {
      return res.status(401).json({ message: 'Utente non autenticato' });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'Nessun file caricato' });
    }

    console.log(`[API] POST /api/documents/bulk - Caricamento multiplo:`, {
      files: files.length,
      userId
    });

    const results = {
      total: files.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      documents: [] as { id: string, title: string }[]
    };

    for (const file of files) {
      try {
        // Mantieni il nome originale del file
        const originalFileName = file.originalname;
        const filePath = path.join(UPLOADS_DIR, originalFileName);

        // Verifica se esiste già un documento con lo stesso filePath o nome file
        const existingDoc = await prismaClient.document.findFirst({
          where: {
            OR: [
              { filePath },
              { title: { equals: originalFileName, mode: 'insensitive' } }
            ]
          }
        });

        if (existingDoc) {
          console.log(`[API] Documento già esistente, viene saltato:`, {
            filename: originalFileName
          });
          results.skipped++;
          continue;
        }

        // Salva il file nella directory di upload con il nome originale
        const destinationPath = path.join(UPLOADS_DIR, originalFileName);

        // Crea la directory se non esiste
        if (!fs.existsSync(UPLOADS_DIR)) {
          fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        }

        // Scrive il file sul disco
        fs.writeFileSync(destinationPath, file.buffer);

        // Estrai il testo dal PDF
        const content = await extractTextFromPDF(destinationPath);

        // Identifica le città menzionate
        const cities = identifyCities(content, originalFileName);

        // Crea un record nel database con il nome originale
        const document = await prismaClient.document.create({
          data: {
            title: originalFileName, // Nome file completo come titolo
            description: `Documento ${originalFileName}`,
            fileUrl: `/server/uploads/${originalFileName}`,
            filePath: destinationPath,
            fileSize: file.size,
            content,
            cities,
            keywords: cities, // Usa le città come parole chiave di base
            uploadDate: new Date(),
            viewCount: 0,
            downloadCount: 0,
            favoriteCount: 0,
            user: {
              connect: { id: userId }
            }
          }
        });

        results.successful++;
        results.documents.push({
          id: document.id,
          title: document.title
        });
      } catch (err) {
        console.error(`[API] Errore durante il caricamento di ${file.originalname}:`, err);
        results.failed++;
      }
    }

    console.log(`[API] Caricamento multiplo completato:`, {
      total: results.total,
      successful: results.successful,
      failed: results.failed,
      skipped: results.skipped
    });

    res.status(201).json({
      message: `Caricamento completato: ${results.successful} documenti caricati, ${results.skipped} saltati, ${results.failed} falliti`,
      results
    });
  } catch (error) {
    console.error('Errore durante il caricamento multiplo:', error);
    res.status(500).json({ message: 'Errore durante il caricamento multiplo' });
  }
};

// GET /api/documents/:id - Ottieni documento per ID
export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const documentId = req.params.id;
    const userId = (req as any).user?.id;

    if (!documentId) {
      return res.status(400).json({ message: 'ID documento mancante' });
    }

    console.log(`[API] GET /api/documents/${documentId} - Richiesta dettagli documento`);

    // Recupera il documento completo dal database
    const document = await prismaClient.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        title: true,
        description: true,
        fileUrl: true,
        filePath: true,
        fileSize: true,
        uploadDate: true,
        viewCount: true,
        downloadCount: true,
        favoriteCount: true,
        keywords: true,
        cities: true,
        content: true
      }
    });

    if (!document) {
      console.log(`[API] Documento non trovato: ${documentId}`);
      return res.status(404).json({ message: 'Documento non trovato' });
    }

    // Incrementa il contatore di visualizzazioni
    await prismaClient.document.update({
      where: { id: documentId },
      data: { viewCount: { increment: 1 } }
    });

    // Costruisci l'URL completo del file se è un percorso relativo
    if (document.fileUrl && !document.fileUrl.startsWith('http')) {
      // Assicurati che l'URL inizi con /server/uploads/
      const baseUrl = '/server/uploads/';
      const fileName = path.basename(document.fileUrl);
      document.fileUrl = baseUrl + fileName;
    }
    
    // Verifica se il file esiste fisicamente
    if (document.filePath) {
      const normalizedPath = normalizeFilePath(document.filePath);
      if (!fs.existsSync(normalizedPath)) {
        console.log(`[API] ATTENZIONE: File fisico non trovato: ${normalizedPath}`);
        // Tenta di correggere il percorso
        const baseName = path.basename(document.filePath);
        const correctedPath = path.join(UPLOADS_DIR, baseName);
        
        if (fs.existsSync(correctedPath)) {
          console.log(`[API] File trovato in percorso alternativo: ${correctedPath}`);
          // Aggiorna il percorso nel database
          await prismaClient.document.update({
            where: { id: documentId },
            data: { filePath: correctedPath }
          });
          document.filePath = correctedPath;
        }
      } else {
        console.log(`[API] File fisico verificato: ${normalizedPath}`);
      }
    }

    console.log(`[API] Documento recuperato:`, {
      id: document.id,
      title: document.title,
      fileUrl: document.fileUrl
    });

    // Restituisci il documento completo
    res.status(200).json({ document });
  } catch (error) {
    console.error('Errore durante il recupero del documento:', error);
    res.status(500).json({ message: 'Errore durante il recupero del documento' });
  }
};

// PUT /api/documents/:id - Aggiorna documento
export const updateDocument = async (req: Request, res: Response) => {
  try {
    const documentId = req.params.id;
    const updateData = req.body;

    if (!documentId) {
      return res.status(400).json({ message: 'ID documento mancante' });
    }

    // Implementazione dell'aggiornamento documento
    console.log(`Aggiornamento documento con ID ${documentId}`);
    res.status(200).json({ message: 'Documento aggiornato con successo' });
  } catch (error) {
    console.error('Errore durante l\'aggiornamento del documento:', error);
    res.status(500).json({ message: 'Errore durante l\'aggiornamento del documento' });
  }
};

// DELETE /api/documents/:id - Elimina documento
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const documentId = req.params.id;

    if (!documentId) {
      return res.status(400).json({ message: 'ID documento mancante' });
    }

    // Implementazione dell'eliminazione documento
    console.log(`Eliminazione documento con ID ${documentId}`);
    res.status(200).json({ message: 'Documento eliminato con successo' });
  } catch (error) {
    console.error('Errore durante l\'eliminazione del documento:', error);
    res.status(500).json({ message: 'Errore durante l\'eliminazione del documento' });
  }
};

// POST /api/documents/:id/download - Gestisce il download e incrementa il contatore
export const incrementDownloadCount = async (req: Request, res: Response) => {
  try {
    const documentId = req.params.id;
    const userId = (req as any).user?.id;

    if (!documentId) {
      return res.status(400).json({ message: 'ID documento mancante' });
    }

    console.log(`[API] POST /api/documents/${documentId}/download - Richiesta download`);

    // Recupera il documento dal database
    const document = await prismaClient.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        filePath: true
      }
    });

    if (!document) {
      console.log(`[API] Documento non trovato: ${documentId}`);
      return res.status(404).json({ message: 'Documento non trovato' });
    }

    // Incrementa il contatore di download
    await prismaClient.document.update({
      where: { id: documentId },
      data: { downloadCount: { increment: 1 } }
    });

    // Se abbiamo un percorso al file, possiamo inviare direttamente il file
    if (document.filePath) {
      const filePath = normalizeFilePath(document.filePath);
      
      if (fs.existsSync(filePath)) {
        console.log(`[API] Invio file per download: ${filePath}`);
        return res.download(filePath, `${document.title}.pdf`);
      } else {
        // Se il file non esiste al percorso registrato, tenta di correggerlo
        console.log(`[API] ATTENZIONE: File non trovato al percorso: ${filePath}`);
        const baseName = path.basename(document.filePath);
        const correctedPath = path.join(UPLOADS_DIR, baseName);
        
        if (fs.existsSync(correctedPath)) {
          console.log(`[API] File trovato in percorso alternativo: ${correctedPath}`);
          // Aggiorna il percorso nel database
          await prismaClient.document.update({
            where: { id: documentId },
            data: { filePath: correctedPath }
          });
          
          // Invia il file dal percorso corretto
          return res.download(correctedPath, `${document.title}.pdf`);
        } else {
          console.log(`[API] File non trovato nemmeno nel percorso alternativo`);
        }
      }
    }

    // Altrimenti, restituiamo l'URL del file
    if (document.fileUrl) {
      // Costruisci l'URL completo se è un percorso relativo
      let fileUrl = document.fileUrl;
      if (!fileUrl.startsWith('http')) {
        // Assicurati che l'URL inizi con /server/uploads/
        const baseUrl = '/server/uploads/';
        const fileName = path.basename(fileUrl);
        fileUrl = baseUrl + fileName;
      }

      console.log(`[API] Restituisco URL per download: ${fileUrl}`);
      return res.status(200).json({ fileUrl });
    }

    // Se non abbiamo né un percorso né un URL, restituisci un errore
    console.log(`[API] File non disponibile per il documento: ${documentId}`);
    return res.status(404).json({ message: 'File non disponibile' });
  } catch (error) {
    console.error('Errore durante il download del documento:', error);
    res.status(500).json({ message: 'Errore durante il download del documento' });
  }
};

// Nuova funzione per recuperare solo gli ultimi documenti (fallback)
export const getRecentDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', pageSize = '10' } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const size = parseInt(pageSize as string, 10);
    const skip = (pageNumber - 1) * size;

    console.log(`[API] GET /api/documents/recent - Recupero ultimi documenti:`, {
      page: pageNumber,
      pageSize: size,
      skip
    });

    // Query estremamente semplice senza filtri complessi
    const documents = await prismaClient.document.findMany({
      orderBy: { uploadDate: 'desc' },
      skip,
      take: size,
      select: {
        id: true,
        title: true,
        description: true,
        fileUrl: true,
        uploadDate: true,
        viewCount: true,
        downloadCount: true,
        favoriteCount: true,
        keywords: true,
        cities: true,
        content: true
      }
    });

    // Conta il totale dei documenti
    const totalDocuments = await prismaClient.document.count();

    res.status(200).json({ 
      documents,
      page: pageNumber,
      pageSize: size,
      total: totalDocuments,
      totalPages: Math.ceil(totalDocuments / size)
    });
  } catch (error) {
    console.error(`[API] Errore nella richiesta GET /api/documents/recent:`, error);
    res.status(500).json({ message: 'Errore nel recupero dei documenti recenti.' });
  }
}; 
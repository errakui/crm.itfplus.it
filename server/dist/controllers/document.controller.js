"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUploadDocuments = exports.getAllDocumentsAdmin = exports.removeFromFavorites = exports.addToFavorites = exports.getFavorites = exports.getAllCities = exports.incrementDownloadCount = exports.deleteDocument = exports.updateDocument = exports.uploadDocument = exports.getDocumentById = exports.getAllDocuments = exports.upload = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const client_1 = require("@prisma/client");
const pdfUtils_1 = require("../utils/pdfUtils");
const multer_1 = __importDefault(require("multer"));
// Rimosso l'import esplicito dei tipi
// I file .d.ts vengono riconosciuti automaticamente da TypeScript
// senza bisogno di importarli esplicitamente
const prismaClient = new client_1.PrismaClient();
// Directory per i file caricati
const UPLOADS_DIR = path_1.default.resolve(__dirname, '../../../uploads');
// Assicuriamoci che la directory esista
if (!fs_1.default.existsSync(UPLOADS_DIR)) {
    fs_1.default.mkdirSync(UPLOADS_DIR, { recursive: true });
}
// Configurazione di Multer per il caricamento dei file
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(null, false);
            return cb(new Error('Solo i file PDF sono supportati'));
        }
    }
});
// Funzione di utility per normalizzare i percorsi dei file
const normalizeFilePath = (filePath) => {
    // Assicura che tutti i percorsi siano assoluti
    if (!path_1.default.isAbsolute(filePath)) {
        const uploadsDir = path_1.default.resolve(__dirname, '../../../uploads');
        return path_1.default.join(uploadsDir, path_1.default.basename(filePath));
    }
    return filePath;
};
// Funzione di utility per ottenere il percorso relativo di un file
const getRelativeFilePath = (filePath) => {
    const uploadsDir = path_1.default.resolve(__dirname, '../../../uploads');
    const basename = path_1.default.basename(filePath);
    return `/uploads/${basename}`;
};
// GET /api/documents - Ottieni tutti i documenti
const getAllDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { searchTerm, cities } = req.query;
        let documents;
        // Se l'utente è autenticato, mostra tutti i documenti
        if (userId) {
            documents = yield prismaClient.document.findMany({
                orderBy: { uploadDate: 'desc' }
            });
        }
        else {
            // Filtra solo i documenti pubblici per utenti non autenticati
            documents = yield prismaClient.document.findMany({
                orderBy: {
                    uploadDate: "desc"
                }
            });
        }
        // Filtriamo i documenti in base al searchTerm e alle città, se specificati
        if (searchTerm || cities) {
            const citiesArray = cities ?
                (Array.isArray(cities) ? cities : [cities]) :
                [];
            const filteredDocuments = yield filterDocuments(documents, searchTerm, citiesArray);
            res.json({ documents: filteredDocuments });
        }
        else {
            res.json({ documents });
        }
    }
    catch (err) {
        console.error('Errore nel recupero dei documenti:', err);
        res.status(500).json({ message: 'Errore nel recupero dei documenti' });
    }
});
exports.getAllDocuments = getAllDocuments;
// Funzione di filtro avanzata
function filterDocuments(documents, searchTerm, cities) {
    return __awaiter(this, void 0, void 0, function* () {
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
                const keywordsMatch = doc.keywords.some((keyword) => keyword.toLowerCase().includes(normalizedSearchTerm));
                // Cerca nel contenuto testuale del PDF
                const contentMatch = doc.content && (0, pdfUtils_1.textContainsSearchTerm)(doc.content, normalizedSearchTerm);
                // Se la corrispondenza è nel contenuto, estrai uno snippet di testo
                if (contentMatch && doc.content) {
                    // Aggiungi lo snippet al documento
                    doc.textSnippet = (0, pdfUtils_1.getTextSnippet)(doc.content, searchTerm, 150);
                }
                return titleMatch || descriptionMatch || keywordsMatch || contentMatch;
            });
        }
        // Filtro per città
        if (cities && cities.length > 0) {
            filteredDocs = filteredDocs.filter(doc => {
                // Se il documento non ha città associate, escludilo
                if (!doc.cities || doc.cities.length === 0)
                    return false;
                // Verifica se almeno una delle città richieste è presente nel documento
                return cities.some((city) => doc.cities.includes(city));
            });
        }
        return filteredDocs;
    });
}
// GET /api/documents/:id - Ottieni un documento specifico
const getDocumentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const document = yield prismaClient.document.findUnique({
            where: { id }
        });
        if (!document) {
            res.status(404).json({ message: 'Documento non trovato' });
            return;
        }
        // Incrementa il contatore di visualizzazioni
        yield prismaClient.document.update({
            where: { id },
            data: { viewCount: { increment: 1 } }
        });
        res.status(200).json({ document });
    }
    catch (error) {
        console.error('Errore durante il recupero del documento:', error);
        res.status(500).json({ message: 'Errore durante il recupero del documento' });
    }
});
exports.getDocumentById = getDocumentById;
/**
 * Pulisce e normalizza un nome file, rimuovendo caratteri speciali e sostituendo spazi
 */
const sanitizeFileName = (fileName) => {
    // Rimuovi caratteri non alfanumerici tranne punti e trattini
    const cleanName = fileName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Rimuove accenti
        .replace(/[^a-zA-Z0-9_\-\.]/g, '_'); // Sostituisce caratteri speciali con underscore
    return cleanName;
};
// POST /api/documents - Carica un nuovo documento
const uploadDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log("Richiesta di caricamento documento ricevuta");
        if (!req.file) {
            console.log("Nessun file ricevuto");
            return res.status(400).json({ message: 'Nessun file caricato' });
        }
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            console.log("UserID non trovato nella richiesta");
            return res.status(401).json({ message: 'Utente non autenticato' });
        }
        console.log(`File ricevuto: ${req.file.originalname}, Dimensione: ${req.file.size} bytes`);
        // Utilizza il nome file originale sanitizzato anziché generare un UUID
        const sanitizedFileName = sanitizeFileName(req.file.originalname);
        const uploadsDir = path_1.default.resolve(process.env.UPLOADS_DIR || 'uploads');
        // Assicurati che la directory esista
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
            console.log(`Directory uploads creata: ${uploadsDir}`);
        }
        const filePath = path_1.default.join(uploadsDir, sanitizedFileName);
        const fileUrl = `/uploads/${sanitizedFileName}`;
        console.log(`Salvataggio file in: ${filePath}`);
        console.log(`URL del file: ${fileUrl}`);
        // Scrivi il file su disco
        fs_1.default.writeFileSync(filePath, req.file.buffer);
        // Estrai il testo dal PDF se è un file PDF
        let content = '';
        let cities = [];
        const fileExtension = path_1.default.extname(req.file.originalname).toLowerCase();
        if (fileExtension === '.pdf') {
            console.log('Estrazione testo dal PDF...');
            content = yield (0, pdfUtils_1.extractTextFromPDF)(filePath);
            // Estrai il titolo dal nome del file originale
            const title = req.file.originalname.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
            // Identifica le città nel testo e nel titolo
            cities = (0, pdfUtils_1.identifyCities)(content, title);
            console.log(`Città identificate: ${cities.join(', ')}`);
        }
        // Ottieni altri campi dalla richiesta
        const { title, description, keywords } = req.body;
        const keywordArray = keywords ? keywords.split(',').map((k) => k.trim()) : [];
        // Salva il documento nel database
        const document = yield prismaClient.document.create({
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
    }
    catch (error) {
        console.error('Errore durante il caricamento del documento:', error);
        res.status(500).json({
            message: 'Errore durante il caricamento del documento',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
exports.uploadDocument = uploadDocument;
// PUT /api/documents/:id - Aggiorna un documento
const updateDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { title, description, keywords } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Verifica se l'utente ha i permessi per modificare il documento
        const document = yield prismaClient.document.findFirst({
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
        const updatedDocument = yield prismaClient.document.update({
            where: { id },
            data: {
                title,
                description,
                keywords
            }
        });
        // Aggiorna le città solo se il titolo è cambiato e abbiamo il contenuto del documento
        if (title !== document.title && document.content) {
            const cities = (0, pdfUtils_1.identifyCities)(document.content, title);
            yield prismaClient.document.update({
                where: { id },
                data: { cities }
            });
        }
        res.status(200).json({ document: updatedDocument });
    }
    catch (error) {
        console.error('Errore durante l\'aggiornamento del documento:', error);
        res.status(500).json({ message: 'Errore durante l\'aggiornamento del documento' });
    }
});
exports.updateDocument = updateDocument;
// DELETE /api/documents/:id - Elimina un documento
const deleteDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        // Ottieni il documento
        const document = yield prismaClient.document.findUnique({
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
        if (fs_1.default.existsSync(document.filePath)) {
            fs_1.default.unlinkSync(document.filePath);
        }
        // Elimina il documento dal database
        yield prismaClient.document.delete({
            where: { id }
        });
        res.status(200).json({ message: 'Documento eliminato con successo' });
    }
    catch (error) {
        console.error('Errore durante l\'eliminazione del documento:', error);
        res.status(500).json({ message: 'Errore durante l\'eliminazione del documento' });
    }
});
exports.deleteDocument = deleteDocument;
// POST /api/documents/:id/download - Incrementa il contatore di download e scarica il file
const incrementDownloadCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        console.log(`Richiesta download per documento ID: ${id}`);
        const document = yield prismaClient.document.update({
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
        const filename = path_1.default.basename(document.filePath);
        console.log(`Nome file estratto: ${filename}`);
        // Prova a trovare il file in vari percorsi
        // 1. Usa process.cwd() per garantire un percorso assoluto corretto
        const rootUploadsDir = path_1.default.resolve(process.cwd(), 'uploads');
        // 2. Usa il percorso relativo alla directory del server
        const serverUploadsDir = path_1.default.resolve(process.cwd(), 'server/uploads');
        // 3. Usa il percorso dalla configurazione del controller
        const controllerUploadsDir = path_1.default.resolve(__dirname, '../../../uploads');
        // Crea un array di possibili percorsi dove cercare il file
        const possiblePaths = [
            // Se il percorso nel DB è assoluto, usalo
            document.filePath,
            // Altrimenti prova varie combinazioni
            path_1.default.join(rootUploadsDir, filename),
            path_1.default.join(serverUploadsDir, filename),
            path_1.default.join(controllerUploadsDir, filename),
            // Prova anche con il solo nome file
            filename
        ];
        console.log("Possibili percorsi per trovare il file:");
        possiblePaths.forEach(p => console.log(`- ${p} (esiste: ${fs_1.default.existsSync(p)})`));
        // Trova il primo percorso che esiste
        const existingPath = possiblePaths.find(p => fs_1.default.existsSync(p));
        if (existingPath) {
            console.log(`File trovato al percorso: ${existingPath}, invio...`);
            return res.download(existingPath, filename);
        }
        else {
            console.log(`File non trovato in nessun percorso. Restituisco URL relativo.`);
            // Invece di restituire un errore, restituiamo il percorso relativo
            // Il client lo userà per accedere direttamente al file
            return res.json({ fileUrl: `/uploads/${filename}` });
        }
    }
    catch (error) {
        console.error('Errore durante l\'incremento del contatore di download:', error);
        res.status(500).json({ message: 'Errore durante l\'incremento del contatore di download' });
    }
});
exports.incrementDownloadCount = incrementDownloadCount;
// GET /api/documents/cities - Ottieni tutte le città disponibili
const getAllCities = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ottieni tutte le città uniche dai documenti
        const documents = yield prismaClient.document.findMany({
            select: {
                cities: true
            }
        });
        // Estrai e appiattisci l'array delle città
        const cities = Array.from(new Set(documents.flatMap(doc => doc.cities)
            .filter(city => !!city))).sort();
        res.status(200).json({ cities });
    }
    catch (error) {
        console.error('Errore durante il recupero delle città:', error);
        res.status(500).json({ message: 'Errore durante il recupero delle città' });
    }
});
exports.getAllCities = getAllCities;
// GET /api/documents/favorites - Ottieni i documenti preferiti dell'utente
const getFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: 'Utente non autenticato' });
            return;
        }
        const favorites = yield prismaClient.favorite.findMany({
            where: { userId },
            include: { document: true }
        });
        // Estrai i documenti dai preferiti
        const documents = favorites.map(favorite => favorite.document);
        res.status(200).json({ documents });
    }
    catch (error) {
        console.error('Errore durante il recupero dei documenti preferiti:', error);
        res.status(500).json({ message: 'Errore durante il recupero dei documenti preferiti' });
    }
});
exports.getFavorites = getFavorites;
// POST /api/documents/favorites - Aggiungi un documento ai preferiti
const addToFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { documentId } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: 'Utente non autenticato' });
            return;
        }
        // Verifica che il documento esista
        const document = yield prismaClient.document.findUnique({
            where: { id: documentId }
        });
        if (!document) {
            res.status(404).json({ message: 'Documento non trovato' });
            return;
        }
        // Verifica che il documento non sia già nei preferiti
        const existingFavorite = yield prismaClient.favorite.findFirst({
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
        yield prismaClient.favorite.create({
            data: {
                userId,
                documentId
            }
        });
        res.status(201).json({ message: 'Documento aggiunto ai preferiti' });
    }
    catch (error) {
        console.error('Errore durante l\'aggiunta ai preferiti:', error);
        res.status(500).json({ message: 'Errore durante l\'aggiunta ai preferiti' });
    }
});
exports.addToFavorites = addToFavorites;
// DELETE /api/documents/favorites/:id - Rimuovi un documento dai preferiti
const removeFromFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: 'Utente non autenticato' });
            return;
        }
        // Trova il preferito
        const favorite = yield prismaClient.favorite.findFirst({
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
        yield prismaClient.favorite.delete({
            where: { id: favorite.id }
        });
        res.status(200).json({ message: 'Documento rimosso dai preferiti' });
    }
    catch (error) {
        console.error('Errore durante la rimozione dai preferiti:', error);
        res.status(500).json({ message: 'Errore durante la rimozione dai preferiti' });
    }
});
exports.removeFromFavorites = removeFromFavorites;
// GET /api/documents/admin/all - Ottieni tutti i documenti (admin)
const getAllDocumentsAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        // Solo gli admin possono accedere a questa rotta
        if (userRole !== 'ADMIN') {
            res.status(403).json({ message: 'Non autorizzato' });
            return;
        }
        const documents = yield prismaClient.document.findMany({
            orderBy: { uploadDate: 'desc' }
        });
        res.status(200).json({ documents });
    }
    catch (error) {
        console.error('Errore durante il recupero di tutti i documenti:', error);
        res.status(500).json({ message: 'Errore durante il recupero di tutti i documenti' });
    }
});
exports.getAllDocumentsAdmin = getAllDocumentsAdmin;
// POST /api/documents/bulk-upload - Carica multipli documenti in una volta sola
const bulkUploadDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        console.log("Richiesta di caricamento multiplo ricevuta");
        console.log("User:", req.user);
        console.log("Files ricevuti:", req.files ? (Array.isArray(req.files) ? req.files.length : 'non è un array') : 'nessun file');
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
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
            failedFiles: []
        };
        console.log(`Elaborazione di ${req.files.length} file iniziata`);
        const uploadsDir = path_1.default.resolve(process.env.UPLOADS_DIR || 'uploads');
        // Assicurati che la directory esista
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
            console.log(`Directory uploads creata: ${uploadsDir}`);
        }
        // Processa ogni file
        for (const file of req.files) {
            try {
                console.log(`Elaborazione file: ${file.originalname}`);
                // Utilizza il nome file originale sanitizzato
                const sanitizedFileName = sanitizeFileName(file.originalname);
                const filePath = path_1.default.join(uploadsDir, sanitizedFileName);
                const fileUrl = `/uploads/${sanitizedFileName}`;
                // Scrivi il file su disco
                fs_1.default.writeFileSync(filePath, file.buffer);
                console.log(`File salvato in: ${filePath}`);
                console.log(`URL del file: ${fileUrl}`);
                // Estrai il testo dal PDF se è un file PDF
                let content = '';
                let cities = [];
                const fileExtension = path_1.default.extname(file.originalname).toLowerCase();
                if (fileExtension === '.pdf') {
                    console.log('Estrazione testo dal PDF...');
                    content = yield (0, pdfUtils_1.extractTextFromPDF)(filePath);
                    // Estrai il titolo dal nome del file originale
                    const title = file.originalname.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
                    // Identifica le città nel testo e nel titolo
                    cities = (0, pdfUtils_1.identifyCities)(content, title);
                    console.log(`Città identificate: ${cities.join(', ')}`);
                }
                // Salva il documento nel database
                const document = yield prismaClient.document.create({
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
            }
            catch (error) {
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
    }
    catch (error) {
        console.error('Errore durante il caricamento multiplo:', error);
        res.status(500).json({
            message: 'Errore durante il caricamento multiplo',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
exports.bulkUploadDocuments = bulkUploadDocuments;
//# sourceMappingURL=document.controller.js.map
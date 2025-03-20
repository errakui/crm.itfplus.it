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
exports.bulkUploadDocuments = exports.getAllCities = exports.getAllDocumentsAdmin = exports.removeFromFavorites = exports.addToFavorites = exports.getFavorites = exports.incrementDownloadCount = exports.deleteDocument = exports.updateDocument = exports.uploadDocument = exports.getDocumentById = exports.getAllDocuments = exports.upload = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const pdfUtils_1 = require("../utils/pdfUtils");
const multer_1 = __importDefault(require("multer"));
// Rimosso l'import esplicito dei tipi
// I file .d.ts vengono riconosciuti automaticamente da TypeScript
// senza bisogno di importarli esplicitamente
const prisma = new client_1.PrismaClient();
// Directory per i file caricati
const UPLOADS_DIR = path_1.default.join(__dirname, '../../uploads');
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
// GET /api/documents - Ottieni tutti i documenti
const getAllDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { searchTerm, cities } = req.query;
        let documents;
        // Se l'utente è autenticato, mostra tutti i documenti
        if (userId) {
            documents = yield prisma.document.findMany({
                orderBy: { uploadDate: 'desc' }
            });
        }
        else {
            // Filtra solo i documenti pubblici per utenti non autenticati
            documents = yield prisma.document.findMany({
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
        const document = yield prisma.document.findUnique({
            where: { id }
        });
        if (!document) {
            res.status(404).json({ message: 'Documento non trovato' });
            return;
        }
        // Incrementa il contatore di visualizzazioni
        yield prisma.document.update({
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
// POST /api/documents - Carica un nuovo documento
const uploadDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.file) {
            res.status(400).json({ message: 'Nessun file caricato' });
            return;
        }
        const { title, description } = req.body;
        let keywords = req.body.keywords || [];
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: 'Utente non autenticato' });
            return;
        }
        // Converti le keywords da stringa JSON a array se necessario
        if (typeof keywords === 'string') {
            try {
                keywords = JSON.parse(keywords);
            }
            catch (e) {
                keywords = keywords.split(',').map((k) => k.trim());
            }
        }
        // Genera un nome univoco per il file
        const fileId = (0, uuid_1.v4)();
        const fileExtension = path_1.default.extname(req.file.originalname).toLowerCase();
        const fileName = `${fileId}${fileExtension}`;
        const filePath = path_1.default.join(UPLOADS_DIR, fileName);
        // Scrivi il file
        fs_1.default.writeFileSync(filePath, req.file.buffer);
        // Estrai il testo dal PDF se è un file PDF
        let content = '';
        let cities = [];
        if (fileExtension === '.pdf') {
            content = yield (0, pdfUtils_1.extractTextFromPDF)(filePath);
            // Identifica le città nel testo e nel titolo
            cities = (0, pdfUtils_1.identifyCities)(content, title);
        }
        // Salva il documento nel database
        const document = yield prisma.document.create({
            data: {
                title,
                description,
                keywords,
                filePath,
                fileUrl: `/uploads/${fileName}`,
                fileSize: req.file.size,
                userId,
                content,
                cities
            }
        });
        res.status(201).json({ document });
    }
    catch (error) {
        console.error('Errore durante il caricamento del documento:', error);
        res.status(500).json({ message: 'Errore durante il caricamento del documento' });
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
        const document = yield prisma.document.findFirst({
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
        const updatedDocument = yield prisma.document.update({
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
            yield prisma.document.update({
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
        const document = yield prisma.document.findUnique({
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
        yield prisma.document.delete({
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
// POST /api/documents/:id/download - Incrementa il contatore di download
const incrementDownloadCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.document.update({
            where: { id },
            data: { downloadCount: { increment: 1 } }
        });
        res.status(200).json({ message: 'Contatore di download incrementato' });
    }
    catch (error) {
        console.error('Errore durante l\'incremento del contatore di download:', error);
        res.status(500).json({ message: 'Errore durante l\'incremento del contatore di download' });
    }
});
exports.incrementDownloadCount = incrementDownloadCount;
// GET /api/documents/favorites - Ottieni i documenti preferiti dell'utente
const getFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: 'Utente non autenticato' });
            return;
        }
        const favorites = yield prisma.favorite.findMany({
            where: { userId },
            include: { document: true }
        });
        // Estrai i documenti dai preferiti
        const documents = favorites.map((favorite) => favorite.document);
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
        const document = yield prisma.document.findUnique({
            where: { id: documentId }
        });
        if (!document) {
            res.status(404).json({ message: 'Documento non trovato' });
            return;
        }
        // Verifica che il documento non sia già nei preferiti
        const existingFavorite = yield prisma.favorite.findFirst({
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
        yield prisma.favorite.create({
            data: {
                userId,
                documentId
            }
        });
        // Incrementa il contatore di preferiti
        yield prisma.document.update({
            where: { id: documentId },
            data: { favoriteCount: { increment: 1 } }
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
        const favorite = yield prisma.favorite.findFirst({
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
        yield prisma.favorite.delete({
            where: { id: favorite.id }
        });
        // Decrementa il contatore di preferiti
        yield prisma.document.update({
            where: { id },
            data: { favoriteCount: { decrement: 1 } }
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
        const documents = yield prisma.document.findMany({
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
// GET /api/documents/cities - Ottieni tutte le città disponibili
const getAllCities = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Restituiamo l'elenco completo delle città italiane
        res.status(200).json({ cities: pdfUtils_1.ITALIAN_CITIES });
    }
    catch (error) {
        console.error('Errore durante il recupero delle città:', error);
        res.status(500).json({ message: 'Errore durante il recupero delle città' });
    }
});
exports.getAllCities = getAllCities;
// POST /api/documents/bulk-upload - Carica multipli documenti in una volta sola
const bulkUploadDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!userId || userRole !== 'ADMIN') {
            res.status(403).json({ message: 'Solo gli amministratori possono eseguire caricamenti multipli' });
            return;
        }
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            res.status(400).json({ message: 'Nessun file caricato' });
            return;
        }
        const results = {
            total: req.files.length,
            successful: 0,
            failed: 0,
            failedFiles: []
        };
        // Elabora i file uno alla volta
        for (const file of req.files) {
            try {
                // Estrai il titolo dal nome del file (rimuovi l'estensione)
                const fileNameWithoutExtension = path_1.default.basename(file.originalname, path_1.default.extname(file.originalname));
                const title = fileNameWithoutExtension;
                const description = '';
                const keywords = [];
                // Genera un nome univoco per il file
                const fileId = (0, uuid_1.v4)();
                const fileExtension = path_1.default.extname(file.originalname).toLowerCase();
                const fileName = `${fileId}${fileExtension}`;
                const filePath = path_1.default.join(UPLOADS_DIR, fileName);
                // Scrivi il file
                fs_1.default.writeFileSync(filePath, file.buffer);
                // Estrai il testo dal PDF se è un file PDF
                let content = '';
                let cities = [];
                if (fileExtension === '.pdf') {
                    content = yield (0, pdfUtils_1.extractTextFromPDF)(filePath);
                    // Identifica le città nel testo e nel titolo
                    cities = (0, pdfUtils_1.identifyCities)(content, title);
                }
                // Salva il documento nel database
                yield prisma.document.create({
                    data: {
                        title,
                        description,
                        keywords,
                        filePath,
                        fileUrl: `/uploads/${fileName}`,
                        fileSize: file.size,
                        userId,
                        content,
                        cities
                    }
                });
                results.successful++;
            }
            catch (error) {
                console.error(`Errore durante il caricamento del file ${file.originalname}:`, error);
                results.failed++;
                results.failedFiles.push(file.originalname);
            }
        }
        res.status(200).json({
            message: `Caricamento multiplo completato. Caricati con successo: ${results.successful}, Falliti: ${results.failed}`,
            results
        });
    }
    catch (error) {
        console.error('Errore durante il caricamento multiplo:', error);
        res.status(500).json({ message: 'Errore durante il caricamento multiplo' });
    }
});
exports.bulkUploadDocuments = bulkUploadDocuments;
//# sourceMappingURL=document.controller.js.map
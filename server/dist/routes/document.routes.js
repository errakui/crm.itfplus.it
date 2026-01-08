"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const documentController = __importStar(require("../controllers/document.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Log middleware per debugging
const logMiddleware = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log("Headers:", JSON.stringify(req.headers));
    console.log("Body:", req.body);
    console.log("Files:", req.files ? (Array.isArray(req.files) ? req.files.length : 'non è un array') : 'nessun file');
    console.log("User:", req.user);
    next();
};
// Rotte pubbliche
router.get('/', documentController.getAllDocuments);
// Rotte che richiedono autenticazione
router.use(auth_middleware_1.authenticateToken);
// Rotta per upload documento
router.post('/', documentController.upload.single('file'), documentController.uploadDocument);
// Ottieni tutte le città
router.get('/cities', documentController.getAllCities);
// Rotte per i preferiti
router.get('/favorites', logMiddleware, auth_middleware_1.isAuthenticated, documentController.getFavorites);
router.post('/favorites', logMiddleware, auth_middleware_1.isAuthenticated, documentController.addToFavorites);
router.delete('/favorites/:id', logMiddleware, auth_middleware_1.isAuthenticated, documentController.removeFromFavorites);
// Rotte admin
router.get('/admin/all', logMiddleware, auth_middleware_1.isAdmin, documentController.getAllDocumentsAdmin);
router.post('/bulk-upload', logMiddleware, auth_middleware_1.isAdmin, documentController.upload.array('files', 800), documentController.bulkUploadDocuments);
// Aggiungo il nuovo endpoint per i documenti recenti
router.get('/recent', documentController.getRecentDocuments);
// Gestione documenti specifici (con parametri)
router.get('/:id', documentController.getDocumentById);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);
router.post('/:id/download', documentController.incrementDownloadCount);
exports.default = router;
//# sourceMappingURL=document.routes.js.map
import express, { RequestHandler, Request, Response, NextFunction } from 'express';
import * as documentController from '../controllers/document.controller';
import { authenticateToken, isAdmin, isAuthenticated } from '../middleware/auth.middleware';

const router = express.Router();

// Log middleware per debugging
const logMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Headers:", JSON.stringify(req.headers));
  console.log("Body:", req.body);
  console.log("Files:", req.files ? (Array.isArray(req.files) ? req.files.length : 'non è un array') : 'nessun file');
  console.log("User:", req.user);
  next();
};

// Rotte pubbliche
router.get('/', (documentController.getAllDocuments as unknown) as RequestHandler);

// Rotte che richiedono autenticazione
router.use(authenticateToken);

// Rotta per upload documento
router.post('/', documentController.upload.single('file'), (documentController.uploadDocument as unknown) as RequestHandler);

// Ottieni tutte le città
router.get('/cities', (documentController.getAllCities as unknown) as RequestHandler);

// Rotte per i preferiti
router.get('/favorites', logMiddleware, isAuthenticated, (documentController.getFavorites as unknown) as RequestHandler);
router.post('/favorites', logMiddleware, isAuthenticated, (documentController.addToFavorites as unknown) as RequestHandler);
router.delete('/favorites/:id', logMiddleware, isAuthenticated, (documentController.removeFromFavorites as unknown) as RequestHandler);

// Rotte admin
router.get('/admin/all', logMiddleware, isAdmin, (documentController.getAllDocumentsAdmin as unknown) as RequestHandler);
router.post('/bulk-upload', logMiddleware, isAdmin, documentController.upload.array('files', 800), (documentController.bulkUploadDocuments as unknown) as RequestHandler);

// Aggiungo il nuovo endpoint per i documenti recenti
router.get('/recent', (documentController.getRecentDocuments as unknown) as RequestHandler);

// Gestione documenti specifici (con parametri)
router.get('/:id', (documentController.getDocumentById as unknown) as RequestHandler);
router.put('/:id', (documentController.updateDocument as unknown) as RequestHandler);
router.delete('/:id', (documentController.deleteDocument as unknown) as RequestHandler);
router.post('/:id/download', (documentController.incrementDownloadCount as unknown) as RequestHandler);

export default router; 
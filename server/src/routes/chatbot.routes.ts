import express, { RequestHandler } from 'express';
import { getChatResponse, getSummary } from '../controllers/chatbot.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Route per ottenere la risposta dal chatbot
router.post('/chat', authenticateToken, (getChatResponse as unknown) as RequestHandler);

// Route per ottenere un riassunto di un documento
router.get('/summary/:documentId', authenticateToken, (getSummary as unknown) as RequestHandler);

export default router; 
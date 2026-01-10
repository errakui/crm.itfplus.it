import express, { RequestHandler } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  searchWithAI,
  getChatSessions,
  getChatSession,
  deleteChatSession,
  getUsageLimit
} from '../controllers/bookySearch.controller';

const router = express.Router();

// Tutte le routes richiedono autenticazione
router.use(authenticateToken);

// POST /api/booky-search - Ricerca con AI
router.post('/', (searchWithAI as unknown) as RequestHandler);

// GET /api/booky-search/limit - Stato limite giornaliero
router.get('/limit', (getUsageLimit as unknown) as RequestHandler);

// GET /api/booky-search/sessions - Lista sessioni chat
router.get('/sessions', (getChatSessions as unknown) as RequestHandler);

// GET /api/booky-search/sessions/:sessionId - Dettaglio sessione
router.get('/sessions/:sessionId', (getChatSession as unknown) as RequestHandler);

// DELETE /api/booky-search/sessions/:sessionId - Elimina sessione
router.delete('/sessions/:sessionId', (deleteChatSession as unknown) as RequestHandler);

export default router;


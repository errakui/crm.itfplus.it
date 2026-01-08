import express, { RequestHandler } from 'express';
import * as publicController from '../controllers/public.controller';
import { verifyApiKey } from '../middleware/apiKey.middleware';

const router = express.Router();

// Endpoint pubblico per richiedere la creazione di un account
// Protegto con API Key (opzionale, configurabile via env)
router.post('/request-account', verifyApiKey, (publicController.requestAccount as unknown) as RequestHandler);

export default router;


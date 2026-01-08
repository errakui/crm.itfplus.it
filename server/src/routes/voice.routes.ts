import express, { RequestHandler } from 'express';
import { textToSpeech } from '../controllers/voice.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Route per Text-to-Speech
router.post('/tts', authenticateToken, (textToSpeech as unknown) as RequestHandler);

export default router;


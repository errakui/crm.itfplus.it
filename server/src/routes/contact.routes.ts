import express, { RequestHandler } from 'express';
import * as contactController from '../controllers/contact.controller';

const router = express.Router();

// Rotte per i form
router.post('/contact', (contactController.submitContact as unknown) as RequestHandler);
router.post('/support', (contactController.submitSupport as unknown) as RequestHandler);

export default router; 
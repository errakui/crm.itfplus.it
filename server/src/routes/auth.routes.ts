import express, { Router } from 'express';
import { register, login, logout, changePassword } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router: Router = express.Router();

// Route per la registrazione
router.post('/register', register);

// Route per il login
router.post('/login', login);

// Route per il logout
router.post('/logout', logout);

// Rotte autenticate
router.post('/change-password', authenticateToken, changePassword);

export default router;

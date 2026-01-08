import express, { Router } from 'express';
import { register, login, logout, changePassword, getAdminStats } from '../controllers/auth.controller';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';

const router: Router = express.Router();

// Route per la registrazione
router.post('/register', register);

// Route per il login
router.post('/login', login);

// Route per il logout
router.post('/logout', logout);

// Rotte autenticate
router.post('/change-password', authenticateToken, changePassword);

// Route per le statistiche admin
router.get('/admin/stats', authenticateToken, isAdmin, getAdminStats);

export default router;

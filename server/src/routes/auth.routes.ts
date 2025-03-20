import express, { Router } from 'express';
import { register, login, logout } from '../controllers/auth.controller';

const router: Router = express.Router();

// Route per la registrazione
router.post('/register', register);

// Route per il login
router.post('/login', login);

// Route per il logout
router.post('/logout', logout);

export default router; 
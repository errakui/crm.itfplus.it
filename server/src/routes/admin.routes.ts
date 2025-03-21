import express, { Router } from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/auth.controller';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';

const router: Router = express.Router();

// Route Admin per la gestione utenti
router.get('/users', authenticateToken, isAdmin, getAllUsers);
router.get('/users/:id', authenticateToken, isAdmin, getUserById);
router.post('/users', authenticateToken, isAdmin, createUser);
router.put('/users/:id', authenticateToken, isAdmin, updateUser);
router.delete('/users/:id', authenticateToken, isAdmin, deleteUser);

export default router; 
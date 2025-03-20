import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';

// Enum per i ruoli (corrispondente all'enum nel database)
enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

// Interfacce
interface RegisterUserRequest {
  email: string;
  password: string;
  name?: string;
  role?: Role;
}

interface LoginRequest {
  email: string;
  password: string;
}

// Controller per la registrazione
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role }: RegisterUserRequest = req.body;

    // Verifica se l'utente esiste già
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({ message: 'L\'utente esiste già' });
      return;
    }

    // Hash della password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creazione utente nel database
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || Role.USER
      }
    });

    // Ometti la password nel risultato
    const { password: _, ...userWithoutPassword } = newUser;

    // Generazione token JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'secret-fallback',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Utente registrato con successo',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Errore nella registrazione:', error);
    res.status(500).json({ message: 'Errore nella registrazione dell\'utente' });
  }
};

// Controller per il login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Verifica se l'utente esiste
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(401).json({ message: 'Credenziali non valide' });
      return;
    }

    // Verifica della password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Credenziali non valide' });
      return;
    }

    // Ometti la password nel risultato
    const { password: _, ...userWithoutPassword } = user;

    // Generazione token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret-fallback',
      { expiresIn: '1d' }
    );

    // Salva la sessione
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 giorno
      }
    });

    res.status(200).json({
      message: 'Login effettuato con successo',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Errore durante il login:', error);
    res.status(500).json({ message: 'Errore durante il login' });
  }
};

// Controller per il logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Token non fornito' });
      return;
    }

    // Elimina la sessione
    await prisma.session.deleteMany({
      where: { token }
    });

    res.status(200).json({ message: 'Logout effettuato con successo' });
  } catch (error) {
    console.error('Errore durante il logout:', error);
    res.status(500).json({ message: 'Errore durante il logout' });
  }
}; 
// Funzione serverless per la gestione degli utenti da parte dell'admin
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Inizializza Prisma Client
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // Gestione CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Gestione delle richieste preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Verifica autenticazione e ruolo admin
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token non fornito' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Non autorizzato' });
    }

    // Gestione GET - Lista utenti
    if (req.method === 'GET') {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });

      return res.status(200).json(users);
    }

    // Gestione POST - Nuovo utente
    if (req.method === 'POST') {
      const { email, password, name, role } = req.body;

      // Verifica se l'utente esiste già
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email già registrata' });
      }

      // Hash della password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crea il nuovo utente
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: role || 'USER'
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });

      return res.status(201).json(newUser);
    }

    // Gestione PUT - Aggiorna utente
    if (req.method === 'PUT') {
      const { id, email, name, role, password } = req.body;

      const updateData = {
        email,
        name,
        role
      };

      // Aggiorna la password solo se fornita
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });

      return res.status(200).json(updatedUser);
    }

    // Gestione DELETE - Elimina utente
    if (req.method === 'DELETE') {
      const { id } = req.body;

      await prisma.user.delete({
        where: { id }
      });

      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Metodo non consentito' });
  } catch (error) {
    console.error('Errore durante la gestione degli utenti:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token non valido' });
    }
    return res.status(500).json({ error: 'Errore del server' });
  } finally {
    await prisma.$disconnect();
  }
}; 
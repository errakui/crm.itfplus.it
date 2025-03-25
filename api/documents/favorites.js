// Funzione serverless per la gestione dei preferiti
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

// Inizializza Prisma Client
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // Gestione CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Gestione delle richieste preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Verifica autenticazione
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token non fornito' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ error: 'Utente non trovato' });
    }

    // Gestione GET - Lista preferiti
    if (req.method === 'GET') {
      const favorites = await prisma.favorite.findMany({
        where: { userId: user.id },
        include: {
          document: true
        }
      });

      return res.status(200).json(favorites);
    }

    // Gestione POST - Aggiungi preferito
    if (req.method === 'POST') {
      const { documentId } = req.body;

      // Verifica se il documento esiste
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });

      if (!document) {
        return res.status(404).json({ error: 'Documento non trovato' });
      }

      // Verifica se è già nei preferiti
      const existingFavorite = await prisma.favorite.findFirst({
        where: {
          userId: user.id,
          documentId: documentId
        }
      });

      if (existingFavorite) {
        return res.status(400).json({ error: 'Documento già nei preferiti' });
      }

      // Aggiungi ai preferiti
      const favorite = await prisma.favorite.create({
        data: {
          userId: user.id,
          documentId: documentId
        },
        include: {
          document: true
        }
      });

      return res.status(201).json(favorite);
    }

    return res.status(405).json({ error: 'Metodo non consentito' });
  } catch (error) {
    console.error('Errore durante la gestione dei preferiti:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token non valido' });
    }
    return res.status(500).json({ error: 'Errore del server' });
  } finally {
    await prisma.$disconnect();
  }
}; 
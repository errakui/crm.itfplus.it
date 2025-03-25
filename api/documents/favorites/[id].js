// Funzione serverless per la rimozione di un documento dai preferiti
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

// Inizializza Prisma Client
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // Gestione CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
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

    const documentId = req.query.id;

    // Gestione DELETE - Rimuovi dai preferiti
    if (req.method === 'DELETE') {
      // Verifica se il preferito esiste
      const favorite = await prisma.favorite.findFirst({
        where: {
          userId: user.id,
          documentId: documentId
        }
      });

      if (!favorite) {
        return res.status(404).json({ error: 'Documento non trovato nei preferiti' });
      }

      // Rimuovi dai preferiti
      await prisma.favorite.delete({
        where: {
          id: favorite.id
        }
      });

      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Metodo non consentito' });
  } catch (error) {
    console.error('Errore durante la rimozione dai preferiti:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token non valido' });
    }
    return res.status(500).json({ error: 'Errore del server' });
  } finally {
    await prisma.$disconnect();
  }
}; 
// Funzione serverless per la gestione di un singolo documento
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

// Inizializza Prisma Client
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // Gestione CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
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

    // Gestione GET - Dettaglio documento
    if (req.method === 'GET') {
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });

      if (!document) {
        return res.status(404).json({ error: 'Documento non trovato' });
      }

      return res.status(200).json(document);
    }

    // Gestione PUT - Aggiornamento documento (solo admin)
    if (req.method === 'PUT') {
      if (user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Non autorizzato' });
      }

      const { title, description, city, keywords, isActive } = req.body;

      const document = await prisma.document.update({
        where: { id: documentId },
        data: {
          title,
          description,
          city,
          keywords,
          isActive
        }
      });

      return res.status(200).json(document);
    }

    // Gestione DELETE - Eliminazione documento (solo admin)
    if (req.method === 'DELETE') {
      if (user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Non autorizzato' });
      }

      await prisma.document.delete({
        where: { id: documentId }
      });

      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Metodo non consentito' });
  } catch (error) {
    console.error('Errore durante la gestione del documento:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token non valido' });
    }
    return res.status(500).json({ error: 'Errore del server' });
  } finally {
    await prisma.$disconnect();
  }
}; 
// Funzione serverless per la gestione del supporto
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

// Inizializza Prisma Client
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // Gestione CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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

    // Gestione POST - Invia richiesta di supporto
    if (req.method === 'POST') {
      const { subject, message, priority = 'MEDIUM' } = req.body;

      // Validazione input
      if (!subject || !message) {
        return res.status(400).json({ error: 'Oggetto e messaggio sono richiesti' });
      }

      // Crea la richiesta di supporto
      const supportRequest = await prisma.supportRequest.create({
        data: {
          subject,
          message,
          priority,
          status: 'OPEN',
          userId: user.id
        }
      });

      return res.status(201).json({
        message: 'Richiesta di supporto inviata con successo',
        request: supportRequest
      });
    }

    return res.status(405).json({ error: 'Metodo non consentito' });
  } catch (error) {
    console.error('Errore durante l\'invio della richiesta di supporto:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token non valido' });
    }
    return res.status(500).json({ error: 'Errore del server' });
  } finally {
    await prisma.$disconnect();
  }
}; 
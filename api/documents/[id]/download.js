// Funzione serverless per il download dei documenti
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

// Inizializza Prisma Client
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // Gestione CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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

    // Gestione GET - Download documento
    if (req.method === 'GET') {
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });

      if (!document) {
        return res.status(404).json({ error: 'Documento non trovato' });
      }

      if (!document.isActive) {
        return res.status(403).json({ error: 'Documento non attivo' });
      }

      // Registra il download
      await prisma.download.create({
        data: {
          userId: user.id,
          documentId: document.id
        }
      });

      // Restituisci i dettagli del documento per il download
      return res.status(200).json({
        document: {
          id: document.id,
          title: document.title,
          filePath: document.filePath,
          fileSize: document.fileSize,
          mimeType: document.mimeType
        },
        message: 'Download avviato con successo'
      });
    }

    return res.status(405).json({ error: 'Metodo non consentito' });
  } catch (error) {
    console.error('Errore durante il download del documento:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token non valido' });
    }
    return res.status(500).json({ error: 'Errore del server' });
  } finally {
    await prisma.$disconnect();
  }
}; 
// Funzione serverless per l'upload bulk dei documenti
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

    // Gestione POST - Upload bulk documenti
    if (req.method === 'POST') {
      const { documents } = req.body;

      if (!Array.isArray(documents) || documents.length === 0) {
        return res.status(400).json({ error: 'Lista documenti non valida' });
      }

      // Valida ogni documento
      for (const doc of documents) {
        if (!doc.title || !doc.description || !doc.city || !doc.filePath || !doc.fileSize || !doc.mimeType) {
          return res.status(400).json({ error: 'Dati documento incompleti' });
        }
      }

      // Crea i documenti in bulk
      const createdDocuments = await Promise.all(
        documents.map(doc =>
          prisma.document.create({
            data: {
              ...doc,
              addedBy: user.id,
              isActive: true
            }
          })
        )
      );

      return res.status(201).json({
        message: `${createdDocuments.length} documenti caricati con successo`,
        documents: createdDocuments
      });
    }

    return res.status(405).json({ error: 'Metodo non consentito' });
  } catch (error) {
    console.error('Errore durante l\'upload bulk dei documenti:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token non valido' });
    }
    return res.status(500).json({ error: 'Errore del server' });
  } finally {
    await prisma.$disconnect();
  }
}; 
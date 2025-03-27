// Funzione serverless per l'eliminazione multipla dei documenti
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

    // Gestione POST - Eliminazione multipla
    if (req.method === 'POST') {
      const { documentIds } = req.body;
      
      if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
        return res.status(400).json({ error: 'IDs documenti non validi' });
      }
      
      console.log(`Eliminazione di ${documentIds.length} documenti...`);
      
      // Elimina tutti i documenti in una transazione
      await prisma.$transaction(async (tx) => {
        // Per ogni documento
        for (const documentId of documentIds) {
          // Elimina prima i record correlati
          await tx.favorite.deleteMany({
            where: { documentId }
          });
          
          await tx.download.deleteMany({
            where: { documentId }
          });
          
          // Ora elimina il documento
          await tx.document.delete({
            where: { id: documentId }
          });
        }
      });
      
      return res.status(200).json({
        message: `${documentIds.length} documenti eliminati con successo`
      });
    }

    return res.status(405).json({ error: 'Metodo non consentito' });
  } catch (error) {
    console.error('Errore durante l\'eliminazione multipla dei documenti:', error);
    return res.status(500).json({ error: 'Errore del server', details: error.message });
  } finally {
    await prisma.$disconnect();
  }
}; 
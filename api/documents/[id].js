// Aggiungo un log iniziale per debugging
console.log(`API documents/[id].js caricata e pronta per gestire le richieste`);

const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

// Inizializza Prisma Client
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // Log iniziale della richiesta
  console.log(`[${new Date().toISOString()}] ${req.method} /api/documents/${req.query.id} - Richiesta ricevuta`);
  
  // Gestione CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Gestione delle richieste preflight OPTIONS
  if (req.method === 'OPTIONS') {
    console.log(`[${new Date().toISOString()}] Richiesta OPTIONS completata`);
    return res.status(200).end();
  }

  const documentId = req.query.id;
  console.log(`API documents/[id] chiamata con metodo ${req.method} per documento ID: ${documentId}`);

  try {
    // Verifica autenticazione
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log('Errore: Token non fornito');
      return res.status(401).json({ error: 'Token non fornito' });
    }

    console.log('Token ricevuto, verifica in corso...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`Token verificato per utente ID: ${decoded.userId}`);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      console.log(`Errore: Utente con ID ${decoded.userId} non trovato`);
      return res.status(401).json({ error: 'Utente non trovato' });
    }
    console.log(`Utente trovato: ${user.name}, ruolo: ${user.role}`);

    // Gestione GET - Dettaglio documento
    if (req.method === 'GET') {
      console.log(`Recupero dettagli per documento ID: ${documentId}`);
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });

      if (!document) {
        console.log(`Errore: Documento con ID ${documentId} non trovato`);
        return res.status(404).json({ error: 'Documento non trovato' });
      }

      console.log(`Documento trovato, inviando risposta...`);
      return res.status(200).json(document);
    }

    // Gestione PUT - Aggiornamento documento (solo admin)
    if (req.method === 'PUT') {
      console.log(`Richiesta di aggiornamento documento ID: ${documentId}`);
      if (user.role !== 'ADMIN') {
        console.log(`Errore: Utente ${user.id} non è admin, accesso negato`);
        return res.status(403).json({ error: 'Non autorizzato' });
      }

      const { title, description, city, keywords, isActive } = req.body;
      console.log(`Aggiornamento documento con dati:`, { title, description, city, keywords, isActive });

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

      console.log(`Documento aggiornato con successo, ID: ${document.id}`);
      return res.status(200).json(document);
    }

    // Gestione DELETE - Elimina documento
    if (req.method === 'DELETE') {
      console.log(`Richiesta di eliminazione documento ID: ${documentId}`);
      try {
        // Verifica che il documento esista
        const document = await prisma.document.findUnique({
          where: { id: documentId }
        });
        
        if (!document) {
          console.log(`Errore: Documento con ID ${documentId} non trovato per eliminazione`);
          return res.status(404).json({ error: 'Documento non trovato' });
        }
        
        console.log(`Documento trovato. Proprietario: ${document.userId}, Richiedente: ${user.id}, Ruolo: ${user.role}`);
        
        // Verifica che l'utente sia il proprietario o un admin
        if (document.userId !== user.id && user.role !== 'ADMIN') {
          console.log(`Errore: Utente ${user.id} non autorizzato ad eliminare il documento ${documentId}`);
          return res.status(403).json({ error: 'Non sei autorizzato a eliminare questo documento' });
        }
        
        console.log(`Utente autorizzato, inizia transazione di eliminazione...`);
        
        // Prima elimina tutti i record correlati
        await prisma.$transaction([
          // Elimina tutti i preferiti associati
          prisma.favorite.deleteMany({
            where: { documentId }
          }),
          // Elimina tutti i download associati
          prisma.download.deleteMany({
            where: { documentId }
          }),
          // Ora elimina il documento
          prisma.document.delete({
            where: { id: documentId }
          })
        ]);
        
        console.log(`Documento ${documentId} eliminato con successo`);
        return res.status(200).json({ message: 'Documento eliminato con successo' });
      } catch (error) {
        console.error(`Errore durante l'eliminazione del documento ${documentId}:`, error);
        return res.status(500).json({ error: 'Errore del server', details: error.message });
      }
    }

    console.log(`Metodo ${req.method} non consentito per questa risorsa`);
    return res.status(405).json({ error: 'Metodo non consentito' });
  } catch (error) {
    console.error(`Errore durante la gestione del documento ${documentId}:`, error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token non valido' });
    }
    return res.status(500).json({ error: 'Errore del server', details: error.message });
  } finally {
    await prisma.$disconnect();
    console.log(`[${new Date().toISOString()}] Richiesta ${req.method} completata`);
  }
}; 
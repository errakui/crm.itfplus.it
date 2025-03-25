// Funzione serverless per il cambio password
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inizializza Prisma Client
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // Gestione CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Gestione delle richieste preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verifica che il metodo sia POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  try {
    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    // Validazione input
    if (!currentPassword || !newPassword || !token) {
      return res.status(400).json({ error: 'Tutti i campi sono richiesti' });
    }

    // Verifica e decodifica il token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Cerca l'utente nel database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    // Verifica la password corrente
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Password corrente non valida' });
    }

    // Hash della nuova password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Aggiorna la password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // Invia la risposta di successo
    return res.status(200).json({
      message: 'Password aggiornata con successo'
    });
  } catch (error) {
    console.error('Errore durante il cambio password:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token non valido' });
    }
    return res.status(500).json({ error: 'Errore del server durante il cambio password' });
  } finally {
    // Disconnetti il client Prisma
    await prisma.$disconnect();
  }
}; 
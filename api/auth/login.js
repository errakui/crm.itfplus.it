// Funzione serverless per il login utente
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inizializza Prisma Client
let prisma;
try {
  prisma = new PrismaClient();
} catch (e) {
  console.error("Errore nell'inizializzazione di Prisma Client:", e);
}

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
    console.log('Tentativo di login, metodo:', req.method);
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurato' : 'Non configurato');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Configurato' : 'Non configurato');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST ? 'Configurato' : 'Non configurato');

    // Verifica corpo della richiesta
    if (!req.body) {
      return res.status(400).json({ error: 'Corpo della richiesta mancante' });
    }

    const { email, password } = req.body;
    console.log('Email ricevuta:', email);

    // Validazione input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password sono richiesti' });
    }

    // Verifica che Prisma Client sia stato inizializzato
    if (!prisma) {
      return res.status(500).json({ error: 'Errore di connessione al database' });
    }

    // Cerca l'utente nel database
    const user = await prisma.user.findUnique({
      where: { email }
    });

    console.log('Utente trovato:', user ? 'Sì' : 'No');

    // Verifica se l'utente esiste
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    // Verifica la password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valida:', isPasswordValid ? 'Sì' : 'No');
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    // Genera token JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'secret-fallback',
      { expiresIn: '24h' }
    );

    console.log('Token generato con successo');

    // Invia la risposta con il token e le informazioni dell'utente
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      message: 'Login effettuato con successo'
    });
  } catch (error) {
    console.error('Errore durante il login:', error);
    
    // Messaggio di errore più dettagliato
    return res.status(500).json({ 
      error: 'Errore del server durante il login',
      details: error.message,
      type: error.name
    });
  } finally {
    // Disconnetti il client Prisma se esiste
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}; 
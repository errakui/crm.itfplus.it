// Funzione serverless per il login utente
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
    const { email, password } = req.body;

    // Validazione input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password sono richiesti' });
    }

    // Cerca l'utente nel database
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Verifica se l'utente esiste
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    // Verifica la password
    const isPasswordValid = await bcrypt.compare(password, user.password);
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
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

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
    return res.status(500).json({ error: 'Errore del server durante il login' });
  } finally {
    // Disconnetti il client Prisma
    await prisma.$disconnect();
  }
}; 
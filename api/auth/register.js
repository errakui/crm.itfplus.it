// Funzione serverless per la registrazione utente
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
    const { email, password, name } = req.body;

    // Validazione input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Tutti i campi sono richiesti' });
    }

    // Verifica se l'utente esiste già
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email già registrata' });
    }

    // Hash della password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea il nuovo utente
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER' // Ruolo predefinito
      }
    });

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
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      message: 'Registrazione effettuata con successo'
    });
  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    return res.status(500).json({ error: 'Errore del server durante la registrazione' });
  } finally {
    // Disconnetti il client Prisma
    await prisma.$disconnect();
  }
}; 
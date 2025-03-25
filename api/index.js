// API proxy per reindirizzare le chiamate API
const { PrismaClient } = require('@prisma/client');

// Inizializza Prisma Client
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // Aggiungi header CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Gestisci le richieste OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Log della richiesta ricevuta
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    // Informazioni di stato dell'API
    return res.status(200).json({
      status: 'online',
      message: 'API ITF Plus funzionanti',
      time: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Errore nella gestione della richiesta:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  } finally {
    await prisma.$disconnect();
  }
};
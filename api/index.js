// Questo file è il punto di ingresso per le funzioni serverless di Vercel
// Importa e utilizza il server Express

// Controlla se siamo in produzione o sviluppo
const isProduction = process.env.NODE_ENV === 'production';

try {
  // Importa il modulo path per gestire i percorsi dei file
  const path = require('path');

  // Determina il percorso alla directory del server
  const serverPath = path.join(process.cwd(), 'server/dist/server.js');
  console.log('Caricamento server da: ' + serverPath);

  // Importa l'app Express dal server
  const appServer = require(serverPath);
  const app = appServer.default;

  // Esporta l'handler per Vercel
  module.exports = (req, res) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    // Aggiungi header CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Gestisci le richieste OPTIONS (preflight CORS)
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Usa l'app Express per gestire la richiesta
    return app(req, res);
  };
} catch (error) {
  console.error('Errore nel caricamento del server:', error);
  
  // Fallback nel caso in cui il server non possa essere caricato
  module.exports = (req, res) => {
    console.error('Utilizzando handler di fallback:', req.method, req.url);
    
    // Aggiungi header CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Gestisci le richieste OPTIONS (preflight CORS)
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Informa del problema
    res.status(500).json({
      error: 'Errore nel caricamento del server',
      message: isProduction ? 'Servizio temporaneamente non disponibile' : error.message,
      time: new Date().toISOString()
    });
  };
} 
// File principale per avviare il server su Vercel
// Modulo per gestire le richieste in produzione

// Esporto una funzione handler per Vercel
module.exports = async (req, res) => {
  // Imposta header CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Gestisci preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Invia richieste ad api/index.js
  try {
    const apiHandler = require('./api/index.js');
    return await apiHandler(req, res);
  } catch (error) {
    console.error('Errore durante l\'elaborazione della richiesta:', error);
    return res.status(500).json({ 
      error: 'Errore del server', 
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
}; 
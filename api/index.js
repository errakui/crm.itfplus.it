// API proxy per reindirizzare le chiamate API al server Express
module.exports = (req, res) => {
  // Aggiungi header CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Gestisci le richieste OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Gestisci ogni richiesta API
  if (req.url.startsWith('/api/auth/login') && req.method === 'POST') {
    // Restituisci una risposta mock di login per testare
    return res.status(200).json({
      token: 'mock-token-1234567890',
      user: {
        id: '1',
        email: 'admin@itfplus.it',
        name: 'Admin',
        role: 'ADMIN'
      },
      message: 'Login effettuato con successo'
    });
  }
  
  // Log della richiesta ricevuta
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Risposta temporanea generica per tutte le altre API
  return res.status(200).json({
    message: 'API ITFPLUS in manutenzione - In arrivo',
    endpoint: req.url,
    method: req.method,
    time: new Date().toISOString()
  });
};
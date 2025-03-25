// Endpoint semplificato per il login senza dipendenze esterne
module.exports = async (req, res) => {
  // Abilita CORS per tutte le richieste
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Gestisce le richieste OPTIONS per CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Controlla che il metodo sia POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metodo non consentito' });
  }

  try {
    const { email, password } = req.body;

    // Validazione base
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e password sono richiesti' });
    }

    // Simula l'autenticazione (accetta qualsiasi credenziale)
    const user = {
      id: '1',
      email: email,
      name: 'Utente Test',
      role: 'ADMIN', // Per test assegniamo ruolo admin
      createdAt: new Date().toISOString()
    };

    // Crea un token semplice (non JWT) per test
    const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64');

    // Risposta di successo
    return res.status(200).json({
      message: 'Login effettuato con successo',
      user,
      token
    });
  } catch (error) {
    console.error('Errore durante il login:', error);
    return res.status(500).json({ message: 'Errore durante il login' });
  }
}; 
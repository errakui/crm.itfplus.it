// Endpoint semplificato per la registrazione senza dipendenze esterne
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
    const { email, password, name } = req.body;

    // Validazione base
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e password sono richiesti' });
    }

    // Crea un utente fittizio (simuliamo la registrazione)
    const newUser = {
      id: Math.random().toString(36).substring(2, 15),
      email: email,
      name: name || 'Nuovo Utente',
      role: 'USER',
      createdAt: new Date().toISOString()
    };

    // Crea un token semplice (non JWT) per test
    const token = Buffer.from(`${newUser.id}:${newUser.email}:${Date.now()}`).toString('base64');

    // Risposta di successo
    return res.status(201).json({
      message: 'Utente registrato con successo',
      user: newUser,
      token
    });
  } catch (error) {
    console.error('Errore nella registrazione:', error);
    return res.status(500).json({ message: 'Errore nella registrazione dell\'utente' });
  }
}; 
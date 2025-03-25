// Importiamo i moduli necessari
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Handler per la richiesta di login
module.exports = async (req, res) => {
  // Controlla che il metodo sia POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metodo non consentito' });
  }

  try {
    const { email, password } = req.body;

    // Qui dovresti avere la logica per verificare le credenziali
    // Per ora, per test, accettiamo qualsiasi credenziale
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e password sono richiesti' });
    }

    // In un'applicazione reale, verificheresti con il database
    // Per ora, per test, creiamo un utente fittizio
    const user = {
      id: '1',
      email: email,
      name: 'Utente Test',
      role: 'USER',
      createdAt: new Date().toISOString()
    };

    // Genera un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret-fallback',
      { expiresIn: '1d' }
    );

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
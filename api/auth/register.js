// Importiamo i moduli necessari
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Handler per la richiesta di registrazione
module.exports = async (req, res) => {
  // Controlla che il metodo sia POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metodo non consentito' });
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e password sono richiesti' });
    }

    // In un'applicazione reale, verificheresti se l'utente esiste già e lo salveresti nel database
    // Per ora, per test, simuliamo solo un successo

    // Hash della password (non usato realmente ma per completezza)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea un utente fittizio
    const newUser = {
      id: Math.random().toString(36).substring(2, 15),
      email: email,
      name: name || 'Nuovo Utente',
      role: 'USER',
      createdAt: new Date().toISOString()
    };

    // Genera un token JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'secret-fallback',
      { expiresIn: '1d' }
    );

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
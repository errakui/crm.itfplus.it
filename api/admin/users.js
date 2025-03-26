// Funzione serverless per la gestione degli utenti da parte dell'admin
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

// Inizializza Prisma Client
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // Log per debug
  console.log('API /admin/users chiamata');
  console.log('Metodo:', req.method);
  console.log('Headers:', Object.keys(req.headers).join(', '));
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body:', { ...req.body, password: req.body.password ? '***HIDDEN***' : undefined });
  }
  
  // Gestione CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Gestione delle richieste preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Verifica autenticazione e ruolo admin
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log('Token non fornito nella richiesta');
      return res.status(401).json({ error: 'Token non fornito' });
    }

    console.log('Token ricevuto, tentativo di verifica');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verificato correttamente, userId:', decoded.userId);
    } catch (jwtError) {
      console.error('Errore nella verifica del token:', jwtError);
      return res.status(401).json({ error: 'Token non valido' });
    }
    
    console.log('Ricerca utente nel database');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    console.log('Risultato ricerca utente:', user ? 'Trovato' : 'Non trovato');
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
    
    console.log('Verifica ruolo utente, ruolo corrente:', user.role);
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Non autorizzato: richiesto ruolo ADMIN' });
    }

    // Gestione GET - Lista utenti
    if (req.method === 'GET') {
      console.log('Elaborazione richiesta GET per lista utenti');
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });

      console.log(`Trovati ${users.length} utenti`);
      return res.status(200).json(users);
    }

    // Gestione POST - Nuovo utente
    if (req.method === 'POST') {
      console.log('Elaborazione richiesta POST per nuovo utente');
      const { email, password, name, role } = req.body;

      // Verifica se l'utente esiste già
      console.log('Verifica se l\'email è già registrata:', email);
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        console.log('Email già registrata');
        return res.status(400).json({ error: 'Email già registrata' });
      }

      // Hash della password
      console.log('Generazione hash della password');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crea il nuovo utente
      try {
        console.log('Tentativo di creazione nuovo utente nel database');
        const newUser = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
            role: role || 'USER'
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true
          }
        });

        console.log('Utente creato con successo, ID:', newUser.id);
        
        // Invio email con credenziali
        try {
          console.log('Invio email con credenziali al nuovo utente');
          const emailBody = `
            <h2>Benvenuto in ITFPlus</h2>
            <p>Gentile ${name},</p>
            <p>Ti diamo il benvenuto nella piattaforma ITFPlus. Di seguito trovi le tue credenziali di accesso:</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p>Ti consigliamo di cambiare la password dopo il primo accesso per maggiore sicurezza.</p>
            <p>Per accedere alla piattaforma, visita <a href="https://crm-itfplus-it-beryl.vercel.app/login">ITFPlus</a>.</p>
            <p>Cordiali saluti,<br>Il team di ITFPlus</p>
          `;
          
          const mailData = {
            from: process.env.EMAIL_FROM || 'noreply@itfplus.it',
            to: email,
            subject: 'Benvenuto in ITFPlus - Credenziali di Accesso',
            html: emailBody
          };
          
          console.log('Configurazione Mailgun:');
          console.log('- API Key configurata:', process.env.MAILGUN_API_KEY ? 'Sì' : 'No');
          console.log('- Dominio configurato:', process.env.MAILGUN_DOMAIN);
          
          const mailResult = await mailgun.messages().send(mailData);
          console.log('Email inviata con successo:', mailResult);
        } catch (emailError) {
          console.error('Errore nell\'invio dell\'email al nuovo utente:', emailError);
          // Non fallire la richiesta se l'email non viene inviata
        }

        return res.status(201).json(newUser);
      } catch (createError) {
        console.error('Errore nella creazione dell\'utente:', createError);
        return res.status(500).json({ 
          error: 'Errore nella creazione dell\'utente', 
          details: createError.message 
        });
      }
    }

    // Gestione PUT - Aggiorna utente
    if (req.method === 'PUT') {
      console.log('Elaborazione richiesta PUT per aggiornamento utente');
      const { id, email, name, role, password } = req.body;

      console.log('Preparazione dati per aggiornamento');
      const updateData = {
        email,
        name,
        role
      };

      // Aggiorna la password solo se fornita
      if (password) {
        console.log('Password fornita, generazione hash');
        updateData.password = await bcrypt.hash(password, 10);
      }

      try {
        console.log('Tentativo di aggiornamento utente, ID:', id);
        const updatedUser = await prisma.user.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true
          }
        });

        console.log('Utente aggiornato con successo');
        return res.status(200).json(updatedUser);
      } catch (updateError) {
        console.error('Errore nell\'aggiornamento dell\'utente:', updateError);
        return res.status(500).json({ 
          error: 'Errore nell\'aggiornamento dell\'utente', 
          details: updateError.message 
        });
      }
    }

    // Gestione DELETE - Elimina utente
    if (req.method === 'DELETE') {
      console.log('Elaborazione richiesta DELETE per eliminazione utente');
      const { id } = req.body;

      try {
        console.log('Tentativo di eliminazione utente, ID:', id);
        await prisma.user.delete({
          where: { id }
        });

        console.log('Utente eliminato con successo');
        return res.status(204).end();
      } catch (deleteError) {
        console.error('Errore nell\'eliminazione dell\'utente:', deleteError);
        return res.status(500).json({ 
          error: 'Errore nell\'eliminazione dell\'utente', 
          details: deleteError.message 
        });
      }
    }

    return res.status(405).json({ error: 'Metodo non consentito' });
  } catch (error) {
    console.error('Errore durante la gestione degli utenti:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token non valido' });
    }
    return res.status(500).json({ error: 'Errore del server' });
  } finally {
    await prisma.$disconnect();
  }
}; 
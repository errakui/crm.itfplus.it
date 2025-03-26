// API per la gestione delle richieste di supporto
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

// Inizializza Prisma Client
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // Log per debug
  console.log('API /support chiamata');
  console.log('Metodo:', req.method);
  console.log('Body:', req.body);
  
  // Gestione CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Gestione delle richieste preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verifica che sia una richiesta POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  // Verifica autenticazione
  let userId = null;
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      console.log('Token fornito, tentativo di decodifica');
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
        
        console.log('UserID decodificato:', userId);
        
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (!user) {
          console.log('Utente non trovato, si procede senza userId');
          userId = null;
        }
      } catch (tokenError) {
        console.error('Errore nella verifica del token:', tokenError);
        userId = null; // Procedi comunque senza userId
      }
    } else {
      console.log('Token non fornito, si procede senza userId');
    }

    // Validazione input
    const { subject, message, email, priority = 'MEDIUM' } = req.body;
    
    if (!subject || !message) {
      console.error('Dati mancanti nella richiesta:', { subject, message });
      return res.status(400).json({ error: 'Oggetto e messaggio sono obbligatori' });
    }

    // Verifica configurazione Mailgun
    console.log('Configurazione Mailgun:');
    console.log('- API Key configurata:', process.env.MAILGUN_API_KEY ? 'Sì' : 'No');
    console.log('- Dominio configurato:', process.env.MAILGUN_DOMAIN);
    
    // Salvataggio della richiesta nel database
    console.log('Salvataggio richiesta nel database');
    const supportRequest = await prisma.supportRequest.create({
      data: {
        subject,
        message,
        priority,
        status: 'OPEN',
        ...(userId && { user: { connect: { id: userId } } })
      }
    });
    
    console.log('Richiesta salvata, ID:', supportRequest.id);

    // Invio email tramite Mailgun
    const emailData = {
      from: process.env.EMAIL_FROM || 'noreply@itfplus.it',
      to: process.env.EMAIL_TO || 'info@itfplus.it',
      subject: `[Assistenza] ${subject}`,
      html: `
        <h2>Nuova richiesta di assistenza</h2>
        <p><strong>Oggetto:</strong> ${subject}</p>
        <p><strong>Priorità:</strong> ${priority}</p>
        <p><strong>Email:</strong> ${email || (userId ? 'Utente autenticato' : 'Non specificata')}</p>
        <p><strong>Messaggio:</strong></p>
        <p>${message}</p>
      `
    };
    
    if (email) {
      emailData['h:Reply-To'] = email;
    }
    
    console.log('Invio email tramite Mailgun...');
    
    // Tentativo di invio email
    try {
      const emailResult = await mailgun.messages().send(emailData);
      console.log('Email inviata con successo:', emailResult);
    } catch (emailError) {
      console.error('Errore nell\'invio dell\'email:', emailError);
      // Non fallire la richiesta se l'email non viene inviata,
      // almeno la richiesta è stata salvata nel database
    }

    return res.status(201).json({
      message: 'Richiesta di assistenza inviata con successo',
      supportRequest
    });
  } catch (error) {
    console.error('Errore nella gestione della richiesta di assistenza:', error);
    return res.status(500).json({ error: 'Errore del server' });
  } finally {
    await prisma.$disconnect();
  }
}; 
// API per la gestione dei contatti
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
  console.log('API /contact chiamata');
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
    const { name, email, subject, message, category } = req.body;
    
    if (!name || !email || !subject || !message) {
      console.error('Dati mancanti nella richiesta:', { name, email, subject, message });
      return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
    }

    // Verifica configurazione Mailgun
    console.log('Configurazione Mailgun:');
    console.log('- API Key configurata:', process.env.MAILGUN_API_KEY ? 'Sì' : 'No');
    console.log('- Dominio configurato:', process.env.MAILGUN_DOMAIN);
    
    // Salvataggio del messaggio nel database
    console.log('Salvataggio messaggio nel database');
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        category: category || 'GENERAL',
        ...(userId && { user: { connect: { id: userId } } })
      }
    });
    
    console.log('Messaggio salvato, ID:', contactMessage.id);

    // Invio email tramite Mailgun
    const emailData = {
      from: process.env.EMAIL_FROM || 'noreply@itfplus.it',
      to: process.env.EMAIL_TO || 'info@itfplus.it',
      subject: `[Contatto] ${subject}`,
      html: `
        <h2>Nuovo messaggio dal form di contatto</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Categoria:</strong> ${category || 'Non specificata'}</p>
        <p><strong>Messaggio:</strong></p>
        <p>${message}</p>
      `,
      'h:Reply-To': email
    };
    
    console.log('Invio email tramite Mailgun...');
    
    // Tentativo di invio email
    try {
      const emailResult = await mailgun.messages().send(emailData);
      console.log('Email inviata con successo:', emailResult);
    } catch (emailError) {
      console.error('Errore nell\'invio dell\'email:', emailError);
      console.error('Dettagli errore Mailgun:', {
        statusCode: emailError.statusCode,
        message: emailError.message,
        details: emailError.details || 'Nessun dettaglio disponibile',
        apiKey: process.env.MAILGUN_API_KEY ? process.env.MAILGUN_API_KEY.substring(0, 8) + '...' : 'Non configurata',
        dominio: process.env.MAILGUN_DOMAIN || 'Non configurato',
        from: emailData.from,
        to: emailData.to
      });
      // Non fallire la richiesta se l'email non viene inviata,
      // almeno il messaggio è stato salvato nel database
    }

    return res.status(201).json({
      message: 'Messaggio inviato con successo',
      contactMessage
    });
  } catch (error) {
    console.error('Errore nella gestione della richiesta di contatto:', error);
    return res.status(500).json({ error: 'Errore del server' });
  } finally {
    await prisma.$disconnect();
  }
}; 
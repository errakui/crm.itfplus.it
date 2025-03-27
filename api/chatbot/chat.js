// Funzione serverless per il chatbot
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

// Inizializza Prisma Client
const prisma = new PrismaClient();

// Definizione delle risposte predefinite
const defaultResponses = {
  greeting: ['Ciao!', 'Salve!', 'Benvenuto!'],
  farewell: ['Arrivederci!', 'A presto!', 'Buona giornata!'],
  thanks: ['Prego!', 'Di nulla!', 'Non c\'è di che!'],
  help: [
    'Posso aiutarti a cercare documenti, gestire i preferiti o rispondere a domande generali.',
    'Come posso esserti d\'aiuto oggi?'
  ],
  unknown: [
    'Mi dispiace, non ho capito la tua domanda. Puoi riformularla?',
    'Non sono sicuro di aver capito. Puoi essere più specifico?'
  ]
};

module.exports = async (req, res) => {
  // Gestione CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Gestione delle richieste preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Verifica autenticazione
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token non fornito' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ error: 'Utente non trovato' });
    }

    // Gestione POST - Processa il messaggio
    if (req.method === 'POST') {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Messaggio richiesto' });
      }

      // Converti il messaggio in minuscolo per il confronto
      const lowerMessage = message.toLowerCase();

      // Registra il messaggio dell'utente
      await prisma.chatMessage.create({
        data: {
          userId: user.id,
          content: message,
          isBot: false
        }
      });

      // Determina la risposta in base al contenuto del messaggio
      let response;
      if (lowerMessage.match(/^(ciao|salve|buongiorno|buonasera|hey|hi|hello)/)) {
        response = defaultResponses.greeting[Math.floor(Math.random() * defaultResponses.greeting.length)];
      } else if (lowerMessage.match(/^(arrivederci|ciao|bye|goodbye|addio)/)) {
        response = defaultResponses.farewell[Math.floor(Math.random() * defaultResponses.farewell.length)];
      } else if (lowerMessage.match(/^(grazie|thanks|thank you|merci)/)) {
        response = defaultResponses.thanks[Math.floor(Math.random() * defaultResponses.thanks.length)];
      } else if (lowerMessage.match(/^(aiuto|help|come funziona|cosa posso fare)/)) {
        response = defaultResponses.help[Math.floor(Math.random() * defaultResponses.help.length)];
      } else if (lowerMessage.match(/^(cerca|trova|documenti|pdf)/)) {
        response = 'Per cercare documenti, usa la barra di ricerca nella pagina principale. Puoi cercare per titolo, descrizione o parole chiave.';
      } else if (lowerMessage.match(/^(preferiti|salvati|bookmark)/)) {
        response = 'Puoi salvare i documenti nei preferiti cliccando sull\'icona del cuore. Li troverai nella sezione "Preferiti" del tuo profilo.';
      } else {
        response = defaultResponses.unknown[Math.floor(Math.random() * defaultResponses.unknown.length)];
      }

      // Registra la risposta del chatbot
      await prisma.chatMessage.create({
        data: {
          userId: user.id,
          content: response,
          isBot: true
        }
      });

      return res.status(200).json({
        response
      });
    }

    return res.status(405).json({ error: 'Metodo non consentito' });
  } catch (error) {
    console.error('Errore durante l\'elaborazione del messaggio:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token non valido' });
    }
    return res.status(500).json({ error: 'Errore del server' });
  } finally {
    await prisma.$disconnect();
  }
}; 
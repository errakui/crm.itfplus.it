// Aggiungo log iniziale per debugging
console.log('API chatbot/chat.js caricata e pronta per gestire le richieste');

const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

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
  // Log iniziale della richiesta
  console.log(`[${new Date().toISOString()}] ${req.method} /api/chatbot/chat - Richiesta ricevuta`);
  
  // Gestione CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Gestione delle richieste preflight OPTIONS
  if (req.method === 'OPTIONS') {
    console.log(`[${new Date().toISOString()}] Richiesta OPTIONS completata`);
    return res.status(200).end();
  }

  try {
    // Solo metodo POST è supportato
    if (req.method !== 'POST') {
      console.log(`Errore: Metodo ${req.method} non supportato`);
      return res.status(405).json({ error: 'Metodo non consentito' });
    }

    // Verifica autenticazione
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log('Errore: Token non fornito');
      return res.status(401).json({ error: 'Token non fornito' });
    }

    // Verifica JWT
    console.log('Token ricevuto, verifica in corso...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`Token verificato per utente ID: ${decoded.userId}`);

    // Recupera l'utente
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      console.log(`Errore: Utente con ID ${decoded.userId} non trovato`);
      return res.status(401).json({ error: 'Utente non trovato' });
    }
    console.log(`Utente trovato: ${user.name}`);

    // Estrai dati dalla richiesta
    const { message, documentId } = req.body;
    console.log(`Messaggio ricevuto: "${message}" per documento ID: ${documentId || 'nessuno'}`);

    if (!message) {
      console.log('Errore: Messaggio mancante');
      return res.status(400).json({ error: 'Messaggio mancante' });
    }

    let context = '';

    // Se è specifico per un documento, ottieni il contenuto
    if (documentId) {
      console.log(`Cerco documento con ID: ${documentId}`);
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });

      if (!document) {
        console.log(`Errore: Documento con ID ${documentId} non trovato`);
        return res.status(404).json({ error: 'Documento non trovato' });
      }

      // Usa titolo, descrizione e contenuto come contesto
      context = `
        Titolo: ${document.title || ''}
        Descrizione: ${document.description || ''}
        Contenuto: ${document.content || ''}
      `;
      console.log(`Contesto documento recuperato, lunghezza: ${context.length} caratteri`);
    }

    try {
      // Prepara la richiesta per l'API di Perplexity
      const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
      
      if (!perplexityApiKey) {
        console.log('Errore: Chiave API Perplexity non configurata');
        return res.status(500).json({ error: 'Configurazione server incompleta' });
      }
      
      console.log('Invio richiesta a Perplexity API...');
      const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${perplexityApiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3-sonar-small-32k-online',
          messages: [
            {
              role: 'system',
              content: `Sei un assistente legale specializzato che aiuta a comprendere documenti legali. ${context ? 'Ecco il contesto del documento:' + context : 'Non è stato fornito un documento specifico.'}`
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 1000
        })
      });
      
      if (!perplexityResponse.ok) {
        const errorText = await perplexityResponse.text();
        console.log(`Errore da Perplexity API: ${perplexityResponse.status} - ${errorText}`);
        return res.status(500).json({ error: 'Errore nella generazione della risposta', details: errorText });
      }
      
      const responseData = await perplexityResponse.json();
      console.log('Risposta ricevuta da Perplexity');
      
      if (!responseData.choices || !responseData.choices[0] || !responseData.choices[0].message) {
        console.log('Errore: Formato risposta Perplexity non valido', responseData);
        return res.status(500).json({ error: 'Formato risposta non valido' });
      }
      
      const botResponse = responseData.choices[0].message.content;
      
      // Salva il messaggio nel database
      await prisma.chatMessage.create({
        data: {
          userId: user.id,
          content: message,
          isBot: false
        }
      });
      
      await prisma.chatMessage.create({
        data: {
          userId: user.id,
          content: botResponse,
          isBot: true
        }
      });
      
      console.log('Messaggi salvati nel database');
      
      return res.status(200).json({ 
        message: botResponse,
        timestamp: new Date().toISOString() 
      });
    } catch (apiError) {
      console.error('Errore durante la comunicazione con Perplexity API:', apiError);
      return res.status(500).json({ 
        error: 'Errore durante la comunicazione con il servizio AI', 
        details: apiError.message 
      });
    }
  } catch (error) {
    console.error('Errore durante la gestione della richiesta chatbot:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token non valido' });
    }
    return res.status(500).json({ error: 'Errore del server', details: error.message });
  } finally {
    await prisma.$disconnect();
    console.log(`[${new Date().toISOString()}] Richiesta chatbot completata`);
  }
}; 
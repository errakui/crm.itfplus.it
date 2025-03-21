// Importa il necessario per Express
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Crea l'app Express
const app = express();

// Configurazione per debug
console.log('Node environment:', process.env.NODE_ENV);
console.log('Current working directory:', process.cwd());
console.log('Available env variables:', Object.keys(process.env).filter(key => !key.includes('SECRET')));

// Configura middleware essenziali
app.use(express.json());
app.use(cors());

// Gestione sicura della directory uploads - CORRETTO PER VERCEL
try {
  // Su Vercel, possiamo scrivere SOLO nella directory /tmp
  const uploadsDir = '/tmp';
  
  console.log(`Utilizzo directory temporanea: ${uploadsDir}`);
  
  // Non abbiamo bisogno di creare /tmp perché esiste già in Vercel
  app.use('/uploads', express.static(uploadsDir));
  console.log('Middleware per uploads configurato con /tmp');
} catch (error) {
  console.error('Errore nella configurazione uploads:', error);
}

// Endpoint per il login (mock)
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Tentativo di login ricevuto:', { email });
    
    // DEBUG: Stampa tutti i dati della richiesta
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    if (email && password) {
      console.log('Login valido, generazione risposta');
      
      // IMPORTANTE: Esattamente la struttura che il frontend si aspetta
      const token = 'mock-token-123456';
      const userData = {
        id: '1',
        name: 'Admin ITFPLUS',
        email: email,
        role: 'ADMIN'
      };
      
      // Risposta corretta per il frontend
      res.status(200).json({
        token: token,
        user: userData
      });
    } else {
      console.log('Credenziali mancanti');
      res.status(401).json({ message: 'Credenziali non valide' });
    }
  } catch (error) {
    console.error('Errore durante il login:', error);
    res.status(500).json({ message: 'Errore durante il login' });
  }
});

// Endpoint per ottenere l'utente corrente
app.get('/api/users/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Richiesta utente corrente, auth:', authHeader ? 'presente' : 'assente');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      res.json({
        id: '1',
        name: 'Admin ITFPLUS',
        email: 'admin@itfplus.it',
        role: 'ADMIN'
      });
    } else {
      res.status(401).json({ message: 'Non autorizzato' });
    }
  } catch (error) {
    console.error('Errore nel recupero utente:', error);
    res.status(500).json({ message: 'Errore nel recupero utente' });
  }
});

// Endpoint per altri utenti
app.get('/api/users', (req, res) => {
  try {
    console.log('Richiesta lista utenti');
    res.json([
      { id: '1', name: 'Admin ITFPLUS', email: 'admin@itfplus.it', role: 'ADMIN' },
      { id: '2', name: 'Utente Cliente', email: 'cliente@example.com', role: 'USER' }
    ]);
  } catch (error) {
    console.error('Errore nel recupero utenti:', error);
    res.status(500).json({ message: 'Errore nel recupero utenti' });
  }
});

// Endpoint per documenti
app.get('/api/documents', (req, res) => {
  try {
    console.log('Richiesta lista documenti');
    res.json([
      { 
        id: '1', 
        title: 'Manuale ITFPLUS', 
        description: 'Manuale utente del sistema ITFPLUS', 
        fileUrl: '/uploads/manual.pdf',
        fileName: 'manual.pdf',
        mimetype: 'application/pdf',
        size: 12345,
        createdAt: new Date().toISOString()
      }
    ]);
  } catch (error) {
    console.error('Errore nel recupero documenti:', error);
    res.status(500).json({ message: 'Errore nel recupero documenti' });
  }
});

// Endpoint per clienti
app.get('/api/clients', (req, res) => {
  try {
    console.log('Richiesta lista clienti');
    res.json([
      { 
        id: '1', 
        name: 'Azienda Esempio', 
        contact: 'Mario Rossi',
        email: 'info@esempio.it', 
        phone: '123456789',
        address: 'Via Esempio 123',
        city: 'Milano',
        notes: 'Cliente attivo',
        createdAt: new Date().toISOString()
      }
    ]);
  } catch (error) {
    console.error('Errore nel recupero clienti:', error);
    res.status(500).json({ message: 'Errore nel recupero clienti' });
  }
});

// Endpoint di test
app.get('/api/test', (req, res) => {
  try {
    console.log('Richiesta test API');
    res.json({ 
      message: 'API funzionante!',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Errore nel test API:', error);
    res.status(500).json({ message: 'Errore nel test API' });
  }
});

// Home page API
app.get('/api', (req, res) => {
  try {
    console.log('Richiesta home page API');
    res.send(`
      <html>
        <head>
          <title>ITFPLUS API</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #2c3e50; }
            .card { border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <h1>ITFPLUS API</h1>
          <div class="card">
            <h2>API funzionante!</h2>
            <p>Il backend è attivo e risponde alle richieste.</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
          </div>
          <div class="card">
            <h3>Endpoint disponibili:</h3>
            <ul>
              <li><a href="/api/test">/api/test</a> - Test API</li>
              <li><a href="/api/users">/api/users</a> - Lista utenti</li>
              <li><a href="/api/clients">/api/clients</a> - Lista clienti</li>
              <li><a href="/api/documents">/api/documents</a> - Lista documenti</li>
            </ul>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Errore nella home page API:', error);
    res.status(500).send('Errore nella generazione della home page API');
  }
});

// Gestione errori generica
app.use((err, req, res, next) => {
  console.error('Errore non gestito:', err);
  res.status(500).json({ 
    message: 'Si è verificato un errore sul server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Gestione 404 per le routes non trovate
app.use((req, res) => {
  console.log(`Richiesta a endpoint non esistente: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Endpoint non trovato' });
});

// Per utilizzo serverless su Vercel
module.exports = async (req, res) => {
  console.log(`Richiesta serverless: ${req.method} ${req.url}`);
  return app(req, res);
}; 
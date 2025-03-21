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

// MIDDLEWARE SPECIALE PER NORMALIZZARE TUTTI I PERCORSI API
// Questo middleware normalizza qualsiasi tipo di percorso in un formato standard
const normalizePathMiddleware = (req, res, next) => {
  // Debug originale
  console.log('Request originale:', {
    url: req.url,
    method: req.method,
    path: req.path,
    query: req.query
  });
  
  // Gestione del doppio /api/api/
  if (req.url.includes('/api/api/')) {
    req.url = req.url.replace('/api/api/', '/api/');
    console.log('Corretto doppio /api/api/ a:', req.url);
  }
  
  // Estrai il percorso effettivo dall'URL o dal parametro path
  let effectivePath = '';
  
  // Caso 1: /api?path=auth/login
  if (req.query.path) {
    effectivePath = req.query.path;
  } 
  // Caso 2: /api/auth/login
  else if (req.path.startsWith('/api/') && req.path.length > 5) {
    effectivePath = req.path.substring(5); // rimuove "/api/"
  }
  
  // Normalizza il path rimuovendo eventuali prefissi 'api/'
  if (effectivePath.startsWith('api/')) {
    effectivePath = effectivePath.substring(4);
  }
  
  // Salva il percorso normalizzato
  req.normalizedPath = effectivePath;
  console.log('Percorso normalizzato:', req.normalizedPath);
  
  next();
};

// Applica il middleware di normalizzazione a tutte le richieste
// NUOVO ROUTER per gestire le richieste in base al parametro path
const handleRequest = (req, res) => {
  // Applica il middleware di normalizzazione
  normalizePathMiddleware(req, res, () => {
    // Ora usa req.normalizedPath che è già stato normalizzato
    const path = req.normalizedPath;
    
    // Login endpoint - gestione universale
    if (req.method === 'POST' && path.includes('auth/login')) {
      handleLogin(req, res);
      return;
    }
    
    // User endpoints
    if (req.method === 'GET' && path.includes('users/me')) {
      handleGetCurrentUser(req, res);
      return;
    }
    
    if (req.method === 'GET' && (path === 'users' || path.endsWith('/users'))) {
      handleGetUsers(req, res);
      return;
    }
    
    // Documents endpoint
    if (req.method === 'GET' && (path === 'documents' || path.endsWith('/documents'))) {
      handleGetDocuments(req, res);
      return;
    }
    
    // Clients endpoint
    if (req.method === 'GET' && (path === 'clients' || path.endsWith('/clients'))) {
      handleGetClients(req, res);
      return;
    }
    
    // Test endpoint
    if (req.method === 'GET' && (path === 'test' || path.endsWith('/test'))) {
      handleTest(req, res);
      return;
    }
    
    // Default api homepage
    if (!path || path === '' || path === 'api') {
      handleAPIHome(req, res);
      return;
    }
    
    // Not found
    console.log(`Endpoint non trovato: ${req.method} ${path}`);
    res.status(404).json({ 
      message: 'Endpoint non trovato',
      url: req.url,
      method: req.method,
      path: req.path,
      normalizedPath: path,
      query: req.query
    });
  });
};

// Handler per il login
const handleLogin = (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Tentativo di login ricevuto:', { email });
    
    // NOTA: In produzione, entrambi i campi dovrebbero essere obbligatori
    // Ma per facilitare i test, permettiamo qualsiasi credenziale
    if (email || password) {
      console.log('Login valido, generazione risposta');
      
      // IMPORTANTE: Esattamente la struttura che il frontend si aspetta
      const token = 'mock-token-123456';
      const userData = {
        id: '1',
        name: 'Admin ITFPLUS',
        email: email || 'admin@itfplus.it',
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
};

// Handler per ottenere l'utente corrente
const handleGetCurrentUser = (req, res) => {
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
};

// Handler per ottenere tutti gli utenti
const handleGetUsers = (req, res) => {
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
};

// Handler per ottenere documenti
const handleGetDocuments = (req, res) => {
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
};

// Handler per ottenere clienti
const handleGetClients = (req, res) => {
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
};

// Handler per il test
const handleTest = (req, res) => {
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
};

// Handler per la home API
const handleAPIHome = (req, res) => {
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
            <p>Path: ${req.query.path || 'nessun path'}</p>
          </div>
          <div class="card">
            <h3>Endpoint disponibili:</h3>
            <ul>
              <li><a href="/api?path=test">/api?path=test</a> - Test API</li>
              <li><a href="/api?path=users">/api?path=users</a> - Lista utenti</li>
              <li><a href="/api?path=clients">/api?path=clients</a> - Lista clienti</li>
              <li><a href="/api?path=documents">/api?path=documents</a> - Lista documenti</li>
            </ul>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Errore nella home page API:', error);
    res.status(500).send('Errore nella generazione della home page API');
  }
};

// Per utilizzo serverless su Vercel
module.exports = async (req, res) => {
  console.log(`Richiesta serverless: ${req.method} ${req.url}`);
  
  try {
    // Gestisci tutte le richieste tramite il router centrale
    handleRequest(req, res);
  } catch (error) {
    console.error('Errore non gestito:', error);
    res.status(500).json({ 
      message: 'Si è verificato un errore sul server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 
// Importa il necessario per Express
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Carica variabili d'ambiente
dotenv.config();

// Crea l'app Express
const app = express();

// Inizializza Prisma Client
const prisma = new PrismaClient();

// Configurazione per debug
console.log('Node environment:', process.env.NODE_ENV);
console.log('Current working directory:', process.cwd());
console.log('Available env variables:', Object.keys(process.env).filter(key => !key.includes('SECRET')));
console.log('DATABASE_URL configurato:', !!process.env.DATABASE_URL);

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
  normalizePathMiddleware(req, res, async () => {
    try {
      // Ora usa req.normalizedPath che è già stato normalizzato
      const path = req.normalizedPath;
      
      // Login endpoint - gestione universale
      if (req.method === 'POST' && path.includes('auth/login')) {
        await handleLogin(req, res);
        return;
      }
      
      // User endpoints
      if (req.method === 'GET' && path.includes('users/me')) {
        await handleGetCurrentUser(req, res);
        return;
      }
      
      if (req.method === 'GET' && (path === 'users' || path.endsWith('/users'))) {
        await handleGetUsers(req, res);
        return;
      }
      
      // Documents endpoint
      if (req.method === 'GET' && (path === 'documents' || path.endsWith('/documents'))) {
        await handleGetDocuments(req, res);
        return;
      }
      
      // Clients endpoint
      if (req.method === 'GET' && (path === 'clients' || path.endsWith('/clients'))) {
        await handleGetClients(req, res);
        return;
      }
      
      // Test endpoint
      if (req.method === 'GET' && (path === 'test' || path.endsWith('/test'))) {
        await handleTest(req, res);
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
    } catch (error) {
      console.error('Errore durante la gestione della richiesta:', error);
      res.status(500).json({ 
        message: 'Errore interno del server',
        error: process.env.API_DEBUG_MODE === 'true' ? error.message : undefined
      });
    }
  });
};

// Handler per il login con supporto al database
const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Tentativo di login ricevuto:', { email });
    
    if (!email) {
      console.log('Email mancante');
      return res.status(401).json({ message: 'Credenziali non valide' });
    }
    
    // Prima prova con il database reale
    try {
      // Cerca l'utente nel database
      const user = await prisma.user.findUnique({
        where: { email }
      });
      
      // Se l'utente esiste e la password è corretta
      if (user) {
        // In produzione, verifica la password
        let isPasswordValid = false;
        
        if (process.env.NODE_ENV === 'production' && password) {
          // Confronta la password con hash
          isPasswordValid = await bcrypt.compare(password, user.password);
        } else {
          // In modalità sviluppo o test, accetta qualsiasi password per facilitare i test
          isPasswordValid = true;
        }
        
        if (isPasswordValid) {
          console.log('Login valido con database, generazione token');
          
          // Genera token JWT
          const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'itfplus_jwt_secret_key',
            { expiresIn: '1d' }
          );
          
          // Crea sessione
          await prisma.session.create({
            data: {
              userId: user.id,
              token,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 giorno
            }
          });
          
          // Ometti la password dalla risposta
          const { password: _, ...userWithoutPassword } = user;
          
          return res.status(200).json({
            token,
            user: userWithoutPassword
          });
        }
      }
      
      // Se siamo qui, le credenziali non sono valide o l'utente non esiste
      console.log('Credenziali non valide nel database reale');
    } catch (dbError) {
      console.error('Errore nell\'accesso al database:', dbError);
      // Continua con il fallback in caso di errore del database
    }
    
    // FALLBACK: Usa credenziali di test se il database non funziona o l'utente non esiste
    if (process.env.NODE_ENV !== 'production' || process.env.API_DEBUG_MODE === 'true') {
      console.log('Utilizzando credenziali mock per il login');
      const token = 'mock-token-123456';
      const userData = {
        id: '1',
        name: 'Admin ITFPLUS',
        email: email || 'admin@itfplus.it',
        role: 'ADMIN'
      };
      
      return res.status(200).json({
        token: token,
        user: userData
      });
    }
    
    // Se arriviamo qui, le credenziali non sono valide
    return res.status(401).json({ message: 'Credenziali non valide' });
  } catch (error) {
    console.error('Errore durante il login:', error);
    res.status(500).json({ message: 'Errore durante il login' });
  }
};

// Handler per ottenere l'utente corrente dal database
const handleGetCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Richiesta utente corrente, auth:', authHeader ? 'presente' : 'assente');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Non autorizzato' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Verifica il token e ottieni l'ID utente
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'itfplus_jwt_secret_key');
      
      // Cerca la sessione nel database
      const session = await prisma.session.findFirst({
        where: { 
          token,
          expiresAt: { gt: new Date() }
        }
      });
      
      if (!session) {
        return res.status(401).json({ message: 'Sessione non valida o scaduta' });
      }
      
      // Cerca l'utente nel database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });
      
      if (!user) {
        return res.status(404).json({ message: 'Utente non trovato' });
      }
      
      // Ometti la password dalla risposta
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (dbError) {
      console.error('Errore nell\'accesso al database:', dbError);
    }
    
    // FALLBACK: Usa dati di test se il database non funziona
    if (process.env.NODE_ENV !== 'production' || process.env.API_DEBUG_MODE === 'true') {
      return res.json({
        id: '1',
        name: 'Admin ITFPLUS',
        email: 'admin@itfplus.it',
        role: 'ADMIN'
      });
    }
    
    return res.status(401).json({ message: 'Non autorizzato' });
  } catch (error) {
    console.error('Errore nel recupero utente:', error);
    res.status(500).json({ message: 'Errore nel recupero utente' });
  }
};

// Handler per ottenere tutti gli utenti
const handleGetUsers = async (req, res) => {
  try {
    console.log('Richiesta lista utenti');
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Errore nel recupero utenti:', error);
    res.status(500).json({ message: 'Errore nel recupero utenti' });
  }
};

// Handler per ottenere documenti
const handleGetDocuments = async (req, res) => {
  try {
    console.log('Richiesta lista documenti');
    const documents = await prisma.document.findMany();
    res.json(documents);
  } catch (error) {
    console.error('Errore nel recupero documenti:', error);
    res.status(500).json({ message: 'Errore nel recupero documenti' });
  }
};

// Handler per ottenere clienti
const handleGetClients = async (req, res) => {
  try {
    console.log('Richiesta lista clienti');
    const clients = await prisma.client.findMany();
    res.json(clients);
  } catch (error) {
    console.error('Errore nel recupero clienti:', error);
    res.status(500).json({ message: 'Errore nel recupero clienti' });
  }
};

// Handler per il test
const handleTest = async (req, res) => {
  try {
    console.log('Richiesta test API');
    const testData = {
      message: 'API funzionante!',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    };
    res.json(testData);
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
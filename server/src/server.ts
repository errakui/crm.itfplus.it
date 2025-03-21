// Importazione dei tipi personalizzati
import './types';

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

// Importazione delle route
import authRoutes from './routes/auth.routes';
import documentRoutes from './routes/document.routes';
import chatbotRoutes from './routes/chatbot.routes';
import contactRoutes from './routes/contact.routes';
import adminRoutes from './routes/admin.routes';

// Caricamento variabili d'ambiente
dotenv.config();

// Inizializzazione app Express
const app: Express = express();
const port = process.env.PORT || 8000;

// Inizializzazione Prisma
export const prisma = new PrismaClient();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabilita CSP per permettere il caricamento di PDF
  crossOriginEmbedderPolicy: false // Permette il caricamento di risorse cross-origin
}));

// Configurazione CORS per produzione
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Consenti richieste senza origin (come app mobile o Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('CORS non consentito'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Configura la directory uploads
const uploadsDir = path.resolve(process.cwd(), 'uploads');
console.log(`Controllando directory uploads: ${uploadsDir}`);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Directory uploads creata: ${uploadsDir}`);
} else {
  console.log(`Directory uploads esistente: ${uploadsDir}`);
}

// Middleware per servire file statici
app.use(express.static(path.join(__dirname, '../../public')));

// Configura il middleware express.static per servire i file direttamente dalla directory uploads
app.use('/uploads', express.static(uploadsDir));
console.log(`Middleware per /uploads configurato per servire file da: ${uploadsDir}`);

// Se in produzione, servi i file statici del frontend
if (process.env.NODE_ENV === 'production') {
  // Percorso alla cartella build del frontend
  const clientBuildPath = path.join(__dirname, '../../client/build');
  console.log(`Servendo file statici da: ${clientBuildPath}`);
  
  // Servi i file statici
  app.use(express.static(clientBuildPath));
  
  // Per tutte le altre richieste, servi l'app React
  app.get('*', (req, res) => {
    // Escludi le richieste API
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    }
  });
}

// Configurazione delle route
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api', contactRoutes);

// Endpoint di test
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'ITFPLUS API funzionante!' });
});

// Rotta principale per reindirizzare alla pagina di login
app.get('/', (req: Request, res: Response) => {
  res.redirect('/api/auth/login');
});

// Middleware per la gestione degli errori
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Si è verificato un errore!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Avvio del server
app.listen(port, () => {
  console.log(`Server in esecuzione su http://localhost:${port}`);
});

// Gestione chiusura server
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Connessione al database chiusa');
  process.exit(0);
});

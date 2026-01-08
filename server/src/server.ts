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
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Importazione delle route
import authRoutes from './routes/auth.routes';
import documentRoutes from './routes/document.routes';
import chatbotRoutes from './routes/chatbot.routes';
import contactRoutes from './routes/contact.routes';
import adminRoutes from './routes/admin.routes';
import publicRoutes from './routes/public.routes';

// Caricamento variabili d'ambiente
dotenv.config();

// Inizializzazione app Express
const app: Express = express();
const port = process.env.PORT || 8000;

// Inizializzazione Prisma
export const prisma = new PrismaClient();

// Configurazione Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // limite di richieste per IP
  message: 'Troppe richieste da questo IP, riprova tra 15 minuti'
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false // Permette il caricamento di risorse cross-origin
}));
app.use(cors());
app.use(express.json({ limit: '1024mb' }));
app.use(express.urlencoded({ extended: true, limit: '1024mb' }));
app.use(morgan('dev'));

// Compressione gzip per tutte le risposte
app.use(compression());

// Applica rate limiting a tutte le route API
app.use('/api/', limiter);

console.log('Limite upload impostato a 1024MB');

// Configura la directory uploads
const uploadsDir = path.resolve(process.cwd(), 'uploads');
console.log(`Controllando directory uploads: ${uploadsDir}`);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Directory uploads creata: ${uploadsDir}`);
} else {
  console.log(`Directory uploads esistente: ${uploadsDir}`);
}

// Middleware per servire file statici con caching ottimizzato
app.use(express.static(path.join(__dirname, '../../public'), {
  maxAge: '5m',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Configura il middleware express.static per servire i file direttamente dalla directory uploads con caching
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '5m',
  etag: true,
  lastModified: true
}));
console.log(`Middleware per /uploads configurato per servire file da: ${uploadsDir}`);

// Configurazione delle route
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api', contactRoutes);
app.use('/api/public', publicRoutes);

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

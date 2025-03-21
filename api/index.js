// Importa il necessario per Express
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Crea l'app Express
const app = express();

// Configura middleware essenziali
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Controlla che esista la directory uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Directory uploads creata: ${uploadsDir}`);
} else {
  console.log(`Directory uploads esistente: ${uploadsDir}`);
}

// Configura uploads
app.use('/uploads', express.static(uploadsDir));

// Importa routes
try {
  const authRoutes = require('../server/src/routes/auth.routes');
  const userRoutes = require('../server/src/routes/user.routes');
  const clientRoutes = require('../server/src/routes/client.routes');
  const documentRoutes = require('../server/src/routes/document.routes');
  
  // Configura routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/documents', documentRoutes);
  
  console.log('Routes configurate con successo');
} catch (error) {
  console.error('Errore nel caricamento delle routes:', error);
}

// Middleware per errori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Si è verificato un errore sul server' });
});

// Endpoint di test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funzionante!' });
});

// Esporta sia come serverless function che come app Express
module.exports = app;
module.exports.handler = async (req, res) => {
  await app(req, res);
}; 
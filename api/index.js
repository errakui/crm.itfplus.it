// Importa il necessario per Express
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Funzione per gestire i file come serverless
module.exports = async (req, res) => {
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
  }
  
  // Configura uploads
  app.use('/uploads', express.static(uploadsDir));
  
  // Importa routes (adatta i percorsi alle tue rotte)
  const authRoutes = require('../server/src/routes/auth.routes');
  const userRoutes = require('../server/src/routes/user.routes');
  const clientRoutes = require('../server/src/routes/client.routes');
  const documentRoutes = require('../server/src/routes/document.routes');
  
  // Configura routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/documents', documentRoutes);
  
  // Middleware per errori
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Si è verificato un errore sul server' });
  });
  
  // Gestisci la richiesta con Express
  return new Promise((resolve, reject) => {
    app(req, res, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}; 
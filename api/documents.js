// Upload sul server usando Cloudinary (modificato)
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const pdfParse = require('pdf-parse');

// Inizializza Prisma Client
const prisma = new PrismaClient();

// Configura Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Configura multer per l'upload temporaneo
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Funzione per estrarre il testo da un PDF
async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Errore nell\'estrazione del testo dal PDF:', error);
    return null;
  }
}

module.exports = async (req, res) => {
  // Log per debug
  console.log('API /documents chiamata');
  console.log('Metodo:', req.method);
  console.log('Headers:', req.headers);
  
  // Gestione CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Gestione delle richieste preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verifica autenticazione
  let userId;
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token non fornito' });
    }

    console.log('Token ricevuto:', token.substring(0, 20) + '...');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
    
    console.log('UserID decodificato:', userId);
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
  } catch (error) {
    console.error('Errore di autenticazione:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token non valido' });
    }
    return res.status(500).json({ error: 'Errore del server' });
  }

  // Gestione POST - Upload documento
  if (req.method === 'POST') {
    console.log('Elaborazione richiesta POST per upload documento');
    try {
      // Elabora l'upload (middleware multer)
      upload.single('file')(req, res, async (err) => {
        if (err) {
          console.error('Errore nell\'upload del file:', err);
          return res.status(400).json({ error: `Errore nell'upload del file: ${err.message}` });
        }
        
        if (!req.file) {
          console.error('Nessun file ricevuto nella richiesta');
          return res.status(400).json({ error: 'Nessun file ricevuto' });
        }

        console.log('File ricevuto:', req.file.originalname);
        
        try {
          const { title, description, category, city } = req.body;
          
          if (!title) {
            return res.status(400).json({ error: 'Il titolo è obbligatorio' });
          }
          
          console.log('Dati documento:', { title, description, category, city });
          
          // Estrai il testo dal PDF
          let content = null;
          if (req.file.mimetype === 'application/pdf') {
            content = await extractTextFromPDF(req.file.buffer);
          }
          
          // Upload su Cloudinary
          console.log('Caricamento su Cloudinary...');
          const fileBuffer = req.file.buffer;
          
          // Opzioni per Cloudinary
          const uploadOptions = {
            folder: 'documents',
            resource_type: 'auto',
            public_id: path.parse(req.file.originalname).name
          };
          
          // Crea uno stream di upload verso Cloudinary
          const cloudinaryUpload = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              uploadOptions,
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            );
            
            uploadStream.end(fileBuffer);
          });
          
          const uploadResult = await cloudinaryUpload;
          console.log('File caricato su Cloudinary:', uploadResult.secure_url);
          
          // Salva le informazioni del documento nel database
          const document = await prisma.document.create({
            data: {
              title,
              description: description || '',
              content: content || '',
              category: category || '',
              city: city || '',
              fileType: path.extname(req.file.originalname).substring(1) || 'pdf',
              fileName: req.file.originalname,
              fileSize: req.file.size,
              fileUrl: uploadResult.secure_url,
              cloudinaryPublicId: uploadResult.public_id,
              uploadedBy: { connect: { id: userId } }
            }
          });
          
          console.log('Documento salvato nel database:', document.id);
          
          return res.status(201).json({
            message: 'Documento caricato con successo',
            document
          });
        } catch (uploadError) {
          console.error('Errore durante l\'elaborazione del file:', uploadError);
          return res.status(500).json({ 
            error: 'Errore durante l\'elaborazione del file',
            details: uploadError.message 
          });
        }
      });
    } catch (error) {
      console.error('Errore generale nel gestore POST:', error);
      return res.status(500).json({ 
        error: 'Errore del server', 
        details: error.message 
      });
    }
  } 
  // Gestione GET - Scarica documento
  else if (req.method === 'GET' && req.url.includes('/download')) {
    try {
      const documentId = req.url.split('/')[2]; // Estrae l'ID dal percorso
      
      console.log('Richiesta di download per documento ID:', documentId);
      
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });
      
      if (!document) {
        return res.status(404).json({ error: 'Documento non trovato' });
      }
      
      console.log('Documento trovato, URL:', document.fileUrl);
      
      // Scarica il file da Cloudinary
      const response = await fetch(document.fileUrl);
      const buffer = await response.buffer();
      
      // Imposta gli header per il download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
      
      // Invia il file
      return res.send(buffer);
      
    } catch (error) {
      console.error('Errore durante il download del documento:', error);
      return res.status(500).json({ error: 'Errore del server' });
    }
  }
  // Altri metodi
  else {
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    return res.status(405).json({ error: `Metodo ${req.method} non consentito` });
  }
}; 
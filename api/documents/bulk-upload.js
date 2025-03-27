// Funzione serverless per l'upload bulk dei documenti
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
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

// Lista di città italiane comuni
const cityNames = [
  'Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 'Firenze', 'Bari', 'Catania',
  'Venezia', 'Verona', 'Messina', 'Padova', 'Trieste', 'Taranto', 'Brescia', 'Prato', 'Reggio Calabria',
  'Modena', 'Parma', 'Livorno', 'Cagliari', 'Foggia', 'Sassari', 'Salerno', 'Pescara', 'Siracusa',
  'Pordenone', 'Treviso', 'Udine', 'Vicenza', 'Monza', 'Bergamo', 'Como', 'Trento'
];

// Funzione per estrarre il testo da un PDF
async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Errore nell\'estrazione del testo dal PDF:', error);
    return '';
  }
}

// Funzione per individuare la città nel nome o contenuto del file
function extractCityFromText(text, filename) {
  // Prima controlla nel nome del file
  const cityFromFilename = cityNames.find(city => 
    filename.toUpperCase().includes(city.toUpperCase())
  );
  
  if (cityFromFilename) {
    return cityFromFilename;
  }
  
  // Poi controlla nel contenuto
  const cityFromContent = cityNames.find(city => 
    text.toUpperCase().includes(city.toUpperCase())
  );
  
  return cityFromContent || 'Non specificata';
}

// Configura multer per l'upload temporaneo
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

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
    // Verifica autenticazione e ruolo admin
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token non fornito' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Non autorizzato' });
    }

    // Gestione POST - Upload bulk documenti
    if (req.method === 'POST') {
      // Utilizziamo multer per processare i file
      upload.array('documents')(req, res, async (err) => {
        if (err) {
          console.error('Errore nell\'upload dei file:', err);
          return res.status(400).json({ error: `Errore nell'upload dei file: ${err.message}` });
        }
        
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ error: 'Nessun file ricevuto' });
        }
        
        console.log(`Ricevuti ${req.files.length} file`);
        
        // Array per tenere traccia dei risultati
        const results = {
          successful: 0,
          failed: 0,
          failedFiles: []
        };
        
        // Processa ogni file
        const createdDocuments = [];
        
        for (const file of req.files) {
          try {
            // Ottieni il nome base del file (senza estensione)
            const baseName = path.parse(file.originalname).name;
            
            // Upload su Cloudinary
            console.log(`Caricamento su Cloudinary: ${file.originalname}`);
            
            // Opzioni per Cloudinary
            const uploadOptions = {
              folder: 'documents',
              resource_type: 'auto',
              public_id: baseName
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
              
              streamifier.createReadStream(file.buffer).pipe(uploadStream);
            });
            
            const uploadResult = await cloudinaryUpload;
            console.log('File caricato su Cloudinary:', uploadResult.secure_url);
            
            // Estrai il testo dal PDF
            let content = '';
            if (file.mimetype === 'application/pdf') {
              content = await extractTextFromPDF(file.buffer);
            }
            
            // Estrai la città dal nome file o dal contenuto
            const extractedCity = extractCityFromText(content, file.originalname);
            
            // Crea il documento nel database
            const document = await prisma.document.create({
              data: {
                title: baseName,
                description: `Documento caricato automaticamente: ${baseName}`,
                content: content,
                fileName: file.originalname,
                fileSize: file.size,
                fileType: path.extname(file.originalname).substring(1) || 'pdf',
                fileUrl: uploadResult.secure_url,
                cloudinaryPublicId: uploadResult.public_id,
                city: extractedCity,
                keywords: [], // Array vuoto per i keywords
                user: {
                  connect: { id: user.id }
                },
                isActive: true,
                viewCount: 0,
                downloadCount: 0,
                favoriteCount: 0
              }
            });
            
            createdDocuments.push(document);
            results.successful++;
            
          } catch (fileError) {
            console.error(`Errore nell'elaborazione del file ${file.originalname}:`, fileError);
            results.failed++;
            results.failedFiles.push(file.originalname);
          }
        }
        
        return res.status(201).json({
          message: `Upload completato: ${results.successful} file caricati con successo, ${results.failed} falliti.`,
          results,
          documents: createdDocuments
        });
      });
    } else {
      return res.status(405).json({ error: 'Metodo non consentito' });
    }
  } catch (error) {
    console.error('Errore durante l\'upload bulk dei documenti:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token non valido' });
    }
    return res.status(500).json({ error: 'Errore del server' });
  } finally {
    await prisma.$disconnect();
  }
}; 
// Funzione serverless per la gestione di tutti i documenti da parte dell'admin
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

// Inizializza Prisma Client
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // Gestione CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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

    console.log('Token ricevuto e tentativo di verifica');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verificato, userID:', decoded.userId);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      console.log('Utente trovato:', !!user);
      
      if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Non autorizzato' });
      }

      console.log('Utente è admin, ruolo:', user.role);
      
      // Gestione GET - Lista tutti i documenti
      if (req.method === 'GET') {
        const { search, city, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // Costruisci la query
        const where = {};

        if (search) {
          where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { keywords: { has: search } }
          ];
        }

        if (city) {
          where.city = city;
        }

        console.log('Tentativo di recupero documenti con query:', JSON.stringify(where));
        console.log('Verifica schema Prisma Document:', Object.keys(prisma.document));
        
        try {
          // Recupera i documenti con informazioni sull'utente che li ha aggiunti
          const [documents, total] = await Promise.all([
            prisma.document.findMany({
              where,
              skip,
              take: parseInt(limit),
              orderBy: { createdAt: 'desc' },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }),
            prisma.document.count({ where })
          ]);

          console.log(`Trovati ${documents.length} documenti`);
          
          return res.status(200).json({
            documents,
            pagination: {
              total,
              page: parseInt(page),
              limit: parseInt(limit),
              totalPages: Math.ceil(total / limit)
            }
          });
        } catch (queryError) {
          console.error('Errore nella query di ricerca documenti:', queryError);
          return res.status(500).json({ 
            error: 'Errore nella ricerca documenti',
            details: queryError.message
          });
        }
      }
    } catch (authError) {
      console.error('Errore nell\'autenticazione:', authError);
      return res.status(401).json({ error: 'Token non valido', details: authError.message });
    }

    return res.status(405).json({ error: 'Metodo non consentito' });
  } catch (error) {
    console.error('Errore durante la gestione dei documenti:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token non valido' });
    }
    return res.status(500).json({ error: 'Errore del server' });
  } finally {
    await prisma.$disconnect();
  }
}; 
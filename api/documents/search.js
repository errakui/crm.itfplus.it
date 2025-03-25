// Funzione serverless per la ricerca dei documenti
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
    // Verifica autenticazione
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token non fornito' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ error: 'Utente non trovato' });
    }

    // Gestione GET - Ricerca documenti
    if (req.method === 'GET') {
      const { query, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      if (!query) {
        return res.status(400).json({ error: 'Query di ricerca richiesta' });
      }

      // Costruisci la query di ricerca
      const where = {
        isActive: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { keywords: { has: query } },
          { content: { contains: query, mode: 'insensitive' } }
        ]
      };

      // Recupera i documenti con paginazione
      const [documents, total] = await Promise.all([
        prisma.document.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            description: true,
            city: true,
            filePath: true,
            fileSize: true,
            createdAt: true,
            keywords: true
          }
        }),
        prisma.document.count({ where })
      ]);

      // Formatta i risultati
      const results = documents.map(doc => ({
        ...doc,
        matches: {
          title: doc.title.toLowerCase().includes(query.toLowerCase()),
          description: doc.description.toLowerCase().includes(query.toLowerCase()),
          keywords: doc.keywords.includes(query)
        }
      }));

      return res.status(200).json({
        results,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    return res.status(405).json({ error: 'Metodo non consentito' });
  } catch (error) {
    console.error('Errore durante la ricerca dei documenti:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token non valido' });
    }
    return res.status(500).json({ error: 'Errore del server' });
  } finally {
    await prisma.$disconnect();
  }
}; 
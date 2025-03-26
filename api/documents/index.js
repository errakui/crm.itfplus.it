// Funzione serverless per la gestione dei documenti
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

// Inizializza Prisma Client
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // Gestione CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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

    // Gestione GET - Lista documenti
    if (req.method === 'GET') {
      const { search, cities, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      // Costruisci la query
      const where = {
        isActive: true
      };

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { keywords: { has: search } },
          { content: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (cities) {
        // Gestisci sia stringa singola che array di città
        const cityArray = Array.isArray(cities) ? cities : [cities];
        where.city = {
          in: cityArray
        };
      }

      // Recupera i documenti
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
            content: true,
            city: true,
            fileUrl: true,
            fileSize: true,
            createdAt: true,
            keywords: true
          }
        }),
        prisma.document.count({ where })
      ]);

      // Formatta i risultati per evidenziare le corrispondenze
      const formattedDocuments = documents.map(doc => {
        const matches = {
          title: search ? doc.title.toLowerCase().includes(search.toLowerCase()) : false,
          description: search ? doc.description?.toLowerCase().includes(search.toLowerCase()) : false,
          content: search ? doc.content?.toLowerCase().includes(search.toLowerCase()) : false,
          keywords: search ? doc.keywords.some(k => k.toLowerCase().includes(search.toLowerCase())) : false
        };

        // Estrai un snippet dal contenuto se c'è una corrispondenza
        let contentSnippet = null;
        if (matches.content && doc.content) {
          const index = doc.content.toLowerCase().indexOf(search.toLowerCase());
          if (index !== -1) {
            const start = Math.max(0, index - 100);
            const end = Math.min(doc.content.length, index + 100);
            contentSnippet = doc.content.substring(start, end);
          }
        }

        return {
          ...doc,
          matches,
          contentSnippet
        };
      });

      return res.status(200).json({
        documents: formattedDocuments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    // Gestione POST - Nuovo documento (solo admin)
    if (req.method === 'POST') {
      if (user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Non autorizzato' });
      }

      const { title, description, city, keywords, filePath, fileSize } = req.body;

      const document = await prisma.document.create({
        data: {
          title,
          description,
          city,
          keywords,
          filePath,
          fileSize,
          addedBy: user.id,
          isActive: true
        }
      });

      return res.status(201).json(document);
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
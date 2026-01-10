import { Request, Response } from 'express';
import { prisma } from '../server';
import axios from 'axios';

// Interfacce - usando any per compatibilità con Prisma Json
interface SearchMessage {
  role: 'user' | 'assistant';
  content: string;
  documents?: SearchResultDocument[];
  totalFound?: number;
  timestamp: string; // String per compatibilità JSON
}

interface SearchResultDocument {
  id: string;
  title: string;
  snippet: string;
  cities: string[];
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: Date;
}

// Limite giornaliero per utenti normali
const DAILY_LIMIT_USER = 2;

/**
 * BOOKY SEARCH - Ricerca intelligente con AI
 * Cerca nel database e analizza i risultati con Perplexity
 * LIMITE: 2 messaggi/giorno per USER, illimitato per ADMIN
 */
export const searchWithAI = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Messaggio non fornito' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Utente non autenticato' });
    }

    // CONTROLLO LIMITE GIORNALIERO (solo per USER, non per ADMIN)
    if (userRole !== 'ADMIN') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      // Conta i messaggi dell'utente di oggi
      const todaySessions = await prisma.chatSession.findMany({
        where: {
          userId,
          updatedAt: {
            gte: todayStart,
            lte: todayEnd
          }
        },
        select: {
          messages: true
        }
      });

      // Conta solo i messaggi 'user' (non le risposte 'assistant')
      let todayMessageCount = 0;
      for (const session of todaySessions) {
        const messages = session.messages as any[];
        todayMessageCount += messages.filter((m: any) => m.role === 'user').length;
      }

      console.log(`[BOOKY SEARCH] User ${userId} - Messaggi oggi: ${todayMessageCount}/${DAILY_LIMIT_USER}`);

      if (todayMessageCount >= DAILY_LIMIT_USER) {
        return res.status(429).json({ 
          message: `Hai raggiunto il limite giornaliero di ${DAILY_LIMIT_USER} ricerche. Il limite si resetta a mezzanotte.`,
          limitReached: true,
          dailyLimit: DAILY_LIMIT_USER,
          used: todayMessageCount
        });
      }
    }

    console.log(`[BOOKY SEARCH] Query: "${message}" - User: ${userId} (${userRole})`);

    // 1. RICERCA NEL DATABASE - Estrai parole chiave dalla domanda
    const searchTerms = extractSearchTerms(message);
    console.log(`[BOOKY SEARCH] Termini estratti: ${searchTerms}`);

    // Query PostgreSQL full-text search
    const searchResults = await prisma.$queryRawUnsafe(`
      SELECT 
        d.id,
        d.title,
        d.cities,
        ts_headline(
          'italian',
          COALESCE(d.content, ''),
          websearch_to_tsquery('italian', unaccent($1)),
          'StartSel=<mark>,StopSel=</mark>,MaxFragments=2,MaxWords=30,MinWords=15'
        ) AS snippet,
        ts_rank_cd(d.tsv, websearch_to_tsquery('italian', unaccent($1))) AS rank
      FROM documents d
      WHERE d.tsv @@ websearch_to_tsquery('italian', unaccent($1))
      ORDER BY rank DESC
      LIMIT 10;
    `, searchTerms) as any[];

    // Conta totale risultati
    const countResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as total
      FROM documents d
      WHERE d.tsv @@ websearch_to_tsquery('italian', unaccent($1));
    `, searchTerms) as any[];

    const totalFound = parseInt(countResult[0]?.total || '0');

    console.log(`[BOOKY SEARCH] Trovate ${totalFound} sentenze, mostrando prime ${searchResults.length}`);

    // 2. Formatta i documenti per la risposta
    const documents: SearchResultDocument[] = searchResults.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      snippet: doc.snippet || 'Nessun estratto disponibile',
      cities: doc.cities || []
    }));

    // 3. ANALISI AI con Perplexity
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Chiave API non configurata' });
    }

    // Prepara contesto con i risultati trovati
    let documentContext = '';
    if (documents.length > 0) {
      documentContext = documents.slice(0, 5).map((doc, i) => 
        `${i + 1}. "${doc.title}"\n   Estratto: ${doc.snippet.replace(/<\/?mark>/g, '**')}\n   Tribunale: ${doc.cities.join(', ') || 'N/A'}`
      ).join('\n\n');
    }

    const aiPrompt = `
Sei BOOKY, l'assistente AI legale di ITFPLUS. L'utente ha cercato nel database delle sentenze.

DOMANDA UTENTE: "${message}"

${totalFound > 0 ? `RISULTATI RICERCA (${totalFound} sentenze trovate, mostro le prime ${documents.length}):

${documentContext}

Analizza i risultati trovati e rispondi all'utente:
1. Riassumi brevemente cosa emerge dalle sentenze trovate
2. Evidenzia gli orientamenti giurisprudenziali rilevanti
3. Suggerisci quali sentenze potrebbero essere più utili per il suo caso
4. Se necessario, suggerisci di affinare la ricerca

NON inventare sentenze. Basati SOLO sui risultati mostrati sopra.` : 
`Non ho trovato sentenze corrispondenti alla tua ricerca.
Suggerisci all'utente di:
1. Usare termini diversi o più generici
2. Provare sinonimi giuridici
3. Verificare l'ortografia`}

Rispondi in italiano, in modo professionale ma accessibile.
`;

    // Chiamata Perplexity
    const aiResponse = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'Sei BOOKY, un assistente legale AI esperto in giurisprudenza italiana. Aiuti avvocati e professionisti a trovare e comprendere sentenze. Rispondi sempre in italiano.'
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        max_tokens: 1500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    const aiAnswer = aiResponse.data.choices[0].message.content;

    // 4. SALVA LA CHAT nella sessione
    const userMessage: SearchMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    const assistantMessage: SearchMessage = {
      role: 'assistant',
      content: aiAnswer,
      documents: documents.slice(0, 5),
      totalFound,
      timestamp: new Date().toISOString()
    };

    let session;
    if (sessionId) {
      // Aggiorna sessione esistente
      const existingSession = await prisma.chatSession.findUnique({
        where: { id: sessionId }
      });

      if (existingSession && existingSession.userId === userId) {
        const existingMessages = existingSession.messages as any[];
        const newMessages = [...existingMessages, userMessage, assistantMessage];
        session = await prisma.chatSession.update({
          where: { id: sessionId },
          data: {
            messages: JSON.parse(JSON.stringify(newMessages)),
            updatedAt: new Date()
          }
        });
      }
    }

    if (!session) {
      // Crea nuova sessione - converti a JSON puro per Prisma
      session = await prisma.chatSession.create({
        data: {
          userId,
          messages: JSON.parse(JSON.stringify([userMessage, assistantMessage]))
        }
      });
    }

    console.log(`[BOOKY SEARCH] Risposta generata - Session: ${session.id}`);

    return res.status(200).json({
      response: aiAnswer,
      documents,
      totalFound,
      sessionId: session.id
    });

  } catch (error: any) {
    console.error('[BOOKY SEARCH] Errore:', error);
    return res.status(500).json({
      message: 'Errore durante la ricerca',
      error: error.message
    });
  }
};

/**
 * Estrae termini di ricerca dalla domanda dell'utente
 */
function extractSearchTerms(message: string): string {
  // Rimuovi parole comuni e stopwords italiane
  const stopwords = [
    'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una',
    'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
    'che', 'chi', 'cui', 'come', 'dove', 'quando', 'perché',
    'ho', 'hai', 'ha', 'abbiamo', 'hanno', 'sono', 'sei', 'è', 'siamo',
    'mi', 'ti', 'ci', 'vi', 'si', 'me', 'te', 'ce', 've', 'se',
    'questo', 'questa', 'questi', 'queste', 'quello', 'quella',
    'mio', 'tuo', 'suo', 'nostro', 'vostro', 'loro',
    'cosa', 'quale', 'quali', 'quanto', 'quanti', 'quanta', 'quante',
    'vorrei', 'cerco', 'cerca', 'trovare', 'sapere', 'capire',
    'cliente', 'caso', 'sentenza', 'sentenze', 'giurisprudenza'
  ];

  const words = message
    .toLowerCase()
    .replace(/[^\w\sàèéìòù]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopwords.includes(word));

  // Prendi le parole più significative (max 6)
  const searchTerms = words.slice(0, 6).join(' ');
  
  return searchTerms || message.substring(0, 50);
}

/**
 * Ottieni tutte le sessioni chat dell'utente
 */
export const getChatSessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Utente non autenticato' });
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        messages: true,
        updatedAt: true,
        createdAt: true
      }
    });

    // Estrai titolo dalla prima domanda
    const formattedSessions = sessions.map(session => {
      const messages = session.messages as any[];
      const firstUserMessage = messages.find(m => m.role === 'user');
      const title = firstUserMessage?.content?.substring(0, 50) + '...' || 'Chat senza titolo';
      
      return {
        id: session.id,
        title,
        updatedAt: session.updatedAt,
        messageCount: messages.length
      };
    });

    return res.status(200).json({ sessions: formattedSessions });
  } catch (error: any) {
    console.error('[BOOKY SEARCH] Errore getChatSessions:', error);
    return res.status(500).json({ message: 'Errore nel recupero delle sessioni' });
  }
};

/**
 * Ottieni una sessione specifica con tutti i messaggi
 */
export const getChatSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { sessionId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Utente non autenticato' });
    }

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.userId !== userId) {
      return res.status(404).json({ message: 'Sessione non trovata' });
    }

    return res.status(200).json({
      id: session.id,
      messages: session.messages,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    });
  } catch (error: any) {
    console.error('[BOOKY SEARCH] Errore getChatSession:', error);
    return res.status(500).json({ message: 'Errore nel recupero della sessione' });
  }
};

/**
 * Elimina una sessione chat
 */
export const deleteChatSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { sessionId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Utente non autenticato' });
    }

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.userId !== userId) {
      return res.status(404).json({ message: 'Sessione non trovata' });
    }

    await prisma.chatSession.delete({
      where: { id: sessionId }
    });

    return res.status(200).json({ message: 'Sessione eliminata' });
  } catch (error: any) {
    console.error('[BOOKY SEARCH] Errore deleteChatSession:', error);
    return res.status(500).json({ message: 'Errore nell\'eliminazione della sessione' });
  }
};

/**
 * Ottieni lo stato del limite giornaliero
 */
export const getUsageLimit = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (!userId) {
      return res.status(401).json({ message: 'Utente non autenticato' });
    }

    // Admin ha accesso illimitato
    if (userRole === 'ADMIN') {
      return res.status(200).json({
        isAdmin: true,
        unlimited: true,
        dailyLimit: -1,
        used: 0,
        remaining: -1
      });
    }

    // Conta messaggi di oggi per USER
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todaySessions = await prisma.chatSession.findMany({
      where: {
        userId,
        updatedAt: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      select: {
        messages: true
      }
    });

    let todayMessageCount = 0;
    for (const session of todaySessions) {
      const messages = session.messages as any[];
      todayMessageCount += messages.filter((m: any) => m.role === 'user').length;
    }

    return res.status(200).json({
      isAdmin: false,
      unlimited: false,
      dailyLimit: DAILY_LIMIT_USER,
      used: todayMessageCount,
      remaining: Math.max(0, DAILY_LIMIT_USER - todayMessageCount)
    });
  } catch (error: any) {
    console.error('[BOOKY SEARCH] Errore getUsageLimit:', error);
    return res.status(500).json({ message: 'Errore nel recupero del limite' });
  }
};


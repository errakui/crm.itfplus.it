import { Request, Response } from 'express';
import { prisma } from '../server';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { PDFExtract, PDFExtractResult } from 'pdf.js-extract';

const pdfExtract = new PDFExtract();

// Interfaccia per la richiesta di chat
interface ChatRequest {
  documentId?: string;
  message: string;
  context?: string;
}

// Interfacce per i tipi di pdf.js-extract
interface PDFPage {
  content: PDFContent[];
  // altre proprietà che potrebbero esistere
}

interface PDFContent {
  str: string;
  // altre proprietà che potrebbero esistere
}

/**
 * Estrae il testo da un documento PDF
 */
const extractTextFromPDF = async (filePath: string): Promise<string> => {
  try {
    const data: PDFExtractResult = await pdfExtract.extract(filePath, {});
    const textContent = data.pages.map((page: PDFPage) => 
      page.content.map((item: PDFContent) => item.str).join(' ')
    ).join('\n');
    return textContent;
  } catch (error) {
    console.error('Errore nell\'estrazione del testo dal PDF:', error);
    throw new Error('Impossibile estrarre il testo dal documento PDF');
  }
};

/**
 * Aggiorna il contenuto testuale di un documento
 */
const updateDocumentTextContent = async (documentId: string, textContent: string): Promise<void> => {
  await prisma.document.update({
    where: { id: documentId },
    data: { textContent }
  });
};

/**
 * Controller per ottenere risposte dal chatbot
 */
export const getChatResponse = async (req: Request, res: Response) => {
  try {
    const { documentId, message, context }: ChatRequest = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Messaggio non fornito' });
    }

    let prompt = message;
    let documentText = '';

    // Se è stato specificato un documento, estrai il testo
    if (documentId) {
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });

      if (!document) {
        return res.status(404).json({ message: 'Documento non trovato' });
      }

      // Utilizza il contenuto testuale memorizzato oppure estrailo dal PDF
      if (document.textContent) {
        documentText = document.textContent;
      } else {
        // Verifica se il file esiste
        if (!document.filePath || !fs.existsSync(document.filePath)) {
          return res.status(404).json({ message: 'File del documento non trovato' });
        }

        // Estrai il testo dal PDF
        documentText = await extractTextFromPDF(document.filePath);

        // Aggiorna il documento con il testo estratto
        await updateDocumentTextContent(documentId, documentText);
      }

      // Costruisci un prompt arricchito con il contesto del documento
      prompt = `
Ecco il testo di una sentenza legale. Per favore, rispondi alla seguente domanda basandoti ESCLUSIVAMENTE sul contenuto della sentenza.

CONTENUTO SENTENZA:
${documentText.substring(0, 15000)} 
${documentText.length > 15000 ? '... (testo troncato per limiti di dimensione)' : ''}

DOMANDA: ${message}

Rispondi in modo chiaro, preciso e diretto, facendo riferimento alle parti rilevanti della sentenza quando necessario. Se la domanda non è pertinente al contenuto della sentenza, spiega cortesemente che puoi rispondere solo a domande relative al documento visualizzato.
`;
    } else if (context) {
      // Se è stato fornito un contesto ma non un documentId
      prompt = `
${context}

DOMANDA: ${message}

Rispondi in modo chiaro, preciso e diretto, facendo riferimento alle informazioni pertinenti quando necessario.
`;
    }

    // Chiave API
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Chiave API non configurata' });
    }

    // Log per debug
    console.log('Tentativo di chiamata a Perplexity API con modello sonar-pro');
    
    try {
      // Chiamata all'API di Perplexity
      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: 'Sei un assistente legale esperto che aiuta a comprendere le sentenze legali italiane. Fornisci risposte precise, accurate e utili, citando le parti rilevanti del documento quando necessario. Spiega i termini legali in modo comprensibile e fornisci analisi contestualizzate. Rispondi SOLO in base al contenuto del documento.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );

      console.log('Risposta ricevuta da Perplexity API');
      
      // Estrai e restituisci la risposta
      const botResponse = response.data.choices[0].message.content;

      return res.status(200).json({
        response: botResponse,
        documentContext: documentId ? true : false
      });
    } catch (apiError: any) {
      console.error('Errore nella chiamata a Perplexity API:', apiError);
      
      // Fallback a un altro modello se il primo fallisce
      console.log('Tentativo fallback con modello sonar-medium-chat');
      
      try {
        const fallbackResponse = await axios.post(
          'https://api.perplexity.ai/chat/completions',
          {
            model: 'sonar-medium-chat',
            messages: [
              {
                role: 'system',
                content: 'Sei un assistente legale esperto che aiuta a comprendere le sentenze legali italiane. Fornisci risposte precise, accurate e utili, citando le parti rilevanti del documento quando necessario. Spiega i termini legali in modo comprensibile e fornisci analisi contestualizzate.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 1000
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            }
          }
        );
        
        console.log('Risposta ricevuta da modello fallback');
        const fallbackBotResponse = fallbackResponse.data.choices[0].message.content;
        
        return res.status(200).json({
          response: fallbackBotResponse,
          documentContext: documentId ? true : false,
          fallback: true
        });
      } catch (fallbackError: any) {
        console.error('Errore anche nel fallback:', fallbackError);
        
        // Log dettagliato dell'errore
        if (fallbackError.response) {
          console.error('Dettagli errore API fallback:', {
            status: fallbackError.response.status,
            data: fallbackError.response.data
          });
          return res.status(500).json({
            message: `Errore dall'API di Perplexity: ${fallbackError.response.status}`,
            error: fallbackError.response.data || fallbackError.message
          });
        } else {
          return res.status(500).json({
            message: 'Errore durante la comunicazione con il servizio chatbot',
            error: fallbackError.message || 'Errore sconosciuto'
          });
        }
      }
    }
  } catch (error: any) {
    console.error('Errore generale nel controller chatbot:', error);
    return res.status(500).json({
      message: 'Errore durante elaborazione della richiesta',
      error: error.message
    });
  }
};

/**
 * Controller per ottenere un riassunto di un documento
 */
export const getSummary = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({ message: 'ID del documento non fornito' });
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return res.status(404).json({ message: 'Documento non trovato' });
    }

    // Utilizza il contenuto testuale memorizzato oppure estrailo dal PDF
    let documentText = '';
    if (document.textContent) {
      documentText = document.textContent;
    } else {
      // Verifica se il file esiste
      if (!document.filePath || !fs.existsSync(document.filePath)) {
        return res.status(404).json({ message: 'File del documento non trovato' });
      }

      // Estrai il testo dal PDF
      documentText = await extractTextFromPDF(document.filePath);

      // Aggiorna il documento con il testo estratto
      await updateDocumentTextContent(documentId, documentText);
    }

    const prompt = `
Per favore, crea un riassunto conciso ma completo della seguente sentenza legale. Il riassunto dovrebbe evidenziare:
1. Le parti coinvolte
2. Il contesto e i fatti principali del caso
3. Le questioni legali rilevanti
4. La decisione del tribunale
5. Il ragionamento giuridico principale

CONTENUTO SENTENZA:
${documentText.substring(0, 15000)}
${documentText.length > 15000 ? '... (testo troncato per limiti di dimensione)' : ''}

Fornisci un riassunto strutturato che catturi l'essenza della sentenza in modo chiaro e accessibile, mantenendo l'accuratezza legale.
`;

    // Chiamata all'API di Perplexity
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Chiave API non configurata' });
    }

    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'llama-3-sonar-small-32k-chat',
        messages: [
          {
            role: 'system',
            content: 'Sei un assistente legale esperto specializzato nella creazione di riassunti di sentenze legali italiane. Crea riassunti strutturati, completi e facili da comprendere.'
          },
          {
            role: 'user',
            content: prompt
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

    // Estrai e restituisci la risposta
    const summary = response.data.choices[0].message.content;

    return res.status(200).json({
      summary,
      title: document.title
    });
  } catch (error: any) {
    console.error('Errore nella generazione del riassunto:', error);
    return res.status(500).json({
      message: 'Errore durante la generazione del riassunto',
      error: error.message
    });
  }
}; 
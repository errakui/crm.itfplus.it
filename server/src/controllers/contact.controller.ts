import { Request, Response } from 'express';
import { sendContactEmail, sendSupportEmail } from '../utils/emailService';

// Interfacce per la richiesta
interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
}

interface SupportRequest {
  subject: string;
  message: string;
  email?: string;
}

/**
 * Gestisce l'invio di un modulo di contatto
 */
export const submitContact = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message, category }: ContactRequest = req.body;

    // Validazione
    if (!name || !email || !subject || !message || !category) {
      return res.status(400).json({ success: false, message: 'Tutti i campi sono obbligatori' });
    }

    // Invio email
    const success = await sendContactEmail(name, email, subject, message, category);

    if (success) {
      return res.status(200).json({ 
        success: true, 
        message: 'Il tuo messaggio è stato inviato con successo. Ti risponderemo al più presto.' 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Si è verificato un errore durante l\'invio del messaggio. Riprova più tardi.' 
      });
    }
  } catch (error) {
    console.error('Errore nella gestione del modulo di contatto:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Si è verificato un errore durante l\'elaborazione della richiesta' 
    });
  }
};

/**
 * Gestisce l'invio di una richiesta di supporto
 */
export const submitSupport = async (req: Request, res: Response) => {
  try {
    const { subject, message, email }: SupportRequest = req.body;

    // Validazione
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Oggetto e messaggio sono obbligatori' });
    }

    // Invio email
    const success = await sendSupportEmail(subject, message, email);

    if (success) {
      return res.status(200).json({ 
        success: true, 
        message: 'La tua richiesta di assistenza è stata inviata con successo. Ti risponderemo al più presto.' 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Si è verificato un errore durante l\'invio della richiesta. Riprova più tardi.' 
      });
    }
  } catch (error) {
    console.error('Errore nella gestione del modulo di assistenza:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Si è verificato un errore durante l\'elaborazione della richiesta' 
    });
  }
}; 
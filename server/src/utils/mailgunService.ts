import mailgun from 'mailgun-js';
import dotenv from 'dotenv';

dotenv.config();

// Configura mailgun
const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY!,
  domain: process.env.MAILGUN_DOMAIN!
});

/**
 * Invia un'email usando Mailgun
 * @param to - Destinatario
 * @param subject - Oggetto
 * @param html - Contenuto HTML
 * @param text - Contenuto testo
 * @param from - Mittente (opzionale)
 * @param replyTo - Risposta a (opzionale)
 * @returns Promise
 */
export const sendEmail = async (
  to: string | string[],
  subject: string,
  html: string,
  text?: string,
  from?: string,
  replyTo?: string
): Promise<any> => {
  try {
    // Log per debug
    console.log('Invio email usando Mailgun:');
    console.log('- API Key configurata:', process.env.MAILGUN_API_KEY ? 'Sì' : 'No');
    console.log('- Dominio configurato:', process.env.MAILGUN_DOMAIN);
    console.log('- Destinatario:', to);
    console.log('- Mittente:', from || process.env.EMAIL_FROM);
    
    const data = {
      from: from || process.env.EMAIL_FROM || 'noreply@itfplus.it',
      to: Array.isArray(to) ? to.join(',') : to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, '') // Converte HTML in testo
    };
    
    if (replyTo) {
      data['h:Reply-To'] = replyTo;
    }
    
    const result = await mg.messages().send(data);
    console.log('Email inviata con successo:', result);
    return result;
  } catch (error) {
    console.error('Errore nell\'invio dell\'email con Mailgun:', error);
    throw error;
  }
};

/**
 * Invia un'email di contatto
 */
export const sendContactEmail = async (
  name: string,
  email: string,
  subject: string,
  message: string,
  category: string
): Promise<boolean> => {
  try {
    const emailBody = `
      <h2>Nuovo messaggio dal form di contatto</h2>
      <p><strong>Nome:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Categoria:</strong> ${category}</p>
      <p><strong>Messaggio:</strong></p>
      <p>${message}</p>
    `;

    await sendEmail(
      process.env.EMAIL_TO || 'info@itfplus.it',
      `[Contatto] ${subject}`,
      emailBody,
      undefined,
      process.env.EMAIL_FROM,
      email
    );
    
    return true;
  } catch (error) {
    console.error('Errore nell\'invio dell\'email di contatto:', error);
    return false;
  }
};

/**
 * Invia un'email di assistenza
 */
export const sendSupportEmail = async (
  subject: string,
  message: string,
  email?: string
): Promise<boolean> => {
  try {
    const emailBody = `
      <h2>Nuova richiesta di assistenza</h2>
      <p><strong>Oggetto:</strong> ${subject}</p>
      <p><strong>Email:</strong> ${email || 'Non specificata'}</p>
      <p><strong>Messaggio:</strong></p>
      <p>${message}</p>
    `;

    await sendEmail(
      process.env.EMAIL_TO || 'info@itfplus.it',
      `[Assistenza] ${subject}`,
      emailBody,
      undefined,
      process.env.EMAIL_FROM,
      email
    );
    
    return true;
  } catch (error) {
    console.error('Errore nell\'invio dell\'email di assistenza:', error);
    return false;
  }
};

/**
 * Invia un'email con le credenziali utente
 */
export const sendAccountEmail = async (
  email: string,
  name: string,
  password: string,
  expiresInDays: number
): Promise<boolean> => {
  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(expiresInDays.toString()));
    const formattedDate = expiryDate.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const emailBody = `
      <h2>Benvenuto in ITFPlus</h2>
      <p>Gentile ${name},</p>
      <p>Ti diamo il benvenuto nella piattaforma ITFPlus. Di seguito trovi le tue credenziali di accesso:</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p><strong>Validità account:</strong> ${expiresInDays} giorni (fino al ${formattedDate})</p>
      <p>Ti consigliamo di cambiare la password dopo il primo accesso per maggiore sicurezza.</p>
      <p>Per accedere alla piattaforma, visita <a href="https://crm-itfplus-it-beryl.vercel.app/login">ITFPlus</a>.</p>
      <p>Cordiali saluti,<br>Il team di ITFPlus</p>
    `;

    await sendEmail(
      email,
      'Benvenuto in ITFPlus - Credenziali di Accesso',
      emailBody
    );
    
    return true;
  } catch (error) {
    console.error('Errore nell\'invio dell\'email con credenziali:', error);
    return false;
  }
}; 
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configurazione del trasportatore email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verifica che il trasportatore sia configurato correttamente
const verifyTransporter = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('Configurazione email verificata con successo!');
    return true;
  } catch (error) {
    console.error('Errore nella configurazione email:', error);
    return false;
  }
};

// Verifica all'avvio
verifyTransporter();

/**
 * Invia un'email di supporto/contatto
 */
export const sendContactEmail = async (
  name: string,
  email: string,
  subject: string,
  message: string,
  category: string
): Promise<boolean> => {
  try {
    // Controlla se le variabili d'ambiente sono configurate
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_TO) {
      console.error('Configurazione email mancante nel file .env');
      return false;
    }
    
    // Costruisci il corpo dell'email
    const emailBody = `
      <h2>Nuovo messaggio dal form di contatto</h2>
      <p><strong>Nome:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Categoria:</strong> ${category}</p>
      <p><strong>Messaggio:</strong></p>
      <p>${message}</p>
    `;

    // Opzioni dell'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: `[Contatto] ${subject}`,
      html: emailBody,
      replyTo: email
    };

    // Invio dell'email
    await transporter.sendMail(mailOptions);
    console.log('Email di contatto inviata con successo a:', process.env.EMAIL_TO);
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
    // Costruisci il corpo dell'email
    const emailBody = `
      <h2>Nuova richiesta di assistenza</h2>
      <p><strong>Oggetto:</strong> ${subject}</p>
      <p><strong>Email:</strong> ${email || 'Non specificata'}</p>
      <p><strong>Messaggio:</strong></p>
      <p>${message}</p>
    `;

    // Opzioni dell'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: `[Assistenza] ${subject}`,
      html: emailBody,
      ...(email && { replyTo: email })
    };

    // Invio dell'email
    await transporter.sendMail(mailOptions);
    console.log('Email di assistenza inviata con successo a:', process.env.EMAIL_TO);
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
    // Calcola la data di scadenza
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(expiresInDays.toString()));
    const formattedDate = expiryDate.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Costruisci il corpo dell'email
    const emailBody = `
      <h2>Benvenuto in ITFPlus</h2>
      <p>Gentile ${name},</p>
      <p>Ti diamo il benvenuto nella piattaforma ITFPlus. Di seguito trovi le tue credenziali di accesso:</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p><strong>Validità account:</strong> ${expiresInDays} giorni (fino al ${formattedDate})</p>
      <p>Ti consigliamo di cambiare la password dopo il primo accesso per maggiore sicurezza.</p>
      <p>Per accedere alla piattaforma, visita <a href="http://localhost:3000/login">ITFPlus</a>.</p>
      <p>Cordiali saluti,<br>Il team di ITFPlus</p>
    `;

    // Opzioni dell'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Benvenuto in ITFPlus - Credenziali di Accesso',
      html: emailBody
    };

    // Invio dell'email
    await transporter.sendMail(mailOptions);
    console.log('Email con credenziali inviata con successo a:', email);
    return true;
  } catch (error) {
    console.error('Errore nell\'invio dell\'email con credenziali:', error);
    return false;
  }
};

/**
 * Invia un'email di notifica quando la password è stata cambiata
 * @param email Indirizzo email dell'utente
 * @param name Nome dell'utente
 */
export const sendPasswordChangedEmail = async (email: string, name: string): Promise<void> => {
  try {
    // Ottieni la data e l'ora attuale
    const now = new Date();
    const formattedDate = now.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Costruisci il corpo dell'email
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1B2A4A;">Notifica di Sicurezza</h2>
        </div>
        <p>Gentile ${name},</p>
        <p>Ti informiamo che la password del tuo account ITF+ è stata modificata con successo.</p>
        <p><strong>Data e ora della modifica:</strong> ${formattedDate} alle ${formattedTime}</p>
        <p>Se non hai effettuato tu questa modifica, ti preghiamo di contattare immediatamente il nostro supporto tecnico.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="font-size: 12px; color: #666;">Questo è un messaggio automatico, si prega di non rispondere a questa email.</p>
          <p style="font-size: 12px; color: #666;">© ${new Date().getFullYear()} ITF Plus - Tutti i diritti riservati</p>
        </div>
      </div>
    `;
    
    // Opzioni per l'invio dell'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'ITF+ - Modifica Password Completata',
      html: emailBody
    };
    
    // Invia l'email
    await transporter.sendMail(mailOptions);
    console.log(`Email di notifica cambio password inviata con successo a ${email}`);
  } catch (error) {
    console.error('Errore nell\'invio dell\'email di notifica cambio password:', error);
    throw error;
  }
}; 
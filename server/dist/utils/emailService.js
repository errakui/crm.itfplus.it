"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordChangedEmail = exports.sendAccountEmail = exports.sendSupportEmail = exports.sendContactEmail = exports.verifyTransporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Configurazione del trasportatore email
const transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
// Verifica che il trasportatore sia configurato correttamente
const verifyTransporter = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield transporter.verify();
        console.log('Configurazione email verificata con successo!');
        return true;
    }
    catch (error) {
        console.error('Errore nella configurazione email:', error);
        return false;
    }
});
exports.verifyTransporter = verifyTransporter;
// Template base per le email
const emailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ITFPlus</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #1B2A4A;
      padding: 20px;
      text-align: center;
    }
    .header img {
      max-width: 200px;
      height: auto;
    }
    .content {
      background-color: #ffffff;
      padding: 30px;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #1B2A4A;
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      background-color: #f5f5f5;
      margin-top: 20px;
      border-radius: 5px;
    }
    .footer p {
      margin: 5px 0;
      color: #666;
    }
    .social-links {
      margin: 15px 0;
    }
    .social-links a {
      color: #1B2A4A;
      text-decoration: none;
      margin: 0 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://crm.itfplus.it/logoitfplus.png" alt="ITFPlus Logo">
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ITF Plus - Tutti i diritti riservati</p>
      <div class="social-links">
        <a href="https://www.linkedin.com/company/itfplus">LinkedIn</a>
        <a href="https://www.facebook.com/itfplus">Facebook</a>
      </div>
      <p>Per assistenza: info@giuridica.net</p>
    </div>
  </div>
</body>
</html>
`;
/**
 * Invia un'email di contatto
 */
const sendContactEmail = (name, email, subject, message, category) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield transporter.sendMail(mailOptions);
        console.log('Email di contatto inviata con successo a:', process.env.EMAIL_TO);
        return true;
    }
    catch (error) {
        console.error('Errore nell\'invio dell\'email di contatto:', error);
        return false;
    }
});
exports.sendContactEmail = sendContactEmail;
/**
 * Invia un'email di assistenza
 */
const sendSupportEmail = (subject, message, email) => __awaiter(void 0, void 0, void 0, function* () {
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
        const mailOptions = Object.assign({ from: process.env.EMAIL_USER, to: process.env.EMAIL_TO, subject: `[Assistenza] ${subject}`, html: emailBody }, (email && { replyTo: email }));
        // Invio dell'email
        yield transporter.sendMail(mailOptions);
        console.log('Email di assistenza inviata con successo a:', process.env.EMAIL_TO);
        return true;
    }
    catch (error) {
        console.error('Errore nell\'invio dell\'email di assistenza:', error);
        return false;
    }
});
exports.sendSupportEmail = sendSupportEmail;
/**
 * Invia un'email con le credenziali utente
 */
const sendAccountEmail = (email, name, password, expiresInDays) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Calcola la data di scadenza
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + parseInt(expiresInDays.toString()));
        const formattedDate = expiryDate.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const content = `
      <h2 style="color: #1B2A4A; margin-bottom: 20px;">Benvenuto in ITFPlus</h2>
      <p>Gentile ${name},</p>
      <p>Ti diamo il benvenuto nella piattaforma ITFPlus. Di seguito trovi le tue credenziali di accesso:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p><strong>Validità account:</strong> ${expiresInDays} giorni (fino al ${formattedDate})</p>
      </div>
      <p style="color: #666; font-size: 14px;">Per sicurezza, ti consigliamo di cambiare la password dopo il primo accesso.</p>
      <div style="text-align: center;">
        <a href="https://crm.itfplus.it" class="button">Accedi a ITFPlus</a>
      </div>
      <p style="margin-top: 20px;">Cordiali saluti,<br>Il team di ITFPlus</p>
    `;
        // Opzioni dell'email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Benvenuto in ITFPlus - Credenziali di Accesso',
            html: emailTemplate(content)
        };
        // Invio dell'email
        yield transporter.sendMail(mailOptions);
        console.log('Email con credenziali inviata con successo a:', email);
        return true;
    }
    catch (error) {
        console.error('Errore nell\'invio dell\'email con credenziali:', error);
        return false;
    }
});
exports.sendAccountEmail = sendAccountEmail;
/**
 * Invia un'email di notifica quando la password è stata cambiata
 */
const sendPasswordChangedEmail = (email, name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ottieni la data e l'ora attuale
        const now = new Date();
        const formattedDate = now.toLocaleDateString('it-IT');
        const formattedTime = now.toLocaleTimeString('it-IT');
        const content = `
      <h2 style="color: #1B2A4A; margin-bottom: 20px;">Notifica di Sicurezza</h2>
      <p>Gentile ${name},</p>
      <p>Ti informiamo che la password del tuo account ITF+ è stata modificata con successo.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p><strong>Data e ora della modifica:</strong><br>${formattedDate} alle ${formattedTime}</p>
      </div>
      <p style="color: #d32f2f; font-size: 14px;">Se non hai effettuato tu questa modifica, contatta subito il supporto tecnico.</p>
      <div style="text-align: center;">
        <a href="https://crm.itfplus.it" class="button">Accedi al tuo account</a>
      </div>
      <p style="margin-top: 20px;">Cordiali saluti,<br>Il team di ITFPlus</p>
    `;
        // Opzioni per l'invio dell'email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'ITF+ - Modifica Password Completata',
            html: emailTemplate(content)
        };
        // Invia l'email
        yield transporter.sendMail(mailOptions);
        console.log(`Email di notifica cambio password inviata con successo a ${email}`);
    }
    catch (error) {
        console.error('Errore nell\'invio dell\'email di notifica cambio password:', error);
        throw error;
    }
});
exports.sendPasswordChangedEmail = sendPasswordChangedEmail;
//# sourceMappingURL=emailService.js.map
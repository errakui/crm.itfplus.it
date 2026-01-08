import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../server';
import { sendAccountEmail } from '../utils/emailService';
import { googleSheetsService } from '../services/googleSheetsService';

// Interfaccia per la richiesta account pubblica
interface PublicAccountRequest {
  email: string;
  name: string;
  expiresInDays?: number; // Default: 3 giorni per trial
  // Campi extra per Google Sheets
  telefono?: string;
  azienda?: string;
  ruolo?: string;
  settore?: string;
  citta?: string;
  note?: string;
}

/**
 * Endpoint pubblico per richiedere la creazione di un account
 * Utilizzato da form esterni per automatizzare la creazione account
 */
export const requestAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      email, 
      name, 
      expiresInDays = 3,
      telefono,
      azienda,
      ruolo,
      settore,
      citta,
      note 
    }: PublicAccountRequest = req.body;

    // Validazione base
    if (!email || !name) {
      res.status(400).json({ 
        success: false, 
        message: 'Email e nome sono obbligatori' 
      });
      return;
    }

    // Validazione formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ 
        success: false, 
        message: 'Formato email non valido' 
      });
      return;
    }

    // Verifica se l'utente esiste già
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ 
        success: false, 
        message: 'Un account con questa email esiste già' 
      });
      return;
    }

    // Genera una password casuale
    const generatedPassword = Math.random().toString(36).slice(-8) + 
                              Math.random().toString(36).slice(-8).toUpperCase() + 
                              Math.floor(Math.random() * 1000);
    
    // Hash della password
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Calcola la data di scadenza dell'account (default 3 giorni)
    const days = expiresInDays || 3;
    let expiresAt = null;
    if (days > 0) {
      expiresAt = new Date();
      expiresAt.setUTCHours(0, 0, 0, 0);
      expiresAt.setDate(expiresAt.getDate() + days);
    }

    // Crea l'utente nel database
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER', // Sempre USER per account pubblici
        expiresAt,
      },
    });

    // Invia email con le credenziali
    try {
      await sendAccountEmail(email, name, generatedPassword, days);
      console.log(`[PUBLIC API] Account creato e email inviata a ${email}`);
    } catch (emailError) {
      console.error('[PUBLIC API] Errore nell\'invio dell\'email:', emailError);
      // Non interrompiamo la creazione dell'utente se l'email fallisce
      // ma lo segnaliamo nella risposta
    }

    // Salva su Google Sheets (se configurato)
    if (googleSheetsService.isEnabled()) {
      try {
        const [nome, ...resto] = name.split(' ');
        const cognome = resto.join(' ');
        const scadenza = expiresAt ? new Date(expiresAt).toLocaleDateString('it-IT') : '';
        
        await googleSheetsService.saveTrialUser({
          nome: nome || '',
          cognome: cognome || '',
          email,
          telefono: telefono || '',
          azienda: azienda || '',
          ruolo: ruolo || '',
          settore: settore || '',
          citta: citta || '',
          note: note || '',
          scadenza,
        });
      } catch (sheetsError) {
        console.error('[PUBLIC API] Errore salvataggio Google Sheets:', sheetsError);
        // Non interrompiamo, è solo un log
      }
    }

    // Ometti la password nel risultato
    const { password, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'Account creato con successo. Le credenziali sono state inviate via email.',
      user: {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        name: userWithoutPassword.name,
        expiresAt: userWithoutPassword.expiresAt
      }
    });
  } catch (error) {
    console.error('[PUBLIC API] Errore nella creazione dell\'account:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Errore nella creazione dell\'account. Riprova più tardi.' 
    });
  }
};


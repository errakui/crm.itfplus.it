import axios from 'axios';

interface TrialUserData {
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  azienda: string;
  ruolo: string;
  settore: string;
  citta: string;
  note: string;
  scadenza: string;
}

class GoogleSheetsService {
  private webhookUrl: string = '';
  private enabled: boolean = false;

  constructor() {
    this.initializeWebhook();
  }

  private initializeWebhook() {
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    if (!webhookUrl) {
      console.log('[Google Sheets] Webhook non configurato. Servizio disabilitato.');
      return;
    }

    this.webhookUrl = webhookUrl;
    this.enabled = true;
    console.log('[Google Sheets] ✅ Webhook configurato');
  }

  async saveTrialUser(data: TrialUserData): Promise<boolean> {
    if (!this.enabled) {
      console.log('[Google Sheets] Servizio non abilitato, skip salvataggio');
      return false;
    }

    try {
      await axios.post(this.webhookUrl, data, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 secondi timeout
      });

      console.log(`[Google Sheets] ✅ Dati salvati per: ${data.email}`);
      return true;
    } catch (error: any) {
      console.error('[Google Sheets] ❌ Errore salvataggio:', error.message);
      return false;
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

// Esporta istanza singleton
export const googleSheetsService = new GoogleSheetsService();

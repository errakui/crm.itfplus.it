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
exports.googleSheetsService = void 0;
const axios_1 = __importDefault(require("axios"));
class GoogleSheetsService {
    constructor() {
        this.webhookUrl = '';
        this.enabled = false;
        this.initializeWebhook();
    }
    initializeWebhook() {
        const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
        if (!webhookUrl) {
            console.log('[Google Sheets] Webhook non configurato. Servizio disabilitato.');
            return;
        }
        this.webhookUrl = webhookUrl;
        this.enabled = true;
        console.log('[Google Sheets] ✅ Webhook configurato');
    }
    saveTrialUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled) {
                console.log('[Google Sheets] Servizio non abilitato, skip salvataggio');
                return false;
            }
            try {
                yield axios_1.default.post(this.webhookUrl, data, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000, // 10 secondi timeout
                });
                console.log(`[Google Sheets] ✅ Dati salvati per: ${data.email}`);
                return true;
            }
            catch (error) {
                console.error('[Google Sheets] ❌ Errore salvataggio:', error.message);
                return false;
            }
        });
    }
    isEnabled() {
        return this.enabled;
    }
}
// Esporta istanza singleton
exports.googleSheetsService = new GoogleSheetsService();
//# sourceMappingURL=googleSheetsService.js.map
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestAccount = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const server_1 = require("../server");
const emailService_1 = require("../utils/emailService");
const googleSheetsService_1 = require("../services/googleSheetsService");
/**
 * Endpoint pubblico per richiedere la creazione di un account
 * Utilizzato da form esterni per automatizzare la creazione account
 */
const requestAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, name, expiresInDays = 3, telefono, azienda, ruolo, settore, citta, note } = req.body;
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
        const existingUser = yield server_1.prisma.user.findUnique({
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
        const hashedPassword = yield bcrypt_1.default.hash(generatedPassword, 10);
        // Calcola la data di scadenza dell'account (default 3 giorni)
        const days = expiresInDays || 3;
        let expiresAt = null;
        if (days > 0) {
            expiresAt = new Date();
            expiresAt.setUTCHours(0, 0, 0, 0);
            expiresAt.setDate(expiresAt.getDate() + days);
        }
        // Crea l'utente nel database
        const newUser = yield server_1.prisma.user.create({
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
            yield (0, emailService_1.sendAccountEmail)(email, name, generatedPassword, days);
            console.log(`[PUBLIC API] Account creato e email inviata a ${email}`);
        }
        catch (emailError) {
            console.error('[PUBLIC API] Errore nell\'invio dell\'email:', emailError);
            // Non interrompiamo la creazione dell'utente se l'email fallisce
            // ma lo segnaliamo nella risposta
        }
        // Salva su Google Sheets (se configurato)
        if (googleSheetsService_1.googleSheetsService.isEnabled()) {
            try {
                const [nome, ...resto] = name.split(' ');
                const cognome = resto.join(' ');
                const scadenza = expiresAt ? new Date(expiresAt).toLocaleDateString('it-IT') : '';
                yield googleSheetsService_1.googleSheetsService.saveTrialUser({
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
            }
            catch (sheetsError) {
                console.error('[PUBLIC API] Errore salvataggio Google Sheets:', sheetsError);
                // Non interrompiamo, è solo un log
            }
        }
        // Ometti la password nel risultato
        const { password } = newUser, userWithoutPassword = __rest(newUser, ["password"]);
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
    }
    catch (error) {
        console.error('[PUBLIC API] Errore nella creazione dell\'account:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nella creazione dell\'account. Riprova più tardi.'
        });
    }
});
exports.requestAccount = requestAccount;
//# sourceMappingURL=public.controller.js.map
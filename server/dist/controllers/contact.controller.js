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
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitSupport = exports.submitContact = void 0;
const emailService_1 = require("../utils/emailService");
/**
 * Gestisce l'invio di un modulo di contatto
 */
const submitContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, subject, message, category } = req.body;
        // Validazione
        if (!name || !email || !subject || !message || !category) {
            return res.status(400).json({ success: false, message: 'Tutti i campi sono obbligatori' });
        }
        // Invio email
        const success = yield (0, emailService_1.sendContactEmail)(name, email, subject, message, category);
        if (success) {
            return res.status(200).json({
                success: true,
                message: 'Il tuo messaggio è stato inviato con successo. Ti risponderemo al più presto.'
            });
        }
        else {
            return res.status(500).json({
                success: false,
                message: 'Si è verificato un errore durante l\'invio del messaggio. Riprova più tardi.'
            });
        }
    }
    catch (error) {
        console.error('Errore nella gestione del modulo di contatto:', error);
        return res.status(500).json({
            success: false,
            message: 'Si è verificato un errore durante l\'elaborazione della richiesta'
        });
    }
});
exports.submitContact = submitContact;
/**
 * Gestisce l'invio di una richiesta di supporto
 */
const submitSupport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subject, message, email } = req.body;
        // Validazione
        if (!subject || !message) {
            return res.status(400).json({ success: false, message: 'Oggetto e messaggio sono obbligatori' });
        }
        // Invio email
        const success = yield (0, emailService_1.sendSupportEmail)(subject, message, email);
        if (success) {
            return res.status(200).json({
                success: true,
                message: 'La tua richiesta di assistenza è stata inviata con successo. Ti risponderemo al più presto.'
            });
        }
        else {
            return res.status(500).json({
                success: false,
                message: 'Si è verificato un errore durante l\'invio della richiesta. Riprova più tardi.'
            });
        }
    }
    catch (error) {
        console.error('Errore nella gestione del modulo di assistenza:', error);
        return res.status(500).json({
            success: false,
            message: 'Si è verificato un errore durante l\'elaborazione della richiesta'
        });
    }
});
exports.submitSupport = submitSupport;
//# sourceMappingURL=contact.controller.js.map
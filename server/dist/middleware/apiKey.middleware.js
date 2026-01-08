"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyApiKey = void 0;
/**
 * Middleware semplice per verificare API Key
 * Protegge gli endpoint pubblici da chiamate non autorizzate
 */
const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const expectedApiKey = process.env.PUBLIC_API_KEY;
    // Se non è configurata la chiave, permette l'accesso (per sviluppo)
    if (!expectedApiKey) {
        console.warn('[API KEY] Nessuna API key configurata, accesso permesso');
        next();
        return;
    }
    if (!apiKey) {
        res.status(401).json({
            success: false,
            message: 'API Key mancante. Fornire X-API-Key nell\'header.'
        });
        return;
    }
    if (apiKey !== expectedApiKey) {
        console.warn(`[API KEY] Tentativo di accesso con chiave non valida: ${apiKey.substring(0, 5)}...`);
        res.status(403).json({
            success: false,
            message: 'API Key non valida.'
        });
        return;
    }
    console.log('[API KEY] Chiave valida, accesso consentito');
    next();
};
exports.verifyApiKey = verifyApiKey;
//# sourceMappingURL=apiKey.middleware.js.map
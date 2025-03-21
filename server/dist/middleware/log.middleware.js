"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logMiddleware = void 0;
/**
 * Middleware per registrare informazioni sulle richieste
 */
const logMiddleware = (req, res, next) => {
    const { method, path, ip, headers } = req;
    const userAgent = headers['user-agent'] || 'Unknown';
    console.log(`[${new Date().toISOString()}] ${method} ${path} - IP: ${ip} - User-Agent: ${userAgent}`);
    if (req.user) {
        console.log(`[Request] Utente: ${req.user.email} (${req.user.role})`);
    }
    else {
        console.log('[Request] Utente: Non autenticato');
    }
    next();
};
exports.logMiddleware = logMiddleware;
//# sourceMappingURL=log.middleware.js.map
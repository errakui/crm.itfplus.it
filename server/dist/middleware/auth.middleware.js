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
exports.isAuthenticated = exports.isAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const server_1 = require("../server");
/**
 * Middleware per verificare il token JWT
 */
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        console.log(`[Auth] Tentativo di autenticazione con token: ${token ? 'presente' : 'assente'}`);
        if (!token) {
            res.status(401).json({ message: 'Accesso negato. Token mancante.' });
            return;
        }
        try {
            // Verifica il token nella sessione
            // 1. Controlla se esiste una sessione per questo token
            const session = yield server_1.prisma.session.findUnique({
                where: { token }
            });
            if (!session) {
                console.log(`[Auth] Sessione non trovata. Token non valido: ${token.substring(0, 10)}...`);
                res.status(401).json({ message: 'Sessione non valida. Fai login di nuovo.' });
            }
            // 2. Controlla se la sessione è scaduta
            if (session && new Date() > session.expiresAt) {
                console.log(`[Auth] Sessione scaduta. Eliminazione...`);
                yield server_1.prisma.session.delete({ where: { id: session.id } });
                res.status(401).json({ message: 'Sessione scaduta. Fai login di nuovo.' });
                return;
            }
            if (!session || new Date() > session.expiresAt) {
                if (session) {
                    // Elimina la sessione scaduta
                    yield server_1.prisma.session.delete({
                        where: { id: session.id }
                    });
                    console.log(`[Auth] Sessione scaduta per token: ${token.substring(0, 10)}...`);
                }
                else {
                    console.log(`[Auth] Sessione non trovata per token: ${token.substring(0, 10)}...`);
                }
                res.status(401).json({ message: 'Sessione scaduta o non valida.' });
                return;
            }
            console.log(`[Auth] Sessione valida trovata per token: ${token.substring(0, 10)}...`);
            // Verifica il token JWT
            jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret-fallback', (err, decoded) => {
                if (err) {
                    console.error(`[Auth] Errore verifica JWT:`, err);
                    res.status(403).json({ message: 'Token non valido.' });
                    return;
                }
                // Aggiungi l'utente decodificato alla richiesta
                req.user = {
                    id: decoded.id,
                    email: decoded.email,
                    role: decoded.role,
                    name: decoded.name
                };
                console.log(`[Auth] Utente autenticato: ${req.user.email} (${req.user.role})`);
                next();
            });
        }
        catch (error) {
            console.error(`[Auth] Errore durante l'autenticazione:`, error);
            res.status(500).json({ message: 'Errore durante l\'autenticazione.' });
        }
    }
    catch (error) {
        console.error(`[Auth] Errore generico:`, error);
        res.status(500).json({ message: 'Errore durante l\'autenticazione.' });
    }
});
exports.authenticateToken = authenticateToken;
/**
 * Middleware per verificare il ruolo ADMIN
 */
const isAdmin = (req, res, next) => {
    console.log(`[Admin Check] Verifica ruolo admin per utente:`, req.user);
    if (!req.user) {
        console.log(`[Admin Check] Nessun utente trovato nella richiesta`);
        res.status(401).json({ message: 'Accesso negato. Autenticazione richiesta.' });
        return;
    }
    if (req.user.role !== 'ADMIN') {
        console.log(`[Admin Check] Utente non admin. Ruolo: ${req.user.role}`);
        res.status(403).json({ message: 'Accesso negato. Autorizzazione ADMIN richiesta.' });
        return;
    }
    console.log(`[Admin Check] Accesso admin confermato per: ${req.user.email}`);
    next();
};
exports.isAdmin = isAdmin;
/**
 * Middleware per verificare solo l'autenticazione dell'utente
 */
const isAuthenticated = (req, res, next) => {
    console.log(`[Auth Check] Verifica autenticazione per utente:`, req.user);
    if (!req.user) {
        console.log(`[Auth Check] Nessun utente trovato nella richiesta`);
        res.status(401).json({ message: 'Accesso negato. Autenticazione richiesta.' });
        return;
    }
    console.log(`[Auth Check] Utente autenticato: ${req.user.email}`);
    next();
};
exports.isAuthenticated = isAuthenticated;
//# sourceMappingURL=auth.middleware.js.map
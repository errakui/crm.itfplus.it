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
exports.isAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const server_1 = require("../server");
/**
 * Middleware per verificare il token JWT
 */
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Accesso negato. Token mancante.' });
            return;
        }
        // Verifica il token nella sessione
        const session = yield server_1.prisma.session.findUnique({
            where: { token }
        });
        if (!session || new Date() > session.expiresAt) {
            if (session) {
                // Elimina la sessione scaduta
                yield server_1.prisma.session.delete({
                    where: { id: session.id }
                });
            }
            res.status(401).json({ message: 'Sessione scaduta o non valida.' });
            return;
        }
        // Verifica il token JWT
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret-fallback', (err, decoded) => {
            if (err) {
                res.status(403).json({ message: 'Token non valido.' });
                return;
            }
            // Aggiunge l'utente decodificato alla richiesta
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                name: decoded.name
            };
            next();
        });
    }
    catch (error) {
        console.error('Errore nell\'autenticazione:', error);
        res.status(500).json({ message: 'Errore durante l\'autenticazione.' });
    }
});
exports.authenticateToken = authenticateToken;
/**
 * Middleware per verificare il ruolo ADMIN
 */
const isAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: 'Accesso negato. Autenticazione richiesta.' });
        return;
    }
    if (req.user.role !== 'ADMIN') {
        res.status(403).json({ message: 'Accesso negato. Autorizzazione ADMIN richiesta.' });
        return;
    }
    next();
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=auth.middleware.js.map
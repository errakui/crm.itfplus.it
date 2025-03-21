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
exports.changePassword = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const server_1 = require("../server");
const emailService_1 = require("../utils/emailService");
// Enum per i ruoli (corrispondente all'enum nel database)
var Role;
(function (Role) {
    Role["USER"] = "USER";
    Role["ADMIN"] = "ADMIN";
})(Role || (Role = {}));
// Controller per la registrazione
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name, role } = req.body;
        // Verifica se l'utente esiste già
        const existingUser = yield server_1.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            res.status(400).json({ message: 'L\'utente esiste già' });
            return;
        }
        // Hash della password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Creazione utente nel database
        const newUser = yield server_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role || Role.USER
            }
        });
        // Ometti la password nel risultato
        const { password: _ } = newUser, userWithoutPassword = __rest(newUser, ["password"]);
        // Generazione token JWT
        const token = jsonwebtoken_1.default.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, process.env.JWT_SECRET || 'secret-fallback', { expiresIn: '1d' });
        res.status(201).json({
            message: 'Utente registrato con successo',
            user: userWithoutPassword,
            token
        });
    }
    catch (error) {
        console.error('Errore nella registrazione:', error);
        res.status(500).json({ message: 'Errore nella registrazione dell\'utente' });
    }
});
exports.register = register;
// Controller per il login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Verifica se l'utente esiste
        const user = yield server_1.prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            res.status(401).json({ message: 'Credenziali non valide' });
            return;
        }
        // Verifica se l'account è scaduto
        if (user.expiresAt && new Date() > user.expiresAt) {
            res.status(401).json({ message: 'Il tuo account è scaduto. Contatta l\'amministratore.' });
            return;
        }
        // Verifica della password
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Credenziali non valide' });
            return;
        }
        // Ometti la password nel risultato
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        // Generazione token JWT
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret-fallback', { expiresIn: '1d' });
        // Salva la sessione
        yield server_1.prisma.session.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 giorno
            }
        });
        res.status(200).json({
            message: 'Login effettuato con successo',
            user: userWithoutPassword,
            token
        });
    }
    catch (error) {
        console.error('Errore durante il login:', error);
        res.status(500).json({ message: 'Errore durante il login' });
    }
});
exports.login = login;
// Controller per il logout
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Token non fornito' });
            return;
        }
        // Elimina la sessione
        yield server_1.prisma.session.deleteMany({
            where: { token }
        });
        res.status(200).json({ message: 'Logout effettuato con successo' });
    }
    catch (error) {
        console.error('Errore durante il logout:', error);
        res.status(500).json({ message: 'Errore durante il logout' });
    }
});
exports.logout = logout;
// ----- FUNZIONI ADMIN PER GESTIONE UTENTI -----
// Ottiene tutti gli utenti
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield server_1.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                expiresAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json({ users });
    }
    catch (error) {
        console.error('Errore nel recupero degli utenti:', error);
        res.status(500).json({ message: 'Errore nel recupero degli utenti' });
    }
});
exports.getAllUsers = getAllUsers;
// Ottiene un utente specifico
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield server_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                expiresAt: true,
            },
        });
        if (!user) {
            res.status(404).json({ message: 'Utente non trovato' });
            return;
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.error('Errore nel recupero dell\'utente:', error);
        res.status(500).json({ message: 'Errore nel recupero dell\'utente' });
    }
});
exports.getUserById = getUserById;
// Crea un nuovo utente
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, name, role, expiresInDays } = req.body;
        // Verifica se l'utente esiste già
        const existingUser = yield server_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(400).json({ message: 'L\'utente con questa email esiste già' });
            return;
        }
        // Genera una password casuale
        const generatedPassword = Math.random().toString(36).slice(-8);
        // Hash della password
        const hashedPassword = yield bcrypt_1.default.hash(generatedPassword, 10);
        // Calcola la data di scadenza dell'account
        let expiresAt = null;
        if (expiresInDays) {
            expiresAt = new Date();
            // Impostiamo la data di scadenza esattamente a expiresInDays giorni dalla creazione
            // Usiamo setUTCHours(0,0,0,0) per impostare l'ora a mezzanotte
            expiresAt.setUTCHours(0, 0, 0, 0);
            expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays.toString()));
        }
        // Crea l'utente nel database
        const newUser = yield server_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role,
                expiresAt,
            },
        });
        // Invia email con le credenziali
        try {
            yield (0, emailService_1.sendAccountEmail)(email, name, generatedPassword, expiresInDays);
            console.log(`Email di credenziali inviata a ${email}`);
        }
        catch (emailError) {
            console.error('Errore nell\'invio dell\'email con le credenziali:', emailError);
            // Non interrompiamo la creazione dell'utente se l'email fallisce
        }
        // Ometti la password nel risultato
        const { password } = newUser, userWithoutPassword = __rest(newUser, ["password"]);
        res.status(201).json({
            message: 'Utente creato con successo',
            user: userWithoutPassword,
        });
    }
    catch (error) {
        console.error('Errore nella creazione dell\'utente:', error);
        res.status(500).json({ message: 'Errore nella creazione dell\'utente' });
    }
});
exports.createUser = createUser;
// Aggiorna un utente esistente
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { email, name, role, expiresInDays } = req.body;
        // Verifica se l'utente esiste
        const existingUser = yield server_1.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            res.status(404).json({ message: 'Utente non trovato' });
            return;
        }
        // Verifica che l'email non sia già in uso da un altro utente
        if (email !== existingUser.email) {
            const emailExists = yield server_1.prisma.user.findUnique({
                where: { email },
            });
            if (emailExists) {
                res.status(400).json({ message: 'L\'email è già in uso da un altro utente' });
                return;
            }
        }
        // Calcola la nuova data di scadenza dell'account
        let expiresAt = existingUser.expiresAt;
        if (expiresInDays) {
            expiresAt = new Date();
            // Impostiamo la data di scadenza esattamente a expiresInDays giorni
            // Usiamo setUTCHours(0,0,0,0) per impostare l'ora a mezzanotte
            expiresAt.setUTCHours(0, 0, 0, 0);
            expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays.toString()));
        }
        // Aggiorna l'utente
        const updatedUser = yield server_1.prisma.user.update({
            where: { id },
            data: {
                email,
                name,
                role,
                expiresAt,
            },
        });
        // Ometti la password nel risultato
        const { password } = updatedUser, userWithoutPassword = __rest(updatedUser, ["password"]);
        res.status(200).json({
            message: 'Utente aggiornato con successo',
            user: userWithoutPassword,
        });
    }
    catch (error) {
        console.error('Errore nell\'aggiornamento dell\'utente:', error);
        res.status(500).json({ message: 'Errore nell\'aggiornamento dell\'utente' });
    }
});
exports.updateUser = updateUser;
// Elimina un utente
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Verifica se l'utente esiste
        const existingUser = yield server_1.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            res.status(404).json({ message: 'Utente non trovato' });
            return;
        }
        // Elimina prima tutte le sessioni dell'utente
        yield server_1.prisma.session.deleteMany({
            where: { userId: id },
        });
        // Elimina l'utente
        yield server_1.prisma.user.delete({
            where: { id },
        });
        res.status(200).json({ message: 'Utente eliminato con successo' });
    }
    catch (error) {
        console.error('Errore nell\'eliminazione dell\'utente:', error);
        res.status(500).json({ message: 'Errore nell\'eliminazione dell\'utente' });
    }
});
exports.deleteUser = deleteUser;
// Cambio password utente
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: 'Utente non autenticato' });
            return;
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({ message: 'Password attuale e nuova password sono richieste' });
            return;
        }
        if (newPassword.length < 6) {
            res.status(400).json({ message: 'La nuova password deve essere di almeno 6 caratteri' });
            return;
        }
        // Trova l'utente
        const user = yield server_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            res.status(404).json({ message: 'Utente non trovato' });
            return;
        }
        // Verifica la password attuale
        const isCurrentPasswordValid = yield bcrypt_1.default.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            res.status(401).json({ message: 'Password attuale non valida' });
            return;
        }
        // Hash della nuova password
        const hashedNewPassword = yield bcrypt_1.default.hash(newPassword, 10);
        // Aggiorna la password dell'utente
        yield server_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        });
        // Invia email di notifica
        yield (0, emailService_1.sendPasswordChangedEmail)(user.email, user.name || 'Utente');
        res.status(200).json({ message: 'Password aggiornata con successo' });
    }
    catch (error) {
        console.error('Errore nel cambio password:', error);
        res.status(500).json({ message: 'Errore interno durante il cambio password' });
    }
});
exports.changePassword = changePassword;
//# sourceMappingURL=auth.controller.js.map
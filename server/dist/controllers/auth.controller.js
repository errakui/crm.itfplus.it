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
exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const server_1 = require("../server");
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
//# sourceMappingURL=auth.controller.js.map
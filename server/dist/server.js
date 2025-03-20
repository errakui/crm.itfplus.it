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
exports.prisma = void 0;
// Importazione dei tipi personalizzati
require("./types");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
// Importazione delle route
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const document_routes_1 = __importDefault(require("./routes/document.routes"));
const chatbot_routes_1 = __importDefault(require("./routes/chatbot.routes"));
// Caricamento variabili d'ambiente
dotenv_1.default.config();
// Inizializzazione app Express
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
// Inizializzazione Prisma
exports.prisma = new client_1.PrismaClient();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
// Cartella per i file statici
app.use(express_1.default.static(path_1.default.join(__dirname, '../../public')));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../../uploads')));
// Assicurati che la directory uploads esista
const fs_1 = __importDefault(require("fs"));
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configurazione delle route
app.use('/api/auth', auth_routes_1.default);
app.use('/api/documents', document_routes_1.default);
app.use('/api/chatbot', chatbot_routes_1.default);
// Endpoint di test
app.get('/api', (req, res) => {
    res.json({ message: 'ITFPLUS API funzionante!' });
});
// Rotta principale per reindirizzare alla pagina di login
app.get('/', (req, res) => {
    res.redirect('/api/auth/login');
});
// Middleware per la gestione degli errori
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Si è verificato un errore!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});
// Avvio del server
app.listen(port, () => {
    console.log(`Server in esecuzione su http://localhost:${port}`);
});
// Gestione chiusura server
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.prisma.$disconnect();
    console.log('Connessione al database chiusa');
    process.exit(0);
}));
//# sourceMappingURL=server.js.map
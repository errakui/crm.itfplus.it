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
exports.textContainsSearchTerm = exports.normalizeForSearch = exports.identifyCities = exports.extractTextFromPDF = exports.ITALIAN_CITIES = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
// Lista di città italiane (aggiunte le città più grandi, puoi espandere questa lista)
exports.ITALIAN_CITIES = [
    'Agrigento', 'Alessandria', 'Ancona', 'Aosta', 'Arezzo', 'Ascoli Piceno', 'Asti', 'Avellino', 'Bari',
    'Barletta', 'Andria', 'Trani', 'Belluno', 'Benevento', 'Bergamo', 'Biella', 'Bologna', 'Bolzano', 'Brescia',
    'Brindisi', 'Cagliari', 'Caltanissetta', 'Campobasso', 'Caserta', 'Catania', 'Catanzaro', 'Chieti', 'Como',
    'Cosenza', 'Cremona', 'Crotone', 'Cuneo', 'Enna', 'Fermo', 'Ferrara', 'Firenze', 'Foggia', 'Forlì', 'Cesena',
    'Frosinone', 'Genova', 'Gorizia', 'Grosseto', 'Imperia', 'Isernia', 'La Spezia', 'L\'Aquila', 'Latina', 'Lecce',
    'Lecco', 'Livorno', 'Lodi', 'Lucca', 'Macerata', 'Mantova', 'Massa', 'Carrara', 'Matera', 'Messina', 'Milano',
    'Modena', 'Monza', 'Brianza', 'Napoli', 'Novara', 'Nuoro', 'Oristano', 'Padova', 'Palermo', 'Parma', 'Pavia',
    'Perugia', 'Pesaro', 'Urbino', 'Pescara', 'Piacenza', 'Pisa', 'Pistoia', 'Pordenone', 'Potenza', 'Prato',
    'Ragusa', 'Ravenna', 'Reggio Calabria', 'Reggio Emilia', 'Rieti', 'Rimini', 'Roma', 'Rovigo', 'Salerno',
    'Sassari', 'Savona', 'Siena', 'Siracusa', 'Sondrio', 'Sud Sardegna', 'Taranto', 'Teramo', 'Terni', 'Torino',
    'Trapani', 'Trento', 'Treviso', 'Trieste', 'Udine', 'Varese', 'Venezia', 'Verbano-Cusio-Ossola', 'Vercelli',
    'Verona', 'Vibo Valentia', 'Vicenza', 'Viterbo'
];
/**
 * Estrae il testo da un file PDF
 */
const extractTextFromPDF = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dataBuffer = yield fs_extra_1.default.readFile(filePath);
        const data = yield (0, pdf_parse_1.default)(dataBuffer);
        return data.text;
    }
    catch (error) {
        console.error('Errore durante l\'estrazione del testo dal PDF:', error);
        return '';
    }
});
exports.extractTextFromPDF = extractTextFromPDF;
/**
 * Identifica le città italiane menzionate nel titolo (solo nel titolo, non nel testo)
 */
const identifyCities = (text, title) => {
    // Ora consideriamo solo il titolo, non più il testo completo
    const titleLowerCase = title.toLowerCase();
    // Trova tutte le città menzionate nel titolo
    return exports.ITALIAN_CITIES.filter(city => titleLowerCase.includes(city.toLowerCase()));
};
exports.identifyCities = identifyCities;
/**
 * Normalizza il testo per la ricerca
 */
const normalizeForSearch = (text) => {
    return text
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Rimuove accenti
        .replace(/[^\w\s]/g, ' ') // Sostituisce punteggiatura con spazi
        .replace(/\s+/g, ' ') // Rimuove spazi multipli
        .trim();
};
exports.normalizeForSearch = normalizeForSearch;
/**
 * Verifica se il testo contiene la parola di ricerca
 */
const textContainsSearchTerm = (text, searchTerm) => {
    if (!text || !searchTerm)
        return false;
    const normalizedText = (0, exports.normalizeForSearch)(text);
    const normalizedSearchTerm = (0, exports.normalizeForSearch)(searchTerm);
    return normalizedText.includes(normalizedSearchTerm);
};
exports.textContainsSearchTerm = textContainsSearchTerm;
//# sourceMappingURL=pdfUtils.js.map
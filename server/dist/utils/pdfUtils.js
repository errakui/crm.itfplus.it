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
exports.textContainsSearchTerm = exports.calculateSimilarity = exports.normalizeForSearch = exports.identifyCities = exports.ITALIAN_CITIES = void 0;
exports.extractTextFromPDF = extractTextFromPDF;
exports.getTextSnippet = getTextSnippet;
exports.verifyAndFixDocumentPath = verifyAndFixDocumentPath;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Lista completa di tutti i Tribunali italiani (aggiornata 2024)
exports.ITALIAN_CITIES = [
    // Tribunali principali
    'L\'Aquila', 'La Spezia', 'Agrigento', 'Alessandria', 'Ancona', 'Aosta', 'Arezzo', 'Ascoli Piceno', 'Asti',
    'Avellino', 'Avezzano', 'Barcellona Pozzo di Gotto', 'Lipari', 'Bari', 'Belluno', 'Benevento', 'Bergamo',
    'Biella', 'Bologna', 'Bolzano', 'Brescia', 'Brindisi', 'Busto Arsizio', 'Cagliari', 'Caltagirone',
    'Caltanissetta', 'Campobasso', 'Cassino', 'Castrovillari', 'Catania', 'Catanzaro', 'Chieti', 'Ortona',
    'Civitavecchia', 'Como', 'Cosenza', 'Cremona', 'Crotone', 'Cuneo', 'Enna', 'Fermo', 'Ferrara', 'Firenze',
    'Foggia', 'Forlì', 'Frosinone', 'Gela', 'Genova', 'Gorizia', 'Grosseto', 'Imperia', 'Isernia', 'Ivrea',
    'Lagonegro', 'Lamezia Terme', 'Lanciano', 'Atessa', 'Lanusei', 'Larino', 'Latina', 'Lecce', 'Lecco',
    'Livorno', 'Portoferraio', 'Locri', 'Lodi', 'Lucca', 'Macerata', 'Mantova', 'Marsala', 'Massa', 'Matera',
    'Messina', 'Milano', 'Modena', 'Monza', 'Napoli', 'Ischia', 'Nocera Inferiore', 'Nola', 'Novara', 'Nuoro',
    'Aversa', 'Oristano', 'Padova', 'Palermo', 'Palmi', 'Paola', 'Parma', 'Patti', 'Pavia', 'Perugia', 'Pesaro',
    'Pescara', 'Piacenza', 'Pisa', 'Pistoia', 'Pordenone', 'Potenza', 'Prato', 'Ragusa', 'Ravenna',
    'Reggio Calabria', 'Reggio Emilia', 'Rieti', 'Rimini', 'Roma', 'Rovereto', 'Rovigo', 'Salerno',
    'Santa Maria Capua Vetere', 'Sassari', 'Savona', 'Sciacca', 'Siena', 'Siracusa', 'Sondrio', 'Spoleto',
    'Sulmona', 'Taranto', 'Tempio Pausania', 'Teramo', 'Termini Imerese', 'Terni', 'Tivoli', 'Torino',
    'Torre Annunziata', 'Trani', 'Trapani', 'Trento', 'Treviso', 'Trieste', 'Udine', 'Urbino',
    'Vallo della Lucania', 'Varese', 'Vasto', 'Velletri', 'Venezia', 'Verbania', 'Vercelli', 'Verona',
    'Vibo Valentia', 'Vicenza', 'Viterbo',
    // Varianti comuni nei documenti
    'Aquila', 'Spezia', 'Reggio di Calabria', 'Napoli Nord', 'Santa Maria C.V.', 'Capua Vetere'
];
/**
 * Estrae il testo da un file PDF
 */
function extractTextFromPDF(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!fs_1.default.existsSync(filePath)) {
                console.error(`[PDF] File non trovato: ${filePath}`);
                return '';
            }
            const dataBuffer = fs_1.default.readFileSync(filePath);
            try {
                const data = yield (0, pdf_parse_1.default)(dataBuffer);
                return data.text || '';
            }
            catch (error) {
                console.error(`[PDF] Errore durante l'analisi del PDF ${path_1.default.basename(filePath)}: ${error.message}`);
                return ''; // Restituisci una stringa vuota invece di far fallire l'operazione
            }
        }
        catch (error) {
            console.error(`[PDF] Errore durante la lettura del file ${path_1.default.basename(filePath)}: ${error.message}`);
            return '';
        }
    });
}
/**
 * Identifica le città italiane nel testo
 * @param text Il testo in cui cercare le città
 * @param title Opzionale, titolo del documento
 */
const identifyCities = (text, title) => {
    // Normalizza e unisce testo e titolo per la ricerca
    const contentLowerCase = text ? text.toLowerCase() : '';
    const titleLowerCase = title ? title.toLowerCase() : '';
    // Cerca corrispondenze tra il testo e le città italiane
    const matchedCities = exports.ITALIAN_CITIES.filter(city => contentLowerCase.includes(city.toLowerCase()) ||
        (title && titleLowerCase.includes(city.toLowerCase())));
    return Array.from(new Set(matchedCities)); // Elimina duplicati
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
 * Calcola la somiglianza tra due stringhe (fuzzy matching)
 * @param str1 Prima stringa
 * @param str2 Seconda stringa
 * @returns Punteggio di somiglianza tra 0 e 1 (1 = identiche)
 */
const calculateSimilarity = (str1, str2) => {
    if (!str1 || !str2)
        return 0;
    if (str1 === str2)
        return 1;
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    // Applica la distanza di Levenshtein modificata
    const costs = new Array(shorter.length + 1);
    for (let i = 0; i <= shorter.length; i++) {
        costs[i] = i;
    }
    for (let i = 1; i <= longer.length; i++) {
        costs[0] = i;
        let nw = i - 1;
        for (let j = 1; j <= shorter.length; j++) {
            const cj = Math.min(costs[j] + 1, costs[j - 1] + 1, nw + (longer.charAt(i - 1) === shorter.charAt(j - 1) ? 0 : 1));
            nw = costs[j];
            costs[j] = cj;
        }
    }
    // Calcola il rapporto di somiglianza
    if (longer.length === 0)
        return 1.0;
    return (longer.length - costs[shorter.length]) / longer.length;
};
exports.calculateSimilarity = calculateSimilarity;
/**
 * Verifica se il testo contiene la parola di ricerca
 */
const textContainsSearchTerm = (text, searchTerm) => {
    if (!text || !searchTerm)
        return false;
    const normalizedText = (0, exports.normalizeForSearch)(text);
    const normalizedSearchTerm = (0, exports.normalizeForSearch)(searchTerm);
    // Verifica se il testo contiene l'intera frase di ricerca
    if (normalizedText.includes(normalizedSearchTerm)) {
        return true;
    }
    // Se non trova l'intera frase, divide in parole e cerca singolarmente
    const searchWords = normalizedSearchTerm
        .split(' ')
        .filter(word => word.length > 2); // Ignora parole troppo corte (articoli, preposizioni, ecc.)
    // Se tutte le parole sono troppo corte, utilizza l'intero termine
    if (searchWords.length === 0) {
        return normalizedText.includes(normalizedSearchTerm);
    }
    // Calcola punteggi di somiglianza per ogni parola chiave
    const wordScores = searchWords.map(word => {
        // Cerca la migliore corrispondenza nel testo
        const textWords = normalizedText.split(' ');
        let bestScore = 0;
        for (const textWord of textWords) {
            if (textWord.length < 3)
                continue; // Ignora parole troppo corte
            // Calcola somiglianza con fuzzy matching
            const score = (0, exports.calculateSimilarity)(word, textWord);
            if (score > bestScore) {
                bestScore = score;
            }
            // Se troviamo un match esatto, interrompiamo la ricerca
            if (score === 1)
                break;
        }
        return bestScore;
    });
    // Calcola il punteggio medio di somiglianza
    const averageScore = wordScores.reduce((sum, score) => sum + score, 0) / wordScores.length;
    // Punteggio minimo richiesto (70%)
    const SIMILARITY_THRESHOLD = 0.7;
    console.log(`[Search] Punteggio di somiglianza per "${searchTerm}": ${(averageScore * 100).toFixed(2)}%`);
    // Consideriamo pertinente se il punteggio medio è almeno 70%
    return averageScore >= SIMILARITY_THRESHOLD;
};
exports.textContainsSearchTerm = textContainsSearchTerm;
/**
 * Estrae un frammento di testo (snippet) contenente la parola chiave cercata
 * @param text - Il testo completo del documento
 * @param searchTerm - Il termine di ricerca completo
 * @param snippetLength - Lunghezza massima dello snippet (caratteri prima e dopo il termine)
 * @param searchWords - Array opzionale di parole singole da evidenziare
 * @returns Frammento di testo con il termine di ricerca evidenziato
 */
function getTextSnippet(text, searchTerm, maxLength = 200, searchWords = []) {
    try {
        if (!text || !searchTerm)
            return '';
        // Se sono state fornite parole di ricerca multiple, usale
        const keywords = searchWords.length > 0 ? searchWords : searchTerm.toLowerCase().split(/\s+/);
        // Trova l'indice della prima occorrenza di qualsiasi parola chiave
        let bestIndex = -1;
        let bestWord = '';
        for (const word of keywords) {
            if (word.length < 3)
                continue; // Ignora parole troppo corte
            const normalizedWord = word
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
            const index1 = text.toLowerCase().indexOf(word);
            const index2 = text.toLowerCase().indexOf(normalizedWord);
            const index = index1 !== -1 ? index1 : index2;
            if (index !== -1 && (bestIndex === -1 || index < bestIndex)) {
                bestIndex = index;
                bestWord = word;
            }
        }
        if (bestIndex === -1)
            return text.substring(0, maxLength) + '...';
        // Calcola gli indici di inizio e fine dello snippet
        const start = Math.max(0, bestIndex - Math.floor(maxLength / 2));
        const end = Math.min(text.length, start + maxLength);
        // Evita di tagliare a metà le parole
        let snippetStart = start;
        while (snippetStart > 0 && text[snippetStart - 1] !== ' ' && text[snippetStart - 1] !== '\n') {
            snippetStart--;
        }
        let snippetEnd = end;
        while (snippetEnd < text.length && text[snippetEnd] !== ' ' && text[snippetEnd] !== '\n') {
            snippetEnd++;
        }
        // Estrai lo snippet
        let snippet = text.substring(snippetStart, snippetEnd).trim();
        // Evidenzia tutte le parole chiave nello snippet (con il carattere *)
        for (const word of keywords) {
            if (word.length < 3)
                continue;
            const normalizedWord = word
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
            // Usa una regex per trovare la parola, ignorando maiuscole/minuscole
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const normalizedRegex = new RegExp(`\\b${normalizedWord}\\b`, 'gi');
            snippet = snippet.replace(regex, `**${word}**`);
            snippet = snippet.replace(normalizedRegex, (match) => `**${match}**`);
        }
        // Aggiungi puntini di sospensione all'inizio e alla fine se necessario
        if (snippetStart > 0)
            snippet = '...' + snippet;
        if (snippetEnd < text.length)
            snippet = snippet + '...';
        return snippet;
    }
    catch (error) {
        console.error('[PDF] Errore durante la generazione dello snippet:', error);
        return text ? text.substring(0, maxLength) + '...' : '';
    }
}
/**
 * Funzione utility per tentare di correggere percorsi dei file PDF
 */
function verifyAndFixDocumentPath(docId, currentPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Verifica se il file esiste nel percorso attuale
            if (fs_1.default.existsSync(currentPath)) {
                return currentPath; // Il percorso è valido
            }
            console.log(`[PDF] File non trovato al percorso originale: ${currentPath}`);
            // Ottieni il nome del file dal percorso
            const fileName = path_1.default.basename(currentPath);
            // Possibili percorsi alternativi
            const possiblePaths = [
                path_1.default.join(process.cwd(), 'uploads', fileName),
                path_1.default.join(process.cwd(), '..', 'uploads', fileName),
                path_1.default.join(process.cwd(), 'server', 'uploads', fileName),
                path_1.default.join(process.cwd(), '..', 'server', 'uploads', fileName),
                path_1.default.join('/var/www/itfplus/server/uploads', fileName),
                path_1.default.join('/var/www/itfplus/uploads', fileName)
            ];
            // Cerca in percorsi alternativi
            for (const altPath of possiblePaths) {
                if (fs_1.default.existsSync(altPath)) {
                    console.log(`[PDF] File trovato in percorso alternativo: ${altPath}`);
                    // Aggiorna il percorso nel database
                    yield prisma.document.update({
                        where: { id: docId },
                        data: { filePath: altPath }
                    });
                    console.log(`[PDF] Percorso documento aggiornato con successo: ${altPath}`);
                    return altPath;
                }
            }
            console.error(`[PDF] Impossibile trovare il file in nessuno dei percorsi alternativi: ${fileName}`);
            return null;
        }
        catch (error) {
            console.error(`[PDF] Errore durante la verifica/correzione del percorso: ${error}`);
            return null;
        }
    });
}
//# sourceMappingURL=pdfUtils.js.map
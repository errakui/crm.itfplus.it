import fs from 'fs-extra';
import path from 'path';
import pdfParse from 'pdf-parse';

// Lista di città italiane (aggiunte le città più grandi, puoi espandere questa lista)
export const ITALIAN_CITIES = [
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
export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Errore durante l\'estrazione del testo dal PDF:', error);
    return '';
  }
};

/**
 * Identifica le città italiane menzionate nel titolo (solo nel titolo, non nel testo)
 */
export const identifyCities = (text: string, title: string): string[] => {
  // Ora consideriamo solo il titolo, non più il testo completo
  const titleLowerCase = title.toLowerCase();
  
  // Trova tutte le città menzionate nel titolo
  return ITALIAN_CITIES.filter(city => 
    titleLowerCase.includes(city.toLowerCase())
  );
};

/**
 * Normalizza il testo per la ricerca
 */
export const normalizeForSearch = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Rimuove accenti
    .replace(/[^\w\s]/g, ' ') // Sostituisce punteggiatura con spazi
    .replace(/\s+/g, ' ') // Rimuove spazi multipli
    .trim();
};

/**
 * Verifica se il testo contiene la parola di ricerca
 */
export const textContainsSearchTerm = (text: string, searchTerm: string): boolean => {
  if (!text || !searchTerm) return false;
  
  const normalizedText = normalizeForSearch(text);
  const normalizedSearchTerm = normalizeForSearch(searchTerm);
  
  return normalizedText.includes(normalizedSearchTerm);
};

/**
 * Estrae un frammento di testo (snippet) contenente la parola chiave cercata
 * @param text - Il testo completo del documento
 * @param searchTerm - Il termine di ricerca
 * @param snippetLength - Lunghezza massima dello snippet (caratteri prima e dopo il termine)
 * @returns Frammento di testo con il termine di ricerca evidenziato
 */
export const getTextSnippet = (text: string, searchTerm: string, snippetLength: number = 100): string | null => {
  if (!text || !searchTerm) return null;
  
  const normalizedText = normalizeForSearch(text);
  const normalizedSearchTerm = normalizeForSearch(searchTerm);
  
  // Trova la posizione del termine di ricerca nel testo normalizzato
  const termPosition = normalizedText.indexOf(normalizedSearchTerm);
  if (termPosition === -1) return null;
  
  // Calcola l'inizio e la fine dello snippet
  const snippetStart = Math.max(0, termPosition - snippetLength);
  const snippetEnd = Math.min(normalizedText.length, termPosition + normalizedSearchTerm.length + snippetLength);
  
  // Estrai lo snippet dal testo originale
  // Nota: usiamo il testo originale per lo snippet, non quello normalizzato
  // ma usiamo le posizioni trovate nel testo normalizzato
  const textSnippet = text.substring(snippetStart, snippetEnd);
  
  // Aggiungi ellissi se necessario
  const prefix = snippetStart > 0 ? '...' : '';
  const suffix = snippetEnd < text.length ? '...' : '';
  
  return `${prefix}${textSnippet}${suffix}`;
}; 
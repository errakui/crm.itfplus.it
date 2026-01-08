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
exports.textToSpeech = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Controller per Text-to-Speech con OpenAI
 */
const textToSpeech = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { text, voice = 'onyx' } = req.body;
        if (!text) {
            return res.status(400).json({ message: 'Testo non fornito' });
        }
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: 'OpenAI API key non configurata' });
        }
        // Limita il testo a 4096 caratteri (limite OpenAI TTS)
        const truncatedText = text.substring(0, 4096);
        const response = yield axios_1.default.post('https://api.openai.com/v1/audio/speech', {
            model: 'tts-1',
            input: truncatedText,
            voice: voice, // alloy, echo, fable, onyx, nova, shimmer
            response_format: 'mp3',
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            responseType: 'arraybuffer',
        });
        // Invia l'audio come risposta
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': response.data.length,
        });
        return res.send(Buffer.from(response.data));
    }
    catch (error) {
        console.error('Errore TTS OpenAI:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        return res.status(500).json({
            message: 'Errore nella generazione audio',
            error: error.message,
        });
    }
});
exports.textToSpeech = textToSpeech;
//# sourceMappingURL=voice.controller.js.map
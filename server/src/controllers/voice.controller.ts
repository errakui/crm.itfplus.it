import { Request, Response } from 'express';
import axios from 'axios';

/**
 * Controller per Text-to-Speech con OpenAI
 */
export const textToSpeech = async (req: Request, res: Response) => {
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

    const response = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      {
        model: 'tts-1',
        input: truncatedText,
        voice: voice, // alloy, echo, fable, onyx, nova, shimmer
        response_format: 'mp3',
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    // Invia l'audio come risposta
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': response.data.length,
    });
    
    return res.send(Buffer.from(response.data));
  } catch (error: any) {
    console.error('Errore TTS OpenAI:', error.response?.data || error.message);
    return res.status(500).json({
      message: 'Errore nella generazione audio',
      error: error.message,
    });
  }
};


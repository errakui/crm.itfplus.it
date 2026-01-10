import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Divider,
  IconButton,
  Modal,
  Fade,
  Backdrop,
} from '@mui/material';
import { 
  Send as SendIcon, 
  DeleteOutline as ClearIcon,
  Phone as PhoneIcon,
  CallEnd as CallEndIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';

// Dichiarazione tipi per Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotProps {
  documentId?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ documentId }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { token, isAuthenticated } = useContext(AuthContext);

  // Stati per la chiamata vocale
  const [isInCall, setIsInCall] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [callStatus, setCallStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');

  // REFS per evitare stale closures
  const isInCallRef = useRef(false);
  const tokenRef = useRef(token);
  const documentIdRef = useRef(documentId);

  // Refs per Speech API
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sincronizza refs con state
  useEffect(() => {
    isInCallRef.current = isInCall;
  }, [isInCall]);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    documentIdRef.current = documentId;
  }, [documentId]);

  // Verifica supporto Web Speech API
  const isSpeechSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Effetto per scrollare automaticamente verso il basso quando arrivano nuovi messaggi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Aggiunge un messaggio di benvenuto all'avvio
  useEffect(() => {
    if (documentId) {
      setMessages([
        {
          text: 'Benvenuto! Sono Booky e sono qui per aiutarti con questa sentenza. Puoi chiedermi informazioni sul contenuto o fare domande specifiche sulla sentenza.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } else {
      setMessages([
        {
          text: 'Benvenuto! Sono Booky il tuo assistente legale. In cosa posso aiutarti oggi?',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    }
  }, [documentId]);

  // Cleanup quando il componente viene smontato
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, []);

  // Carica le voci quando disponibili
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Le voci potrebbero non essere subito disponibili
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Ref per audio player
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Funzione per far parlare Booky con OpenAI TTS
  const speakText = useCallback(async (text: string, onEnd?: () => void) => {
    console.log('[Booky] Richiedo audio TTS per:', text.substring(0, 50) + '...');
    setIsSpeaking(true);
    setCallStatus('speaking');

    try {
      // Chiama l'API backend per TTS
      const response = await axios.post(
        '/api/voice/tts',
        { text, voice: 'onyx' }, // nova è una voce femminile naturale
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
          },
          responseType: 'blob',
        }
      );

      // Crea URL per l'audio
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Riproduci l'audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        console.log('[Booky] Ho finito di parlare');
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        if (onEnd) onEnd();
      };

      audio.onerror = (e) => {
        console.error('[Booky] Errore riproduzione audio:', e);
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        if (onEnd) onEnd();
      };

      await audio.play();
    } catch (error) {
      console.error('[Booky] Errore TTS API:', error);
      setIsSpeaking(false);
      
      // Fallback a Web Speech API se OpenAI fallisce
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'it-IT';
        utterance.onend = () => {
          setIsSpeaking(false);
          if (onEnd) onEnd();
        };
        window.speechSynthesis.speak(utterance);
      } else {
        if (onEnd) onEnd();
      }
    }
  }, []);

  // Funzione per iniziare ad ascoltare (definita prima di sendMessage)
  const startListening = useCallback(() => {
    console.log('[Voice] startListening chiamato, isInCallRef:', isInCallRef.current);
    
    if (!isSpeechSupported) {
      console.error('[Voice] Speech API non supportata');
      return;
    }
    
    if (!isInCallRef.current) {
      console.log('[Voice] Non siamo in chiamata, skip');
      return;
    }

    // Se c'è già un riconoscimento attivo, fermalo
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignora errori
      }
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    recognition.lang = 'it-IT';
    recognition.continuous = false; // Cambiato a false per gestione migliore
    recognition.interimResults = true;

    let finalText = '';

    recognition.onstart = () => {
      console.log('[Voice] Riconoscimento avviato');
      setIsListening(true);
      setCallStatus('listening');
      setTranscript('');
      finalText = '';
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalText += transcript;
          console.log('[Voice] Testo finale:', finalText);
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalText || interimTranscript);
    };

    recognition.onend = () => {
      console.log('[Voice] Riconoscimento terminato, testo:', finalText);
      setIsListening(false);

      // Se abbiamo del testo, invialo
      if (finalText.trim() && isInCallRef.current) {
        console.log('[Voice] Invio messaggio:', finalText.trim());
        sendMessageVoice(finalText.trim());
      } else if (isInCallRef.current) {
        // Se non c'è testo ma siamo ancora in chiamata, riavvia
        console.log('[Voice] Nessun testo, riavvio ascolto');
        setTimeout(() => {
          if (isInCallRef.current) {
            startListening();
          }
        }, 500);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('[Voice] Errore:', event.error);
      setIsListening(false);
      
      // Riprova se siamo ancora in chiamata (tranne per alcuni errori)
      if (isInCallRef.current && event.error !== 'aborted' && event.error !== 'not-allowed') {
        setTimeout(() => {
          if (isInCallRef.current) {
            startListening();
          }
        }, 1000);
      }
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
      console.log('[Voice] recognition.start() chiamato');
    } catch (e) {
      console.error('[Voice] Errore avvio:', e);
    }
  }, [isSpeechSupported]);

  // Funzione per inviare messaggio vocale (usa refs per evitare stale closures)
  const sendMessageVoice = useCallback(async (messageText: string) => {
    console.log('[Voice] sendMessageVoice chiamato con:', messageText);
    
    if (!messageText.trim()) {
      console.log('[Voice] Messaggio vuoto, skip');
      return;
    }

    const userMessage: Message = {
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setCallStatus('processing');

    try {
      const payload = {
        message: messageText,
        ...(documentIdRef.current && { documentId: documentIdRef.current }),
      };

      console.log('[Voice] Invio richiesta API...');
      const response = await axios.post(
        '/api/chatbot/chat',
        payload,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
          },
        }
      );

      console.log('[Voice] Risposta ricevuta:', response.data.response?.substring(0, 50) + '...');

      const botMessage: Message = {
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setLoading(false);

      // Leggi la risposta e poi riascolta
      if (isInCallRef.current) {
        speakText(response.data.response, () => {
          console.log('[Voice] Booky ha finito di parlare, riavvio ascolto');
          if (isInCallRef.current) {
            setTimeout(() => startListening(), 500);
          }
        });
      }
    } catch (error) {
      console.error('[Voice] Errore API:', error);
      const errorMessage: Message = {
        text: 'Mi dispiace, si è verificato un errore. Riprova più tardi.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setLoading(false);

      if (isInCallRef.current) {
        speakText('Mi dispiace, si è verificato un errore.', () => {
          if (isInCallRef.current) {
            setTimeout(() => startListening(), 500);
          }
        });
      }
    }
  }, [speakText, startListening]);

  // Funzione per inviare messaggio normale (form)
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || loading || !isAuthenticated()) return;

    const userMessage: Message = {
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const payload = {
        message: messageText,
        ...(documentId && { documentId }),
      };

      const response = await axios.post(
        '/api/chatbot/chat',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const botMessage: Message = {
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Errore nella comunicazione con il chatbot:', error);
      const errorMessage: Message = {
        text: 'Mi dispiace, si è verificato un errore. Riprova più tardi.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Funzione per iniziare la chiamata
  const startCall = useCallback(() => {
    console.log('[Call] Avvio chiamata...');
    
    if (!isSpeechSupported) {
      alert('Il tuo browser non supporta il riconoscimento vocale. Prova con Chrome o Edge.');
      return;
    }

    // Imposta lo stato
    setIsInCall(true);
    isInCallRef.current = true;
    setCallStatus('speaking');
    
    // Messaggio di benvenuto vocale
    const welcomeMessage = documentIdRef.current 
      ? 'Ciao! Sono Booky. Dimmi cosa vuoi sapere su questa sentenza.'
      : 'Ciao! Sono Booky. Come posso aiutarti?';

    console.log('[Call] Dico messaggio di benvenuto...');
    speakText(welcomeMessage, () => {
      console.log('[Call] Benvenuto finito, avvio ascolto...');
      if (isInCallRef.current) {
        startListening();
      }
    });
  }, [isSpeechSupported, speakText, startListening]);

  // Funzione per terminare la chiamata
  const endCall = useCallback(() => {
    console.log('[Call] Termino chiamata');
    
    setIsInCall(false);
    isInCallRef.current = false;
    setIsListening(false);
    setIsSpeaking(false);
    setCallStatus('idle');
    setTranscript('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignora
      }
      recognitionRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  // Funzione per leggere un singolo messaggio con OpenAI TTS
  const speakSingleMessage = async (text: string) => {
    try {
      const response = await axios.post(
        '/api/voice/tts',
        { text, voice: 'onyx' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => URL.revokeObjectURL(audioUrl);
      await audio.play();
    } catch (error) {
      console.error('Errore TTS:', error);
      // Fallback
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'it-IT';
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const clearChat = () => {
    setMessages([
      {
        text: documentId
          ? 'Conversazione azzerata. Puoi farmi nuove domande su questo documento.'
          : 'Conversazione azzerata. Come posso aiutarti oggi?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Componente per l'animazione delle onde audio
  const AudioWaves = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, height: 40 }}>
      {[...Array(5)].map((_, i) => (
        <Box
          key={i}
          sx={{
            width: 4,
            backgroundColor: '#C9A227',
            borderRadius: 2,
            animation: `audioWave 0.5s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
            '@keyframes audioWave': {
              '0%, 100%': { height: 8 },
              '50%': { height: 32 },
            },
          }}
        />
      ))}
    </Box>
  );

  return (
    <>
    <Paper 
      elevation={3} 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        maxHeight: 'calc(100vh - 200px)',
          borderRadius: 'var(--border-radius-lg)',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF'
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          backgroundColor: '#1B2A4A', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img 
            src="/booky.png" 
            alt="Booky" 
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid white'
            }} 
          />
            <Typography variant="h6" fontFamily="var(--font-heading)">
              Booky - Assistente Legale
          </Typography>
        </Box>
        <IconButton 
          size="small" 
          onClick={clearChat} 
          sx={{ color: 'white' }}
          title="Cancella conversazione"
        >
          <ClearIcon />
        </IconButton>
      </Box>
      
      <Divider />
      
      {/* Messaggi */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: '#F5F5F0'
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                backgroundColor: message.sender === 'user' ? '#1B2A4A' : '#FFFFFF',
                color: message.sender === 'user' ? 'white' : 'inherit',
                  borderRadius: 'var(--border-radius-lg)',
                  borderTopRightRadius: message.sender === 'user' ? '0px' : 'var(--border-radius-lg)',
                  borderTopLeftRadius: message.sender === 'bot' ? '0px' : 'var(--border-radius-lg)',
                  position: 'relative',
              }}
            >
              <Typography variant="body1">{message.text}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {formatTime(message.timestamp)}
              </Typography>
                  {message.sender === 'bot' && (
                    <IconButton 
                      size="small" 
                      onClick={() => speakSingleMessage(message.text)}
                      sx={{ 
                        ml: 1, 
                        p: 0.5,
                        color: '#1B2A4A',
                        '&:hover': { color: '#C9A227' }
                      }}
                      title="Leggi ad alta voce"
                    >
                      <VolumeUpIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
            </Paper>
          </Box>
        ))}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>
      
      <Divider />
      
      {/* Input */}
      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center',
            backgroundColor: '#FFFFFF',
            gap: 1,
        }}
      >
        <TextField
          fullWidth
          placeholder="Scrivi un messaggio..."
          variant="outlined"
          value={input}
          onChange={handleInputChange}
            disabled={loading || !isAuthenticated() || isInCall}
          size="small"
          />
          
          {/* Pulsante Chiamata */}
          {isSpeechSupported && (
            <IconButton
              onClick={startCall}
              disabled={loading || !isAuthenticated() || isInCall}
              sx={{ 
                bgcolor: '#4CAF50',
                color: 'white',
                '&:hover': { bgcolor: '#45a049' },
                '&:disabled': { bgcolor: '#ccc' },
              }}
              title="Avvia chiamata vocale con Booky"
            >
              <PhoneIcon />
            </IconButton>
          )}
          
        <Button
          type="submit"
          variant="contained"
            disabled={loading || !input.trim() || !isAuthenticated() || isInCall}
          sx={{ minWidth: '50px', bgcolor: '#1B2A4A' }}
        >
          <SendIcon />
        </Button>
      </Box>
    </Paper>

      {/* Modal Chiamata in Corso */}
      <Modal
        open={isInCall}
        onClose={endCall}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backgroundColor: 'rgba(27, 42, 74, 0.95)' }
        }}
      >
        <Fade in={isInCall}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 400 },
              bgcolor: 'transparent',
              outline: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              p: 4,
            }}
          >
            {/* Avatar Booky */}
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                border: '4px solid #C9A227',
                overflow: 'hidden',
                boxShadow: isSpeaking 
                  ? '0 0 0 8px rgba(201, 162, 39, 0.3), 0 0 0 16px rgba(201, 162, 39, 0.2)' 
                  : '0 0 30px rgba(201, 162, 39, 0.5)',
                animation: isSpeaking ? 'pulse 1s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(201, 162, 39, 0.7)' },
                  '70%': { boxShadow: '0 0 0 20px rgba(201, 162, 39, 0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(201, 162, 39, 0)' },
                },
              }}
            >
              <img 
                src="/booky.png" 
                alt="Booky" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                }} 
              />
            </Box>

            {/* Nome */}
            <Typography 
              variant="h4" 
              sx={{ 
                color: 'white', 
                fontFamily: 'var(--font-heading)',
                textAlign: 'center',
              }}
            >
              Booky
            </Typography>

            {/* Stato */}
            <Box sx={{ textAlign: 'center', minHeight: 80 }}>
              {callStatus === 'listening' && (
                <>
                  <AudioWaves />
                  <Typography sx={{ color: '#C9A227', mt: 2, fontWeight: 500 }}>
                    🎙️ Ti sto ascoltando...
                  </Typography>
                  {transcript && (
                    <Typography 
                      sx={{ 
                        color: 'rgba(255,255,255,0.8)', 
                        mt: 1, 
                        fontStyle: 'italic',
                        maxWidth: 300,
                      }}
                    >
                      "{transcript}"
                    </Typography>
                  )}
                </>
              )}
              {callStatus === 'processing' && (
                <>
                  <CircularProgress sx={{ color: '#C9A227' }} />
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)', mt: 2 }}>
                    Sto pensando...
                  </Typography>
                </>
              )}
              {callStatus === 'speaking' && (
                <>
                  <AudioWaves />
                  <Typography sx={{ color: '#C9A227', mt: 2, fontWeight: 500 }}>
                    🔊 Booky sta parlando...
                  </Typography>
                </>
              )}
            </Box>

            {/* Info */}
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
              Parla quando vuoi • Termina la frase e aspetta
            </Typography>

            {/* Pulsante Termina */}
            <IconButton
              onClick={endCall}
              sx={{
                width: 70,
                height: 70,
                bgcolor: '#f44336',
                color: 'white',
                '&:hover': { bgcolor: '#d32f2f' },
                boxShadow: '0 4px 20px rgba(244, 67, 54, 0.4)',
              }}
            >
              <CallEndIcon sx={{ fontSize: 32 }} />
            </IconButton>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
              Termina chiamata
            </Typography>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

export default Chatbot; 

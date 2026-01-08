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

  // Refs per Speech API
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Funzione per far parlare Booky
  const speakText = useCallback((text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) return;

    // Cancella qualsiasi sintesi in corso
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'it-IT';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Cerca una voce italiana
    const voices = window.speechSynthesis.getVoices();
    const italianVoice = voices.find(voice => voice.lang.startsWith('it'));
    if (italianVoice) {
      utterance.voice = italianVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCallStatus('speaking');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };

    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Funzione per inviare messaggio (usata sia dal form che dalla chiamata)
  const sendMessage = useCallback(async (messageText: string, speakResponse: boolean = false) => {
    if (!messageText.trim() || loading || !isAuthenticated()) return;

    const userMessage: Message = {
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    if (speakResponse) setCallStatus('processing');

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

      // Se siamo in chiamata, leggi la risposta
      if (speakResponse && isInCall) {
        speakText(response.data.response, () => {
          // Dopo che Booky ha finito di parlare, riattiva il microfono
          if (isInCall) {
            setTimeout(() => startListening(), 500);
          }
        });
      }
    } catch (error) {
      console.error('Errore nella comunicazione con il chatbot:', error);
      const errorMessage: Message = {
        text: 'Mi dispiace, si è verificato un errore. Riprova più tardi.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);

      if (speakResponse && isInCall) {
        speakText('Mi dispiace, si è verificato un errore.', () => {
          if (isInCall) {
            setTimeout(() => startListening(), 500);
          }
        });
      }
    } finally {
      setLoading(false);
    }
  }, [loading, isAuthenticated, documentId, token, isInCall, speakText]);

  // Funzione per iniziare ad ascoltare
  const startListening = useCallback(() => {
    if (!isSpeechSupported || !isInCall) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    recognition.lang = 'it-IT';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setCallStatus('listening');
      setTranscript('');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);

      // Reset del timeout di silenzio ogni volta che c'è input
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }

      // Se abbiamo un risultato finale, aspetta un po' e poi invia
      if (finalTranscript) {
        silenceTimeoutRef.current = setTimeout(() => {
          if (finalTranscript.trim() && isInCall) {
            recognition.stop();
            sendMessage(finalTranscript.trim(), true);
          }
        }, 1500); // 1.5 secondi di silenzio prima di inviare
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Non riavviare automaticamente qui - sarà gestito dopo che Booky parla
    };

    recognition.onerror = (event: any) => {
      console.error('Errore riconoscimento vocale:', event.error);
      setIsListening(false);
      
      // Riprova se siamo ancora in chiamata e non è un errore di abort
      if (isInCall && event.error !== 'aborted' && event.error !== 'no-speech') {
        setTimeout(() => startListening(), 1000);
      } else if (isInCall && event.error === 'no-speech') {
        // Se non ha sentito nulla, riprova
        setTimeout(() => startListening(), 500);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSpeechSupported, isInCall, sendMessage]);

  // Funzione per iniziare la chiamata
  const startCall = useCallback(() => {
    if (!isSpeechSupported) {
      alert('Il tuo browser non supporta il riconoscimento vocale. Prova con Chrome o Edge.');
      return;
    }

    setIsInCall(true);
    
    // Messaggio di benvenuto vocale
    const welcomeMessage = documentId 
      ? 'Ciao! Sono Booky, il tuo assistente legale. Sono pronto ad aiutarti con questa sentenza. Dimmi pure cosa vuoi sapere.'
      : 'Ciao! Sono Booky, il tuo assistente legale. Dimmi pure come posso aiutarti.';

    speakText(welcomeMessage, () => {
      startListening();
    });
  }, [isSpeechSupported, documentId, speakText, startListening]);

  // Funzione per terminare la chiamata
  const endCall = useCallback(() => {
    setIsInCall(false);
    setIsListening(false);
    setIsSpeaking(false);
    setCallStatus('idle');
    setTranscript('');

    if (recognitionRef.current) {
      recognitionRef.current.abort();
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

  // Funzione per leggere un singolo messaggio
  const speakSingleMessage = (text: string) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      const voices = window.speechSynthesis.getVoices();
      const italianVoice = voices.find(voice => voice.lang.startsWith('it'));
      if (italianVoice) utterance.voice = italianVoice;
      window.speechSynthesis.speak(utterance);
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

            {/* Timer/Info */}
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
              Parla quando vuoi • Rilevo automaticamente le pause
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

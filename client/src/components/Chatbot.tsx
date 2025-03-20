import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Divider,
  IconButton,
} from '@mui/material';
import { Send as SendIcon, DeleteOutline as ClearIcon } from '@mui/icons-material';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !isAuthenticated()) return;

    // Aggiungi il messaggio dell'utente
    const userMessage: Message = {
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const payload = {
        message: input,
        ...(documentId && { documentId }),
      };

      const response = await axios.post(
        'http://localhost:8000/api/chatbot/chat',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Aggiungi la risposta del bot
      const botMessage: Message = {
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Errore nella comunicazione con il chatbot:', error);
      // Messaggio di errore
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

  // Formatta la data/ora per i messaggi
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        maxHeight: 'calc(100vh - 200px)',
        borderRadius: '8px',
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
          <Typography variant="h6" fontFamily="Cormorant Garamond, serif">
            {documentId ? 'Booky - Assistente Legale' : 'Booky - Assistente Legale'}
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
                borderRadius: '12px',
                borderTopRightRadius: message.sender === 'user' ? '0px' : '12px',
                borderTopLeftRadius: message.sender === 'bot' ? '0px' : '12px',
              }}
            >
              <Typography variant="body1">{message.text}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1, textAlign: 'right' }}>
                {formatTime(message.timestamp)}
              </Typography>
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
          backgroundColor: '#FFFFFF'
        }}
      >
        <TextField
          fullWidth
          placeholder="Scrivi un messaggio..."
          variant="outlined"
          value={input}
          onChange={handleInputChange}
          disabled={loading || !isAuthenticated()}
          size="small"
          sx={{ mr: 1 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || !input.trim() || !isAuthenticated()}
          sx={{ minWidth: '50px', bgcolor: '#1B2A4A' }}
        >
          <SendIcon />
        </Button>
      </Box>
    </Paper>
  );
};

export default Chatbot; 
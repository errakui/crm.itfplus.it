import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Chip,
  CircularProgress,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Divider,
  Button,
  Card,
  CardContent,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Chat as ChatIcon,
  Visibility as ViewIcon,
  FavoriteBorder as FavoriteIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  AutoAwesome as AIIcon,
} from '@mui/icons-material';
import AuthContext from '../contexts/AuthContext';
import axios from 'axios';

// Interfacce
interface SearchDocument {
  id: string;
  title: string;
  snippet: string;
  cities: string[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  documents?: SearchDocument[];
  totalFound?: number;
  timestamp?: Date;
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
}

const BookySearchPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { token } = useContext(AuthContext);
  
  // States
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [loadingSessions, setLoadingSessions] = useState(true);
  
  // Limite utilizzo
  const [usageLimit, setUsageLimit] = useState<{
    isAdmin: boolean;
    unlimited: boolean;
    dailyLimit: number;
    used: number;
    remaining: number;
  } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Funzione per formattare il markdown in HTML
  const formatMarkdown = (text: string): string => {
    return text
      // Headers
      .replace(/^### (.*$)/gm, '<strong style="font-size: 1.1em; display: block; margin-top: 16px; margin-bottom: 8px;">$1</strong>')
      .replace(/^## (.*$)/gm, '<strong style="font-size: 1.2em; display: block; margin-top: 20px; margin-bottom: 10px; color: var(--primary-color);">$1</strong>')
      .replace(/^# (.*$)/gm, '<strong style="font-size: 1.3em; display: block; margin-top: 24px; margin-bottom: 12px; color: var(--primary-color);">$1</strong>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      // Bullet points
      .replace(/^- (.*$)/gm, '<span style="display: block; padding-left: 16px; margin: 4px 0;">• $1</span>')
      .replace(/^\* (.*$)/gm, '<span style="display: block; padding-left: 16px; margin: 4px 0;">• $1</span>')
      // Numbered lists
      .replace(/^(\d+)\. (.*$)/gm, '<span style="display: block; padding-left: 16px; margin: 4px 0;">$1. $2</span>')
      // Line breaks
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  };

  // Carica sessioni e limite all'avvio
  useEffect(() => {
    loadSessions();
    loadUsageLimit();
  }, [token]);

  const loadUsageLimit = async () => {
    try {
      const response = await axios.get<{
        isAdmin: boolean;
        unlimited: boolean;
        dailyLimit: number;
        used: number;
        remaining: number;
      }>('/api/booky-search/limit');
      setUsageLimit(response.data);
    } catch (error) {
      console.error('Errore caricamento limite:', error);
    }
  };

  // Scroll automatico ai nuovi messaggi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const response = await axios.get<{ sessions: ChatSession[] }>('/api/booky-search/sessions');
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Errore caricamento sessioni:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      const response = await axios.get<{ messages: Message[] }>(`/api/booky-search/sessions/${sessionId}`);
      setMessages(response.data.messages || []);
      setCurrentSessionId(sessionId);
      if (isMobile) setSidebarOpen(false);
    } catch (error) {
      console.error('Errore caricamento sessione:', error);
    }
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/booky-search/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        startNewChat();
      }
    } catch (error) {
      console.error('Errore eliminazione sessione:', error);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setInput('');
    inputRef.current?.focus();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim() || isLoading) return;

    // Controlla limite (se non è admin e ha esaurito)
    if (usageLimit && !usageLimit.unlimited && usageLimit.remaining <= 0) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Hai raggiunto il limite giornaliero di ${usageLimit.dailyLimit} ricerche. Il limite si resetta a mezzanotte. Contatta l'assistenza per un upgrade!`,
        timestamp: new Date()
      }]);
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/booky-search', {
        message: userMessage.content,
        sessionId: currentSessionId
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response,
        documents: response.data.documents,
        totalFound: response.data.totalFound,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Aggiorna sessionId se è una nuova chat
      if (!currentSessionId && response.data.sessionId) {
        setCurrentSessionId(response.data.sessionId);
        loadSessions(); // Ricarica la lista sessioni
      }

      // Aggiorna il limite dopo l'invio
      loadUsageLimit();
    } catch (error: any) {
      console.error('Errore ricerca:', error);
      
      // Gestisci errore limite raggiunto (429)
      if (error.response?.status === 429) {
        const data = error.response.data;
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `⚠️ ${data.message || 'Limite giornaliero raggiunto.'}`,
          timestamp: new Date()
        }]);
        loadUsageLimit(); // Aggiorna stato limite
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Mi dispiace, si è verificato un errore durante la ricerca. Riprova tra qualche istante.',
          timestamp: new Date()
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDocument = (docId: string) => {
    navigate(`/viewer/${docId}`);
  };

  const handleAddToFavorites = async (docId: string) => {
    try {
      await axios.post('/api/documents/favorites', { documentId: docId });
      // Feedback visivo (potresti aggiungere uno snackbar)
    } catch (error) {
      console.error('Errore aggiunta preferiti:', error);
    }
  };

  // Sidebar Component
  const SidebarContent = () => (
    <Box sx={{ 
      width: isMobile ? 280 : 300, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-light)'
    }}>
      {/* Header Sidebar */}
      <Box sx={{ p: 2, borderBottom: '1px solid var(--border-light)' }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={startNewChat}
          sx={{
            bgcolor: 'var(--primary-color)',
            '&:hover': { bgcolor: 'var(--primary-dark)' },
            borderRadius: '4px',
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Nuova Ricerca
        </Button>
      </Box>

      {/* Lista Sessioni */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
        <Typography variant="caption" sx={{ px: 1, color: 'var(--text-tertiary)', fontWeight: 600 }}>
          RICERCHE SALVATE
        </Typography>
        
        {loadingSessions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : sessions.length === 0 ? (
          <Typography variant="body2" sx={{ p: 2, color: 'var(--text-tertiary)', textAlign: 'center' }}>
            Nessuna ricerca salvata
          </Typography>
        ) : (
          <List dense>
            {sessions.map((session) => (
              <ListItem
                key={session.id}
                disablePadding
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    size="small"
                    onClick={(e) => deleteSession(session.id, e)}
                    sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemButton
                  selected={currentSessionId === session.id}
                  onClick={() => loadSession(session.id)}
                  sx={{ 
                    borderRadius: '4px',
                    '&.Mui-selected': {
                      bgcolor: 'rgba(27, 42, 74, 0.1)',
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <ChatIcon fontSize="small" sx={{ color: 'var(--primary-color)' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={session.title}
                    primaryTypographyProps={{
                      noWrap: true,
                      fontSize: '0.875rem'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Sidebar Desktop */}
      {!isMobile && sidebarOpen && <SidebarContent />}

      {/* Sidebar Mobile (Drawer) */}
      <Drawer
        anchor="left"
        open={isMobile && sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      >
        <SidebarContent />
      </Drawer>

      {/* Area Chat Principale */}
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'var(--bg-primary)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            borderBottom: '1px solid var(--border-light)',
            borderRadius: 0
          }}
        >
          {isMobile && (
            <IconButton onClick={() => setSidebarOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <AIIcon sx={{ color: 'var(--primary-color)', fontSize: 28 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: '"Libre Baskerville", serif',
                fontWeight: 700,
                color: 'var(--primary-color)'
              }}
            >
              BOOKY SEARCH
            </Typography>
            <Chip 
              label="BETA" 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255, 193, 7, 0.2)', 
                color: '#B8860B',
                fontWeight: 700,
                fontSize: '0.65rem'
              }} 
            />
          </Box>
          
          {/* Indicatore limite */}
          {usageLimit && (
            <Chip
              label={usageLimit.unlimited 
                ? '∞ Illimitato' 
                : `${usageLimit.remaining}/${usageLimit.dailyLimit} ricerche`
              }
              size="small"
              sx={{
                bgcolor: usageLimit.unlimited 
                  ? 'rgba(76, 175, 80, 0.1)' 
                  : usageLimit.remaining > 0 
                    ? 'rgba(33, 150, 243, 0.1)' 
                    : 'rgba(244, 67, 54, 0.1)',
                color: usageLimit.unlimited 
                  ? '#388E3C' 
                  : usageLimit.remaining > 0 
                    ? '#1976D2' 
                    : '#D32F2F',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            />
          )}
        </Paper>

        {/* Area Messaggi */}
        <Box sx={{ 
          flexGrow: 1, 
          overflow: 'auto', 
          p: { xs: 2, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}>
          {messages.length === 0 ? (
            // Stato iniziale
            <Box sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 3,
              maxWidth: 600,
              mx: 'auto',
              textAlign: 'center',
              p: 3
            }}>
              <Box
                component="img"
                src="/booky.png"
                alt="Booky - Assistente AI"
                sx={{
                  width: { xs: 120, md: 150 },
                  height: { xs: 120, md: 150 },
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
                  animation: 'float 3s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                  }
                }}
              />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontFamily: '"Libre Baskerville", serif',
                  fontWeight: 700,
                  color: 'var(--text-primary)'
                }}
              >
                Benvenuto in BOOKY SEARCH
              </Typography>
              <Typography variant="body1" sx={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Descrivi il tuo caso o la tua ricerca giuridica. Analizzerò il database delle sentenze 
                e ti mostrerò i risultati più pertinenti con un'analisi degli orientamenti giurisprudenziali.
              </Typography>
              
              {/* Esempi di ricerca */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 2 }}>
                {[
                  'Risarcimento danno biologico sinistro stradale',
                  'Licenziamento per giusta causa',
                  'Nullità contratto bancario',
                  'Responsabilità medica'
                ].map((example) => (
                  <Chip
                    key={example}
                    label={example}
                    variant="outlined"
                    onClick={() => setInput(example)}
                    sx={{ 
                      cursor: 'pointer',
                      borderColor: 'var(--border-light)',
                      '&:hover': { 
                        bgcolor: 'rgba(27, 42, 74, 0.05)',
                        borderColor: 'var(--primary-color)'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          ) : (
            // Messaggi
            <>
              {messages.map((msg, idx) => (
                <Box 
                  key={idx}
                  sx={{ 
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    width: '100%'
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      maxWidth: { xs: '90%', md: '75%' },
                      bgcolor: msg.role === 'user' ? 'var(--primary-color)' : 'white',
                      color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                      border: msg.role === 'assistant' ? '1px solid var(--border-light)' : 'none',
                      borderRadius: '12px',
                    }}
                  >
                    {/* Contenuto messaggio */}
                    {msg.role === 'user' ? (
                      <Typography sx={{ lineHeight: 1.7 }}>
                        {msg.content}
                      </Typography>
                    ) : (
                      <Typography 
                        component="div"
                        sx={{ 
                          lineHeight: 1.7,
                          '& strong': { fontWeight: 600 },
                          '& em': { fontStyle: 'italic' },
                          '& br': { display: 'block', marginBottom: '4px' }
                        }}
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                      />
                    )}

                    {/* Documenti trovati (solo per messaggi assistant) */}
                    {msg.role === 'assistant' && msg.documents && msg.documents.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            mb: 2, 
                            color: 'var(--text-secondary)',
                            fontWeight: 600 
                          }}
                        >
                          📄 Sentenze trovate ({msg.totalFound} totali):
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {msg.documents.map((doc) => (
                            <Card 
                              key={doc.id}
                              variant="outlined"
                              sx={{ 
                                borderRadius: '8px',
                                '&:hover': { borderColor: 'var(--primary-color)' }
                              }}
                            >
                              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Typography 
                                  variant="subtitle2" 
                                  sx={{ 
                                    fontWeight: 600, 
                                    color: 'var(--primary-color)',
                                    mb: 1
                                  }}
                                >
                                  {doc.title}
                                </Typography>
                                
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: 'var(--text-secondary)',
                                    mb: 1.5,
                                    fontSize: '0.85rem'
                                  }}
                                  dangerouslySetInnerHTML={{ __html: doc.snippet }}
                                />
                                
                                {doc.cities.length > 0 && (
                                  <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
                                    {doc.cities.slice(0, 3).map((city) => (
                                      <Chip 
                                        key={city} 
                                        label={city} 
                                        size="small"
                                        sx={{ 
                                          fontSize: '0.7rem',
                                          height: 20,
                                          bgcolor: 'rgba(27, 42, 74, 0.08)'
                                        }}
                                      />
                                    ))}
                                  </Box>
                                )}
                                
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button
                                    size="small"
                                    startIcon={<ViewIcon />}
                                    onClick={() => handleViewDocument(doc.id)}
                                    sx={{ 
                                      textTransform: 'none',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    Visualizza
                                  </Button>
                                  <Button
                                    size="small"
                                    startIcon={<FavoriteIcon />}
                                    onClick={() => handleAddToFavorites(doc.id)}
                                    sx={{ 
                                      textTransform: 'none',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    Preferiti
                                  </Button>
                                </Box>
                              </CardContent>
                            </Card>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Paper>
                </Box>
              ))}
              
              {/* Indicatore caricamento */}
              {isLoading && (
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" sx={{ color: 'var(--text-tertiary)' }}>
                    Sto cercando nel database e analizzando i risultati...
                  </Typography>
                </Box>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </Box>

        {/* Input Area */}
        <Paper 
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          sx={{ 
            p: 2, 
            borderTop: '1px solid var(--border-light)',
            borderRadius: 0
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            maxWidth: 800,
            mx: 'auto'
          }}>
            <TextField
              ref={inputRef}
              fullWidth
              placeholder="Descrivi il tuo caso o cosa stai cercando..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              multiline
              maxRows={4}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: 'var(--bg-secondary)'
                }
              }}
            />
            <IconButton 
              type="submit"
              disabled={!input.trim() || isLoading}
              sx={{ 
                bgcolor: 'var(--primary-color)',
                color: 'white',
                '&:hover': { bgcolor: 'var(--primary-dark)' },
                '&.Mui-disabled': { bgcolor: 'var(--border-light)' },
                width: 48,
                height: 48,
                alignSelf: 'flex-end'
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default BookySearchPage;


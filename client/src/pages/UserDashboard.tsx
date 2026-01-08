import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  TextField, 
  InputAdornment,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Chip,
  Button,
  Autocomplete,
  Pagination,
  Stack,
  IconButton
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterListIcon, Clear as ClearIcon } from '@mui/icons-material';
import DocumentCard from '../components/DocumentCard';
import AuthContext, { AuthContextType } from '../contexts/AuthContext';
import axios from 'axios';
import API from '../utils/http';
import { useOptimizedSearch, measurePerformance } from '../utils/searchOptimization';
import { trackSearch, trackAddToFavorites, trackRemoveFromFavorites, trackDocumentView } from '../utils/analytics';

interface Document {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileSize: number;
  uploadDate: string;
  viewCount: number;
  downloadCount: number;
  favoriteCount: number;
  keywords?: string[];
  cities?: string[];
  userId?: string;
  content?: string;
}

interface PaginatedResponse {
  documents: Document[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, isAuthenticated } = useContext<AuthContextType>(AuthContext);
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [favorites, setFavorites] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalDocuments, setTotalDocuments] = useState<number>(0);
  
  // Carica i documenti quando cambia il termine di ricerca, le città selezionate o la pagina
  useEffect(() => {
    console.log("[UserDashboard] useEffect per fetchDocuments attivato", {
      currentPage,
      activeTab,
      searchTermLength: searchTerm?.length || 0,
      selectedCitiesCount: selectedCities?.length || 0
    });
    fetchDocuments();
  }, [token, searchTerm, selectedCities, currentPage, activeTab]);

  // Carica le città disponibili al caricamento del componente
  useEffect(() => {
    fetchCities();
  }, []);

  // Ripristina lo stato della ricerca quando si torna dal viewer
  useEffect(() => {
    const state = location.state as any;
    if (state?.searchState) {
      console.log('[UserDashboard] Ripristino stato ricerca:', state.searchState);
      
      setSearchTerm(state.searchState.searchTerm || '');
      setInputValue(state.searchState.searchTerm || '');
      setSelectedCities(state.searchState.cities || []);
      setCurrentPage(state.searchState.page || 1);
      setActiveTab(state.searchState.activeTab || 0);
      
      // Pulisci lo state per evitare loop
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 🚀 Fetch ottimizzato con cache e performance monitoring
  const fetchDocuments = measurePerformance('fetchDocuments', async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Costruisci i parametri di richiesta
      const params: Record<string, any> = {};
      
      if (searchTerm) {
        params.searchTerm = searchTerm;
      }
      
      if (selectedCities.length > 0) {
        params.cities = selectedCities;
      }
      
      // Configura l'autenticazione
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      if (activeTab === 0) {
        // Fetch documenti con filtri usando la nuova API utilità
        console.log(`[UserDashboard] Richiesta documenti con paginazione:`, {
          currentPage,
          pageSize: 10,
          params
        });
        
        const response = await API.getPaginated<PaginatedResponse>(
          '/api/documents',
          currentPage,
          10,
          params,
          config
        );
        
        console.log('[UserDashboard] Risposta documenti del server:', {
          documents: response.data.documents?.length || 0,
          page: response.data.page,
          totalPages: response.data.totalPages,
          total: response.data.total
        });
        
        setDocuments(response.data.documents || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalDocuments(response.data.total || 0);
        
        // 📊 Traccia ricerca su Google Analytics (solo se c'è un termine di ricerca)
        if (searchTerm) {
          trackSearch(searchTerm, {
            cities: selectedCities,
            resultsCount: response.data.total || 0,
          });
        }
      } else if (activeTab === 1) {
        // Fetch preferiti usando la nuova API utilità
        console.log(`[UserDashboard] Richiesta preferiti con paginazione:`, {
          currentPage,
          pageSize: 10,
          params
        });
        
        const favResponse = await API.getPaginated<PaginatedResponse>(
          '/api/documents/favorites',
          currentPage,
          10,
          params,
          config
        );
        
        console.log('[UserDashboard] Risposta preferiti del server:', {
          documents: favResponse.data.documents?.length || 0,
          page: favResponse.data.page,
          totalPages: favResponse.data.totalPages,
          total: favResponse.data.total
        });
        
        setFavorites(favResponse.data.documents || []);
        setTotalPages(favResponse.data.totalPages || 1);
        setTotalDocuments(favResponse.data.total || 0);
        
        // Aggiorna l'elenco degli ID dei documenti preferiti
        setUserFavorites((favResponse.data.documents || []).map((doc: Document) => doc.id));
      }
    } catch (err: any) {
      console.error('Errore nel recupero dei documenti:', err);
      setError(err.response?.data?.message || 'Errore nel caricamento dei documenti.');
    } finally {
      setLoading(false);
    }
  });

  const fetchCities = async () => {
    try {
      const response = await axios.get('/api/documents/cities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableCities(response.data.cities || []);
    } catch (error) {
      console.error('Errore nel recupero delle città:', error);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // 🚀 Ricerca ottimizzata con debounce (300ms)
  const optimizedSearch = useOptimizedSearch(() => {
    setSearchTerm(inputValue);
    setCurrentPage(1);
  }, 300);

  const handleSearch = () => {
    optimizedSearch();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setCurrentPage(1);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    console.log(`[UserDashboard] handlePageChange - Cambio pagina da ${currentPage} a ${value}`);
    setCurrentPage(value);
  };

  const toggleFavorite = async (documentId: string) => {
    try {
      const isFavorite = userFavorites.includes(documentId);
      
      if (isFavorite) {
        // Rimuovi dai preferiti
        await axios.delete(`/api/documents/favorites/${documentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setFavorites(favorites.filter(doc => doc.id !== documentId));
        setUserFavorites(userFavorites.filter(id => id !== documentId));
        
        // 📊 Traccia rimozione preferiti su GA4
        trackRemoveFromFavorites(documentId);
      } else {
        // Aggiungi ai preferiti
        await axios.post(
          '/api/documents/favorites',
          { documentId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Aggiungi alla lista dei preferiti
        const docToAdd = documents.find(doc => doc.id === documentId);
        if (docToAdd) {
          setFavorites([...favorites, docToAdd]);
          setUserFavorites([...userFavorites, documentId]);
          
          // 📊 Traccia aggiunta preferiti su GA4
          trackAddToFavorites(documentId, docToAdd.title);
        }
      }
    } catch (err) {
      console.error('Errore nella gestione dei preferiti:', err);
    }
  };

  const handleViewDocument = (id: string) => {
    // 📊 Traccia visualizzazione documento su GA4
    const doc = [...documents, ...favorites].find(d => d.id === id);
    if (doc) {
      trackDocumentView(id, doc.title);
    }
    
    // Salva lo stato della ricerca corrente
    const searchState = {
      searchTerm: searchTerm,
      cities: selectedCities,
      page: currentPage,
      activeTab: activeTab
    };
    
    navigate(`/viewer/${id}`, { 
      state: { 
        returnTo: '/dashboard', 
        searchState: searchState 
      } 
    });
  };

  // Filtra per tab attivo (tutti i documenti o preferiti)
  const displayedDocuments = activeTab === 0 ? documents : favorites;

  return (
    <Container maxWidth="lg" sx={{ py: 5 }} className="fade-in">
      <Box sx={{ mb: 5 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          className="page-title"
          sx={{ 
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            mb: 3
          }}
        >
          La tua Raccolta Documenti
        </Typography>
        {user && (
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              mb: 4,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              lineHeight: 1.7,
              maxWidth: '800px'
            }}
            className="slide-up"
          >
            Benvenuto, <Box component="span" sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</Box>. 
            Questa è la tua dashboard personalizzata dove puoi sfogliare, cercare e organizzare i tuoi documenti.
          </Typography>
        )}
        
        <Box 
          className="glass-card enhanced-search-container"
          sx={{ 
            p: 0.8,
            mb: 4,
            borderRadius: 'var(--border-radius-xl)',
            display: 'flex',
            alignItems: 'center',
            backdropFilter: 'blur(10px)',
            background: 'var(--glass-background)',
            border: 'var(--glass-border)',
          }}
        >
          <TextField
            fullWidth
            placeholder="Cerca per titolo, contenuto, città o parole chiave..."
            variant="outlined"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'var(--primary-color)' }} />
                </InputAdornment>
              ),
              endAdornment: inputValue && (
                <InputAdornment position="end">
                  <IconButton 
                    edge="end" 
                    onClick={() => setInputValue('')}
                    size="small"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: { 
                borderRadius: '30px',
                '& fieldset': { border: 'none' },
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: '0.95rem',
                py: 0.5
              }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            sx={{ 
              height: '40px',
              minWidth: '80px',
              borderRadius: '20px',
              ml: 1,
              fontWeight: 600,
              textTransform: 'none',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            Cerca
          </Button>
        </Box>
        
        <Button 
          startIcon={<FilterListIcon />} 
          onClick={() => setShowFilters(!showFilters)}
          className="modern-button"
          variant="contained"
          color="primary"
          size="medium"
          sx={{ 
            mb: 3,
            borderRadius: 'var(--border-radius-md)',
            textTransform: 'none',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontWeight: 600,
            bgcolor: 'var(--secondary-color)',
            color: '#fff',
            boxShadow: 'var(--shadow-md)',
            '&:hover': {
              bgcolor: 'var(--primary-color)',
              boxShadow: 'var(--shadow-lg)',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease'
            },
            px: 3,
            py: 1
          }}
        >
          {showFilters ? 'Nascondi filtri' : 'Filtri avanzati'}
        </Button>
        
        {showFilters && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 'var(--border-radius-lg)',
              border: '1px solid var(--border-light)',
              background: 'linear-gradient(145deg, var(--card-background), rgba(255,255,255,0.8))'
            }}
            className="fade-blur-in"
          >
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 2,
                fontFamily: 'Syne, sans-serif',
                fontWeight: 600,
                fontSize: '1.1rem'
              }}
            >
              Filtra per città
            </Typography>
            <Autocomplete
              multiple
              id="cities-filter"
              options={availableCities}
              value={selectedCities}
              onChange={(_, newValue) => {
                setSelectedCities(newValue);
                setCurrentPage(1);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Seleziona una o più città..."
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 'var(--border-radius-md)',
                      fontFamily: 'Plus Jakarta Sans, sans-serif'
                    }
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    color="primary"
                    variant="filled"
                    sx={{
                      borderRadius: '20px',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      bgcolor: 'var(--secondary-color)',
                      fontWeight: 500
                    }}
                  />
                ))
              }
            />
          </Paper>
        )}
      </Box>
      
      <Box sx={{ mb: 4 }}>
                  <Paper 
            className="enhanced-tabs"
            sx={{ 
              borderRadius: 'var(--border-radius-lg)',
              overflow: 'hidden',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)'
            }}
            elevation={0}
          >
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                py: 1.8
              }
            }}
          >
            <Tab label="Tutti i Documenti" />
            <Tab label="I Miei Preferiti" />
          </Tabs>
        </Paper>
      </Box>

      {/* Mostra i filtri attivi */}
      {(searchTerm || selectedCities.length > 0) && (
        <Box 
          sx={{ 
            mb: 4, 
            display: 'flex', 
            flexWrap: 'wrap', 
            alignItems: 'center', 
            gap: 1.5,
            p: 2,
            borderRadius: 'var(--border-radius-lg)',
            bgcolor: 'rgba(195, 143, 255, 0.05)',
            border: '1px dashed rgba(195, 143, 255, 0.3)'
          }}
          className="fade-in"
        >
          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Filtri attivi:
          </Typography>
          
          {searchTerm && (
            <Chip 
              label={`Ricerca: ${searchTerm}`} 
              onDelete={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }} 
              color="primary"
              sx={{ 
                borderRadius: '20px',
                bgcolor: 'var(--secondary-color)',
                fontFamily: 'Plus Jakarta Sans, sans-serif'
              }}
            />
          )}
          
          {selectedCities.map(city => (
            <Chip 
              key={city}
              label={`Città: ${city}`} 
              onDelete={() => {
                setSelectedCities(selectedCities.filter(c => c !== city));
                setCurrentPage(1);
              }}
              sx={{ 
                borderRadius: '20px',
                bgcolor: 'rgba(56, 189, 248, 0.2)',
                color: 'var(--primary-color)',
                fontFamily: 'Plus Jakarta Sans, sans-serif'
              }}
            />
          ))}
          
          {(searchTerm || selectedCities.length > 0) && (
            <Button 
              variant="text" 
              size="small"
              onClick={() => {
                setSearchTerm('');
                setSelectedCities([]);
                setCurrentPage(1);
              }}
              sx={{ 
                ml: 'auto',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                textTransform: 'none',
                fontWeight: 600,
                color: 'var(--primary-color)'
              }}
            >
              Cancella tutti
            </Button>
          )}
        </Box>
      )}

      {loading ? (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            flexDirection: 'column',
            py: 10,
            gap: 2
          }}
        >
          <CircularProgress 
            color="primary"
            size={50}
            thickness={4}
            sx={{ color: 'var(--secondary-color)' }}
          />
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              animation: 'pulse 1.5s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 0.6 },
                '50%': { opacity: 1 },
                '100%': { opacity: 0.6 }
              }
            }}
          >
            Caricamento documenti...
          </Typography>
        </Box>
      ) : error ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            px: 3,
            borderRadius: 'var(--border-radius-lg)',
            bgcolor: 'rgba(244, 63, 94, 0.05)',
            border: '1px solid rgba(244, 63, 94, 0.1)',
            maxWidth: '800px',
            mx: 'auto'
          }}
        >
          <Typography variant="h6" color="error" gutterBottom sx={{ fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ 
              mt: 2,
              borderRadius: 'var(--border-radius-md)',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: 'var(--shadow-md)'
            }}
            onClick={() => window.location.reload()}
          >
            Riprova
          </Button>
        </Box>
      ) : displayedDocuments.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            px: 3,
            borderRadius: 'var(--border-radius-lg)',
            bgcolor: 'rgba(56, 189, 248, 0.05)',
            border: '1px solid rgba(56, 189, 248, 0.1)',
            maxWidth: '800px',
            mx: 'auto'
          }}
        >
          <Typography 
            variant="h6" 
            color="text.secondary" 
            gutterBottom 
            sx={{ 
              fontFamily: 'Syne, sans-serif', 
              fontWeight: 600,
              mb: 2
            }}
          >
            {searchTerm || selectedCities.length > 0
              ? 'Nessun documento trovato con i filtri selezionati' 
              : activeTab === 0 
                ? 'Nessun documento disponibile' 
                : 'Nessun documento nei preferiti'}
          </Typography>
          {(searchTerm || selectedCities.length > 0) && (
            <Button 
              variant="outlined" 
              sx={{ 
                mt: 2,
                borderRadius: 'var(--border-radius-md)',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 600,
                textTransform: 'none',
                borderColor: 'var(--info-color)',
                color: 'var(--info-color)',
                '&:hover': {
                  borderColor: 'var(--info-color)',
                  bgcolor: 'rgba(56, 189, 248, 0.05)'
                }
              }}
              onClick={() => {
                setSearchTerm('');
                setSelectedCities([]);
                setCurrentPage(1);
              }}
            >
              Cancella filtri
            </Button>
          )}
        </Box>
      ) : (
        <>
          <Box sx={{ position: 'relative' }}>
            <Grid container spacing={3} className="slide-up">
              {displayedDocuments.map((doc, index) => (
                <Grid 
                  item 
                  xs={12}
                  key={doc.id}
                  className="stagger-item"
                  sx={{ 
                    animation: `slideUp 0.5s cubic-bezier(0.33, 1, 0.68, 1) forwards ${index * 0.08}s`,
                    opacity: 0 
                  }}
                >
                  <DocumentCard 
                    document={doc}
                    isFavorite={userFavorites.includes(doc.id)}
                    onToggleFavorite={() => toggleFavorite(doc.id)}
                    onViewDocument={handleViewDocument}
                  />
                </Grid>
              ))}
            </Grid>
            
            {/* Paginazione */}
            {totalPages > 1 && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  mt: 6, 
                  mb: 2,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '150px',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, var(--border-light), transparent)'
                  }
                }}
                className="fade-in"
              >
                <Pagination 
                  count={totalPages} 
                  page={currentPage} 
                  onChange={handlePageChange} 
                  color="primary"
                  size="large"
                  siblingCount={1}
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      fontWeight: 500,
                      borderRadius: 'var(--border-radius-md)',
                      transition: 'all 0.2s cubic-bezier(0.33, 1, 0.68, 1)'
                    },
                    '& .Mui-selected': {
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, var(--primary-color), var(--primary-light))',
                      boxShadow: 'var(--shadow-sm)'
                    },
                    '& .MuiPaginationItem-root:hover': {
                      background: 'rgba(195, 143, 255, 0.1)'
                    }
                  }}
                />
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  align="center"
                  sx={{ 
                    mt: 2,
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    fontSize: '0.9rem'
                  }}
                >
                  <Box component="span" sx={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                    {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, totalDocuments)}
                  </Box>{' '}
                  di {totalDocuments} documenti
                </Typography>
              </Box>
            )}
          </Box>
        </>
      )}
    </Container>
  );
};

export default UserDashboard; 
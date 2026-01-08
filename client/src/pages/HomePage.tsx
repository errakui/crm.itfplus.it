import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  TextField, 
  InputAdornment,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  Paper,
  Chip,
  Autocomplete,
  Pagination,
  Stack,
  IconButton
} from '@mui/material';
import { 
  Search as SearchIcon, 
  FilterList as FilterListIcon, 
  Clear as ClearIcon 
} from '@mui/icons-material';
import DocumentCard from '../components/DocumentCard';
import AuthContext from '../contexts/AuthContext';
import TrialPopup from '../components/TrialPopup';
import axios from 'axios';

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
  cities: string[];
  userId: string;
  content?: string;
}

interface PaginatedResponse {
  documents: Document[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const HomePage: React.FC = () => {
  const { isAuthenticated, token } = useContext(AuthContext);
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
    fetchDocuments();
  }, [token, isAuthenticated, searchTerm, selectedCities, currentPage, activeTab]);

  // Carica le città disponibili al caricamento del componente
  useEffect(() => {
    fetchCities();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Reset della pagina quando cambia la ricerca o i filtri
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('searchTerm', searchTerm);
      }
      selectedCities.forEach(city => {
        params.append('cities', city);
      });
      
      // Aggiungi parametri di paginazione
      params.append('page', currentPage.toString());
      params.append('pageSize', '10'); // Impostiamo a 10 documenti per pagina
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      
      if (activeTab === 0) {
        // Fetch documenti con filtri
        const response = await axios.get<PaginatedResponse>(`/api/documents${queryString}`, {
          headers: isAuthenticated() ? { Authorization: `Bearer ${token}` } : {}
        });
        
        setDocuments(response.data.documents || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalDocuments(response.data.total || 0);
      } else if (activeTab === 1 && isAuthenticated()) {
        // Fetch preferiti
        const favResponse = await axios.get<PaginatedResponse>(`/api/documents/favorites${queryString}`, {
          headers: { Authorization: `Bearer ${token}` }
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
  };

  const fetchCities = async () => {
    try {
      const response = await axios.get('/api/documents/cities');
      setAvailableCities(response.data.cities || []);
    } catch (error) {
      console.error('Errore nel recupero delle città:', error);
    }
  };

  // Modifica della funzione handleSearch per gestire solo l'input senza avviare la ricerca
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // Nuova funzione per avviare la ricerca
  const handleSearch = () => {
    setSearchTerm(inputValue);
    setCurrentPage(1); // Reimposta alla prima pagina quando cambia la ricerca
  };

  // Funzione per gestire il tasto Invio
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setCurrentPage(1); // Reimposta alla prima pagina quando cambia la tab
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const toggleFavorite = async (documentId: string) => {
    if (!isAuthenticated()) return;

    try {
      const isFavorite = userFavorites.includes(documentId);
      
      if (isFavorite) {
        // Rimuovi dai preferiti
        await axios.delete(`/api/documents/favorites/${documentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setFavorites(favorites.filter(doc => doc.id !== documentId));
        setUserFavorites(userFavorites.filter(id => id !== documentId));
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
        }
      }
    } catch (err) {
      console.error('Errore nella gestione dei preferiti:', err);
    }
  };

  // Filtra per tab attivo (tutti i documenti o preferiti)
  const displayedDocuments = activeTab === 0 ? documents : favorites;

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img 
            src="/itfpluslogo.png" 
            alt="ITFPLUS" 
            style={{ 
              height: '80px'
            }} 
          />
        </Box>
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 4,
            color: 'text.secondary',
            maxWidth: '800px',
            mx: 'auto'
          }}
        >
          Il tuo CRM legale per la gestione dei documenti giuridici
        </Typography>
        
        <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 1, 
              mx: 'auto',
              mb: 2,
              borderRadius: '28px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <TextField
              fullWidth
              placeholder="Cerca documenti per titolo, descrizione, parole chiave o contenuto..."
              variant="outlined"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {inputValue && (
                      <IconButton 
                        edge="end" 
                        onClick={() => setInputValue('')}
                        size="small"
                      >
                        <ClearIcon />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: '24px',
                  '& fieldset': { border: 'none' },
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
                fontWeight: 600
              }}
            >
              Cerca
            </Button>
          </Paper>
          
          <Button 
            startIcon={<FilterListIcon />} 
            onClick={() => setShowFilters(!showFilters)}
            variant="outlined"
            color="primary"
            size="small"
            sx={{ mb: 2 }}
          >
            {showFilters ? 'Nascondi filtri' : 'Mostra filtri'}
          </Button>
          
          {showFilters && (
            <Paper sx={{ p: 2, mb: 2, borderRadius: '8px' }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Filtra per città
              </Typography>
              <Autocomplete
                multiple
                id="cities-filter"
                options={availableCities}
                value={selectedCities}
                onChange={(_, newValue) => {
                  setSelectedCities(newValue);
                  setCurrentPage(1); // Reimposta alla prima pagina quando cambiano i filtri
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Seleziona una o più città..."
                    fullWidth
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      color="primary"
                    />
                  ))
                }
              />
            </Paper>
          )}
        </Box>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Paper sx={{ borderRadius: '8px' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Tutti i Documenti" />
            {isAuthenticated() && <Tab label="I Miei Preferiti" />}
          </Tabs>
        </Paper>
      </Box>

      {/* Mostra i filtri attivi */}
      {(searchTerm || selectedCities.length > 0) && (
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
          <Typography variant="body1">
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
              variant="outlined"
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
              color="primary"
              variant="outlined"
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
            >
              Cancella tutti
            </Button>
          )}
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
          >
            Riprova
          </Button>
        </Box>
      ) : displayedDocuments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm || selectedCities.length > 0
              ? 'Nessun documento trovato con i filtri selezionati' 
              : activeTab === 0 
                ? 'Nessun documento disponibile' 
                : 'Nessun documento nei preferiti'}
          </Typography>
          {(searchTerm || selectedCities.length > 0) && (
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }}
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
          <Grid container spacing={3}>
            {displayedDocuments.map((doc) => (
              <Grid item xs={12} key={doc.id}>
                <DocumentCard 
                  document={doc}
                  isFavorite={userFavorites.includes(doc.id)}
                  onToggleFavorite={() => toggleFavorite(doc.id)}
                />
              </Grid>
            ))}
          </Grid>
          
          {/* Paginazione */}
          {totalPages > 1 && (
            <Stack spacing={2} sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Pagina {currentPage} di {totalPages} ({totalDocuments} documenti)
              </Typography>
              <Pagination 
                count={totalPages} 
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Stack>
          )}
        </>
      )}

      {/* Popup Trial solo se NON loggato */}
      {!isAuthenticated() && <TrialPopup />}
    </Container>
  );
};

export default HomePage; 
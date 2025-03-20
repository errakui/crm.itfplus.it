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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import DocumentCard from '../components/DocumentCard';
import AuthContext from '../contexts/AuthContext';
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

const HomePage: React.FC = () => {
  const { isAuthenticated, token } = useContext(AuthContext);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [favorites, setFavorites] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Carica i documenti quando cambia il termine di ricerca o le città selezionate
  useEffect(() => {
    fetchDocuments();
  }, [token, isAuthenticated, searchTerm, selectedCities]);

  // Carica le città disponibili al caricamento del componente
  useEffect(() => {
    fetchCities();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Costruisci i parametri di query
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('searchTerm', searchTerm);
      }
      selectedCities.forEach(city => {
        params.append('cities', city);
      });
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      
      // Fetch documenti con filtri
      const response = await axios.get(`http://localhost:8000/api/documents${queryString}`, {
        headers: isAuthenticated() ? { Authorization: `Bearer ${token}` } : {}
      });
      
      setDocuments(response.data.documents || []);
      
      // Se l'utente è autenticato, recupera anche i preferiti
      if (isAuthenticated()) {
        try {
          const favResponse = await axios.get('http://localhost:8000/api/documents/favorites', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setFavorites(favResponse.data.documents || []);
          setUserFavorites((favResponse.data.documents || []).map((doc: Document) => doc.id));
        } catch (err) {
          console.error('Errore nel recupero dei preferiti:', err);
        }
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
      const response = await axios.get('http://localhost:8000/api/documents/cities');
      setAvailableCities(response.data.cities || []);
    } catch (error) {
      console.error('Errore nel recupero delle città:', error);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const toggleFavorite = async (documentId: string) => {
    if (!isAuthenticated()) return;

    try {
      const isFavorite = userFavorites.includes(documentId);
      
      if (isFavorite) {
        // Rimuovi dai preferiti
        await axios.delete(`http://localhost:8000/api/documents/favorites/${documentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setFavorites(favorites.filter(doc => doc.id !== documentId));
        setUserFavorites(userFavorites.filter(id => id !== documentId));
      } else {
        // Aggiungi ai preferiti
        await axios.post(
          'http://localhost:8000/api/documents/favorites',
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
        <Typography 
          variant="h2" 
          component="h1" 
          sx={{ 
            mb: 2,
            fontFamily: 'Cormorant Garamond, serif',
            color: '#1B2A4A',
            fontWeight: 600
          }}
        >
          ITFPLUS
        </Typography>
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
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: '24px',
                  '& fieldset': { border: 'none' },
                }
              }}
            />
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
                onChange={(_, newValue) => setSelectedCities(newValue)}
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
              onDelete={() => setSearchTerm('')} 
              color="primary"
              variant="outlined"
            />
          )}
          
          {selectedCities.map(city => (
            <Chip 
              key={city}
              label={`Città: ${city}`} 
              onDelete={() => setSelectedCities(selectedCities.filter(c => c !== city))}
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
              }}
            >
              Cancella filtri
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {displayedDocuments.map((doc) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
              <DocumentCard 
                document={doc}
                isFavorite={userFavorites.includes(doc.id)}
                onToggleFavorite={() => toggleFavorite(doc.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default HomePage; 
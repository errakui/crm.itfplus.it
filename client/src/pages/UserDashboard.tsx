import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Chip,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Alert,
  Autocomplete,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Link,
  IconButton,
  Tooltip
} from '@mui/material';
import { Search as SearchIcon, Description as DescriptionIcon, FilterList as FilterListIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { SelectChangeEvent } from '@mui/material';

interface Document {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  viewCount: number;
  downloadCount: number;
  uploadDate: string;
  keywords?: string[];
  cities?: string[];
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [favoriteDocuments, setFavoriteDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const loadDocuments = async () => {
    if (!isAuthenticated()) return;
    
    try {
      setLoading(true);
      
      // Carica documenti con apiService
      const response = await apiService.getDocuments({
        search: searchTerm,
        sort: sortOrder
      });
      
      setDocuments(response.data.documents || []);
      setLoading(false);
    } catch (err) {
      console.error('Errore nel recupero documenti:', err);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadDocuments();
  }, [searchTerm, sortOrder]);
  
  useEffect(() => {
    const fetchCities = async () => {
      try {
        // Carica città disponibili
        const response = await apiService.getCities();
        setAvailableCities(response.data || []);
      } catch (err) {
        console.error('Errore nel recupero delle città:', err);
      }
    };
    
    fetchCities();
  }, []);
  
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated()) return;
      
      try {
        // Carica preferiti
        const response = await apiService.getFavorites();
        // Salva l'intera lista dei documenti preferiti
        setFavoriteDocuments(response.data || []);
      } catch (err) {
        console.error('Errore nel recupero dei preferiti:', err);
      }
    };
    
    fetchFavorites();
  }, [isAuthenticated]);

  const viewDocument = (id: string) => {
    navigate(`/viewer/${id}`);
  };

  const handleSearch = () => {
    loadDocuments();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedCities([]);
    loadDocuments();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCities([]);
    loadDocuments();
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOrder(event.target.value);
    loadDocuments();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 2,
            fontFamily: 'Cormorant Garamond, serif',
            color: '#1B2A4A',
            fontWeight: 600,
          }}
        >
          Benvenuto, {user?.name || 'Utente'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Esplora i documenti disponibili o cerca specifici contenuti legali
        </Typography>

        <Paper
          component="form"
          sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center' }}
          elevation={1}
          onSubmit={handleSearch}
        >
          <TextField
            fullWidth
            placeholder="Cerca documenti per titolo, contenuto o parole chiave..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mr: 2 }}
          />
          <Button
            variant="contained"
            type="submit"
            sx={{ py: 1.5, px: 4 }}
            disabled={loading}
          >
            Cerca
          </Button>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button 
            startIcon={<FilterListIcon />} 
            onClick={() => setShowFilters(!showFilters)}
            variant="outlined"
            size="small"
          >
            {showFilters ? 'Nascondi filtri' : 'Mostra filtri'}
          </Button>
          
          {(searchTerm || selectedCities.length > 0) && (
            <Button 
              variant="text" 
              color="secondary" 
              size="small"
              onClick={handleResetFilters}
            >
              Reimposta filtri
            </Button>
          )}
        </Box>
        
        {showFilters && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
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
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                  />
                ))
              }
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                onClick={loadDocuments}
                disabled={loading}
              >
                Applica filtri
              </Button>
            </Box>
          </Paper>
        )}

        {/* Visualizza i filtri attivi */}
        {(searchTerm || selectedCities.length > 0) && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Filtri attivi:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {searchTerm && (
                <Chip 
                  label={`Ricerca: ${searchTerm}`} 
                  onDelete={() => setSearchTerm('')}
                />
              )}
              
              {selectedCities.map(city => (
                <Chip 
                  key={city}
                  label={`Città: ${city}`}
                  onDelete={() => setSelectedCities(selectedCities.filter(c => c !== city))}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            Documenti disponibili
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : documents.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Nessun documento trovato.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {documents.map((doc) => (
                <Grid item xs={12} key={doc.id}>
                  <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6">{doc.title}</Typography>
                      <Chip
                        label={`${doc.viewCount} visualizzazioni`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    {doc.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {doc.description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Aggiunto il: {formatDate(doc.uploadDate)}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {doc.keywords?.map((keyword) => (
                            <Chip
                              key={keyword}
                              label={keyword}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                        {doc.cities && doc.cities.length > 0 && (
                          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {doc.cities.map((city) => (
                              <Chip
                                key={city}
                                label={city}
                                size="small"
                                variant="outlined"
                                color="secondary"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<DescriptionIcon />}
                        onClick={() => viewDocument(doc.id)}
                        sx={{ minWidth: 120 }}
                      >
                        Visualizza
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              I tuoi preferiti
            </Typography>
            {favoriteDocuments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Non hai ancora documenti preferiti.
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Titolo</TableCell>
                      <TableCell>Data Caricamento</TableCell>
                      <TableCell align="right">Azioni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {favoriteDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <Link 
                            component="button"
                            variant="body1"
                            onClick={() => viewDocument(doc.id)}
                            underline="hover"
                            color="primary"
                          >
                            {doc.title}
                          </Link>
                        </TableCell>
                        <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Visualizza">
                            <IconButton onClick={() => viewDocument(doc.id)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistiche personali
              </Typography>
              <Box sx={{ my: 2 }}>
                <Typography variant="body2">
                  Documenti visualizzati: {favoriteDocuments.length}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Ricerche effettuate: {searchTerm ? '1' : '0'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserDashboard; 
import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import { Favorite as FavoriteIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';

interface Document {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  uploadDate: string;
}

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/documents/favorites', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFavorites(response.data.documents);
        setError(null);
      } catch (err) {
        console.error('Errore nel recupero dei preferiti:', err);
        setError('Impossibile caricare i documenti preferiti. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [token]);

  const handleViewDocument = (id: string) => {
    navigate(`/viewer/${id}`);
  };

  const handleRemoveFavorite = async (id: string) => {
    try {
      await axios.delete(`http://localhost:8000/api/documents/favorites/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Aggiorna la lista dei preferiti dopo la rimozione
      setFavorites(favorites.filter(doc => doc.id !== id));
    } catch (err) {
      console.error('Errore nella rimozione dai preferiti:', err);
      setError('Impossibile rimuovere il documento dai preferiti.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          I miei documenti preferiti
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Qui puoi trovare tutti i documenti che hai salvato come preferiti per accedervi facilmente.
        </Typography>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      ) : favorites.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          textAlign: 'center'
        }}>
          <FavoriteIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Non hai ancora documenti preferiti
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
            Sfoglia i documenti disponibili e aggiungi ai preferiti quelli che vuoi consultare più frequentemente.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Sfoglia documenti
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {favorites.map(document => (
            <Grid item xs={12} sm={6} md={4} key={document.id}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardMedia
                  component="div"
                  sx={{
                    height: 140,
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: 60, color: 'primary.light' }} />
                </CardMedia>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2" noWrap>
                    {document.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {document.description || 'Nessuna descrizione disponibile'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Aggiunto il: {new Date(document.uploadDate).toLocaleDateString('it-IT')}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleViewDocument(document.id)}>
                    Visualizza
                  </Button>
                  <Button 
                    size="small" 
                    color="error"
                    startIcon={<FavoriteIcon />}
                    onClick={() => handleRemoveFavorite(document.id)}
                  >
                    Rimuovi
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default FavoritesPage; 
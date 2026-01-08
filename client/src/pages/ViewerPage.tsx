import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Grid, Container, Typography, CircularProgress, Button } from '@mui/material';
import axios from 'axios';
import PDFViewer from '../components/PDFViewer';
import Chatbot from '../components/Chatbot';
import AuthContext from '../contexts/AuthContext';
import { ArrowBack } from '@mui/icons-material';

interface Document {
  id: string;
  title: string;
  fileUrl: string;
  description?: string;
  keywords?: string[];
  uploadDate: string;
  viewCount: number;
  downloadCount: number;
  favoriteCount: number;
  fileSize: number;
  content?: string;
}

const ViewerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, isAuthenticated } = useContext(AuthContext);
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id || !isAuthenticated()) return;

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/documents/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setDocument(response.data.document);

        // Verifica se il documento è nei preferiti
        try {
          const favoritesResponse = await axios.get(`/api/documents/favorites`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          const favorites = favoritesResponse.data.documents || [];
          const isFav = favorites.some((doc: any) => doc.id === id);
          setIsFavorite(isFav);
        } catch (err) {
          console.error('Errore nel recupero dei preferiti:', err);
        }
      } catch (err: any) {
        console.error('Errore nel recupero del documento:', err);
        setError(err.response?.data?.message || 'Errore nel caricamento del documento.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, token, isAuthenticated]);

  const handleToggleFavorite = async () => {
    if (!document || !isAuthenticated()) return;

    try {
      if (isFavorite) {
        // Rimuovi dai preferiti
        await axios.delete(`/api/documents/favorites/${document.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setIsFavorite(false);
      } else {
        // Aggiungi ai preferiti
        await axios.post(
          `/api/documents/favorites`,
          { documentId: document.id },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Errore nella gestione dei preferiti:', err);
    }
  };

  const handleBackToResults = () => {
    const state = location.state as any;
    
    if (state?.returnTo && state?.searchState) {
      // Torna alla ricerca con lo stato salvato
      navigate(state.returnTo, { 
        state: { searchState: state.searchState },
        replace: true 
      });
    } else {
      // Fallback alla dashboard
      navigate('/dashboard');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBackToResults}
          sx={{ color: '#1B2A4A' }}
        >
          Torna ai risultati
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 4, textAlign: 'center', my: 8 }}>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2, bgcolor: '#1B2A4A' }}
            onClick={handleBackToResults}
          >
            Torna ai risultati
          </Button>
        </Box>
      ) : document ? (
        <Grid container spacing={4}>
          {/* PDF Viewer (occupa 2/3 su desktop, pieno su mobile) */}
          <Grid item xs={12} md={8}>
            <Box sx={{ height: { xs: 'calc(100vh - 300px)', md: 'calc(100vh - 200px)' } }}>
              <PDFViewer
                documentId={document.id}
                documentUrl={document.fileUrl.startsWith('http') 
                  ? document.fileUrl 
                  : `/api${document.fileUrl.startsWith('/') ? '' : '/'}${document.fileUrl}`}
                title={document.title}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
              />
            </Box>
          </Grid>
          
          {/* Chatbot (occupa 1/3 su desktop, pieno su mobile) */}
          <Grid item xs={12} md={4}>
            <Box sx={{ height: { xs: 'calc(100vh - 300px)', md: 'calc(100vh - 200px)' } }}>
              <Chatbot documentId={document.id} />
            </Box>
          </Grid>
        </Grid>
      ) : (
        <Box sx={{ p: 4, textAlign: 'center', my: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Documento non trovato
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2, bgcolor: '#1B2A4A' }}
            onClick={handleBackToResults}
          >
            Torna ai risultati
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default ViewerPage; 
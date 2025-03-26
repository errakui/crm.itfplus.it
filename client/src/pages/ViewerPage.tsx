import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Grid, Container, Typography, CircularProgress, Button } from '@mui/material';
import axios from 'axios';
import PDFViewer from '../components/PDFViewer';
import Chatbot from '../components/Chatbot';
import AuthContext from '../contexts/AuthContext';
import { ArrowBack } from '@mui/icons-material';
import api, { apiService } from '../services/api';

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
}

const ViewerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useContext(AuthContext);
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('ID documento non valido');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Carica dettagli documento
        const response = await apiService.getDocument(id);
        setDocument(response.data);
        
        // Carica preferiti dell'utente
        const favoritesResponse = await apiService.getFavorites();
        const favoriteIds = favoritesResponse.data.map((fav: any) => fav.documentId);
        setIsFavorite(favoriteIds.includes(id));
        
        setLoading(false);
      } catch (error) {
        console.error('Errore nel recupero documento:', error);
        setError('Errore nel caricamento del documento');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      if (!document) return;
      
      if (isFavorite) {
        // Rimuovi dai preferiti
        await apiService.removeFavorite(document.id);
      } else {
        // Aggiungi ai preferiti
        await apiService.addFavorite(document.id);
      }
      
      setIsFavorite(!isFavorite);
      // Aggiorna il conteggio dei preferiti sulla UI
      if (document) {
        setDocument({
          ...document,
          favoriteCount: isFavorite 
            ? (document.favoriteCount || 1) - 1 
            : (document.favoriteCount || 0) + 1
        });
      }
    } catch (error) {
      console.error('Errore nella gestione del preferito:', error);
    }
  };

  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Indietro
        </Button>
        
        <Typography 
          variant="h4" 
          sx={{ 
            fontFamily: 'Cormorant Garamond, serif',
            color: '#1B2A4A'
          }}
        >
          {loading ? 'Caricamento documento...' : document?.title || 'Documento'}
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 4, textAlign: 'center', my: 8 }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2, bgcolor: '#1B2A4A' }}
            onClick={() => navigate('/')}
          >
            Torna alla home
          </Button>
        </Box>
      ) : document ? (
        <Grid container spacing={4}>
          {/* PDF Viewer (occupa 2/3 su desktop, pieno su mobile) */}
          <Grid item xs={12} md={8}>
            <Box sx={{ height: { xs: 'calc(100vh - 300px)', md: 'calc(100vh - 200px)' } }}>
              <PDFViewer
                documentId={document.id}
                title={document.title}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
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
            onClick={() => navigate('/')}
          >
            Torna alla home
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default ViewerPage; 
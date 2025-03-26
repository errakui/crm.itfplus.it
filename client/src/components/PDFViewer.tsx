import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  IconButton, 
  Typography, 
  Tooltip,
  CircularProgress,
  Button
} from '@mui/material';
import {
  Save as SaveIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface PDFViewerProps {
  documentId: string;
  title: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  autoDownload?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  documentId, 
  title,
  isFavorite = false,
  onToggleFavorite,
  autoDownload = false
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { token, isAuthenticated } = React.useContext(AuthContext);

  const loadPdf = async () => {
    if (!documentId) return;

    try {
      setLoading(true);
      setError(null);
      
      // Incrementa il contatore di visualizzazioni
      const docResponse = await apiService.getDocument(documentId);
      if (!docResponse.data || !docResponse.data.fileUrl) {
        throw new Error('URL del documento non trovato');
      }
      
      // Carica il PDF direttamente da Cloudinary
      setPdfUrl(docResponse.data.fileUrl);
      
    } catch (err: any) {
      console.error('Errore durante il caricamento del PDF:', err);
      setError(`Impossibile caricare il documento. ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    loadPdf();
    
    return () => {
      isMounted = false;
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [documentId]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    loadPdf();
  };

  const handleDownload = async () => {
    if (!documentId) return;
    
    try {
      setLoading(true);
      const response = await apiService.downloadDocument(documentId);
      
      // Crea un blob dal buffer ricevuto
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title || 'document'}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error: any) {
      console.error('Errore durante il download:', error);
      setError(`Impossibile scaricare il documento. ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" gutterBottom>{error}</Typography>
          <Button variant="outlined" onClick={handleRetry} sx={{ mt: 2 }}>
            Riprova
          </Button>
        </Box>
      );
    }
    
    if (pdfUrl) {
      return (
        <iframe
          src={pdfUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="PDF Viewer"
          onError={() => setError('Errore nel caricamento del PDF')}
        />
      );
    }
    
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Nessun documento caricato</Typography>
      </Box>
    );
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px'
      }}
    >
      {/* Header con titolo e controlli */}
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
        <Typography 
          variant="h6" 
          noWrap 
          sx={{ 
            maxWidth: { xs: '200px', sm: '300px', md: '500px' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: 'Cormorant Garamond, serif'
          }}
        >
          {title || 'Documento PDF'}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isAuthenticated() && onToggleFavorite && (
            <Tooltip title={isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}>
              <IconButton 
                size="small" 
                onClick={onToggleFavorite}
                sx={{ color: 'white' }}
              >
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="Scarica PDF">
            <IconButton 
              size="small" 
              onClick={handleDownload}
              sx={{ color: 'white' }}
            >
              <SaveIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Visualizzatore del documento */}
      <Box 
        sx={{ 
          flex: 1, 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#F5F5F5',
          position: 'relative'
        }}
      >
        {renderContent()}
      </Box>
    </Paper>
  );
};

export default PDFViewer; 
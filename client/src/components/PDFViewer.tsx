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
import api, { apiService } from '../services/api';

interface PDFViewerProps {
  documentId: string;
  documentUrl: string;
  title: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  documentId, 
  documentUrl, 
  title,
  isFavorite = false,
  onToggleFavorite 
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { token, isAuthenticated } = React.useContext(AuthContext);

  useEffect(() => {
    // Debug: stampa l'URL del documento
    console.log("URL del documento:", documentUrl);
    
    // Incrementa il contatore di visualizzazioni quando il documento viene caricato
    const incrementViewCount = async () => {
      if (documentId && isAuthenticated()) {
        try {
          // Questa chiamata aggiorna il contatore di visualizzazioni nel backend
          await axios.get(`http://localhost:8000/api/documents/${documentId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } catch (err) {
          console.error('Errore nell\'incrementare il contatore di visualizzazioni:', err);
        }
      }
    };

    incrementViewCount();
    
    // Carica il PDF utilizzando l'API di download
    const loadPdf = async () => {
      if (documentId && isAuthenticated()) {
        try {
          setLoading(true);
          setError(null);
          
          console.log("Caricamento PDF per visualizzazione, ID:", documentId);
          
          // Usa fetch con responseType blob per scaricare direttamente il file
          const response = await fetch(
            `http://localhost:8000/api/documents/${documentId}/download`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          if (!response.ok) {
            throw new Error(`Errore durante il caricamento: ${response.status} ${response.statusText}`);
          }
          
          // Verifica se la risposta è JSON o un file binario
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            // Se è JSON, il server ha restituito un URL invece del file
            const data = await response.json();
            console.log("Server ha restituito un URL:", data.fileUrl);
            
            if (data.fileUrl) {
              // Usa direttamente l'URL per il visualizzatore
              const fullUrl = `http://localhost:8000${data.fileUrl}`;
              console.log("URL completo per la visualizzazione:", fullUrl);
              setPdfUrl(fullUrl);
              setLoading(false);
            }
          } else {
            // Altrimenti procedi con il blob direttamente dalla risposta
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            setPdfUrl(objectUrl);
            setLoading(false);
          }
        } catch (err: any) {
          console.error('Errore durante il caricamento del PDF:', err);
          setError(`Impossibile caricare il documento. Errore: ${err.message}`);
          setLoading(false);
        }
      }
    };
    
    loadPdf();
    
    // Cleanup
    return () => {
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [documentId, token, isAuthenticated, documentUrl, pdfUrl]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Force reload
    window.location.reload();
  };

  const fetchDocumentAndDownload = async () => {
    if (!documentId) return;
    setLoading(true);
    try {
      // Ottieni i dettagli del documento
      const response = await apiService.getDocument(documentId);
      setPdfUrl(response.data.fileUrl);
      
      // Scarica il file PDF
      const downloadResponse = await apiService.downloadDocument(documentId);
      
      // Crea un URL per il blob e aprilo in un iframe
      const blob = new Blob([downloadResponse.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(blob);
      setPdfUrl(fileURL);
      
      // Puoi anche salvare il file localmente se necessario
      if (autoDownload) {
        const link = document.createElement('a');
        link.href = fileURL;
        link.setAttribute('download', `${response.data.title || 'document'}.pdf`);
        document.body.appendChild(link);
        link.click();
      }
    } catch (error) {
      console.error('Errore nel caricamento del documento:', error);
      setError('Impossibile caricare il documento. Verifica che il file esista e che tu abbia i permessi per visualizzarlo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!documentId) return;
    
    try {
      setLoading(true);
      const response = await apiService.downloadDocument(documentId);
      
      // Crea un URL per il blob e usa un link per il download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title || 'document'}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setLoading(false);
    } catch (error) {
      console.error('Errore durante il download:', error);
      setError('Impossibile scaricare il documento');
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
          <Typography color="error">{error}</Typography>
          <Button variant="outlined" onClick={fetchDocumentAndDownload} sx={{ mt: 2 }}>
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
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
          await axios.get(`/api/documents/${documentId}`, {
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
            `/api/documents/${documentId}/download`,
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
const fullUrl = data.fileUrl;
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
  }, [documentId, token, isAuthenticated, documentUrl]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Force reload
    window.location.reload();
  };

  const handleDownload = async () => {
    if (documentId && isAuthenticated()) {
      try {
        console.log("Avvio download per documento:", documentId);
        
        // Usa fetch con responseType blob per scaricare direttamente il file
        const response = await fetch(
          `/api/documents/${documentId}/download`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Errore durante il download: ${response.status} ${response.statusText}`);
        }
        
        // Verifica se la risposta è JSON o un file binario
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          // Se è JSON, il server ha restituito un URL invece del file
          const data = await response.json();
          console.log("Server ha restituito un URL:", data.fileUrl);
          
          if (data.fileUrl) {
            // Crea un link per il download usando l'URL fornito
            const fullUrl = data.fileUrl;
            console.log("URL completo per il download:", fullUrl);
            
            const link = document.createElement('a');
            link.href = fullUrl;
            link.download = `${title || 'documento'}.pdf`;
            link.target = "_blank"; // Apre in una nuova finestra/tab
            console.log("Download link creato:", link.download);
            
            // Clicca sul link per avviare il download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
          }
        }
        
        // Altrimenti procedi con il download del blob
        const blob = await response.blob();
        
        // Crea un URL per il blob
        const url = window.URL.createObjectURL(blob);
        
        // Crea un link per il download
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title || 'documento'}.pdf`;
        console.log("Download link creato:", link.download);
        
        // Clicca sul link per avviare il download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Libera la memoria
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Errore durante il download:', err);
      }
    }
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
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1">Caricamento documento...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            p: 3,
            textAlign: 'center'
          }}>
            <Typography variant="h6" color="error" sx={{ mb: 2 }}>
              Errore di caricamento
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
              sx={{ backgroundColor: '#1B2A4A' }}
            >
              Riprova
            </Button>
          </Box>
        ) : pdfUrl ? (
          <iframe 
            src={`${pdfUrl}#toolbar=1&navpanes=0&view=FitH`}
            title={title || "PDF Viewer"}
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
          />
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            p: 3
          }}>
            <Typography variant="body1">Nessun documento disponibile</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default PDFViewer; 
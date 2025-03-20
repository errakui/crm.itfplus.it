import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  Box, 
  Paper, 
  IconButton, 
  Typography, 
  Tooltip, 
  Skeleton,
  CircularProgress,
  Stack,
  Button
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  NavigateNext,
  NavigateBefore,
  Save as SaveIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';

// Configurazione necessaria per react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token, isAuthenticated } = React.useContext(AuthContext);

  // Add a key to force Document component to reload when needed
  const [reloadKey, setReloadKey] = useState<number>(Date.now());

  useEffect(() => {
    // Debug: stampa l'URL del documento
    console.log("URL del documento:", documentUrl);
    
    // Verifica se l'URL è accessibile con una richiesta HEAD
    const checkUrlAccessibility = async () => {
      try {
        console.log("Verifica URL:", documentUrl);
        const response = await fetch(documentUrl, { method: 'HEAD' });
        console.log("Controllo accesso URL:", documentUrl, "Status:", response.status, response.statusText);
        if (!response.ok) {
          console.error(`Il documento non è accessibile (${response.status}: ${response.statusText}). URL: ${documentUrl}`);
          setError(`Il documento non è accessibile (${response.status}: ${response.statusText}). Verificare che il server sia configurato correttamente.`);
        }
      } catch (err: any) {
        console.error("Errore nel controllo dell'URL del documento:", err, "URL:", documentUrl);
        setError(`Errore nel controllo dell'URL: ${err.message}`);
      }
    };
    
    checkUrlAccessibility();
    
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
  }, [documentId, token, isAuthenticated, documentUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log("PDF caricato con successo, pagine:", numPages);
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Errore nel caricamento del PDF:', error, "URL:", documentUrl);
    setError(`Impossibile caricare il documento. Errore: ${error.message}. Verificare l'URL: ${documentUrl}`);
    setLoading(false);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Force reload using a timestamp to avoid caching issues
    setReloadKey(Date.now());
  };

  const handleDownload = async () => {
    if (documentId && isAuthenticated()) {
      try {
        console.log("Avvio download per documento:", documentId);
        
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
            const fullUrl = `http://localhost:8000${data.fileUrl}`;
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
      
      {/* Controlli di navigazione */}
      <Box 
        sx={{ 
          p: 1, 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F5F5F0',
          gap: 2
        }}
      >
        <Box>
          <Tooltip title="Zoom out">
            <IconButton 
              size="small" 
              onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
              disabled={scale <= 0.5}
            >
              <ZoomOut />
            </IconButton>
          </Tooltip>
          
          <Typography variant="body2" component="span" sx={{ mx: 1 }}>
            {Math.round(scale * 100)}%
          </Typography>
          
          <Tooltip title="Zoom in">
            <IconButton 
              size="small" 
              onClick={() => setScale((prev) => Math.min(2.5, prev + 0.1))}
              disabled={scale >= 2.5}
            >
              <ZoomIn />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box>
          <Tooltip title="Pagina precedente">
            <span>
              <IconButton 
                size="small" 
                onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                disabled={pageNumber <= 1}
              >
                <NavigateBefore />
              </IconButton>
            </span>
          </Tooltip>
          
          <Typography variant="body2" component="span" sx={{ mx: 1 }}>
            {pageNumber} / {numPages || '?'}
          </Typography>
          
          <Tooltip title="Pagina successiva">
            <span>
              <IconButton 
                size="small" 
                onClick={() => setPageNumber((prev) => Math.min(numPages || prev, prev + 1))}
                disabled={numPages === null || pageNumber >= numPages}
              >
                <NavigateNext />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Area visualizzazione PDF */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto',
          p: 2,
          backgroundColor: '#F5F5F0',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        {loading ? (
          <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
            <CircularProgress />
            <Typography variant="body2">Caricamento documento...</Typography>
          </Stack>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error" gutterBottom>{error}</Typography>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />} 
              onClick={handleRetry}
              sx={{ mt: 2 }}
            >
              Riprova
            </Button>
          </Box>
        ) : (
          <Document
            key={reloadKey}
            file={documentUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={800} 
                animation="wave" 
              />
            }
            options={{
              cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
              cMapPacked: true,
              standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/standard_fonts/'
            }}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              loading={
                <Skeleton 
                  variant="rectangular" 
                  width="100%" 
                  height={800} 
                  animation="wave" 
                />
              }
            />
          </Document>
        )}
      </Box>
    </Paper>
  );
};

export default PDFViewer; 
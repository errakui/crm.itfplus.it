import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Tooltip,
  Divider,
  Paper,
} from '@mui/material';
import {
  Description as PdfIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';

interface DocumentCardProps {
  document: {
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
  cities?: string[];
  content?: string;
  };
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onViewDocument?: (id: string) => void;
}

// Funzione per evidenziare le parole cercate 
const highlightSearchTerms = (text: string, searchQuery?: string): string => {
  if (!text) return '';
  
  // Prima di tutto, sostituiamo il formato **parola** con l'evidenziazione verde
  // Questa espressione regolare cattura anche quando ci sono più asterischi
  let highlightedText = text.replace(/\*\*([^*]+)\*\*/g, '<mark class="green-highlight">$1</mark>');
  
  // Se non c'è una query di ricerca, restituisci il testo con le evidenziazioni già presenti
  if (!searchQuery || searchQuery.trim() === '') return highlightedText;
  
  // Estrai i termini di ricerca e filtra quelli troppo brevi
  const searchTerms = searchQuery
    .toLowerCase()
    .split(/\s+/)
    .filter(term => term.length > 2);
  
  if (searchTerms.length === 0) return highlightedText;
  
  // Cerca ulteriori occorrenze di parole non ancora evidenziate
  searchTerms.forEach(term => {
    // Crea un'espressione regolare sicura per il termine di ricerca
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Espressione regolare per trovare il termine (case insensitive) ma non all'interno di tag HTML
    const regex = new RegExp(`(?<![<>\\w])(${escapedTerm})(?![<>\\w])`, 'gi');
    
    // Non sostituire parole che sono già all'interno di un tag mark
    const parts = highlightedText.split(/<\/?mark[^>]*>/);
    let newText = '';
    let isInsideTag = false;
    
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) { // Fuori dal tag mark
        newText += parts[i].replace(regex, '<mark class="green-highlight">$1</mark>');
      } else { // Dentro il tag mark
        newText += `<mark class="green-highlight">${parts[i]}</mark>`;
      }
    }
    
    highlightedText = newText || highlightedText;
  });
  
  return highlightedText;
};

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  isFavorite = false,
  onToggleFavorite,
  onViewDocument,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useContext(AuthContext);
  const location = useLocation();
  
  // Estrai il termine di ricerca dall'URL se presente
  const searchQuery = new URLSearchParams(location.search).get('searchTerm') || '';
  
  const handleView = () => {
    if (isAuthenticated()) {
      // Se c'è una funzione onViewDocument dal parent, usala (ha lo stato corretto)
      if (onViewDocument) {
        onViewDocument(document.id);
      } else {
        // Fallback: comportamento originale
        const searchState = (location.state as any)?.searchState || {
          searchTerm: searchQuery,
          cities: [],
          page: 1,
          activeTab: 0
        };
        
        navigate(`/viewer/${document.id}`, { 
          state: { 
            returnTo: location.pathname + location.search, 
            searchState: searchState 
          } 
        });
      }
    } else {
      navigate('/login', { state: { from: `/viewer/${document.id}` } });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownload = async () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/' } });
      return;
    }

    try {
      // Incrementa il contatore di download
      await axios.post(
        `/api/documents/${document.id}/download`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Avvia il download
      const link = window.document.createElement('a');
      link.href = document.fileUrl;
      link.download = `${document.title || 'documento'}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (err) {
      console.error('Errore durante il download:', err);
    }
  };

  return (
    <Card 
      className="modern-card document-card-gradient elegant-shadow"
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'row',
        transition: 'all 0.4s cubic-bezier(0.33, 1, 0.68, 1)',
        animation: 'fadeIn 0.5s cubic-bezier(0.33, 1, 0.68, 1)',
        borderRadius: 'var(--border-radius-lg) !important',
        position: 'relative',
        overflow: 'visible',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, var(--accent-color), var(--secondary-color))',
          borderRadius: 'var(--border-radius-lg) var(--border-radius-lg) 0 0'
        }
      }}
      elevation={0}
    >
      <Box 
        sx={{ 
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          width: '40%',
          borderRight: '1px solid var(--border-light)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--border-radius-md)',
              background: 'linear-gradient(135deg, var(--primary-lighter), var(--secondary-color))',
              color: 'white',
              flexShrink: 0
            }}
          >
            <PdfIcon />
          </Box>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h6" 
              component="div" 
              className="enhanced-title"
              sx={{ 
                fontFamily: 'Syne, sans-serif',
                fontWeight: 600,
                fontSize: '1.1rem',
                lineHeight: 1.3,
                mb: 0.5,
                wordBreak: 'break-word',
                display: '-webkit-box',
                overflow: 'hidden',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
              }}
            >
              {document.title}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography
                variant="caption"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--text-secondary)',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontSize: '0.75rem'
                }}
              >
                <Box component="span" sx={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', bgcolor: 'var(--success-color)', mr: 0.5 }} />
                {formatDate(document.uploadDate)}
              </Typography>
              
              <Typography
                variant="caption"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--text-secondary)',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontSize: '0.75rem'
                }}
              >
                <Box component="span" sx={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', bgcolor: 'var(--info-color)', mr: 0.5 }} />
                {formatFileSize(document.fileSize)}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {document.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              height: '3em',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              lineHeight: 1.5,
              fontSize: '0.85rem'
            }}
          >
            {document.description}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 'auto' }}>
          {document.cities && document.cities.length > 0 && (
            document.cities.slice(0, 2).map((city, index) => (
              <Chip 
                key={`city-${index}`} 
                label={city} 
                size="small" 
                icon={<LocationIcon sx={{ fontSize: '0.8rem !important' }} />}
                sx={{ 
                  borderRadius: '20px',
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  color: 'var(--primary-color)',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  height: '24px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(56, 189, 248, 0.2)',
                    transform: 'translateY(-2px)'
                  }
                }}
              />
            ))
          )}
          
          {document.cities && document.cities.length > 2 && (
            <Chip 
              label={`+${document.cities.length - 2}`} 
              size="small" 
              sx={{ 
                borderRadius: '20px',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                color: 'var(--primary-color)',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 500,
                fontSize: '0.7rem',
                height: '24px'
              }}
            />
          )}
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 'auto'
          }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ViewIcon 
                sx={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--text-tertiary)' 
                }} 
              />
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  color: 'var(--text-tertiary)'
                }}
              >
                {document.viewCount}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DownloadIcon 
                sx={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--text-tertiary)' 
                }} 
              />
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  color: 'var(--text-tertiary)'
                }}
              >
                {document.downloadCount}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FavoriteIcon 
                sx={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--text-tertiary)' 
                }} 
              />
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  color: 'var(--text-tertiary)'
                }}
              >
                {document.favoriteCount}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      
      <Box 
        sx={{ 
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          width: '60%',
          justifyContent: 'space-between'
        }}
      >
        {document.content ? (
          <Box
            className="text-snippet-container enhanced-text"
            sx={{
              p: 1.5,
              mb: 2,
              borderRadius: 'var(--border-radius-md)',
              fontSize: '0.9rem',
              lineHeight: '1.6',
              position: 'relative',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              color: 'var(--text-primary)',
              fontStyle: 'italic',
              overflow: 'auto',
              maxHeight: '200px',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '3px',
                background: 'linear-gradient(180deg, var(--accent-color), var(--secondary-color))',
                borderRadius: '3px',
              }
            }}
            dangerouslySetInnerHTML={{ __html: highlightSearchTerms(document.content.substring(0, 500), searchQuery) }}
          />
        ) : (
          <Box
            sx={{
              p: 1.5,
              mb: 2,
              bgcolor: 'rgba(200, 200, 200, 0.08)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '0.9rem',
              lineHeight: '1.6',
              position: 'relative',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '3px',
                background: 'rgba(200, 200, 200, 0.5)',
                borderRadius: '3px',
              }
            }}
          >
            Nessun frammento di testo disponibile
          </Box>
        )}
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
          {document.keywords && document.keywords.length > 0 && (
            document.keywords.slice(0, 5).map((keyword, index) => (
              <Chip 
                key={index} 
                label={keyword} 
                size="small" 
                className="enhanced-chip"
                sx={{ 
                  borderRadius: '20px',
                  backgroundColor: 'rgba(195, 143, 255, 0.1)',
                  color: 'var(--primary-color)',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  height: '24px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(195, 143, 255, 0.2)',
                    transform: 'translateY(-2px)'
                  }
                }}
              />
            ))
          )}
          
          {document.keywords && document.keywords.length > 5 && (
            <Chip 
              label={`+${document.keywords.length - 5}`} 
              size="small" 
              sx={{ 
                borderRadius: '20px',
                backgroundColor: 'rgba(195, 143, 255, 0.2)',
                color: 'var(--primary-color)',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 500,
                fontSize: '0.7rem',
                height: '24px'
              }}
            />
          )}
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
            mt: 'auto'
          }}
        >
          {isAuthenticated() && onToggleFavorite && (
            <IconButton 
              size="small" 
              onClick={onToggleFavorite} 
              color={isFavorite ? "error" : "default"}
              sx={{ 
                width: 32,
                height: 32,
                background: isFavorite ? 'rgba(244, 63, 94, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '&:hover': { 
                  transform: 'scale(1.1)',
                  background: isFavorite ? 'rgba(244, 63, 94, 0.15)' : 'rgba(0, 0, 0, 0.08)' 
                },
              }}
            >
              {isFavorite ? 
                <FavoriteIcon sx={{ fontSize: '1rem', color: 'var(--error-color)' }} /> : 
                <FavoriteBorderIcon sx={{ fontSize: '1rem' }} />
              }
            </IconButton>
          )}
          
          <IconButton 
            size="small" 
            onClick={handleDownload}
            sx={{ 
              width: 32,
              height: 32,
              background: 'rgba(0, 0, 0, 0.04)',
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              '&:hover': { 
                transform: 'scale(1.1)',
                background: 'rgba(0, 0, 0, 0.08)' 
              },
            }}
          >
            <DownloadIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
          
          <Button 
            variant="contained" 
            size="small" 
            className="refined-button"
            startIcon={<ViewIcon sx={{ fontSize: '1rem' }} />}
            onClick={handleView}
            sx={{ 
              background: 'linear-gradient(135deg, var(--primary-color), var(--primary-light))',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '0.8rem',
              padding: '4px 10px',
              minWidth: 'auto',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              '&:hover': { 
                background: 'linear-gradient(135deg, var(--primary-lighter), var(--secondary-color))',
                transform: 'translateY(-2px)',
                boxShadow: 'var(--shadow-md)'
              }
            }}
          >
            Apri
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

export default DocumentCard; 
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { apiService } from '../services/api';

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
    textSnippet?: string;
    isPublic?: boolean;
    contentSnippet?: string;
  };
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useContext(AuthContext);
  const [loading, setLoading] = useState<boolean>(false);
  
  const handleView = () => {
    if (isAuthenticated() || document.isPublic) {
      navigate(`/viewer/${document.id}`);
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
    if (!isAuthenticated() && !document.isPublic) {
      navigate('/login', { state: { from: '/' } });
      return;
    }

    try {
      setLoading(true);
      
      // Usa apiService per scaricare il documento
      const response = await apiService.downloadDocument(document.id);
      
      // Crea un URL blob per il download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Crea un elemento di link per il download
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${document.title}.pdf`);
      window.document.body.appendChild(link);
      link.click();
      
      // Pulisci
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setLoading(false);
    } catch (error) {
      console.error('Errore nel download del documento:', error);
      setLoading(false);
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        },
        borderRadius: '8px',
        overflow: 'hidden',
      }}
      elevation={2}
    >
      <Box 
        sx={{ 
          bgcolor: '#1B2A4A', 
          color: 'white', 
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <PdfIcon />
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: 'Cormorant Garamond, serif'
          }}
        >
          {document.title}
        </Typography>
      </Box>
      
      <CardContent sx={{ flexGrow: 1, pt: 2 }}>
        {document.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              height: '4.5em'
            }}
          >
            {document.description}
          </Typography>
        )}
        
        {document.contentSnippet && (
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              mb: 2,
              bgcolor: '#FFFDE7',
              borderLeft: '3px solid #FFC107',
              borderRadius: '0 4px 4px 0',
              fontSize: '0.85rem',
              lineHeight: '1.4',
              maxHeight: '5.6em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {document.contentSnippet}
          </Paper>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Caricato il: {formatDate(document.uploadDate)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatFileSize(document.fileSize)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
          <Chip 
            size="small" 
            icon={<ViewIcon sx={{ fontSize: '0.8rem !important' }} />} 
            label={`${document.viewCount} visualizzazioni`} 
            variant="outlined"
          />
          <Chip 
            size="small" 
            icon={<DownloadIcon sx={{ fontSize: '0.8rem !important' }} />} 
            label={`${document.downloadCount} download`} 
            variant="outlined"
          />
          <Chip 
            size="small" 
            icon={<FavoriteIcon sx={{ fontSize: '0.8rem !important' }} />} 
            label={`${document.favoriteCount} preferiti`} 
            variant="outlined"
          />
        </Box>
        
        {document.keywords && document.keywords.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Parole chiave:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {document.keywords.slice(0, 5).map((keyword, index) => (
                <Chip 
                  key={index} 
                  label={keyword} 
                  size="small" 
                  sx={{ 
                    bgcolor: '#F5F5F0',
                    fontSize: '0.7rem'
                  }}
                />
              ))}
              {document.keywords.length > 5 && (
                <Chip 
                  label={`+${document.keywords.length - 5}`} 
                  size="small" 
                  sx={{ 
                    bgcolor: '#E5E5E5',
                    fontSize: '0.7rem'
                  }}
                />
              )}
            </Box>
          </Box>
        )}
        
        {document.cities && document.cities.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Città menzionate:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {document.cities.slice(0, 3).map((city, index) => (
                <Chip 
                  key={index} 
                  label={city} 
                  size="small" 
                  icon={<LocationIcon sx={{ fontSize: '0.8rem !important' }} />}
                  sx={{ 
                    bgcolor: '#E8F4FD',
                    fontSize: '0.7rem',
                    color: '#0277bd'
                  }}
                />
              ))}
              {document.cities.length > 3 && (
                <Chip 
                  label={`+${document.cities.length - 3}`} 
                  size="small" 
                  sx={{ 
                    bgcolor: '#E8F4FD',
                    fontSize: '0.7rem',
                    color: '#0277bd'
                  }}
                />
              )}
            </Box>
          </Box>
        )}
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ p: 1.5, pt: 1 }}>
        <Button 
          variant="contained" 
          size="small" 
          startIcon={<ViewIcon />}
          onClick={handleView}
          sx={{ 
            bgcolor: '#1B2A4A', 
            '&:hover': { bgcolor: '#2c4270' },
            flexGrow: 1
          }}
        >
          Visualizza
        </Button>
        
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {isAuthenticated() && onToggleFavorite && (
            <Tooltip title={isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}>
              <IconButton size="small" onClick={onToggleFavorite} color={isFavorite ? "error" : "default"}>
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="Scarica PDF">
            <IconButton size="small" onClick={handleDownload}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>
    </Card>
  );
};

export default DocumentCard; 
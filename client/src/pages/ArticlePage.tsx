import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { articles } from './BlogPage';

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Trova l'articolo
  const article = articles.find((a) => a.slug === slug);

  // Se l'articolo non esiste, redirect al blog
  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Back button */}
      <Button
        component={Link}
        to="/blog"
        startIcon={<BackIcon />}
        sx={{
          mb: 4,
          color: 'var(--text-secondary)',
          '&:hover': {
            color: 'var(--primary-color)',
            backgroundColor: 'rgba(27, 42, 74, 0.04)',
          },
        }}
      >
        Torna al Blog
      </Button>

      {/* Header articolo */}
      <Box sx={{ mb: 4 }}>
        <Chip
          label={article.category}
          size="small"
          sx={{
            mb: 2,
            backgroundColor: 'rgba(27, 42, 74, 0.08)',
            color: 'var(--primary-color)',
            fontWeight: 600,
            fontSize: '0.75rem',
            borderRadius: '4px',
          }}
        />

        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontFamily: '"Libre Baskerville", Georgia, serif',
            fontWeight: 700,
            color: 'var(--text-primary)',
            mb: 3,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
            lineHeight: 1.3,
          }}
        >
          {article.title}
        </Typography>

        {/* Meta info */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 2, sm: 3 },
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PersonIcon sx={{ fontSize: 18 }} />
            <span>{article.author}</span>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarIcon sx={{ fontSize: 18 }} />
            <span>{formatDate(article.date)}</span>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TimeIcon sx={{ fontSize: 18 }} />
            <span>{article.readTime} di lettura</span>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Contenuto articolo */}
      <Box
        sx={{
          '& h2': {
            fontFamily: '"Libre Baskerville", Georgia, serif',
            fontWeight: 700,
            color: 'var(--primary-color)',
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            mt: 4,
            mb: 2,
          },
          '& h3': {
            fontFamily: '"Libre Baskerville", Georgia, serif',
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontSize: { xs: '1.1rem', md: '1.25rem' },
            mt: 3,
            mb: 1.5,
          },
          '& p': {
            fontFamily: '"Source Sans Pro", sans-serif',
            color: 'var(--text-primary)',
            lineHeight: 1.8,
            mb: 2,
            fontSize: { xs: '0.95rem', md: '1.05rem' },
          },
          '& ul, & ol': {
            fontFamily: '"Source Sans Pro", sans-serif',
            color: 'var(--text-primary)',
            lineHeight: 1.8,
            mb: 2,
            pl: 3,
            '& li': {
              mb: 1,
            },
          },
          '& strong': {
            fontWeight: 600,
            color: 'var(--text-primary)',
          },
          '& a': {
            color: 'var(--primary-color)',
            textDecoration: 'underline',
            '&:hover': {
              color: 'var(--primary-light)',
            },
          },
          '& hr': {
            border: 'none',
            borderTop: '1px solid var(--border-light)',
            my: 4,
          },
          '& em': {
            fontStyle: 'italic',
            color: 'var(--text-secondary)',
          },
          '& blockquote': {
            borderLeft: '3px solid var(--secondary-color)',
            pl: 3,
            py: 1,
            my: 3,
            backgroundColor: 'rgba(166, 124, 82, 0.05)',
            borderRadius: '0 4px 4px 0',
            '& p': {
              mb: 0,
              fontStyle: 'italic',
            },
          },
        }}
      >
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Footer */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Button
          component={Link}
          to="/blog"
          startIcon={<BackIcon />}
          variant="outlined"
          sx={{
            borderColor: 'var(--border-light)',
            color: 'var(--text-secondary)',
            '&:hover': {
              borderColor: 'var(--primary-color)',
              color: 'var(--primary-color)',
              backgroundColor: 'rgba(27, 42, 74, 0.04)',
            },
          }}
        >
          Altri articoli
        </Button>

        <Typography variant="body2" sx={{ color: 'var(--text-tertiary)' }}>
          © {new Date().getFullYear()} ITFPLUS
        </Typography>
      </Box>
    </Container>
  );
};

export default ArticlePage;


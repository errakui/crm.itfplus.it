import React from 'react';
import { Box, Container, Typography, Grid, IconButton, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Link as MuiLink } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';

const Footer: React.FC = () => {
  // Link a WhatsApp
  const openWhatsApp = () => {
    window.open('https://wa.me/+393336170230', '_blank');
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '12px',
    fontFamily: 'Inter, sans-serif',
    '&:hover': {
      textDecoration: 'underline'
    }
  };

  return (
    <Box
      sx={{
        bgcolor: '#1B2A4A',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <img 
                src="/itfpluslogo.png" 
                alt="ITFPLUS" 
                style={{ 
                  height: '45px',
                  filter: 'brightness(0) invert(1)' // Rende il logo bianco
                }} 
              />
            </Box>
            <Typography variant="body2" sx={{ mb: 2, fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
              La nostra piattaforma di documentazione giuridica offre un accesso facile e sicuro 
              a una vasta collezione di sentenze.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton sx={{ color: 'white', '&:hover': { transform: 'translateY(-3px)', color: '#64B5F6' } }}>
                <Facebook />
              </IconButton>
              <IconButton sx={{ color: 'white', '&:hover': { transform: 'translateY(-3px)', color: '#64B5F6' } }}>
                <Twitter />
              </IconButton>
              <IconButton sx={{ color: 'white', '&:hover': { transform: 'translateY(-3px)', color: '#64B5F6' } }}>
                <Instagram />
              </IconButton>
              <IconButton sx={{ color: 'white', '&:hover': { transform: 'translateY(-3px)', color: '#64B5F6' } }}>
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600 }}>
              Link utili
            </Typography>
            <RouterLink to="/privacy-policy" style={{ color: 'white', textDecoration: 'none', display: 'block', marginBottom: '12px', fontFamily: 'Inter, sans-serif' }}>
              Informativa sulla privacy
            </RouterLink>
            <RouterLink to="/terms" style={{ color: 'white', textDecoration: 'none', display: 'block', marginBottom: '12px', fontFamily: 'Inter, sans-serif' }}>
              Condizioni di abbonamento
            </RouterLink>
            <RouterLink to="/faq" style={{ color: 'white', textDecoration: 'none', display: 'block', marginBottom: '12px', fontFamily: 'Inter, sans-serif' }}>
              Domande frequenti
            </RouterLink>
            <RouterLink to="/contact" style={{ color: 'white', textDecoration: 'none', display: 'block', marginBottom: '12px', fontFamily: 'Inter, sans-serif' }}>
              Contattaci
            </RouterLink>
            <RouterLink to="/support" style={{ color: 'white', textDecoration: 'none', display: 'block', marginBottom: '12px', fontFamily: 'Inter, sans-serif' }}>
              Supporto
            </RouterLink>
            <RouterLink to="/changelog" style={{ color: 'white', textDecoration: 'none', display: 'block', marginBottom: '12px', fontFamily: 'Inter, sans-serif' }}>
              Cronologia delle modifiche
            </RouterLink>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600 }}>
              Contatti
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, fontFamily: 'Inter, sans-serif' }}>
              Via Santa Teresa, 47
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, fontFamily: 'Inter, sans-serif' }}>
              37135 – Verona
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, fontFamily: 'Inter, sans-serif' }}>
              Email: info@itfplus.it
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, fontFamily: 'Inter, sans-serif' }}>
              Tel: +39 333 617 0230
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontFamily: 'Inter, sans-serif' }}>
            © {new Date().getFullYear()} ITF Plus. Tutti i diritti riservati.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.1)', 
                px: 1.5, 
                py: 0.5, 
                borderRadius: '20px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                letterSpacing: 0.5
              }}
            >
              versione: 0.0.8
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 
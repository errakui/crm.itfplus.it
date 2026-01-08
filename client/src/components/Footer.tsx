import React from 'react';
import { Box, Container, Typography, Grid, IconButton, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Facebook, LinkedIn, Email as EmailIcon, Phone as PhoneIcon } from '@mui/icons-material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const linkStyle = {
    color: 'rgba(255, 255, 255, 0.85)',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '10px',
    fontSize: '0.9rem',
    transition: 'color 0.2s ease',
    '&:hover': {
      color: 'white',
      textDecoration: 'underline',
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'var(--primary-color)',
        color: 'white',
        py: { xs: 4, sm: 5, md: 6 },
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {/* Colonna 1: Logo e descrizione */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                component="img"
                src="/itfpluslogo.png" 
                alt="ITFPLUS" 
                sx={{ 
                  height: { xs: 35, sm: 45 },
                  filter: 'brightness(0) invert(1)',
                }} 
              />
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 2, 
                lineHeight: 1.7,
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
              }}
            >
              La piattaforma di documentazione giuridica che offre accesso facile e sicuro 
              a una vasta collezione di sentenze.
            </Typography>
            
            {/* Social Icons */}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton 
                href="https://facebook.com" 
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  '&:hover': { 
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  } 
                }}
              >
                <Facebook />
              </IconButton>
              <IconButton 
                href="https://linkedin.com" 
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  '&:hover': { 
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  } 
                }}
              >
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          {/* Colonna 2: Link utili */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                mb: 2,
              }}
            >
              Link utili
            </Typography>
            <Box component="nav">
              <RouterLink to="/privacy-policy" style={linkStyle as React.CSSProperties}>
                Informativa sulla privacy
              </RouterLink>
              <RouterLink to="/terms" style={linkStyle as React.CSSProperties}>
                Condizioni di abbonamento
              </RouterLink>
              <RouterLink to="/faq" style={linkStyle as React.CSSProperties}>
                Domande frequenti
              </RouterLink>
              <RouterLink to="/contact" style={linkStyle as React.CSSProperties}>
                Contattaci
              </RouterLink>
              <RouterLink to="/support" style={linkStyle as React.CSSProperties}>
                Supporto
              </RouterLink>
              <RouterLink to="/changelog" style={linkStyle as React.CSSProperties}>
                Cronologia modifiche
              </RouterLink>
            </Box>
          </Grid>

          {/* Colonna 3: Contatti */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                mb: 2,
              }}
            >
              Contatti
            </Typography>
            <Box sx={{ color: 'rgba(255, 255, 255, 0.85)' }}>
              <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
                Via Santa Teresa, 47
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
                37135 – Verona
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EmailIcon sx={{ fontSize: 18, color: 'var(--accent-color)' }} />
                <Typography 
                  component="a" 
                  href="mailto:info@itfplus.it"
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.85)',
                    textDecoration: 'none',
                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                    '&:hover': { color: 'white' },
                  }}
                >
                  info@itfplus.it
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon sx={{ fontSize: 18, color: 'var(--accent-color)' }} />
                <Typography 
                  component="a" 
                  href="tel:+393336170230"
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.85)',
                    textDecoration: 'none',
                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                    '&:hover': { color: 'white' },
                  }}
                >
                  +39 333 617 0230
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 3, md: 4 }, borderColor: 'rgba(255, 255, 255, 0.15)' }} />

        {/* Bottom bar */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: { xs: '0.75rem', sm: '0.85rem' },
            }}
          >
            © {currentYear} ITF Plus. Tutti i diritti riservati.
          </Typography>
          
          <Box 
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.1)', 
              px: 2, 
              py: 0.5, 
              borderRadius: '20px',
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 600,
                letterSpacing: 0.5,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
              }}
            >
              versione: 0.0.9
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

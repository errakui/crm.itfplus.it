import React from 'react';
import { Box, Container, Typography, Link, Button, Grid } from '@mui/material';
import { Mail as MailIcon, Chat as ChatIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer: React.FC = () => {
  // Link a WhatsApp
  const openWhatsApp = () => {
    window.open('https://wa.me/+393336170230', '_blank');
  };

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'white',
        borderTop: '1px solid #e0e0e0',
        width: '100%'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Parte sinistra: Logo e copyright */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' } }}>
            <Box
              component="img"
              src="/logoitfplus.png"
              alt="ITFPLUS Logo"
              sx={{
                height: 50,
                mb: 2
              }}
            />
            <Typography variant="body2" color="text.secondary">
              © Copyright 2025, Tutti i diritti riservati | Giuridica.net S.r.l. - P. IVA 04476450236
            </Typography>
          </Grid>
          
          {/* Parte destra: Contatti */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-end' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <MailIcon sx={{ mr: 1, fontSize: 20 }} />
              <Link href="mailto:info@giuridica.net" color="inherit" underline="hover">
                info@giuridica.net
              </Link>
            </Box>
            
            <Button 
              variant="contained" 
              startIcon={<ChatIcon />}
              size="small"
              onClick={openWhatsApp}
              sx={{ 
                mb: 2,
                bgcolor: '#1B2A4A',
                '&:hover': {
                  bgcolor: '#2c4270',
                }
              }}
            >
              Live Chat
            </Button>
            
            <RouterLink to="/privacy-policy" style={{ color: 'inherit', textDecoration: 'none' }}>
              Privacy e Policy
            </RouterLink>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer; 
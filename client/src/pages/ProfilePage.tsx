import React, { useContext } from 'react';
import { Container, Typography, Paper, Box, Avatar, Grid, TextField, Button, Divider } from '@mui/material';
import AuthContext from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useContext(AuthContext);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Il mio profilo
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Gestisci i tuoi dati personali e le preferenze
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: 48,
                  mb: 2,
                  backgroundColor: 'primary.main',
                }}
              >
                {user?.name?.[0] || user?.email?.[0] || 'U'}
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {user?.name || 'Utente'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || ''}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 1,
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: user?.role === 'ADMIN' ? 'error.light' : 'primary.light',
                  color: 'white',
                }}
              >
                {user?.role === 'ADMIN' ? 'Amministratore' : 'Utente standard'}
              </Typography>
            </Box>
            <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
              Modifica avatar
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Informazioni personali
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome completo"
                  variant="outlined"
                  defaultValue={user?.name || ''}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  defaultValue={user?.email || ''}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" sx={{ mt: 2 }}>
                  Modifica informazioni
                </Button>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Sicurezza
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Button variant="outlined" color="primary">
                Cambia password
              </Button>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Preferenze
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Impostazioni delle notifiche e altre preferenze personali verranno aggiunte qui.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage; 
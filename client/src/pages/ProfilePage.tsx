import React, { useContext, useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Paper, Divider, Chip, Alert } from '@mui/material';
import AuthContext from '../contexts/AuthContext';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  expiresAt?: string;
}

const ProfilePage: React.FC = () => {
  const { isAuthenticated, token, userId } = useContext(AuthContext);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Carica i dettagli dell'utente
    const fetchUserDetails = async () => {
      if (!token || !userId) return;

      try {
        // In una vera applicazione, avresti un endpoint dedicato per ottenere i dettagli dell'utente
        // Per ora, useremo semplicemente i dati memorizzati nel localStorage
        const userDataStr = localStorage.getItem('userData');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          setUserDetails({
            id: userData.id,
            name: userData.name || 'Utente',
            email: userData.email,
            role: userData.role,
            createdAt: new Date(userData.createdAt || Date.now()).toLocaleDateString('it-IT'),
            expiresAt: userData.expiresAt ? new Date(userData.expiresAt).toLocaleDateString('it-IT') : undefined
          });
        }
      } catch (err) {
        console.error('Errore nel caricamento dei dettagli utente:', err);
        setError('Impossibile caricare i dettagli dell\'utente');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [token, userId]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom 
        sx={{ fontFamily: 'Cormorant Garamond, serif', color: '#1B2A4A', fontWeight: 600 }}>
        Il Mio Profilo
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Informazioni Personali</Typography>
            <Divider sx={{ mb: 2 }} />
            
            {userDetails && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">Nome</Typography>
                  <Typography variant="body1">{userDetails.name}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{userDetails.email}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">Ruolo</Typography>
                  <Chip 
                    label={userDetails.role === 'ADMIN' ? 'Amministratore' : 'Utente'} 
                    color={userDetails.role === 'ADMIN' ? 'primary' : 'default'} 
                    size="small" 
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">Data Registrazione</Typography>
                  <Typography variant="body1">{userDetails.createdAt}</Typography>
                </Box>
                
                {userDetails.expiresAt && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">Scadenza Account</Typography>
                    <Typography variant="body1">{userDetails.expiresAt}</Typography>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={7}>
          <ChangePasswordForm />
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage; 
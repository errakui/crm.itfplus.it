import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  Container,
  Grid,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import AuthContext from '../contexts/AuthContext';
import TrialPopup from '../components/TrialPopup';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAdmin } = useContext(AuthContext);
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Per favore inserisci sia email che password');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await login(email, password);
      
      // Verifica il ruolo dell'utente per il reindirizzamento
      if (isAdmin()) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Errore durante il login:', err);
      setError('Credenziali non valide. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0d2748 0%, #0a1a2e 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Pattern decorativo */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 2px, transparent 0)',
          backgroundSize: '30px 30px',
          opacity: 0.5,
        }}
      />


      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 5,
            borderRadius: 4,
            background: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          }}
        >
          {/* Logo */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
            <Box
              component="img"
              src="/logoitfplus.png"
              alt="ITFPLUS Logo"
              sx={{
                height: 80,
                mb: 1
              }}
            />
          </Box>

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h5"
              sx={{
                mb: 1,
                color: '#1B2A4A',
                fontWeight: 500,
              }}
            >
              Accedi a ITFPLUS
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Inserisci le tue credenziali per accedere
            </Typography>

            {error && (
              <Typography 
                color="error" 
                sx={{ 
                  mb: 2,
                  p: 1,
                  bgcolor: 'rgba(211, 47, 47, 0.1)',
                  borderRadius: 1
                }}
              >
                {error}
              </Typography>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ 
                  py: 1.5, 
                  borderRadius: 2,
                  background: 'linear-gradient(to right, #1B2A4A, #2c4270)',
                  mb: 2
                }}
              >
                {loading ? 'Accesso in corso...' : 'Accedi'}
              </Button>
              
              <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
                <Grid item>
                  <Link
                    to="#"
                    style={{ 
                      color: '#1B2A4A', 
                      textDecoration: 'none',
                      fontSize: '0.875rem'
                    }}
                  >
                    Password dimenticata?
                  </Link>
                </Grid>
              </Grid>
            </form>
          </Box>
          
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              textAlign: 'center',
              p: 2,
              color: 'text.secondary',
              fontSize: '0.75rem',
            }}
          >
            powered by giuridica.net
          </Box>
        </Paper>
      </Container>

      {/* Popup Trial in basso a destra */}
      <TrialPopup />
    </Box>
  );
};

export default LoginPage; 
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
  useMediaQuery,
  useTheme,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
        minHeight: ['100vh', '-webkit-fill-available'], // Fix per iOS Safari
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
        position: 'relative',
        overflow: 'auto',
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3 },
      }}
    >
      {/* Pattern decorativo - nascosto su mobile per performance */}
      {!isMobile && (
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 2px, transparent 0)',
          backgroundSize: '30px 30px',
          opacity: 0.5,
            pointerEvents: 'none',
        }}
      />
      )}

      <Container 
        maxWidth="sm" 
            sx={{
          display: 'flex', 
          justifyContent: 'center',
          px: { xs: 0, sm: 2 },
            }}
          >
        <Paper
          elevation={isMobile ? 8 : 24}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: '4px',
            background: 'white',
            textAlign: 'center',
            position: 'relative',
            boxShadow: isMobile 
              ? '0 4px 20px rgba(0,0,0,0.15)' 
              : '0 10px 30px rgba(0,0,0,0.2)',
            width: '100%',
            maxWidth: { xs: '100%', sm: '450px' },
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Logo */}
          <Box 
            sx={{ 
              mb: { xs: 2, sm: 3, md: 4 }, 
              display: 'flex', 
              justifyContent: 'center' 
            }}
          >
            <Box
              component="img"
              src="/itfpluslogo.png"
              alt="ITFPLUS Logo"
              sx={{
                height: { xs: 50, sm: 65, md: 80 },
                width: 'auto',
                maxWidth: '100%',
                objectFit: 'contain',
              }}
            />
          </Box>

          <Box sx={{ position: 'relative', zIndex: 1, flex: 1 }}>
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              sx={{
                mb: 1,
                color: 'var(--primary-color)',
                fontWeight: 600,
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
              }}
            >
              Accedi a ITFPLUS
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                mb: { xs: 2, sm: 3 },
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
              }}
            >
              Inserisci le tue credenziali per accedere
            </Typography>

            {error && (
              <Typography 
                color="error" 
                sx={{ 
                  mb: 2,
                  p: { xs: 1, sm: 1.5 },
                  bgcolor: 'rgba(211, 47, 47, 0.1)',
                  borderRadius: 1,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
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
                size={isMobile ? 'small' : 'medium'}
                sx={{ 
                  mb: { xs: 2, sm: 2.5, md: 3 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '4px',
                  },
                }}
                inputProps={{
                  autoComplete: 'email',
                  inputMode: 'email',
                }}
              />
              
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size={isMobile ? 'small' : 'medium'}
                sx={{ 
                  mb: { xs: 2, sm: 2.5, md: 3 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '4px',
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size={isMobile ? 'small' : 'medium'}
                        aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  autoComplete: 'current-password',
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ 
                  py: { xs: 1.2, sm: 1.5 }, 
                  borderRadius: '4px',
                  background: 'linear-gradient(to right, var(--primary-color), var(--primary-light))',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(27, 42, 74, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(to right, var(--primary-light), var(--primary-lighter))',
                    boxShadow: '0 6px 16px rgba(27, 42, 74, 0.4)',
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                  '&:disabled': {
                    background: '#ccc',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? 'Accesso in corso...' : 'Accedi'}
              </Button>
              
              <Box sx={{ mt: { xs: 2, sm: 2.5 }, textAlign: 'right' }}>
                  <Link
                    to="#"
                    style={{ 
                    color: 'var(--primary-color)', 
                      textDecoration: 'none',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    }}
                  >
                    Password dimenticata?
                  </Link>
              </Box>
            </form>
          </Box>
          
          {/* Footer - non più assoluto per evitare sovrapposizioni */}
          <Box
            sx={{
              mt: { xs: 3, sm: 4 },
              pt: { xs: 2, sm: 2.5 },
              borderTop: '1px solid rgba(0,0,0,0.08)',
              textAlign: 'center',
              color: 'text.secondary',
              fontSize: { xs: '0.65rem', sm: '0.75rem' },
            }}
          >
            powered by giuridica.net
          </Box>
        </Paper>
      </Container>

      {/* Popup Trial - nascosto su mobile per non ingombrare */}
      {!isMobile && <TrialPopup />}
    </Box>
  );
};

export default LoginPage; 
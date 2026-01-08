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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import AuthContext from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    // Almeno 8 caratteri, almeno una lettera minuscola, una maiuscola e un numero
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazione
    if (!name || !email || !password || !confirmPassword) {
      setError('Tutti i campi sono obbligatori');
      return;
    }

    if (!validateEmail(email)) {
      setError('Per favore inserisci un indirizzo email valido');
      return;
    }

    if (!validatePassword(password)) {
      setError('La password deve contenere almeno 8 caratteri, una lettera minuscola, una maiuscola e un numero');
      return;
    }

    if (password !== confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }

    if (!acceptTerms) {
      setError('Devi accettare i termini e le condizioni per registrarti');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await register(name, email, password);
      setSuccess(true);
      
      // Reindirizza alla pagina di login dopo un breve ritardo
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Errore durante la registrazione:', err);
      setError(err.response?.data?.message || 'Si è verificato un errore durante la registrazione');
      setSuccess(false);
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

      {/* Elementi decorativi */}
      {[...Array(8)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: ['20px', '30px', '40px'][i % 3],
            height: ['20px', '30px', '40px'][i % 3],
            borderRadius: '50%',
            background: i % 2 ? 'rgba(33, 150, 243, 0.3)' : 'rgba(255, 152, 0, 0.3)',
            filter: 'blur(8px)',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${3 + i % 3}s ease-in-out infinite`,
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-20px)' },
            },
          }}
        />
      ))}

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
              Registrati a ITFPLUS
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Crea un nuovo account per accedere ai servizi
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

            {success && (
              <Typography 
                color="success" 
                sx={{ 
                  mb: 2,
                  p: 1,
                  bgcolor: 'rgba(46, 125, 50, 0.1)',
                  borderRadius: 1
                }}
              >
                Registrazione completata con successo! Sarai reindirizzato alla pagina di login...
              </Typography>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Nome completo"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
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
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
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
                helperText="Min. 8 caratteri, con almeno una lettera maiuscola, una minuscola e un numero"
              />
              
              <TextField
                fullWidth
                label="Conferma Password"
                type={showConfirmPassword ? 'text' : 'password'}
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box sx={{ textAlign: 'left', mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      required
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Accetto i Termini di Servizio e la Privacy Policy*
                    </Typography>
                  }
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || success}
                sx={{ 
                  py: 1.5, 
                  borderRadius: 2,
                  background: 'linear-gradient(to right, #1B2A4A, #2c4270)',
                  mb: 2
                }}
              >
                {loading ? 'Registrazione in corso...' : 'Registrati'}
              </Button>
              
              <Grid container justifyContent="center" sx={{ mt: 2 }}>
                <Grid item>
                  <Link
                    to="/login"
                    style={{ 
                      color: '#1B2A4A', 
                      textDecoration: 'none',
                      fontSize: '0.875rem'
                    }}
                  >
                    Hai già un account? Accedi
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
    </Box>
  );
};

export default RegisterPage; 
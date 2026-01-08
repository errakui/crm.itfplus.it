import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  IconButton,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { trackSignUp } from '../utils/analytics';

interface TrialPopupProps {
  apiUrl?: string;
}

const TrialPopup: React.FC<TrialPopupProps> = ({ apiUrl = '/api' }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    azienda: '',
    ruolo: '',
    settore: '',
    citta: '',
    note: '',
  });

  const handleOpen = () => {
    setOpen(true);
    setSuccess(false);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      nome: '',
      cognome: '',
      email: '',
      telefono: '',
      azienda: '',
      ruolo: '',
      settore: '',
      citta: '',
      note: '',
    });
    setSuccess(false);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const nomeCompleto = `${formData.nome} ${formData.cognome}`;
      
      // Chiama l'API pubblica per creare l'account
      const response = await axios.post(`${apiUrl}/public/request-account`, {
        email: formData.email,
        name: nomeCompleto,
        expiresInDays: 3,
        telefono: formData.telefono,
        azienda: formData.azienda,
        ruolo: formData.ruolo,
        settore: formData.settore,
        citta: formData.citta,
        note: formData.note,
      }, {
        headers: {
          'X-API-Key': '933126c4a803a65808eab51db263a5287841a661d648c08196363bd257b08246'
        }
      });

      if (response.data.success) {
        setSuccess(true);
        
        // 📊 Traccia registrazione trial su Google Analytics
        trackSignUp('trial_popup');
        
        setTimeout(() => {
          handleClose();
        }, 5000);
      } else {
        setError(response.data.message || 'Errore nella creazione dell\'account');
      }
    } catch (err: any) {
      console.error('Errore creazione trial:', err);
      setError(
        err.response?.data?.message || 
        'Si è verificato un errore. Riprova più tardi.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Popup fluttuante in basso a destra */}
      <Box
        onClick={handleOpen}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24, md: 30 },
          right: { xs: 16, sm: 24, md: 30 },
          cursor: 'pointer',
          zIndex: 9999,
          // Animazione bounce solo all'inizio, poi si ferma
          animation: 'bounceOnce 0.8s ease-out',
          '@keyframes bounceOnce': {
            '0%': { transform: 'translateY(100px)', opacity: 0 },
            '60%': { transform: 'translateY(-10px)', opacity: 1 },
            '80%': { transform: 'translateY(5px)' },
            '100%': { transform: 'translateY(0)' },
          },
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'scale(1.03) translateY(-3px)',
          },
        }}
      >
        {/* Contenitore con Booky e testo */}
        <Box
          sx={{
            position: 'relative',
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)',
            borderRadius: '6px',
            padding: { xs: '12px 16px', sm: '15px 20px' },
            boxShadow: '0 8px 25px rgba(27, 42, 74, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1.5, sm: 2 },
            maxWidth: { xs: '300px', sm: '350px' },
          }}
        >
          {/* Immagine Booky */}
          <Box
            component="img"
            src="/booky.png"
            alt="Booky"
            sx={{
              width: { xs: 45, sm: 60 },
              height: { xs: 45, sm: 60 },
              borderRadius: '50%',
              border: '3px solid white',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              flexShrink: 0,
            }}
          />
          
          {/* Testo */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 700,
                fontSize: { xs: '14px', sm: '18px' },
                lineHeight: 1.2,
                fontFamily: '"Syne", sans-serif',
              }}
            >
              SEI NUOVO?
            </Typography>
            <Typography
              sx={{
                color: 'var(--accent-color)',
                fontWeight: 700,
                fontSize: { xs: '12px', sm: '16px' },
                fontFamily: '"Plus Jakarta Sans", sans-serif',
              }}
            >
              PROVAMI GRATIS SUBITO!
            </Typography>
          </Box>

          {/* Badge "3 giorni" */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: -8, sm: -10 },
              right: { xs: -8, sm: -10 },
              background: 'var(--error-color)',
              color: 'white',
              borderRadius: '4px',
              width: { xs: 36, sm: 44 },
              height: { xs: 36, sm: 44 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: { xs: '10px', sm: '12px' },
              fontWeight: 700,
              border: '3px solid white',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
          >
            3 GG
          </Box>
        </Box>
      </Box>

      {/* Dialog Form */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '6px',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: { xs: 2, sm: 2.5 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              component="img"
              src="/booky.png"
              alt="Booky"
              sx={{ width: 50, height: 50, borderRadius: '50%' }}
            />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Prova Gratuita 3 Giorni
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Compila il form e inizia subito!
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 3 }}>
          {success ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                ✅ Account creato con successo!
              </Typography>
              <Typography>
                Controlla la tua email <strong>{formData.email}</strong> per ricevere le credenziali di accesso.
                Il tuo account di prova è valido per <strong>3 giorni</strong>.
              </Typography>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={2}>
                {/* Nome */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Cognome */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Cognome"
                    name="cognome"
                    value={formData.cognome}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Email */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    type="email"
                    label="Email Aziendale"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Telefono */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="+39 ..."
                  />
                </Grid>

                {/* Azienda */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Studio/Azienda"
                    name="azienda"
                    value={formData.azienda}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Ruolo */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    select
                    label="Ruolo"
                    name="ruolo"
                    value={formData.ruolo}
                    onChange={handleChange}
                  >
                    <MenuItem value="Avvocato">Avvocato</MenuItem>
                    <MenuItem value="Partner">Partner</MenuItem>
                    <MenuItem value="Praticante">Praticante</MenuItem>
                    <MenuItem value="Segreteria">Segreteria</MenuItem>
                    <MenuItem value="Responsabile IT">Responsabile IT</MenuItem>
                    <MenuItem value="Amministratore">Amministratore</MenuItem>
                    <MenuItem value="Altro">Altro</MenuItem>
                  </TextField>
                </Grid>

                {/* Settore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Settore"
                    name="settore"
                    value={formData.settore}
                    onChange={handleChange}
                  >
                    <MenuItem value="Diritto Civile">Diritto Civile</MenuItem>
                    <MenuItem value="Diritto Penale">Diritto Penale</MenuItem>
                    <MenuItem value="Diritto del Lavoro">Diritto del Lavoro</MenuItem>
                    <MenuItem value="Diritto Tributario">Diritto Tributario</MenuItem>
                    <MenuItem value="Diritto Amministrativo">Diritto Amministrativo</MenuItem>
                    <MenuItem value="Diritto Commerciale">Diritto Commerciale</MenuItem>
                    <MenuItem value="Multi-settore">Multi-settore</MenuItem>
                    <MenuItem value="Altro">Altro</MenuItem>
                  </TextField>
                </Grid>

                {/* Città */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Città"
                    name="citta"
                    value={formData.citta}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Note */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Note o esigenze particolari (opzionale)"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>

              {/* Bottone Submit */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.5,
                  background: 'linear-gradient(to right, var(--primary-color), var(--primary-light))',
                  fontSize: { xs: '14px', sm: '16px' },
                  fontWeight: 700,
                  borderRadius: '4px',
                  '&:hover': {
                    background: 'linear-gradient(to right, var(--primary-light), var(--primary-lighter))',
                  },
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                    Creazione in corso...
                  </>
                ) : (
                  '🚀 Attiva la Prova Gratuita'
                )}
              </Button>

              <Typography
                variant="caption"
                sx={{ display: 'block', mt: 2, textAlign: 'center', color: 'text.secondary' }}
              >
                Cliccando su "Attiva" riceverai un'email con le credenziali di accesso.
                <br />
                L'account di prova è valido per 3 giorni.
              </Typography>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TrialPopup;


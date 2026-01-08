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
          bottom: 30,
          right: 30,
          cursor: 'pointer',
          zIndex: 9999,
          animation: 'bounce 2s infinite',
          '@keyframes bounce': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' },
          },
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
      >
        {/* Contenitore con Booky e testo */}
        <Box
          sx={{
            position: 'relative',
            background: 'linear-gradient(135deg, #1B2A4A 0%, #2c4270 100%)',
            borderRadius: '20px',
            padding: '15px 20px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            maxWidth: '350px',
          }}
        >
          {/* Immagine Booky */}
          <Box
            component="img"
            src="/booky.png"
            alt="Booky"
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: '3px solid white',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            }}
          />
          
          {/* Testo */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px',
                lineHeight: 1.2,
              }}
            >
              SEI NUOVO?
            </Typography>
            <Typography
              sx={{
                color: '#FFD700',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              PROVAMI GRATIS SUBITO!
            </Typography>
          </Box>

          {/* Badge "3 giorni" */}
          <Box
            sx={{
              position: 'absolute',
              top: -10,
              right: -10,
              background: '#FF6B35',
              color: 'white',
              borderRadius: '50%',
              width: 50,
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              border: '3px solid white',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
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
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #1B2A4A 0%, #2c4270 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
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
                  background: 'linear-gradient(to right, #1B2A4A, #2c4270)',
                  fontSize: '16px',
                  fontWeight: 'bold',
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


import React, { useState } from 'react';
import { 
  Container, Typography, Paper, Grid, TextField, 
  Button, Box, Divider, FormControl, InputLabel, 
  Select, MenuItem, SelectChangeEvent, Snackbar, 
  Alert
} from '@mui/material';
import { 
  Send as SendIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Apartment as ApartmentIcon
} from '@mui/icons-material';
import axios from 'axios';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: '',
  });
  
  const [loading, setLoading] = useState(false);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCategoryChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({ ...prev, category: e.target.value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Invio dei dati all'API
      const response = await axios.post('http://localhost:8000/api/contact', formData);
      
      console.log('Risposta API:', response.data);
      
      // Mostra un messaggio di successo
      setSnackbar({
        open: true,
        message: response.data.message || 'Il tuo messaggio è stato inviato con successo. Ti risponderemo al più presto.',
        severity: 'success',
      });
      
      // Resetta il form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: '',
      });
    } catch (error: any) {
      console.error('Errore nell\'invio del form:', error);
      
      // Mostra un messaggio di errore
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Si è verificato un errore nell\'invio del messaggio. Riprova più tardi.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Contattaci
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Siamo qui per rispondere a qualsiasi domanda o richiesta tu possa avere. Compila il modulo sottostante o contattaci direttamente.
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Inviaci un messaggio
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nome e cognome"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Categoria</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      label="Categoria"
                      onChange={handleCategoryChange}
                    >
                      <MenuItem value="support">Supporto tecnico</MenuItem>
                      <MenuItem value="billing">Fatturazione</MenuItem>
                      <MenuItem value="feedback">Feedback</MenuItem>
                      <MenuItem value="partnership">Partnership</MenuItem>
                      <MenuItem value="other">Altro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Oggetto"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Messaggio"
                    name="message"
                    multiline
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<SendIcon />}
                    sx={{ mt: 1, px: 4 }}
                    disabled={loading}
                  >
                    {loading ? 'Invio in corso...' : 'Invia messaggio'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              I nostri contatti
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Email
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    info@itfplus.it
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Telefono
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    +39 333 617 0230
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ApartmentIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Sede principale
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                  Via Santa Teresa, 53/A 
                  37135 – Verona
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Orari di ufficio
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box>
              <Typography variant="body1" fontWeight="medium">
                Lunedì - Venerdì
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                9:00 - 18:00
              </Typography>
              
              <Typography variant="body1" fontWeight="medium">
                Sabato
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                9:00 - 13:00
              </Typography>
              
              <Typography variant="body1" fontWeight="medium">
                Domenica e festivi
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chiuso
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ContactPage; 
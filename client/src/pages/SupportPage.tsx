import React, { useState } from 'react';
import { 
  Container, Typography, Paper, Box, 
  Grid, Card, CardContent, Button, 
  TextField, List, ListItem, ListItemIcon, 
  ListItemText, Divider, Snackbar, Alert
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Phone as PhoneIcon,
  ChatBubble as ChatBubbleIcon,
  HelpOutline as HelpOutlineIcon,
  Assignment as AssignmentIcon,
  VideoCall as VideoCallIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SupportPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    email: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.message) {
      setSnackbar({
        open: true,
        message: 'Per favore compila tutti i campi richiesti',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Invio dei dati all'API
      const response = await axios.post('http://localhost:8000/api/support', formData);
      
      console.log('Risposta API:', response.data);
      
      // Mostra un messaggio di successo
      setSnackbar({
        open: true,
        message: response.data.message || 'La tua richiesta è stata inviata con successo.',
        severity: 'success'
      });
      
      // Resetta il form
      setFormData({
        subject: '',
        message: '',
        email: ''
      });
    } catch (error: any) {
      console.error('Errore nell\'invio della richiesta:', error);
      
      // Mostra un messaggio di errore
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Si è verificato un errore nell\'invio della richiesta. Riprova più tardi.',
        severity: 'error'
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
          Assistenza
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Hai bisogno di aiuto? Siamo qui per te. Utilizza una delle opzioni seguenti per ricevere assistenza.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Contatta il supporto
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Oggetto"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    variant="outlined"
                    placeholder="Descrivi brevemente il problema"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email per la risposta"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    variant="outlined"
                    placeholder="Inserisci la tua email per ricevere una risposta"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Messaggio"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    variant="outlined"
                    multiline
                    rows={6}
                    placeholder="Fornisci tutti i dettagli che ritieni utili per risolvere il tuo problema"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    type="submit"
                    variant="contained" 
                    size="large" 
                    startIcon={<EmailIcon />} 
                    sx={{ mt: 1 }}
                    disabled={loading}
                  >
                    {loading ? 'Invio in corso...' : 'Invia richiesta'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Canali di contatto
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Email" 
                  secondary="info@itfplus.it" 
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Telefono" 
                  secondary="+39 333 617 0230" 
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ChatBubbleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Chat dal vivo" 
                  secondary="Disponibile negli orari di ufficio"
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
                <Button 
                  variant="outlined" 
                  size="small"
                  href="http://wa.me/+393336170230"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Avvia chat
                </Button>
              </ListItem>
            </List>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Soluzioni rapide
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box>
              <Button 
                variant="text" 
                startIcon={<HelpOutlineIcon />} 
                sx={{ justifyContent: 'flex-start', width: '100%', mb: 1, py: 1 }}
                onClick={() => navigate('/faq')}
              >
                FAQ e domande frequenti
              </Button>
              <Button 
                variant="text" 
                startIcon={<AssignmentIcon />} 
                sx={{ justifyContent: 'flex-start', width: '100%', mb: 1, py: 1 }}
              >
                Guide e manuali
              </Button>
              <Button 
                variant="text" 
                startIcon={<VideoCallIcon />} 
                sx={{ justifyContent: 'flex-start', width: '100%', py: 1 }}
              >
                Video tutorial
              </Button>
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

export default SupportPage; 
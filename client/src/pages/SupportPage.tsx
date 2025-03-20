import React from 'react';
import { 
  Container, Typography, Paper, Box, 
  Grid, Card, CardContent, Button, 
  TextField, List, ListItem, ListItemIcon, 
  ListItemText, Divider 
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Phone as PhoneIcon,
  ChatBubble as ChatBubbleIcon,
  HelpOutline as HelpOutlineIcon,
  Assignment as AssignmentIcon,
  VideoCall as VideoCallIcon
} from '@mui/icons-material';

const SupportPage: React.FC = () => {
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
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Oggetto"
                  variant="outlined"
                  placeholder="Descrivi brevemente il problema"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Messaggio"
                  variant="outlined"
                  multiline
                  rows={6}
                  placeholder="Fornisci tutti i dettagli che ritieni utili per risolvere il tuo problema"
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" size="large" startIcon={<EmailIcon />} sx={{ mt: 1 }}>
                  Invia richiesta
                </Button>
              </Grid>
            </Grid>
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
                  secondary="supporto@itfplus.it" 
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
    </Container>
  );
};

export default SupportPage; 
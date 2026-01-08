import React, { useState } from 'react';
import { 
  Container, Typography, Paper, Grid, Accordion, 
  AccordionSummary, AccordionDetails, TextField, 
  InputAdornment, Divider, Box
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon 
} from '@mui/icons-material';

const FAQPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // FAQ di esempio
  const faqs = [
    {
      question: 'Come posso accedere alla piattaforma?',
      answer: 'Per accedere alla piattaforma ITFPLUS, devi registrarti utilizzando l\'indirizzo email fornito dal tuo ente o studio legale. Dopo la registrazione, riceverai una password temporanea che potrai utilizzare per effettuare il primo accesso e poi modificare secondo le tue preferenze.'
    },
    {
      question: 'Come posso salvare un documento tra i preferiti?',
      answer: 'Mentre visualizzi un documento, clicca sul pulsante con l\'icona del cuore nella parte superiore. Il documento verrà aggiunto alla tua lista dei preferiti a cui potrai accedere in qualsiasi momento dalla sezione "Preferiti" nel menu principale.'
    },
    {
      question: 'È possibile scaricare i documenti per consultarli offline?',
      answer: 'Sì, ogni documento può essere scaricato in formato PDF cliccando sul pulsante "Scarica" nella visualizzazione del documento. Questi file possono essere salvati sul tuo dispositivo per una consultazione offline.'
    },
    {
      question: 'Come posso modificare le informazioni del mio profilo?',
      answer: 'Accedi alla sezione "Il mio profilo" dal menu laterale. Qui troverai un pulsante "Modifica informazioni" che ti permetterà di aggiornare il tuo nome e altri dettagli personali. Per cambiare la password, utilizza l\'apposita sezione "Sicurezza".'
    },
    {
      question: 'Quali tipi di documenti sono disponibili nella piattaforma?',
      answer: 'ITFPLUS offre le sentenze di merito di tutti i Tribunali e le Corti d\'Appello italiane, anonimizzate da tutti i dati sensibili.'
    },
    {
      question: 'Come posso ottenere assistenza se ho problemi tecnici?',
      answer: 'Puoi contattare il nostro team di supporto attraverso la sezione "Assistenza" nel menu laterale. Lì troverai diverse opzioni: invio di una richiesta via email, chiamata telefonica o chat dal vivo durante gli orari di ufficio.'
    },
    {
      question: 'Quali browser sono supportati da ITFPLUS?',
      answer: 'ITFPLUS è ottimizzato per funzionare con i browser più recenti come Chrome, Firefox, Safari ed Edge. Per una migliore esperienza, ti consigliamo di utilizzare sempre l\'ultima versione disponibile del tuo browser preferito.'
    },
    {
      question: 'I documenti vengono aggiornati regolarmente?',
      answer: 'Sì, il nostro team aggiorna costantemente l\'archivio con nuovi documenti e materiali. Gli aggiornamenti vengono effettuati su base settimanale, garantendo che tu abbia sempre accesso alle informazioni più recenti e pertinenti.'
    }
  ];
  
  // Filtra le FAQ in base al termine di ricerca
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Domande frequenti (FAQ)
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Trova rapidamente risposte alle domande più comuni sulla piattaforma ITFPLUS.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Cerca nelle FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <Divider sx={{ my: 3 }} />
            
            {filteredFaqs.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nessun risultato trovato
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Prova con un termine di ricerca diverso o contatta l'assistenza per domande specifiche.
                </Typography>
              </Box>
            ) : (
              filteredFaqs.map((faq, index) => (
                <Accordion key={index} sx={{ mb: 1, '&:before': { display: 'none' } }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                      backgroundColor: 'rgba(27, 42, 74, 0.04)',
                      '&:hover': { backgroundColor: 'rgba(27, 42, 74, 0.08)' }
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="medium">
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1">
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Paper>
          
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Non hai trovato quello che cercavi?
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              Se non hai trovato risposta alla tua domanda, ti invitiamo a contattare il nostro servizio di assistenza. Il nostro team di supporto sarà lieto di aiutarti a risolvere qualsiasi problema o dubbio.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visita la sezione <b>Assistenza</b> o <b>Contattaci</b> dal menu laterale per scoprire tutti i modi in cui puoi raggiungerci.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FAQPage; 
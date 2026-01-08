import React from 'react';
import { Container, Typography, Paper, Box, Divider, List, ListItem, ListItemText, ListItemIcon, Chip } from '@mui/material';
import { CheckCircleOutline, BugReport, NewReleases, Speed, Security, Brush, Animation, ViewList, SearchOutlined, FindInPage, AutoFixHigh, CloudUpload, PeopleAlt, Sort, Link, Psychology } from '@mui/icons-material';

// Ottieni la data di oggi in formato italiano
const today = new Date().toLocaleDateString('it-IT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

const ChangelogPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }} className="fade-in">
      <Typography 
        variant="h3" 
        component="h1" 
        align="center"
        sx={{ 
          mb: 4,
          fontFamily: 'Cormorant Garamond, serif',
          color: 'var(--primary-color)',
          fontWeight: 600,
          position: 'relative',
          paddingBottom: '10px'
        }}
        className="page-title"
      >
        Cronologia delle modifiche
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: '12px' }} className="scale-in">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, fontFamily: 'Cormorant Garamond, serif' }}>
            Versione 0.0.8
          </Typography>
          <Chip 
            label={today} 
            color="primary" 
            size="small" 
            icon={<NewReleases fontSize="small" />}
            sx={{ fontFamily: 'Inter, sans-serif' }}
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="subtitle1" gutterBottom sx={{ fontFamily: 'Inter, sans-serif' }}>
          Gestione avanzata degli utenti, navigazione migliorata e ottimizzazione del motore di ricerca
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <PeopleAlt color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Paginazione utenti in admin" 
              secondary="Implementata visualizzazione paginata (10 utenti per pagina) nell'area amministrativa per gestire meglio grandi quantità di utenti"
              primaryTypographyProps={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              secondaryTypographyProps={{ fontFamily: 'Inter, sans-serif' }}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Sort color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Ordinamento utenti per scadenza" 
              secondary="Nuovo sistema di ordinamento degli utenti per data di scadenza, evidenziando visivamente quelli in scadenza entro 7 giorni"
              primaryTypographyProps={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              secondaryTypographyProps={{ fontFamily: 'Inter, sans-serif' }}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Psychology color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Motore di ricerca fuzzy" 
              secondary="Implementato algoritmo di ricerca avanzato con tolleranza del 30% agli errori di digitazione e similarity score del 70%"
              primaryTypographyProps={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              secondaryTypographyProps={{ fontFamily: 'Inter, sans-serif' }}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Link color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="Navigazione SPA migliorata" 
              secondary="Convertiti tutti i link nel footer da elementi HTML a componenti Router per una navigazione fluida senza ricaricamento della pagina"
              primaryTypographyProps={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              secondaryTypographyProps={{ fontFamily: 'Inter, sans-serif' }}
            />
          </ListItem>
        </List>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
            Questa versione migliora significativamente la gestione degli utenti e arricchisce l'esperienza di ricerca. Il nuovo algoritmo di matching fuzzy permette di trovare risultati pertinenti anche con errori di digitazione, garantendo un tasso di pertinenza minimo del 70%. La navigazione del sito è più fluida grazie all'implementazione completa del routing SPA. Nell'area amministrativa, l'ordinamento per scadenza consente di identificare rapidamente gli abbonamenti in scadenza.
          </Typography>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: '12px' }} className="scale-in">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, fontFamily: 'Cormorant Garamond, serif' }}>
            Versione 0.0.7
          </Typography>
          <Chip 
            label="19/07/2023" 
            color="default" 
            size="small" 
            icon={<NewReleases fontSize="small" />}
            sx={{ fontFamily: 'Inter, sans-serif' }}
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="subtitle1" gutterBottom sx={{ fontFamily: 'Inter, sans-serif' }}>
          Ottimizzazione motore di ricerca, visualizzazione PDF e prevenzione documenti duplicati
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <SearchOutlined color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Motore di ricerca avanzato" 
              secondary="Completamente ridisegnato per cercare esclusivamente nel contenuto dei PDF. Supporta ricerca multi-parola e caratteri accentati (es. 'morosità')"
              primaryTypographyProps={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              secondaryTypographyProps={{ fontFamily: 'Inter, sans-serif' }}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <FindInPage color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Filtro città dal titolo" 
              secondary="Migliorata la ricerca per città, ora filtra esclusivamente in base al titolo della sentenza per maggiore precisione"
              primaryTypographyProps={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              secondaryTypographyProps={{ fontFamily: 'Inter, sans-serif' }}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CloudUpload color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Prevenzione documenti duplicati" 
              secondary="Implementato controllo automatico dei documenti duplicati durante il caricamento per evitare doppioni nel sistema"
              primaryTypographyProps={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              secondaryTypographyProps={{ fontFamily: 'Inter, sans-serif' }}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <AutoFixHigh color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="Riparazione automatica percorsi" 
              secondary="Sistema intelligente che corregge automaticamente i percorsi ai file quando vengono spostati o rinominati"
              primaryTypographyProps={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              secondaryTypographyProps={{ fontFamily: 'Inter, sans-serif' }}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <BugReport color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="Risoluzione problemi visualizzazione" 
              secondary="Corretti i problemi di visualizzazione e download dei PDF, ora funziona correttamente in tutte le sezioni"
              primaryTypographyProps={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              secondaryTypographyProps={{ fontFamily: 'Inter, sans-serif' }}
            />
          </ListItem>
        </List>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
            Questa versione migliora significativamente l'affidabilità del sistema e ottimizza la ricerca di documenti.
            La ricerca di termini giuridici nei PDF è ora più precisa e l'esperienza utente risulta notevolmente migliorata.
          </Typography>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: '12px', opacity: 0.95 }} className="slide-up">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, fontFamily: 'Cormorant Garamond, serif' }}>
            Versione 0.0.6
          </Typography>
          <Chip 
            label="15/07/2023" 
            color="default" 
            size="small" 
            icon={<NewReleases fontSize="small" />}
            sx={{ fontFamily: 'Inter, sans-serif' }}
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="subtitle1" gutterBottom sx={{ fontFamily: 'Inter, sans-serif' }}>
          Aggiornamento dell'interfaccia utente con miglioramenti grafici, animazioni e ottimizzazione della paginazione
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <Brush color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Rinnovamento interfaccia grafica" 
              secondary="Migliorato l'aspetto visivo dell'app con nuovi font, stili più moderni e migliore leggibilità dei contenuti"
              primaryTypographyProps={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              secondaryTypographyProps={{ fontFamily: 'Inter, sans-serif' }}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Animation color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Animazioni fluide" 
              secondary="Aggiunte animazioni di transizione per una migliore esperienza utente e interazioni più naturali"
              primaryTypographyProps={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              secondaryTypographyProps={{ fontFamily: 'Inter, sans-serif' }}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <ViewList color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Paginazione ottimizzata" 
              secondary="Implementazione di paginazione uniforme con 10 documenti per pagina sia nella dashboard utente che nella sezione di amministrazione"
              primaryTypographyProps={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              secondaryTypographyProps={{ fontFamily: 'Inter, sans-serif' }}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CheckCircleOutline color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="Miglioramento visualizzazione titoli PDF" 
              secondary="Ottimizzata la leggibilità dei nomi completi dei documenti PDF attraverso tooltip e migliore gestione del testo"
              primaryTypographyProps={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              secondaryTypographyProps={{ fontFamily: 'Inter, sans-serif' }}
            />
          </ListItem>
        </List>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
            Questa versione migliora significativamente l'aspetto estetico e l'usabilità dell'applicazione,
            rendendo l'esperienza più piacevole e moderna. Sono stati mantenuti i colori principali
            con leggeri aggiustamenti per una migliore armonia visiva.
          </Typography>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: '12px', opacity: 0.85 }} className="slide-up">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, fontFamily: 'Cormorant Garamond, serif' }}>
            Versione 0.0.5
          </Typography>
          <Chip 
            label="28/04/2023" 
            color="default" 
            size="small" 
            sx={{ fontFamily: 'Inter, sans-serif' }}
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="subtitle1" gutterBottom sx={{ fontFamily: 'Inter, sans-serif' }}>
          Miglioramenti significativi delle prestazioni e dell'esperienza utente
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <Speed color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Paginazione nella ricerca" 
              secondary="Implementata paginazione con 10 documenti per pagina per velocizzare il caricamento e migliorare la navigazione"
              primaryTypographyProps={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              secondaryTypographyProps={{ fontFamily: 'Inter, sans-serif' }}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Speed color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Paginazione nella dashboard admin" 
              secondary="Migliorato il caricamento dei documenti nella dashboard admin per evitare rallentamenti con grandi quantità di file"
              primaryTypographyProps={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              secondaryTypographyProps={{ fontFamily: 'Inter, sans-serif' }}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CheckCircleOutline color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="Motore di ricerca semantico" 
              secondary="Migliorato il motore di ricerca per trovare documenti anche quando le parole chiave non sono consecutive o in ordine esatto"
              primaryTypographyProps={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              secondaryTypographyProps={{ fontFamily: 'Inter, sans-serif' }}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <BugReport color="error" />
            </ListItemIcon>
            <ListItemText 
              primary="Correzione contatori dashboard" 
              secondary="Risolto il problema dei contatori di documenti e utenti nella dashboard di amministrazione"
              primaryTypographyProps={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              secondaryTypographyProps={{ fontFamily: 'Inter, sans-serif' }}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Security color="secondary" />
            </ListItemIcon>
            <ListItemText 
              primary="URL email corretti" 
              secondary="Aggiornati i link nelle email per puntare correttamente a crm.itfplus.it"
              primaryTypographyProps={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              secondaryTypographyProps={{ fontFamily: 'Inter, sans-serif' }}
            />
          </ListItem>
        </List>
      </Paper>
      
      <Typography variant="body2" color="text.secondary" align="center" sx={{ fontFamily: 'Inter, sans-serif' }}>
        Le versioni precedenti non sono documentate in questa pagina.
      </Typography>
    </Container>
  );
};

export default ChangelogPage; 
import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';

const TermsPage: React.FC = () => {
  return (
    <Box sx={{ py: 5 }}>
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 3, color: '#1B2A4A' }}>
            Condizioni di Abbonamento
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1B2A4A' }}>
              CONDIZIONI DI CONTRATTO E TERMINI DI UTILIZZO
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2, color: '#1B2A4A' }}>
              1. Proprietà del marchio
            </Typography>
            <Typography paragraph>
              ITFPlus.it è un marchio di proprietà di Giuridicanet S.r.l.s
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, color: '#1B2A4A' }}>
              2. Campo di applicazione
            </Typography>
            <Typography paragraph>
              Le presenti condizioni si applicano alla sottoscrizione di tutte le tipologie di abbonamento ai servizi offerti da ITFPlus.it che avviene per mezzo dell'accettazione del presente contratto ed è confermata dal versamento del canone di abbonamento.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, color: '#1B2A4A' }}>
              3. Conclusione di contratto
            </Typography>
            <Typography paragraph>
              Gli abbonamenti hanno durata mensile o annuale e si intendono tacitamente rinnovati di anno in anno salvo disdetta da inviarsi entro 60 gg dalla data di scadenza (data sottoscrizione) tramite pec a giuridicanet@pec.studioespen.it. Essendo il servizio soggetto all'autorizzazione da parte degli organismi giudiziari, Giuridicanet S.r.l.s avrà facoltà di recedere dal contratto qualora l'autorizzazione venga revocata per ragioni che esulano da dirette responsabilità di Giuridicanet S.r.l.s Nessun rimborso sarà dovuto.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, color: '#1B2A4A' }}>
              4. Termini di utilizzo del Servizio
            </Typography>
            <Typography paragraph>
              Per il download e la consultazione dei documenti pubblicati su ITFPlus.it è richiesta al cliente l'attivazione di credenziali di accesso, comunicate allo stesso al momento della registrazione su www.itfplus.it. Il Cliente prende atto e accetta che tale adempimento costituisca condizione indispensabile alla fruizione del servizio. Il Cliente si assume nei confronti di ITFPlus.it l'obbligo di conservazione delle sue credenziali per nessun motivo cedibili a terzi non direttamente autorizzati da Giuridicanet S.r.l.s. Giuridicanet S.r.l.s è titolare di ogni diritto di proprietà intellettuale sul servizio. Il Cliente prende atto che tutti i contenuti fruibili da ITFPlus.it sono protetti dal diritto d'autore e sono oggetto di proprietà intellettuale esclusivi di Giuridicanet s.r.l.s. vista l'attività di rielaborazione del testo per l'omissione dei dati identificativi degli interessati e delle parti. Ogni riproduzione, duplicazione o vendita dei contenuti de ITFPlus.it è espressamente vietata al Cliente. Le sentenze pubblicate sono disponibili in formato html o in PDF; indipendentemente dal formato al cliente è vietato ogni utilizzo che esuli dall'attività strettamente professionale. Al cliente è quindi vietata la riproduzione totale o parziale su qualsiasi supporto. Fanno eccezione le stampe dei documenti in PDF scaricabili da ITFPlus.it e le forme di riproduzione parziale per citazione della fonte. Il Cliente si assume tutti gli oneri derivanti dall'utilizzo dei documenti scaricati da ITFPlus.it, riconosciuta la natura di mero ausilio all'attività professionale. Giuridicanet s.r.l.s. garantisce che ad esclusione dell'omissione dei dati identificativi delle parti e degli interessati, nessuna informazione viene manomessa e il testo della sentenza è riprodotto integralmente e fedelmente all'originale. Eventuali refusi contenuti nel testo della sentenza sono dovuti all'utilizzo delle tecnologie per l'estrapolazione del testo dall' originale.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, color: '#1B2A4A' }}>
              5. Privacy
            </Typography>
            <Typography paragraph>
              Gli indirizzi e-mail presenti nel nostro archivio provengono da richieste di iscrizioni o da altri elenchi o servizi di pubblico dominio e/o pubblicati in Internet. Il trattamento dei dati è effettuato al fine di informarLa sulle iniziative commerciali di Giuridicanet s.r.l.s. I Suoi dati personali vengono trattati all'interno di Giuridicanet s.r.l.s., responsabile del trattamento, nel rispetto di quanto stabilito dal Regolamento Europeo n. 679/2016 ("GDPR") e dalla normativa nazionale (Dlgs. n. 196/03) e successivi, e in qualsiasi momento potrà esercitare i diritti di cui all'art. 7 (accesso, correzione, cancellazione, opposizione al trattamento, ecc..) inviando comunicazione scritta a info@itfplus.it
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, color: '#1B2A4A' }}>
              6. Foro competente
            </Typography>
            <Typography paragraph>
              Per qualsiasi controversia relativa al presente contratto è competente in via esclusiva il Foro di Verona.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, color: '#1B2A4A' }}>
              7. Rinvio
            </Typography>
            <Typography paragraph>
              Per tutto quanto non previsto dalle condizioni generali si applicano le norme del Codice Civile in materia di obbligazioni e le disposizioni delle leggi speciali.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default TermsPage; 
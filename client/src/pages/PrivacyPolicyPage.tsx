import React from 'react';
import { Box, Container, Typography, Paper, Divider } from '@mui/material';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <Box sx={{ py: 5 }}>
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 3, color: '#1B2A4A' }}>
            Privacy Policy
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1B2A4A' }}>
              Chi siamo
            </Typography>
            <Typography paragraph>
              L'indirizzo del nostro sito web è: https://itfplus.it.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1B2A4A' }}>
              Quali dati personali raccogliamo e perché li raccogliamo
            </Typography>
            <Typography paragraph>
              Fra i Dati Personali raccolti da questo sito e dal CRM itfplus.it, in modo autonomo, ci sono: nome, cognome, numero di telefono, Partita IVA, ragione sociale, indirizzo, nazione, stato, provincia, email, CAP, Città e Codice Fiscale. Dettagli completi su ciascuna tipologia di Dati raccolti sono forniti nelle sezioni dedicate di questa privacy policy o mediante specifici testi informativi visualizzati prima della raccolta dei Dati stessi. I Dati Personali possono essere liberamente forniti dall'Utente o, nel caso di Dati di Utilizzo, raccolti automaticamente durante l'uso di questo sito e del CRM.
            </Typography>
            <Typography paragraph>
              I Dati obbligatori richiesti da questo sito, in fase di iscrizione, sono: nome utente, indirizzo e-mail.
              I Dati obbligatori richiesti per l'utilizzo del CRM itfplus.it sono: nome, cognome, tipo di fatturazione, paese/regione, via, CAP, città, provincia, telefono, indirizzo e-mail.
            </Typography>
            <Typography paragraph>
              Nel caso in cui i Dati obbligatori specificati non venissero conferiti, potrebbe essere impossibile per questo sito e per il CRM fornire il servizio. Nei casi in cui questo sito o il CRM indichino alcuni Dati come facoltativi, gli Utenti sono liberi di astenersi dal comunicare tali Dati, senza che ciò abbia alcuna conseguenza sulla disponibilità del servizio o sulla sua operatività. Gli Utenti che dovessero avere dubbi su quali Dati siano obbligatori, sono incoraggiati a contattare il Titolare. L'eventuale utilizzo di Cookie – o di altri strumenti di tracciamento – da parte di questo sito o del CRM o dei titolari dei servizi terzi utilizzati, ove non diversamente precisato, ha la finalità di fornire il servizio richiesto dall'Utente, oltre alle ulteriori finalità descritte nel presente documento e nella Cookie Policy, se disponibile. L'Utente si assume la responsabilità dei Dati Personali di terzi pubblicati o condivisi mediante questo sito o il CRM e garantisce di avere il diritto di comunicarli o diffonderli, liberando il Titolare da qualsiasi responsabilità verso terzi.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1B2A4A' }}>
              Commenti
            </Typography>
            <Typography paragraph>
              Quando i visitatori lasciano commenti sul sito, raccogliamo i Dati mostrati nel modulo dei commenti oltre all'indirizzo IP del visitatore e la stringa dello user agent del browser per facilitare il rilevamento dello spam.
            </Typography>
            <Typography paragraph>
              Una stringa anonimizzata creata a partire dal tuo indirizzo email (altrimenti detta hash) può essere fornita al servizio Gravatar per vedere se lo stai usando. La privacy policy del servizio Gravatar è disponibile qui: https://automattic.com/privacy/. Dopo l'approvazione del tuo commento, la tua immagine del profilo è visibile al pubblico nel contesto del tuo commento.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1B2A4A' }}>
              Media
            </Typography>
            <Typography paragraph>
              Se carichi immagini sul sito web o sul CRM, dovresti evitare di caricare immagini che includono i Dati di posizione incorporati (EXIF GPS). I visitatori del sito web possono scaricare ed estrarre qualsiasi dato sulla posizione dalle immagini sul sito web.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1B2A4A' }}>
              Cookie
            </Typography>
            <Typography paragraph>
              Se lasci un commento sul nostro sito, puoi scegliere di salvare il tuo nome, indirizzo email e sito web nei cookie. Sono usati per la tua comodità in modo che tu non debba inserire nuovamente i tuoi Dati quando lasci un altro commento. Questi cookie dureranno per un anno.
            </Typography>
            <Typography paragraph>
              Se hai un account e accedi a questo sito o al CRM itfplus.it, verrà impostato un cookie temporaneo per determinare se il tuo browser accetta i cookie. Questo cookie non contiene Dati Personali e viene eliminato quando chiudi il browser.
            </Typography>
            <Typography paragraph>
              Quando effettui l'accesso, verranno impostati diversi cookie per salvare le tue informazioni di accesso e le tue opzioni di visualizzazione dello schermo. I cookie di accesso durano due giorni mentre i cookie per le opzioni dello schermo durano un anno. Se selezioni "Ricordami", il tuo accesso persisterà per due settimane. Se esci dal tuo account, i cookie di accesso verranno rimossi.
            </Typography>
            <Typography paragraph>
              Se modifichi o pubblichi un articolo, un cookie aggiuntivo verrà salvato nel tuo browser. Questo cookie non include Dati Personali, ma indica semplicemente l'ID dell'articolo appena modificato. Scade dopo 1 giorno.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1B2A4A' }}>
              Contenuto incorporato da altri siti web
            </Typography>
            <Typography paragraph>
              Gli articoli su questo sito possono includere contenuti incorporati (ad esempio video, immagini, articoli, ecc.). I contenuti incorporati da altri siti web si comportano esattamente allo stesso modo come se il visitatore avesse visitato l'altro sito web.
            </Typography>
            <Typography paragraph>
              Questi siti web possono raccogliere Dati su di te, usare cookie, integrare ulteriori tracciamenti di terze parti e monitorare l'interazione con essi, incluso il tracciamento della tua interazione con il contenuto incorporato se hai un account e sei connesso a quei siti web.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1B2A4A' }}>
              Analytics
            </Typography>
            <Typography paragraph>
              L'analisi dei Dati offerta da Google Analytics avviene in forma anonima.
            </Typography>
            <Typography paragraph>
              Le analytics del CRM itfplus.it presentano solo i Dati forniti dall'utente (come specificato nella sezione dedicata). Questi sono utili al fine della fatturazione e dell'analisi dell'utilizzo del servizio.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1B2A4A' }}>
              Con chi condividiamo i tuoi dati
            </Typography>
            <Typography paragraph>
              Condividiamo i tuoi Dati solo con le parti terze interessante dal pagamento di un ordine o necessarie per la fornitura del servizio CRM (vedi sezione apposita).
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1B2A4A' }}>
              Per quanto tempo conserviamo i tuoi dati
            </Typography>
            <Typography paragraph>
              Se lasci un commento, il commento e i relativi metadati vengono conservati a tempo indeterminato. È così che possiamo riconoscere e approvare automaticamente eventuali commenti successivi invece di tenerli in una coda di moderazione.
            </Typography>
            <Typography paragraph>
              Per gli utenti che si registrano sul nostro sito web o sul CRM itfplus.it, memorizziamo anche le informazioni personali che forniscono nel loro profilo utente. Tutti gli utenti possono vedere, modificare o cancellare le loro informazioni personali in qualsiasi momento (eccetto il loro nome utente che non possono cambiare). Gli amministratori del sito web e del CRM possono anche vedere e modificare queste informazioni.
            </Typography>
            <Typography paragraph>
              Per quanto riguarda gli acquisti e l'utilizzo del servizio CRM, i Dati vengono conservati per un periodo di 10 anni ai fini fiscali e di contabilità.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1B2A4A' }}>
              Quali diritti hai sui tuoi dati
            </Typography>
            <Typography paragraph>
              Se hai un account su questo sito o sul CRM itfplus.it, o hai lasciato commenti, puoi richiedere di ricevere un file esportato dal sito con i Dati personali che abbiamo su di te, compresi i Dati che ci hai fornito. Puoi anche richiedere che cancelliamo tutti i Dati personali che ti riguardano. Questo non include i Dati che siamo obbligati a conservare per scopi amministrativi, legali o di sicurezza.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1B2A4A' }}>
              Dove spediamo i tuoi dati
            </Typography>
            <Typography paragraph>
              I commenti dei visitatori possono essere controllati attraverso un servizio di rilevamento automatico dello spam.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1B2A4A' }}>
              Le tue informazioni di contatto
            </Typography>
            <Typography paragraph>
              Nel caso si fossero riscontrate delle violazioni dei propri Dati, si prega di segnalare l'episodio scrivendo a info@itfplus.it.
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1B2A4A' }}>
              Informazioni aggiuntive
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2, color: '#1B2A4A' }}>
              Difesa in giudizio
            </Typography>
            <Typography paragraph>
              I Dati Personali dell'Utente possono essere utilizzati da parte del Titolare in giudizio o nelle fasi propedeutiche alla sua eventuale instaurazione per la difesa da abusi nell'utilizzo di questo sito, del CRM itfplus.it o dei servizi connessi da parte dell'Utente. L'Utente dichiara di essere consapevole che al Titolare potrebbe essere richiesto di rivelare i Dati su richiesta delle pubbliche autorità.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, color: '#1B2A4A' }}>
              Informative specifiche
            </Typography>
            <Typography paragraph>
              Su richiesta dell'Utente, in aggiunta alle informazioni contenute in questa privacy policy, questo sito e il CRM itfplus.it potrebbero fornire all'Utente delle informative aggiuntive e contestuali riguardanti servizi specifici, o la raccolta ed il trattamento di Dati Personali.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, color: '#1B2A4A' }}>
              Log di sistema e manutenzione
            </Typography>
            <Typography paragraph>
              Per necessità legate al funzionamento ed alla manutenzione, questo sito, il CRM itfplus.it e gli eventuali servizi terzi da essi utilizzati potrebbero raccogliere Log di sistema, ossia file che registrano le interazioni e che possono contenere anche Dati Personali, quali l'indirizzo IP Utente.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, color: '#1B2A4A' }}>
              Informazioni non contenute in questa policy
            </Typography>
            <Typography paragraph>
              Maggiori informazioni in relazione al trattamento dei Dati Personali potranno essere richieste in qualsiasi momento al Titolare del Trattamento utilizzando le informazioni di contatto.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, color: '#1B2A4A' }}>
              Esercizio dei diritti da parte degli Utenti
            </Typography>
            <Typography paragraph>
              I soggetti cui si riferiscono i Dati Personali hanno il diritto in qualunque momento di ottenere la conferma dell'esistenza o meno degli stessi presso il Titolare del Trattamento, di conoscerne il contenuto e l'origine, di verificarne l'esattezza o chiederne l'integrazione, la cancellazione, l'aggiornamento, la rettifica, la trasformazione in forma anonima o il blocco dei Dati Personali trattati in violazione di legge, nonché di opporsi in ogni caso, per motivi legittimi, al loro trattamento. Le richieste vanno rivolte al Titolare del Trattamento. Questo sito e il CRM itfplus.it non supportano le richieste "Do Not Track". Per conoscere se gli eventuali servizi di terze parti utilizzati le supportano, l'Utente è invitato a consultare le rispettive privacy policy.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, color: '#1B2A4A' }}>
              Modifiche a questa privacy policy
            </Typography>
            <Typography paragraph>
              Il Titolare del Trattamento si riserva il diritto di apportare modifiche alla presente privacy policy in qualunque momento dandone pubblicità agli Utenti su questa pagina. Si prega dunque di consultare spesso questa pagina, prendendo come riferimento la data di ultima modifica indicata in fondo. Nel caso di mancata accettazione delle modifiche apportate alla presente privacy policy, l'Utente è tenuto a cessare l'utilizzo di questa Applicazione e del CRM itfplus.it e può richiedere al Titolare del Trattamento di rimuovere i propri Dati Personali. Salvo quanto diversamente specificato, la precedente privacy policy continuerà ad applicarsi ai Dati Personali sino a quel momento raccolti.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, color: '#1B2A4A' }}>
              Informazioni su questa privacy policy
            </Typography>
            <Typography paragraph>
              Il Titolare del Trattamento dei Dati è responsabile per questa privacy policy.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1B2A4A' }}>
              Come proteggiamo i tuoi dati
            </Typography>
            <Typography paragraph>
              I tuoi Dati sono custoditi sui nostri server, sui quali si può accedere tramite autenticazione sicura. Il CRM itfplus.it utilizza moderne tecnologie di crittografia per garantire la massima sicurezza dei dati personali.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1B2A4A' }}>
              Quali procedure abbiamo predisposto per prevenire la violazione dei dati
            </Typography>
            <Typography paragraph>
              Il sito web e il CRM itfplus.it sono protetti dai maggiori attacchi informatici mediante le tecnologie del provider di hosting utilizzato, e dagli accorgimenti generali indicati nella documentazione ufficiale (Hardening WordPress e relative tecnologie). Utilizziamo lo stato dell'arte in materia di sicurezza informatica sul web, utilizzando firewall, vari tipi di protezioni via software, password robuste ed aggiornamenti quasi sempre istantanei del CMS, dei plugin e del theme attivo, nonché dei sistemi di gestione del CRM.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1B2A4A' }}>
              Da quali terze parti riceviamo dati
            </Typography>
            <Typography paragraph>
              Tutti i Dati vengono forniti dall'utente. Il CRM itfplus.it non acquisisce dati da fonti terze.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1B2A4A' }}>
              Quale processo decisionale automatizzato e/o profilazione facciamo con i dati dell'utente
            </Typography>
            <Typography paragraph>
              I Dati forniti dall'utente vengono utilizzati unicamente con scopo di contatto in cui sono compresi: richieste di informazioni, di preventivo o di qualunque altra natura indicata dall'intestazione del modulo, nonché per la fornitura e il corretto funzionamento del servizio CRM.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1B2A4A' }}>
              Requisiti di informativa normativa del settore
            </Typography>
            <Typography paragraph>
              La presente informativa privacy è redatta sulla base di molteplici ordinamenti legislativi, inclusi gli artt. 13 e 14 del Regolamento (UE) 2016/679.
              Ove non diversamente specificato, questa informativa privacy riguarda esclusivamente questo sito web e il CRM itfplus.it.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1B2A4A' }}>
              Servizi offerti
            </Typography>
            <Typography paragraph>
              Durante la procedura di registrazione al nostro CRM itfplus.it e durante il suo utilizzo, raccogliamo informazioni su di te.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, color: '#1B2A4A' }}>
              Cosa raccogliamo e salviamo
            </Typography>
            <Typography paragraph>
              Mentre visiti il nostro sito o utilizzi il CRM, tracciamo:
            </Typography>

            <Typography paragraph>
              Le funzionalità che hai utilizzato: utilizzeremo queste informazioni per, ad esempio, migliorare l'esperienza utente
            </Typography>
            <Typography paragraph>
              Posizione, indirizzo IP e tipo di browser: useremo queste informazioni per garantire la sicurezza e l'ottimizzazione del servizio
            </Typography>
            <Typography paragraph>
              Indirizzo e dati di contatto: ti chiederemo di inserirli per poterti offrire il servizio correttamente!
            </Typography>

            <Typography paragraph>
              Useremo i cookie anche per tenere traccia della sessione utente mentre stai navigando sul nostro sito o utilizzando il CRM.
            </Typography>

            <Typography paragraph>
              Quando ti registri presso di noi, ti invitiamo a fornire informazioni quali nome, indirizzo di fatturazione, indirizzo e-mail, numero di telefono, dettagli del pagamento e informazioni opzionali sull'account, come il nome utente e la password. Useremo queste informazioni per scopi quali:
            </Typography>

            <Typography paragraph>
              Ti inviamo informazioni sull'account e sul servizio
            </Typography>
            <Typography paragraph>
              Rispondiamo alle tue richieste, inclusi reclami e assistenza
            </Typography>
            <Typography paragraph>
              Elaborazione dei pagamenti e prevenzione delle frodi
            </Typography>
            <Typography paragraph>
              Configura il tuo account per il nostro CRM
            </Typography>
            <Typography paragraph>
              Rispetta tutti gli obblighi legali a nostro carico
            </Typography>
            <Typography paragraph>
              Migliora le offerte del nostro servizio CRM
            </Typography>
            <Typography paragraph>
              Invio di messaggi di marketing, se scegli di riceverli
            </Typography>

            <Typography paragraph>
              Se crei un account, archivieremo il tuo nome, indirizzo, email e numero di telefono: questi dati verranno poi usati per personalizzare la tua esperienza con il CRM itfplus.it.
            </Typography>

            <Typography paragraph>
              In generale conserviamo le tue informazioni finché ne abbiamo bisogno per le finalità per le quali raccogliamo e utilizziamo i dati e finché siamo legalmente tenuti a continuare a mantenerli. Ad esempio, archiviamo le informazioni per 10 anni per ragioni fiscali e di contabilità. Tali informazioni includono nome, indirizzo e-mail e indirizzi di fatturazione.
            </Typography>

            <Typography paragraph>
              Archiviamo anche commenti e feedback, se scegli di lasciarceli.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, color: '#1B2A4A' }}>
              Persone del nostro team che hanno accesso
            </Typography>
            <Typography paragraph>
              I membri del nostro team hanno accesso alle informazioni che ci fornisci. Per esempio, sia gli amministratori che i manager del sistema possono accedere a:
            </Typography>

            <Typography paragraph>
              Informazioni sull'account quali, servizi sottoscritti, data di sottoscrizione e utilizzo
            </Typography>
            <Typography paragraph>
              Informazioni sul cliente come il tuo nome, indirizzo email e informazioni di fatturazione
            </Typography>

            <Typography paragraph>
              I membri del nostro team hanno accesso a queste informazioni per aiutarti a fornirti il servizio, elaborare i pagamenti e supportarti nell'utilizzo del CRM itfplus.it.
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            Questo documento è stato aggiornato per itfplus.it e il CRM itfplus.it, un nuovo progetto di Giuridica.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default PrivacyPolicyPage; 
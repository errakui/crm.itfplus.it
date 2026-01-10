import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';

// Interfaccia per gli articoli
export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
}

// Articoli del blog (hardcoded per ora)
export const articles: Article[] = [
  {
    id: '8',
    slug: 'booky-search-ricerca-intelligente-sentenze-ai',
    title: 'BOOKY SEARCH: La Ricerca Intelligente che Rivoluziona il Lavoro dell\'Avvocato',
    excerpt: 'Scopri BOOKY SEARCH, la nuova funzionalità di ITFPLUS che combina ricerca nel database e intelligenza artificiale. Descrivi il tuo caso e ottieni analisi, orientamenti giurisprudenziali e sentenze pertinenti in pochi secondi.',
    content: `
## BOOKY SEARCH: Il Futuro della Ricerca Giuridica è Qui

Immagina di poter descrivere il tuo caso a un collega esperto che conosce tutte le sentenze del database e in pochi secondi ti fornisce un'analisi completa con le sentenze più pertinenti. Questo è **BOOKY SEARCH**.

## Cos'è BOOKY SEARCH

BOOKY SEARCH è la nuova funzionalità di ITFPLUS che combina la potenza della ricerca full-text con l'intelligenza artificiale. Non devi più pensare alle parole chiave giuste: descrivi semplicemente il tuo caso in linguaggio naturale e lascia che l'AI faccia il resto.

## Come Funziona: Passo per Passo

### 1. Accedi a BOOKY SEARCH

Dal menu laterale, clicca su "BOOKY SEARCH" (contraddistinto dal badge BETA). Si aprirà un'interfaccia simile a ChatGPT, pulita e intuitiva.

### 2. Descrivi il Tuo Caso

Non serve conoscere le parole chiave perfette. Scrivi come parleresti a un collega:

- "Ho un cliente che ha subito un danno biologico del 15% in un sinistro stradale a Verona. L'assicurazione offre poco. Cosa dice la giurisprudenza?"
- "Sto seguendo un caso di licenziamento per giusta causa dove il dipendente ha usato i social media in modo inappropriato"
- "Cerco precedenti sulla nullità delle clausole abusive nei contratti bancari"

### 3. Ricevi l'Analisi Completa

BOOKY SEARCH:

1. **Cerca nel database** tutte le sentenze pertinenti usando algoritmi di ricerca avanzata
2. **Conta i risultati** e ti dice quante sentenze ha trovato
3. **Analizza gli orientamenti** giurisprudenziali emergenti
4. **Ti mostra le sentenze più rilevanti** con estratti significativi

### 4. Esplora i Risultati

Per ogni sentenza trovata puoi:

- **Visualizzare** il documento completo con un click
- **Salvare nei preferiti** per ritrovarla facilmente
- **Vedere il tribunale** di provenienza

### 5. Continua la Conversazione

Puoi fare domande di follow-up:

- "Ci sono sentenze più recenti?"
- "E per quanto riguarda la quantificazione del danno morale?"
- "Mostrami sentenze del Tribunale di Milano"

## La Tecnologia Dietro BOOKY SEARCH

### Ricerca Full-Text PostgreSQL

Il cuore di BOOKY SEARCH è un motore di ricerca ottimizzato per il linguaggio giuridico italiano. Quando scrivi la tua domanda:

1. L'AI estrae i concetti chiave dalla tua descrizione
2. Questi vengono trasformati in una query di ricerca
3. PostgreSQL cerca in millisecondi tra migliaia di sentenze
4. I risultati sono ordinati per rilevanza

### Intelligenza Artificiale

Dopo la ricerca, l'AI analizza i risultati e:

- Identifica i principi di diritto ricorrenti
- Riconosce gli orientamenti maggioritari e minoritari
- Suggerisce quali sentenze sono più utili per il tuo caso
- Spiega in modo chiaro cosa emerge dalla giurisprudenza

### Salvataggio delle Chat

Ogni conversazione viene salvata automaticamente. Nella sidebar trovi tutte le tue ricerche precedenti e puoi:

- Riprendere una conversazione passata
- Rivedere le sentenze trovate
- Eliminare le chat che non ti servono più

## Casi d'Uso Pratici

### Per l'Avvocato Civilista

"Sto preparando un atto di citazione per responsabilità medica. Il mio cliente ha subito danni durante un intervento chirurgico. Quali sono gli orientamenti sulla prova del nesso causale?"

BOOKY SEARCH ti mostrerà:
- Sentenze sulla responsabilità medica
- Focus sul nesso causale e onere della prova
- Distinzione tra inadempimento e danno

### Per l'Avvocato Penalista

"Devo difendere un imputato accusato di truffa aggravata. Cerco precedenti sulle attenuanti generiche in casi simili."

### Per l'Avvocato del Lavoro

"Il mio cliente è stato licenziato per scarso rendimento, ma non ha mai ricevuto contestazioni disciplinari. Cosa dice la Cassazione?"

### Per lo Studio Legale

"Stiamo valutando se accettare un caso di risarcimento danni da vacanza rovinata. Quali sono le prospettive di successo secondo la giurisprudenza recente?"

## Vantaggi Rispetto alla Ricerca Tradizionale

| Ricerca Tradizionale | BOOKY SEARCH |
|---------------------|--------------|
| Devi conoscere le parole chiave giuste | Descrivi il caso in linguaggio naturale |
| Risultati da filtrare manualmente | Analisi automatica dei risultati |
| Nessun contesto | Spiegazione degli orientamenti |
| Lista di documenti | Sentenze con estratti rilevanti |
| Ricerche perse | Chat salvate automaticamente |

## Perché BOOKY SEARCH è in BETA

Stiamo continuamente migliorando BOOKY SEARCH basandoci sul feedback degli utenti. La versione BETA ti permette di:

- Provare la funzionalità in anteprima
- Contribuire al miglioramento con i tuoi feedback
- Essere tra i primi a sfruttare questa innovazione

## Come Iniziare

1. **Accedi** a ITFPLUS con le tue credenziali
2. **Clicca** su "BOOKY SEARCH" nel menu laterale
3. **Descrivi** il tuo primo caso
4. **Scopri** un nuovo modo di fare ricerca giuridica

## Conclusioni

BOOKY SEARCH rappresenta un salto evolutivo nella ricerca giuridica. Non sostituisce il giurista, ma lo potenzia enormemente, permettendogli di trovare in secondi ciò che prima richiedeva ore.

La combinazione di ricerca avanzata e intelligenza artificiale rende ITFPLUS lo strumento più innovativo per i professionisti del diritto in Italia.

Prova BOOKY SEARCH oggi stesso e scopri come l'AI può trasformare il tuo modo di lavorare.

---

*BOOKY SEARCH è disponibile per tutti gli utenti ITFPLUS. Accedi ora e inizia la tua prima ricerca intelligente.*
    `,
    date: '2026-01-10',
    author: 'Team ITFPLUS',
    category: 'Novità',
    readTime: '8 min',
  },
  {
    id: '7',
    slug: 'convenzioni-ordini-avvocati-tribunali-italia',
    title: 'Convenzioni ITFPLUS con gli Ordini degli Avvocati: Accesso Agevolato per i Professionisti',
    excerpt: 'ITFPLUS ha stipulato convenzioni con numerosi Ordini degli Avvocati in tutta Italia. Scopri se il tuo Ordine è convenzionato e come accedere alla tariffa riservata di 500€ annui.',
    content: `
## Le Convenzioni ITFPLUS: Un Vantaggio Esclusivo per gli Avvocati

ITFPLUS crede nel valore della collaborazione istituzionale. Per questo abbiamo stipulato **convenzioni con numerosi Ordini degli Avvocati** su tutto il territorio nazionale, offrendo condizioni economiche agevolate ai professionisti iscritti.

## Tariffa Riservata agli Avvocati Convenzionati

Gli avvocati iscritti agli Ordini convenzionati possono accedere a ITFPLUS a una **tariffa speciale di 500€ annui**, rispetto al prezzo standard di 700€. Un risparmio significativo per accedere a tutte le funzionalità della piattaforma.

### Come Attivare la Convenzione

1. **Verifica** che il tuo Ordine sia nell'elenco sottostante
2. **Richiedi** la prova gratuita di 3 giorni
3. **Comunica** il tuo Ordine di appartenenza
4. **Attiva** l'abbonamento alla tariffa convenzionata

## Ordini degli Avvocati Convenzionati

### Unione Triveneta degli Ordini degli Avvocati

L'**Unione Triveneta** comprende 14 Ordini del Nord-Est Italia, tutti convenzionati con ITFPLUS:

- **Verona**
- **Vicenza**
- **Padova**
- **Venezia**
- **Treviso**
- **Belluno**
- **Rovigo**
- **Trieste**
- **Udine**
- **Gorizia**
- **Pordenone**
- **Bolzano**
- **Trento**
- **Rovereto**

### Altri Ordini Convenzionati

Oltre all'Unione Triveneta, ITFPLUS ha convenzioni attive con:

- **Asti**
- **Genova**
- **La Spezia**
- **Lodi**
- **Monza**
- **Fermo**
- **Velletri**

## Vantaggi della Convenzione

### Per l'Avvocato

- **Risparmio economico**: 500€ invece di 700€ annui
- **Accesso completo**: Tutte le funzionalità senza limitazioni
- **Supporto prioritario**: Assistenza dedicata
- **Aggiornamenti inclusi**: Nuove sentenze e funzionalità

### Per l'Ordine

- **Servizio per gli iscritti**: Un beneficio concreto per i propri associati
- **Formazione**: Possibilità di webinar formativi sulla piattaforma
- **Collaborazione**: Partnership per eventi e iniziative

## Il Tuo Ordine Non È in Elenco?

Stiamo lavorando per ampliare la rete di convenzioni. Se il tuo Ordine non è ancora convenzionato:

1. **Richiedi comunque la prova gratuita** per valutare la piattaforma
2. **Segnala l'interesse** al tuo Consiglio dell'Ordine
3. **Contattaci** per avviare una proposta di convenzione

## Come Richiedere Informazioni

Per informazioni sulle convenzioni o per proporre una nuova partnership:

- **Email**: info@itfplus.it
- **Telefono**: +39 333 617 0230
- **Form di contatto**: Sezione "Contattaci" sul sito

## Conclusioni

Le convenzioni con gli Ordini degli Avvocati rappresentano l'impegno di ITFPLUS nel rendere la ricerca giuridica accessibile a tutti i professionisti. Se sei iscritto a uno degli Ordini convenzionati, **approfitta della tariffa riservata di 500€** e inizia a lavorare con il database di sentenze più completo d'Italia.

---

*ITFPLUS: La giurisprudenza a portata di click, a un prezzo accessibile.*
    `,
    date: '2026-01-10',
    author: 'Team ITFPLUS',
    category: 'Convenzioni',
    readTime: '5 min',
  },
  {
    id: '6',
    slug: 'trial-gratuito-3-giorni-cosa-puoi-fare',
    title: 'Prova Gratuita di 3 Giorni: Tutto Quello che Puoi Fare con ITFPLUS',
    excerpt: 'Hai 3 giorni per esplorare ITFPLUS senza impegno. Ecco una guida pratica per sfruttare al massimo il periodo di prova e valutare se la piattaforma fa per te.',
    content: `
## Introduzione: Perché Offriamo una Prova Gratuita

Sappiamo che scegliere uno strumento di lavoro è una decisione importante. Per questo offriamo **3 giorni di prova gratuita** con accesso completo a tutte le funzionalità. Nessun trucco, nessun limite: provi tutto e poi decidi.

## Come Attivare la Prova Gratuita

### Passo 1: Richiedi l'Accesso

Dalla pagina di login, compila il form "Richiedi Trial" con:

- Nome e Cognome
- Email professionale
- Numero di telefono
- Ordine di appartenenza (se applicabile)
- Una breve descrizione delle tue esigenze

### Passo 2: Ricevi le Credenziali

Entro poche ore riceverai via email le tue credenziali di accesso. Il trial parte dal momento del primo login.

### Passo 3: Esplora la Piattaforma

Hai 72 ore per provare tutto. Ecco cosa ti consigliamo di fare.

## Giorno 1: Scopri il Motore di Ricerca

### Prova la Ricerca Testuale

Inizia cercando temi che ti interessano professionalmente:

- Cerca per parole chiave generiche come "risarcimento danni"
- Prova ricerche più specifiche come "danno biologico sinistro stradale"
- Cerca citazioni normative come "art. 2043 c.c."

### Esplora i Filtri per Città

Se lavori principalmente in un tribunale:

1. Esegui una ricerca
2. Attiva i filtri avanzati
3. Seleziona la tua città
4. Osserva come cambiano i risultati

### Valuta la Velocità

Nota quanto è veloce ottenere risultati. Confronta con gli strumenti che usi attualmente.

## Giorno 2: Conosci Booky, l'Assistente AI

### Apri una Sentenza e Attiva Booky

Quando visualizzi una sentenza, troverai l'icona di Booky. Cliccala e inizia a fare domande:

- "Riassumi questa sentenza in 5 punti"
- "Qual è il principio di diritto?"
- "Quali articoli di legge vengono citati?"

### Prova la Modalità Vocale

Novità 2026: puoi **parlare con Booky** come in una telefonata:

1. Clicca sull'icona del telefono nella chat
2. Parla la tua domanda
3. Booky risponderà a voce

Perfetto per quando hai le mani occupate o preferisci un'interazione più naturale.

### Testa Diverse Tipologie di Domande

Booky può:
- Riassumere
- Spiegare concetti giuridici
- Estrarre citazioni
- Confrontare passaggi

## Giorno 3: Organizza e Valuta

### Crea la Tua Lista di Preferiti

Salva le sentenze che trovi utili:

1. Clicca sull'icona cuore su una sentenza
2. Vai nella sezione "Preferiti" per rivederle
3. Inizia a costruire il tuo archivio personale

### Valuta l'Utilità per il Tuo Lavoro

Poniti queste domande:

- Ho trovato sentenze che non conoscevo?
- Il motore di ricerca è più veloce di quello che uso ora?
- Booky mi ha fatto risparmiare tempo?
- La piattaforma è facile da usare?

### Contatta il Supporto

Se hai dubbi o domande, contattaci. Il supporto è attivo anche durante il trial.

## Cosa Succede Dopo i 3 Giorni?

### Se Vuoi Continuare

Attiva l'abbonamento e mantieni tutti i preferiti e le impostazioni salvate durante il trial.

Se sei iscritto a un **Ordine convenzionato**, ricorda di comunicarlo per ottenere la tariffa agevolata di 500€ invece di 700€.

### Se Non Vuoi Continuare

Nessun problema. Il tuo account verrà disattivato automaticamente. Non ti verrà addebitato nulla.

## Domande Frequenti sul Trial

### Devo inserire una carta di credito?

No. La prova è completamente gratuita e non richiede dati di pagamento.

### Posso prolungare il trial?

In casi particolari, contattaci e valuteremo insieme.

### I preferiti salvati durante il trial rimangono?

Sì, se attivi l'abbonamento tutto ciò che hai salvato rimane.

### Posso usare il trial da mobile?

Assolutamente sì. ITFPLUS è responsive e funziona su smartphone e tablet.

## Conclusioni

3 giorni sono sufficienti per capire se ITFPLUS può migliorare il tuo lavoro quotidiano. **Provalo senza impegno** e scopri un nuovo modo di fare ricerca giuridica.

---

*ITFPLUS: Prova gratis, scegli consapevolmente.*
    `,
    date: '2026-01-10',
    author: 'Team ITFPLUS',
    category: 'Guide',
    readTime: '6 min',
  },
  {
    id: '5',
    slug: 'digitalizzazione-studio-legale-itfplus',
    title: 'Digitalizzazione dello Studio Legale: Come ITFPLUS Semplifica la Ricerca Giuridica',
    excerpt: 'Scopri come la digitalizzazione sta trasformando gli studi legali e come ITFPLUS offre strumenti concreti per la ricerca e l\'analisi delle sentenze.',
    content: `
## La Trasformazione Digitale del Lavoro Legale

Il settore legale sta vivendo una trasformazione digitale senza precedenti. Ciò che prima richiedeva ore di ricerca in biblioteca o la consultazione di pesanti volumi cartacei, oggi può essere fatto in pochi click.

ITFPLUS si inserisce in questa trasformazione offrendo **strumenti pratici e immediati** per la ricerca giuridica quotidiana.

## Le Funzionalità Digitali di ITFPLUS

### Motore di Ricerca Full-Text

Il cuore di ITFPLUS è il motore di ricerca che indicizza **l'intero contenuto di ogni sentenza**:

- **Ricerca per parole chiave**: Trova sentenze che contengono i termini che ti interessano
- **Ricerca in linguaggio naturale**: Scrivi come parleresti a un collega
- **Risultati istantanei**: Risposte in meno di un secondo

### Filtri per Tribunale e Città

Una funzionalità particolarmente apprezzata dai professionisti:

- **Filtra per città**: Seleziona uno o più tribunali di interesse
- **Conosci la giurisprudenza locale**: Scopri come decide il tribunale dove operi
- **Confronta orientamenti**: Vedi come diverse corti affrontano lo stesso tema

### Evidenziazione dei Termini Cercati

Quando apri una sentenza dai risultati di ricerca:

- I **termini cercati sono evidenziati in verde** nel testo
- Trovi subito i passaggi rilevanti
- Risparmi tempo nella lettura

### Gestione dei Preferiti

Costruisci il tuo archivio personale di sentenze:

- **Salva con un click**: Clicca sull'icona cuore per salvare una sentenza
- **Organizza**: Accedi rapidamente alle sentenze salvate dalla sezione Preferiti
- **Sempre disponibili**: I tuoi preferiti sono sincronizzati e accessibili da qualsiasi dispositivo

### Booky: L'Assistente AI

L'intelligenza artificiale integrata in ogni sentenza:

- **Riassunti automatici**: Chiedi a Booky di riassumere una sentenza
- **Domande specifiche**: Fai domande sul contenuto del documento
- **Spiegazioni**: Chiedi chiarimenti su passaggi complessi
- **Estrazione informazioni**: Richiedi l'elenco degli articoli citati o dei precedenti

### Modalità Vocale

Novità del 2026: puoi **parlare con Booky**:

- Clicca sull'icona del telefono nella chat
- Parla la tua domanda
- Booky risponde a voce
- Interazione naturale e mani libere

## Accessibilità Ovunque

### Da Computer

L'esperienza completa su desktop con:
- Visualizzazione ottimale dei documenti
- Tutte le funzionalità disponibili
- Spazio di lavoro ampio

### Da Tablet e Smartphone

ITFPLUS è **responsive**:
- Funziona perfettamente su mobile
- Interfaccia adattata allo schermo
- Ricerca e consultazione anche in tribunale

## Sicurezza e Privacy

### Protezione dei Dati

- **Connessione sicura**: Protocollo HTTPS
- **Autenticazione**: Accesso con credenziali personali
- **Privacy**: I tuoi dati non vengono condivisi

### Conformità GDPR

ITFPLUS rispetta la normativa europea sulla protezione dei dati personali.

## Supporto e Assistenza

### Canali di Supporto

- **Email**: info@itfplus.it
- **Telefono**: +39 333 617 0230
- **Sezione FAQ**: Risposte alle domande frequenti

### Contatti Rapidi

Dalla piattaforma puoi accedere rapidamente a:
- Assistenza tecnica
- Domande frequenti
- Form di contatto

## Perché Scegliere ITFPLUS

### Strumenti Concreti

Non promesse vaghe, ma funzionalità che usi ogni giorno:
- Ricerca veloce
- Filtri efficaci
- AI che risponde alle tue domande

### Semplicità d'Uso

Interfaccia pulita e intuitiva:
- Nessuna formazione necessaria
- Impari usando
- Tutto a portata di click

### Prova Senza Rischi

3 giorni di trial gratuito per valutare personalmente.

## Conclusioni

La digitalizzazione non è il futuro: è il presente. ITFPLUS offre gli strumenti per affrontarla con **semplicità ed efficacia**.

Prova gratuitamente per 3 giorni e scopri come la ricerca giuridica può essere più semplice.

---

*ITFPLUS: La ricerca giuridica del presente.*
    `,
    date: '2026-01-10',
    author: 'Team ITFPLUS',
    category: 'Innovazione',
    readTime: '7 min',
  },
  {
    id: '4',
    slug: 'booky-assistente-ai-sentenze-giuridiche',
    title: 'Booky: L\'Assistente AI Rivoluzionario per l\'Analisi delle Sentenze Giuridiche',
    excerpt: 'Scopri Booky, l\'intelligenza artificiale integrata in ITFPLUS che ti aiuta a comprendere, analizzare e interpretare le sentenze in tempo reale. Un assistente virtuale pensato per avvocati e professionisti del diritto.',
    content: `
## Introduzione a Booky: L'Intelligenza Artificiale al Servizio del Diritto

Nel mondo giuridico moderno, la quantità di informazioni da elaborare è in costante crescita. **Booky** nasce come risposta a questa sfida: un assistente AI avanzato, integrato direttamente in ogni sentenza della piattaforma ITFPLUS, progettato per supportare avvocati, giuristi e professionisti del diritto nell'analisi e comprensione dei documenti legali.

## Cos'è Booky e Come Funziona

**Booky** è un chatbot basato su intelligenza artificiale che appare automaticamente quando apri qualsiasi sentenza su ITFPLUS. Non si tratta di un semplice assistente generico: Booky è contestualizzato sulla sentenza specifica che stai leggendo, il che significa che può rispondere a domande precise sul documento che hai davanti.

### Tecnologia alla Base di Booky

Booky utilizza tecnologie di **Natural Language Processing (NLP)** e **Large Language Models (LLM)** di ultima generazione per:

- **Comprendere il contesto giuridico**: Booky è addestrato su terminologia legale italiana
- **Analizzare il testo della sentenza**: Estrae automaticamente i punti salienti
- **Rispondere in linguaggio naturale**: Puoi fare domande come parleresti a un collega
- **Citare le fonti**: Ogni risposta fa riferimento a parti specifiche del documento

## Come Utilizzare Booky: Guida Pratica

### Passo 1: Apri una Sentenza

Accedi alla piattaforma ITFPLUS, cerca la sentenza di tuo interesse e aprila nel visualizzatore documenti.

### Passo 2: Attiva la Chat con Booky

Troverai l'icona di Booky nell'angolo della schermata. Cliccaci sopra per aprire la finestra di chat.

### Passo 3: Fai le Tue Domande

Ecco alcuni esempi di domande che puoi porre a Booky:

- *"Qual è il principio di diritto enunciato in questa sentenza?"*
- *"Riassumi i fatti del caso in 5 punti"*
- *"Quali sono i precedenti giurisprudenziali citati?"*
- *"Come si è espressa la Corte sulla questione della prescrizione?"*
- *"Quali articoli di legge vengono applicati?"*
- *"Estrai le massime giurisprudenziali"*

### Passo 4: Approfondisci

Booky può continuare la conversazione. Se una risposta non è chiara, chiedi chiarimenti o approfondimenti specifici.

## Vantaggi di Booky per i Professionisti del Diritto

### 1. Risparmio di Tempo

Leggere e analizzare una sentenza complessa può richiedere ore. Con Booky, puoi ottenere un riassunto dei punti chiave in pochi secondi, permettendoti di valutare rapidamente la rilevanza del documento per il tuo caso.

### 2. Comprensione Approfondita

Booky non si limita a riassumere: può spiegare concetti giuridici complessi, contestualizzare le decisioni della Corte e aiutarti a comprendere le sfumature interpretative.

### 3. Estrazione Automatica di Informazioni

Hai bisogno di estrarre tutte le norme citate? O tutti i precedenti giurisprudenziali? Booky può farlo per te in un istante.

### 4. Supporto alla Ricerca

Se stai preparando una memoria difensiva o un parere, Booky può aiutarti a identificare i passaggi più rilevanti da citare.

### 5. Accessibilità 24/7

A differenza di un collaboratore umano, Booky è sempre disponibile, anche alle 3 di notte prima di un'udienza importante.

## Casi d'Uso Pratici

### Per l'Avvocato Penalista

*"Booky, in questa sentenza come ha valutato la Corte l'elemento soggettivo del reato? Ci sono riferimenti a sentenze della Cassazione?"*

### Per l'Avvocato Civilista

*"Quali sono i criteri di quantificazione del danno applicati in questa sentenza? Sono conformi agli orientamenti più recenti?"*

### Per il Praticante

*"Puoi spiegarmi cosa si intende per 'giudicato implicito' come usato in questa sentenza?"*

### Per lo Studio Legale

*"Estrai un riassunto di 200 parole di questa sentenza da inserire nel nostro database interno"*

## Sicurezza e Privacy

Booky opera nel rispetto della privacy:

- **I dati delle conversazioni non vengono utilizzati per addestrare il modello**
- **Le chat sono private e non vengono condivise**
- **Conformità GDPR garantita**

## Il Futuro di Booky

Il team ITFPLUS lavora costantemente per migliorare Booky. Nelle prossime versioni prevediamo:

- **Confronto tra sentenze**: Booky potrà comparare più sentenze tra loro
- **Suggerimenti proattivi**: Booky suggerirà sentenze correlate
- **Generazione di bozze**: Supporto nella redazione di atti
- **Integrazione con gestionali**: Export diretto verso i software di studio

## Conclusioni

**Booky rappresenta il futuro dell'assistenza legale digitale**. Non sostituisce il giurista, ma lo potenzia, permettendogli di lavorare in modo più efficiente e informato.

Prova Booky oggi stesso su ITFPLUS. Apri una sentenza e inizia a fare domande: scoprirai un nuovo modo di lavorare con i documenti giuridici.

---

*Booky è disponibile per tutti gli utenti ITFPLUS. Richiedi la tua prova gratuita di 3 giorni per scoprire come l'AI può trasformare il tuo lavoro quotidiano.*
    `,
    date: '2026-01-08',
    author: 'Team ITFPLUS',
    category: 'Intelligenza Artificiale',
    readTime: '8 min',
  },
  {
    id: '3',
    slug: 'motore-ricerca-sentenze-piu-potente-italia',
    title: 'Il Motore di Ricerca per Sentenze Più Potente d\'Italia: Tecnologia e Funzionalità',
    excerpt: 'Scopri la tecnologia dietro il motore di ricerca ITFPLUS: full-text search, filtri avanzati, ricerca per tribunale e molto altro. Come trovare la sentenza giusta in pochi secondi.',
    content: `
## Introduzione: Perché il Motore di Ricerca è Fondamentale

Nel lavoro quotidiano di un avvocato o di un professionista del diritto, **trovare la sentenza giusta al momento giusto può fare la differenza tra vincere e perdere una causa**. Il motore di ricerca di ITFPLUS è stato progettato con un unico obiettivo: permetterti di trovare esattamente ciò che cerchi nel minor tempo possibile.

## La Tecnologia Behind the Scenes

### Full-Text Search: Ricerca nel Contenuto Completo

A differenza di molti database giuridici che permettono solo la ricerca per titolo o metadati, **ITFPLUS indicizza l'intero contenuto di ogni sentenza**. Questo significa che puoi cercare:

- **Frasi specifiche**: Cerca "danno da perdita di chance" e troverai tutte le sentenze che contengono questa espressione
- **Combinazioni di termini**: Usa operatori logici per ricerche complesse
- **Citazioni normative**: Cerca "art. 2043 c.c." per trovare tutte le sentenze che citano quell'articolo

### Algoritmo di Ranking Intelligente

Non basta trovare le sentenze: bisogna mostrarle nell'ordine giusto. Il nostro algoritmo considera:

- **Rilevanza testuale**: Quanto il documento corrisponde alla tua ricerca
- **Frequenza dei termini**: Quante volte appaiono i termini cercati
- **Posizione dei termini**: I termini nel titolo o nei principi di diritto pesano di più
- **Attualità**: Le sentenze più recenti hanno priorità a parità di rilevanza

### Indicizzazione in Tempo Reale

Quando una nuova sentenza viene aggiunta al database, è **immediatamente ricercabile**. Non ci sono ritardi di indicizzazione: ciò che è nel sistema, è trovabile.

## Funzionalità di Ricerca Avanzate

### 1. Ricerca Semplice

La barra di ricerca principale accetta qualsiasi query in linguaggio naturale:

- \`risarcimento danni sinistro stradale\`
- \`licenziamento per giusta causa\`
- \`nullità contratto bancario\`

### 2. Filtro per Città/Tribunale

Una delle funzionalità più apprezzate: **filtra le sentenze per tribunale di provenienza**. 

Perché è importante?
- **Giurisprudenza locale**: Conosci l'orientamento del tribunale dove operi
- **Precedenti specifici**: Trova sentenze dello stesso giudice o sezione
- **Analisi territoriale**: Confronta come diverse corti affrontano lo stesso tema

Come usarlo:
1. Esegui la tua ricerca
2. Clicca su "Filtri avanzati"
3. Seleziona una o più città
4. I risultati si aggiornano istantaneamente

### 3. Ricerca Combinata

Combina ricerca testuale e filtri per risultati ultra-precisi:

*Esempio*: Cerchi sentenze sul danno biologico emesse dal Tribunale di Milano negli ultimi 2 anni? Con ITFPLUS è una ricerca di 10 secondi.

### 4. Evidenziazione dei Risultati

Quando apri una sentenza dai risultati di ricerca, **i termini cercati sono evidenziati in verde** direttamente nel testo. Non devi più scorrere pagine cercando dove appare la parola che ti interessa.

## Confronto con Altri Motori di Ricerca Giuridici

| Funzionalità | ITFPLUS | Altri Database |
|--------------|---------|----------------|
| Full-text search | ✅ Completo | ⚠️ Spesso limitato |
| Filtro per tribunale | ✅ Sì | ❌ Raramente |
| Evidenziazione termini | ✅ Automatica | ❌ No |
| Velocità | ✅ < 1 secondo | ⚠️ Variabile |
| AI integrata (Booky) | ✅ Sì | ❌ No |
| Aggiornamento | ✅ Tempo reale | ⚠️ Periodico |

## Consigli per Ricerche Efficaci

### 1. Sii Specifico ma Non Troppo

- ❌ Troppo generico: \`contratto\`
- ❌ Troppo specifico: \`contratto di compravendita immobiliare con clausola risolutiva espressa per inadempimento del venditore relativo a vizi occulti\`
- ✅ Giusto equilibrio: \`compravendita immobiliare vizi occulti\`

### 2. Usa Termini Giuridici Corretti

Il motore comprende il linguaggio giuridico. Usa la terminologia tecnica:

- \`inadempimento contrattuale\` invece di \`non ha rispettato il contratto\`
- \`legittimazione attiva\` invece di \`può fare causa\`

### 3. Prova Sinonimi

Se non trovi risultati, prova sinonimi o formulazioni alternative:

- \`risarcimento\` / \`indennizzo\` / \`ristoro\`
- \`recesso\` / \`disdetta\` / \`risoluzione\`

### 4. Sfrutta i Filtri

Dopo una ricerca ampia, usa i filtri per restringere:
- Prima cerca \`responsabilità medica\`
- Poi filtra per il tribunale di tuo interesse

## Performance e Affidabilità

### Velocità

- **Tempo medio di risposta**: < 500ms
- **Caricamento risultati**: Istantaneo con paginazione
- **Nessun limite di ricerche**: Cerca quanto vuoi

### Uptime

- **Disponibilità**: 99.9%
- **Backup continui**: I tuoi preferiti e le tue ricerche sono al sicuro
- **Supporto tecnico**: Assistenza dedicata per problemi

## Il Futuro del Motore di Ricerca

Stiamo lavorando su:

- **Ricerca semantica**: Capire il significato, non solo le parole
- **Suggerimenti automatici**: "Forse cercavi..."
- **Ricerche salvate**: Salva le tue query frequenti
- **Alert automatici**: Ricevi notifiche quando escono nuove sentenze sul tuo tema

## Conclusioni

Il motore di ricerca ITFPLUS non è solo un database: è uno **strumento di lavoro progettato da giuristi per giuristi**. Ogni funzionalità è pensata per farti risparmiare tempo e trovare esattamente ciò che ti serve.

**Provalo gratuitamente per 3 giorni** e scopri la differenza che un motore di ricerca professionale può fare nel tuo lavoro quotidiano.

---

*ITFPLUS: La ricerca giuridica come dovrebbe essere.*
    `,
    date: '2026-01-08',
    author: 'Team ITFPLUS',
    category: 'Tecnologia',
    readTime: '10 min',
  },
  {
    id: '2',
    slug: 'guida-completa-sentenze-come-leggerle-analizzarle',
    title: 'Guida Completa alle Sentenze: Come Leggerle, Analizzarle e Utilizzarle nel Tuo Lavoro',
    excerpt: 'Tutto quello che devi sapere sulle sentenze giuridiche: struttura, come leggerle efficacemente, come citarle correttamente e come sfruttarle al meglio con ITFPLUS.',
    content: `
## Introduzione: L'Importanza delle Sentenze nella Pratica Legale

Le sentenze rappresentano il **cuore della giurisprudenza**. Sono la fonte primaria per comprendere come i giudici interpretano e applicano le norme, e costituiscono uno strumento indispensabile per qualsiasi professionista del diritto. In questa guida completa, esploreremo tutto ciò che c'è da sapere sulle sentenze e su come ITFPLUS ti aiuta a lavorare con esse.

## La Struttura di una Sentenza Italiana

Ogni sentenza segue una struttura codificata che, una volta compresa, rende la lettura molto più efficiente.

### 1. Intestazione (Epigrafe)

Contiene:
- **Autorità giudiziaria**: Tribunale, Corte d'Appello, Cassazione, ecc.
- **Sezione**: Es. "Sezione Lavoro", "Sezione Civile III"
- **Numero e anno**: Es. "Sentenza n. 1234/2025"
- **Data di pubblicazione**
- **Composizione del collegio o nome del giudice monocratico**

### 2. Svolgimento del Processo (Fatto)

Questa sezione narra:
- **Chi sono le parti**: Attore/ricorrente e convenuto/resistente
- **Cosa è successo**: I fatti che hanno dato origine alla controversia
- **Iter processuale**: Le fasi precedenti del giudizio
- **Domande delle parti**: Cosa chiedono attore e convenuto

### 3. Motivi della Decisione (Diritto)

Il cuore della sentenza:
- **Questioni giuridiche**: I problemi di diritto da risolvere
- **Interpretazione delle norme**: Come il giudice legge le leggi applicabili
- **Precedenti citati**: Altre sentenze richiamate
- **Ragionamento logico-giuridico**: Come si arriva alla decisione

### 4. Dispositivo

La decisione vera e propria:
- **Accoglimento/rigetto** della domanda
- **Condanne**: Pagamenti, risarcimenti, obblighi di fare
- **Spese processuali**: Chi paga i costi del processo

## Come Leggere Efficacemente una Sentenza

### Strategia 1: Lettura a Imbuto

1. **Leggi prima il dispositivo**: Capisci subito come è finita
2. **Scorri l'intestazione**: Comprendi il contesto
3. **Leggi i motivi della decisione**: Il ragionamento del giudice
4. **Approfondisci il fatto se necessario**: Solo se ti serve il contesto fattuale

### Strategia 2: Ricerca Mirata con ITFPLUS

Se stai cercando un principio specifico:

1. Usa il motore di ricerca con termini precisi
2. Apri la sentenza
3. I **termini cercati sono evidenziati in verde**
4. Vai direttamente ai passaggi rilevanti
5. Usa **Booky** per chiedere chiarimenti

### Strategia 3: Analisi Comparativa

Quando devi confrontare più sentenze:

1. Cerca il tema su ITFPLUS
2. Salva nei preferiti le sentenze rilevanti
3. Apri ciascuna e usa Booky per estrarre i principi
4. Confronta gli orientamenti

## Le Sentenze su ITFPLUS: Funzionalità Specifiche

### Visualizzatore Integrato

Non devi scaricare PDF o aprire programmi esterni:

- **Lettura nel browser**: Apri e leggi direttamente online
- **Zoom e navigazione**: Adatta la visualizzazione alle tue esigenze
- **Responsive**: Funziona anche su tablet e smartphone

### Evidenziazione Automatica

Quando arrivi da una ricerca:

- I **termini cercati sono evidenziati** nel testo
- Trovi subito i passaggi pertinenti
- Risparmi tempo nella lettura

### Preferiti

Costruisci il tuo archivio personale:

- **Salva** le sentenze importanti con un click
- **Organizza** la tua giurisprudenza di riferimento
- **Accedi rapidamente** quando ti servono

### Booky: L'Assistente AI

Per ogni sentenza hai Booky a disposizione:

- Chiedi riassunti
- Fai domande specifiche
- Estrai citazioni e principi
- Comprendi passaggi complessi

## Come Citare Correttamente una Sentenza

### Formato Standard

> Cass. civ., Sez. III, 15 marzo 2025, n. 1234

Elementi:
- **Autorità**: Cass. civ. (Cassazione civile), Trib. Milano, App. Roma, ecc.
- **Sezione**: Se rilevante
- **Data**: Giorno, mese, anno
- **Numero**: Numero della sentenza

### Nelle Memorie Difensive

*"Come affermato dalla Suprema Corte, 'il danno da perdita di chance richiede la prova, anche presuntiva, della concreta possibilità di conseguire il risultato utile' (Cass. civ., Sez. III, 15 marzo 2025, n. 1234)."*

### Nei Pareri

Quando citi più sentenze sullo stesso punto:

*"L'orientamento consolidato della giurisprudenza di legittimità (cfr. Cass. n. 1234/2025, Cass. n. 5678/2024, Cass. n. 9012/2023) afferma che..."*

## Tipologie di Sentenze e Loro Valore

### Sentenze della Cassazione

- **Massimo valore precedenziale**
- Vincolanti per l'interpretazione del diritto
- Le Sezioni Unite hanno autorità superiore

### Sentenze di Merito

- **Valore persuasivo** ma non vincolante
- Utili per conoscere orientamenti locali
- Importanti per prevedere esiti in tribunali specifici

### Ordinanze e Decreti

- Spesso su questioni procedurali
- Minore approfondimento motivazionale
- Comunque utili per prassi applicative

## Errori Comuni da Evitare

### 1. Citare Sentenze Superate

Verifica sempre che l'orientamento sia ancora attuale. ITFPLUS ti aiuta mostrando le sentenze più recenti in cima ai risultati.

### 2. Decontestualizzare

Non estrapolare frasi dal contesto. Leggi sempre il ragionamento completo per capire se è applicabile al tuo caso.

### 3. Ignorare la Giurisprudenza Contraria

Un buon avvocato conosce anche gli orientamenti sfavorevoli. Cerca sempre anche l'altro punto di vista.

### 4. Non Verificare le Fonti

Controlla sempre che la sentenza citata dalla controparte dica davvero ciò che sostiene.

## ITFPLUS: Il Tuo Alleato per le Sentenze

### Database Sempre Aggiornato

Nuove sentenze aggiunte costantemente, indicizzate in tempo reale.

### Ricerca Potente

Trova ciò che cerchi in secondi, non in ore.

### AI Integrata

Booky ti aiuta a comprendere e analizzare ogni sentenza.

### Accessibile Ovunque

Da computer, tablet o smartphone. In studio o in tribunale.

## Conclusioni

Lavorare con le sentenze è un'arte che richiede metodo, esperienza e gli strumenti giusti. **ITFPLUS combina un database completo, un motore di ricerca potente e l'assistenza dell'intelligenza artificiale** per offrirti tutto ciò di cui hai bisogno.

Non perdere tempo con ricerche inefficienti. Prova ITFPLUS gratuitamente per 3 giorni e scopri un nuovo modo di lavorare con la giurisprudenza.

---

*ITFPLUS: La giurisprudenza a portata di click.*
    `,
    date: '2026-01-08',
    author: 'Team ITFPLUS',
    category: 'Guide',
    readTime: '12 min',
  },
  {
    id: '1',
    slug: 'come-funziona-itfplus',
    title: 'Come funziona ITFPLUS: Guida Introduttiva alla Piattaforma',
    excerpt: 'Scopri come utilizzare al meglio ITFPLUS per la ricerca e consultazione di documenti giuridici. Una guida passo-passo per professionisti del diritto.',
    content: `
## Introduzione

**ITFPLUS** è la piattaforma di documentazione giuridica pensata per avvocati, studi legali e professionisti del diritto. Offre accesso rapido e sicuro a una vasta collezione di sentenze e documenti legali.

## Come accedere alla piattaforma

1. **Registrazione**: Visita la pagina di login e richiedi una prova gratuita di 3 giorni
2. **Credenziali**: Riceverai via email le credenziali di accesso
3. **Primo accesso**: Effettua il login con email e password ricevute

## Funzionalità principali

### Motore di ricerca avanzato

Il cuore di ITFPLUS è il potente motore di ricerca che permette di:

- **Ricerca testuale**: Cerca per parole chiave nel titolo e nel contenuto dei documenti
- **Filtro per città**: Filtra i risultati per tribunale/città di riferimento
- **Ricerca combinata**: Combina più filtri per risultati più precisi

### Gestione dei Preferiti

Salva i documenti più importanti nei tuoi preferiti per accedervi rapidamente:

- Clicca sull'icona cuore per aggiungere un documento ai preferiti
- Accedi alla sezione "Preferiti" dal menu per visualizzarli tutti
- Rimuovi un documento dai preferiti con un altro click

### Visualizzatore documenti

Il visualizzatore integrato permette di:

- Leggere i documenti direttamente nella piattaforma
- Evidenziare i termini di ricerca nel testo
- Navigare facilmente tra le pagine

## Assistenza e supporto

Per qualsiasi domanda o problema:

- **Email**: info@itfplus.it
- **Telefono**: +39 333 617 0230
- **Sezione FAQ**: Consulta le domande frequenti

## Convenzioni e tribunali

ITFPLUS collabora con diversi tribunali italiani per offrire un archivio sempre aggiornato. Resta sintonizzato sul nostro blog per le ultime novità sulle convenzioni istituite.

---

*Il team ITFPLUS è a tua disposizione per aiutarti a sfruttare al meglio la piattaforma.*
    `,
    date: '2026-01-08',
    author: 'Team ITFPLUS',
    category: 'Guide',
    readTime: '5 min',
  },
];

const BlogPage: React.FC = () => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontFamily: '"Libre Baskerville", Georgia, serif',
            fontWeight: 700,
            color: 'var(--primary-color)',
            mb: 2,
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
          }}
        >
          Blog
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'var(--text-secondary)',
            maxWidth: 600,
            mx: 'auto',
            fontSize: { xs: '0.95rem', md: '1.05rem' },
          }}
        >
          News, guide e aggiornamenti sulla piattaforma ITFPLUS e sul mondo giuridico
        </Typography>
      </Box>

      {/* Lista articoli */}
      <Grid container spacing={3}>
        {articles.map((article) => (
          <Grid item xs={12} md={6} lg={4} key={article.id}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                border: '1px solid var(--border-light)',
                borderRadius: '4px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'var(--primary-color)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                },
              }}
            >
              <CardActionArea
                component={Link}
                to={`/blog/${article.slug}`}
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Categoria */}
                  <Chip
                    label={article.category}
                    size="small"
                    sx={{
                      mb: 2,
                      backgroundColor: 'rgba(27, 42, 74, 0.08)',
                      color: 'var(--primary-color)',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      borderRadius: '4px',
                    }}
                  />

                  {/* Titolo */}
                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{
                      fontFamily: '"Libre Baskerville", Georgia, serif',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      mb: 2,
                      fontSize: { xs: '1rem', md: '1.1rem' },
                      lineHeight: 1.4,
                    }}
                  >
                    {article.title}
                  </Typography>

                  {/* Excerpt */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--text-secondary)',
                      mb: 3,
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {article.excerpt}
                  </Typography>

                  {/* Footer card */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pt: 2,
                      borderTop: '1px solid var(--border-light)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarIcon sx={{ fontSize: 16, color: 'var(--text-tertiary)' }} />
                      <Typography
                        variant="caption"
                        sx={{ color: 'var(--text-tertiary)' }}
                      >
                        {formatDate(article.date)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{ 
                          color: 'var(--primary-color)', 
                          fontWeight: 600,
                        }}
                      >
                        Leggi
                      </Typography>
                      <ArrowIcon sx={{ fontSize: 16, color: 'var(--primary-color)' }} />
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Se non ci sono articoli */}
      {articles.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 3,
            border: '1px dashed var(--border-light)',
            borderRadius: '4px',
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Nessun articolo disponibile al momento
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default BlogPage;


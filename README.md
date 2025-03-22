# ITFPlus - Piattaforma di Gestione Documenti

ITFPlus è una piattaforma web completa per la gestione, consultazione e analisi di documenti legali. Offre un'interfaccia moderna per visualizzare, gestire e consultare documenti con l'assistenza di intelligenza artificiale.

## Caratteristiche Principali

- **Autenticazione Sicura**: Sistema di login con JWT e gestione ruoli (Admin/Utente)
- **Gestione Documenti**: Upload, visualizzazione e download di documenti PDF
- **Ricerca Avanzata**: Ricerca per titolo, contenuto o città di riferimento
- **Chat AI Integrata**: Interazione con i documenti tramite modelli AI di Perplexity
- **Pannello Amministrativo**: Gestione utenti, statistiche e monitoraggio
- **Database PostgreSQL**: Archiviazione dati su Neon Serverless Postgres
- **Responsive Design**: Interfaccia adattiva per desktop e dispositivi mobili

## Struttura del Progetto

Il progetto è strutturato in due componenti principali:

### Server (Backend)

- Framework: Express.js con Node.js
- Database: PostgreSQL con Prisma ORM
- API RESTful: Endpoint completi per tutte le funzionalità
- Middleware: Autenticazione JWT, logging, gestione upload
- Servizi: Email, elaborazione PDF, AI Chatbot

### Client (Frontend)

- Framework: React con TypeScript
- UI: Material-UI per componenti moderni
- State Management: Context API
- Routing: React Router
- Componenti principali:
  - Visualizzatore PDF
  - Chat AI
  - Dashboard utente e admin
  - Gestione profilo

## Requisiti di Sistema

- Node.js v18+
- PostgreSQL (o connessione a Neon Database)
- 1GB RAM minimo
- 1GB spazio su disco (esclusi documenti archiviati)

## Installazione

### Configurazione Server

1. Naviga nella directory server:
```bash
cd server
```

2. Installa le dipendenze:
```bash
npm install
```

3. Configura le variabili d'ambiente nel file `.env`:
```
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
PORT=8000
JWT_SECRET=your_jwt_secret
PERPLEXITY_API_KEY=your_perplexity_api_key
EMAIL_HOST=your_email_host
EMAIL_PORT=465
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
EMAIL_TO=default_contact_email
EMAIL_SECURE=true
```

4. Avvia il server:
```bash
npm start
```

### Configurazione Client

1. Naviga nella directory client:
```bash
cd client
```

2. Installa le dipendenze:
```bash
npm install
npm install @jridgewell/sourcemap-codec
```

3. Avvia il client:
```bash
npm start
```

## Deployment

Il progetto è configurato per il deployment su:
- Render.com (sia frontend che backend)
- Heroku (configurazione alternativa)

### Variabili d'ambiente per produzione

Oltre alle variabili di base, in produzione configurare:
- `NODE_ENV=production`
- `APP_URL=https://your-production-url.com`

## Autenticazione

- **Admin Default**: admin@itfplus.it / admin123
- La piattaforma supporta registrazione utenti da parte degli amministratori

## Licenza

Tutti i diritti riservati © 2025 ITFPlus

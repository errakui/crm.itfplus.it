# ITF Plus - Sistema di Gestione Documenti

Sistema di gestione documenti sviluppato per ITF Plus, che permette agli utenti di cercare, visualizzare e gestire documenti PDF.

## Funzionalità

- Autenticazione utenti (login/registrazione)
- Gestione documenti PDF
- Ricerca documenti per titolo, descrizione e parole chiave
- Gestione preferiti
- Sistema di supporto
- Chatbot integrato
- Pannello amministratore
- Gestione utenti
- Upload bulk di documenti

## Tecnologie Utilizzate

- Frontend: React.js
- Backend: Node.js con Express
- Database: PostgreSQL
- ORM: Prisma
- Autenticazione: JWT
- Hosting: Vercel

## Requisiti di Sistema

- Node.js >= 14.x
- PostgreSQL >= 12.x
- npm o yarn

## Installazione

1. Clona il repository:
```bash
git clone https://github.com/errakui/crm.itfplus.it.git
cd crm.itfplus.it
```

2. Installa le dipendenze:
```bash
npm install
```

3. Configura le variabili d'ambiente:
- Crea un file `.env` nella root del progetto
- Copia il contenuto da `.env.example`
- Modifica le variabili secondo le tue necessità

4. Inizializza il database:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Avvia l'applicazione in modalità sviluppo:
```bash
npm run dev
```

## Struttura del Progetto

```
├── api/                    # API endpoints
│   ├── auth/              # Autenticazione
│   ├── documents/         # Gestione documenti
│   ├── admin/            # Funzionalità admin
│   ├── chatbot/          # Chatbot
│   └── support/          # Supporto e contatti
├── client/               # Frontend React
├── prisma/              # Schema e migrazioni database
└── public/              # File statici
```

## API Endpoints

### Autenticazione
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/change-password

### Documenti
- GET /api/documents
- GET /api/documents/[id]
- POST /api/documents
- PUT /api/documents/[id]
- DELETE /api/documents/[id]
- GET /api/documents/search
- GET /api/documents/cities
- GET /api/documents/[id]/download

### Preferiti
- GET /api/documents/favorites
- POST /api/documents/favorites
- DELETE /api/documents/favorites/[id]

### Admin
- GET /api/admin/users
- POST /api/admin/users
- PUT /api/admin/users
- DELETE /api/admin/users
- GET /api/documents/admin/all
- POST /api/documents/bulk-upload

### Supporto e Contatti
- POST /api/support
- POST /api/contact

### Chatbot
- POST /api/chatbot/chat

## Contribuire

1. Fai il fork del repository
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Committa le tue modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Pusha al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## Licenza

Questo progetto è sotto licenza MIT. Vedi il file `LICENSE` per maggiori dettagli.

# ITFPlus - Sistema di Gestione Documenti Legali

ITFPlus è un'applicazione web completa per la gestione dei documenti legali. Permette agli utenti di caricare, cercare, visualizzare e scaricare documenti, con funzionalità aggiuntive come estrazione del testo, ricerca avanzata e un'interfaccia admin.

## Struttura del Progetto

Il progetto è diviso in due parti principali:

- **Client**: Applicazione frontend React con Material-UI
- **Server**: API backend Node.js con Express, TypeScript e Prisma ORM

## Requisiti di Sistema

- Node.js (v18.0.0 o superiore)
- PostgreSQL (v14.0 o superiore)
- npm o yarn
- Spazio di archiviazione per i documenti PDF

## Installazione e Configurazione

### 1. Clonazione del Repository

```bash
git clone https://github.com/errakui/crm.itfplus.it.git
cd crm.itfplus.it
```

### 2. Configurazione del Server

```bash
cd server

# Installazione delle dipendenze
npm install

# Configurazione dell'ambiente
cp .env.example .env
```

Modifica il file `.env` con i tuoi parametri:

```
DATABASE_URL="postgresql://username:password@localhost:5432/itfplus?schema=public"
PORT=8000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key
PERPLEXITY_API_KEY=your_perplexity_api_key
APP_URL=https://tuo-dominio.it
SESSION_SECRET=your_session_secret
```

Crea le directory necessarie:

```bash
mkdir -p uploads
```

### 3. Configurazione del Database

```bash
# Esegui le migrazioni
npx prisma migrate deploy

# Carica i dati iniziali (seed)
npx prisma db seed
```

### 4. Configurazione del Client

```bash
cd ../client

# Installazione delle dipendenze
npm install

# Configurazione dell'ambiente
cp .env.example .env
```

Modifica il file `.env`:

```
REACT_APP_API_URL=https://api.tuo-dominio.it
```

### 5. Compilazione per Produzione

**Server:**
```bash
cd ../server
npm run build
```

**Client:**
```bash
cd ../client
npm run build
```

## Avvio in Produzione

### Configurazione Nginx

Ecco un esempio di configurazione Nginx:

```nginx
# Server API (Backend)
server {
    listen 80;
    server_name api.tuo-dominio.it;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Client (Frontend)
server {
    listen 80;
    server_name tuo-dominio.it;
    root /percorso/alla/cartella/client/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Avvio del Server

Per avviare il server in modalità produzione:

```bash
cd server
npm start
```

Per mantenere il server sempre attivo, è consigliabile utilizzare PM2:

```bash
npm install -g pm2
pm2 start dist/server.js --name itfplus-server
pm2 save
pm2 startup
```

## Gestione dei File Caricati

I documenti caricati vengono salvati nella directory `uploads`. Assicurati che:

1. L'utente del server web abbia permessi di lettura/scrittura sulla directory
2. La directory sia accessibile tramite il percorso configurato nel server
3. Sia configurato un backup regolare di questa directory

## Struttura della Directory Uploads

Il server si aspetta di trovare la directory uploads in una delle seguenti posizioni:
- `/percorso/al/progetto/uploads`
- `/percorso/al/progetto/server/uploads`

Se necessario, puoi modificare il percorso nel file `server/src/server.ts`.

## Gestione degli Errori Comuni

### 1. Errore EADDRINUSE (Porta già in uso)

Se ricevi un errore "address already in use :::8000":

```bash
sudo netstat -tulpn | grep 8000
kill -9 <PID>
```

Oppure modifica la porta nel file `.env`.

### 2. Errori di Connessione al Database

Verifica:
- Che PostgreSQL sia in esecuzione
- Che le credenziali nel DATABASE_URL siano corrette
- Che il database esista

### 3. Errori di Caricamento File

- Verifica i permessi della directory uploads
- Controlla che ci sia spazio sufficiente sul disco
- Verifica i limiti di dimensione nei file di configurazione

## Manutenzione

### Backup del Database

Esegui regolarmente il backup del database:

```bash
pg_dump -U nome_utente -d itfplus > backup_$(date +%Y%m%d).sql
```

### Backup dei Documenti

Esegui regolarmente il backup dei file caricati:

```bash
rsync -av --progress /percorso/alla/cartella/uploads /percorso/backup/uploads
```

## Licenza

Questo progetto è protetto da copyright © 2024 ITFPlus.

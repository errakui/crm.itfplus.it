# Come Generare e Configurare l'API Key

## Passo 1: Genera l'API Key

Esegui questo comando nel terminale:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Oppure usa questo comando:

```bash
openssl rand -hex 32
```

**Esempio di chiave generata:**
```
933126c4a803a65808eab51db263a5287841a661d648c08196363bd257b08246
```

## Passo 2: Aggiungi la Chiave nel File .env

1. Vai nella cartella del server:
   ```bash
   cd /var/www/itfplus/server
   ```

2. Apri o crea il file `.env`:
   ```bash
   nano .env
   ```
   oppure
   ```bash
   vi .env
   ```

3. Aggiungi questa riga (sostituisci con la TUA chiave generata):
   ```env
   PUBLIC_API_KEY=933126c4a803a65808eab51db263a5287841a661d648c08196363bd257b08246
   ```

4. Salva il file (Ctrl+X, poi Y, poi Enter se usi nano)

## Passo 3: Riavvia il Server

```bash
# Se usi PM2:
pm2 restart itfplus

# Oppure se usi systemd:
sudo systemctl restart itfplus

# Oppure se lo avvii manualmente:
# Ferma il server (Ctrl+C) e riavvialo
```

## Passo 4: Usa la Chiave negli Script

Negli script PHP o JavaScript, usa la STESSA chiave:

### Esempio PHP:
```php
$API_KEY = '933126c4a803a65808eab51db263a5287841a661d648c08196363bd257b08246';
```

### Esempio JavaScript:
```javascript
const API_KEY = '933126c4a803a65808eab51db263a5287841a661d648c08196363bd257b08246';
```

## ⚠️ IMPORTANTE

- **NON condividere** questa chiave con nessuno
- **NON metterla** in file pubblici o nel repository Git
- **Usa la STESSA chiave** nel `.env` e negli script
- **Solo tu** (admin) devi conoscere questa chiave

## Verifica che Funzioni

Testa l'endpoint:

```bash
curl -X POST http://localhost:8000/api/public/request-account \
  -H "Content-Type: application/json" \
  -H "X-API-Key: 933126c4a803a65808eab51db263a5287841a661d648c08196363bd257b08246" \
  -d '{"email":"test@example.com","name":"Test User","expiresInDays":3}'
```

Se funziona, riceverai una risposta con `"success": true`


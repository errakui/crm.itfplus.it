# API Pubblica - Creazione Account Automatica

## Endpoint

```
POST /api/public/request-account
```

## Descrizione

Endpoint pubblico per automatizzare la creazione di account utente. 
Crea automaticamente un account con credenziali generate e invia email con le credenziali.

## Autenticazione

Protezione tramite **API Key** nell'header:
```
X-API-Key: your-secret-key
```

**Nota**: Se `PUBLIC_API_KEY` non è configurata nel `.env`, l'endpoint è accessibile senza autenticazione (solo per sviluppo).

## Configurazione

Aggiungi nel file `.env`:
```env
PUBLIC_API_KEY=your-super-secret-api-key-here
```

## Request Body

```json
{
  "email": "utente@example.com",
  "name": "Mario Rossi",
  "expiresInDays": 3  // Opzionale, default: 3 giorni
}
```

### Parametri

- `email` (string, obbligatorio): Email dell'utente
- `name` (string, obbligatorio): Nome completo dell'utente
- `expiresInDays` (number, opzionale): Giorni di validità account (default: 3)

## Response

### Successo (201)

```json
{
  "success": true,
  "message": "Account creato con successo. Le credenziali sono state inviate via email.",
  "user": {
    "id": "uuid",
    "email": "utente@example.com",
    "name": "Mario Rossi",
    "expiresAt": "2024-01-15T00:00:00.000Z"
  }
}
```

### Errori

**400 - Email già esistente**
```json
{
  "success": false,
  "message": "Un account con questa email esiste già"
}
```

**400 - Dati mancanti**
```json
{
  "success": false,
  "message": "Email e nome sono obbligatori"
}
```

**401/403 - API Key non valida**
```json
{
  "success": false,
  "message": "API Key non valida."
}
```

## Esempi

### cURL

```bash
curl -X POST https://crm.itfplus.it/api/public/request-account \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-key" \
  -d '{
    "email": "mario.rossi@example.com",
    "name": "Mario Rossi",
    "expiresInDays": 3
  }'
```

### JavaScript (fetch)

```javascript
const response = await fetch('https://crm.itfplus.it/api/public/request-account', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-secret-key'
  },
  body: JSON.stringify({
    email: 'mario.rossi@example.com',
    name: 'Mario Rossi',
    expiresInDays: 3
  })
});

const result = await response.json();
console.log(result);
```

### PHP

```php
<?php
$ch = curl_init('https://crm.itfplus.it/api/public/request-account');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-API-Key: your-secret-key'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => 'mario.rossi@example.com',
    'name' => 'Mario Rossi',
    'expiresInDays' => 3
]));

$response = curl_exec($ch);
$result = json_decode($response, true);
curl_close($ch);
?>
```

## Funzionalità

- ✅ Crea account automaticamente
- ✅ Genera password casuale sicura
- ✅ Imposta scadenza account (default 3 giorni)
- ✅ Invia email con credenziali
- ✅ Verifica email duplicata
- ✅ Validazione formato email
- ✅ Ruolo automatico: USER

## Note

- La password viene generata automaticamente e inviata solo via email
- L'account scade automaticamente dopo i giorni specificati
- Se l'email fallisce, l'account viene comunque creato (ma senza invio credenziali)


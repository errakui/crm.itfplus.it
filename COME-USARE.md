# Come Usare l'API per Creare Account Automaticamente

## Cosa Serve

1. **Endpoint API** già pronto: `POST /api/public/request-account`
2. **API Key** (solo tu la conosci, la metti nel `.env`)

## Passo 1: Configura API Key

Nel file `.env` del server aggiungi:
```env
PUBLIC_API_KEY=chiave-segreta-solo-tua
```

## Passo 2: Usa lo Script

Hai 2 opzioni:

### Opzione A: Script PHP (Consigliato)

Usa il file `script-esempio.php`:
- Lo metti nel tuo gestionale
- Quando un utente compila il form, chiami questo script
- L'account viene creato automaticamente

### Opzione B: Form HTML + JavaScript

Usa il file `script-esempio.html`:
- Form semplice che chiama direttamente l'API
- L'utente compila e clicca "Richiedi Account"
- L'account viene creato

## Come Funziona

1. **Utente compila form** → Nome + Email
2. **Tu chiami l'API** → Con la tua API Key
3. **Sistema crea account** → Password generata automaticamente
4. **Email inviata** → All'utente con credenziali
5. **Account attivo** → Per 3 giorni (trial)

## Esempio Pratico

```php
// Nel tuo gestionale, quando salvi un nuovo utente:
$email = "mario@example.com";
$nome = "Mario Rossi";

// Chiama l'API
$ch = curl_init('https://crm.itfplus.it/api/public/request-account');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-API-Key: la-tua-chiave-segreta'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => $email,
    'name' => $nome,
    'expiresInDays' => 3
]));
$response = curl_exec($ch);
// Fatto! Account creato e email inviata
```

## Sicurezza

- ✅ L'API Key è SOLO nel tuo `.env` (solo tu la vedi)
- ✅ L'utente finale NON vede mai l'API Key
- ✅ L'endpoint è protetto (senza API Key non funziona)

## Domande?

- **Dove metto lo script?** → Nel tuo gestionale/form
- **L'API Key chi la vede?** → Solo tu (nel server)
- **L'utente cosa vede?** → Solo il form, nient'altro
- **Funziona subito?** → Sì, dopo aver configurato l'API Key


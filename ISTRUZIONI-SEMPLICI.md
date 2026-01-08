# 📋 ISTRUZIONI SEMPLICI - Come usare tutto

## 1️⃣ PROVA IL FORM (già funzionante)

**Link:** https://crm.itfplus.it/form-account.html

**Cosa fa:**
- Utente compila nome + email
- Clicca "Crea Account"
- Account creato (valido 3 giorni)
- **Email inviata automaticamente** con credenziali

---

## 2️⃣ METTI IL FORM IN ALTRI SITI (IFRAME)

**Copia questo codice** e incollalo dove vuoi:

```html
<iframe 
    src="https://crm.itfplus.it/form-account-iframe.html" 
    width="100%" 
    height="550" 
    frameborder="0"
    style="max-width: 500px; border: none;">
</iframe>
```

**Dove lo usi:**
- Pagine HTML
- WordPress (in un blocco HTML)
- Qualsiasi sito web

**Link iframe:** https://crm.itfplus.it/form-account-iframe.html

---

## 3️⃣ SCRIPT PHP PER AUTOMAZIONI

### TEST PHP (prova subito)

**Link:** https://crm.itfplus.it/test-php.php

Compila e testa la creazione automatica

### CODICE DA COPIARE NEL TUO GESTIONALE

```php
<?php
function creaAccountITFPlus($email, $nome) {
    $url = 'https://crm.itfplus.it/api/public/request-account';
    $apiKey = '933126c4a803a65808eab51db263a5287841a661d648c08196363bd257b08246';
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'X-API-Key: ' . $apiKey
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'email' => $email,
        'name' => $nome,
        'expiresInDays' => 3
    ]));
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// USO: Quando un utente si registra
$risultato = creaAccountITFPlus('mario@example.com', 'Mario Rossi');

if ($risultato['success']) {
    echo "✅ Account creato! Email inviata.";
}
?>
```

---

## 4️⃣ JAVASCRIPT (per siti web)

```javascript
async function creaAccountITFPlus(email, nome) {
    const response = await fetch('https://crm.itfplus.it/api/public/request-account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': '933126c4a803a65808eab51db263a5287841a661d648c08196363bd257b08246'
        },
        body: JSON.stringify({
            email: email,
            name: nome,
            expiresInDays: 3
        })
    });
    
    return await response.json();
}

// USO
creaAccountITFPlus('mario@example.com', 'Mario Rossi')
    .then(risultato => {
        if (risultato.success) {
            alert('✅ Account creato!');
        }
    });
```

---

## ✅ COSA FUNZIONA

- ✅ Form: https://crm.itfplus.it/form-account.html
- ✅ Iframe: https://crm.itfplus.it/form-account-iframe.html  
- ✅ Test PHP: https://crm.itfplus.it/test-php.php
- ✅ Invio email: SÌ, automatico con credenziali
- ✅ Durata: 3 giorni
- ✅ API funzionante

---

## 📂 DOVE SONO I FILE

Nel server `/var/www/itfplus/`:

1. `public/form-account.html` - Form completo
2. `public/form-account-iframe.html` - Versione iframe
3. `public/test-php.php` - Test PHP
4. `script-automazione.php` - Script completo con esempi
5. `CODICI-INTEGRAZIONE.md` - Tutti i codici

---

## 🎯 RIEPILOGO

### Per utenti finali:
→ https://crm.itfplus.it/form-account.html

### Per mettere in altri siti:
→ Copia il codice iframe sopra

### Per automazioni dal gestionale:
→ Copia lo script PHP sopra

### Per testare:
→ https://crm.itfplus.it/test-php.php

**Tutto invia email automaticamente con le credenziali ✅**


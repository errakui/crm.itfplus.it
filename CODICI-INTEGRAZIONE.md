# Codici per Integrare il Form Account di Prova

## 1. IFRAME - Da incorporare in qualsiasi sito

Copia e incolla questo codice HTML nella tua pagina:

```html
<iframe 
    src="https://crm.itfplus.it/form-account-iframe.html" 
    width="100%" 
    height="550" 
    frameborder="0"
    style="max-width: 500px; border: none; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
</iframe>
```

### Esempio con centratura:

```html
<div style="display: flex; justify-content: center; padding: 20px;">
    <iframe 
        src="https://crm.itfplus.it/form-account-iframe.html" 
        width="100%" 
        height="550" 
        frameborder="0"
        style="max-width: 500px; border: none; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
    </iframe>
</div>
```

## 2. SCRIPT PHP - Per automazioni dal tuo gestionale

```php
<?php
/**
 * Script per creare account automaticamente
 * Usa quando un utente si registra nel tuo gestionale
 */

function creaAccountProva($email, $nome) {
    $url = 'https://crm.itfplus.it/api/public/request-account';
    $apiKey = '933126c4a803a65808eab51db263a5287841a661d648c08196363bd257b08246';
    
    $data = [
        'email' => $email,
        'name' => $nome,
        'expiresInDays' => 3
    ];
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'X-API-Key: ' . $apiKey
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $result = json_decode($response, true);
    
    if ($httpCode === 201 && $result['success']) {
        return [
            'success' => true,
            'message' => 'Account creato con successo',
            'user' => $result['user']
        ];
    } else {
        return [
            'success' => false,
            'message' => $result['message'] ?? 'Errore sconosciuto'
        ];
    }
}

// ESEMPIO DI USO:
// Quando un utente si registra nel tuo gestionale:
$email = "mario.rossi@example.com";
$nome = "Mario Rossi";

$risultato = creaAccountProva($email, $nome);

if ($risultato['success']) {
    echo "✅ Account creato! Email inviata.";
} else {
    echo "❌ Errore: " . $risultato['message'];
}
?>
```

## 3. SCRIPT JAVASCRIPT - Per siti web dinamici

```javascript
/**
 * Funzione per creare account da JavaScript
 */
async function creaAccountProva(email, nome) {
    const url = 'https://crm.itfplus.it/api/public/request-account';
    const apiKey = '933126c4a803a65808eab51db263a5287841a661d648c08196363bd257b08246';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            },
            body: JSON.stringify({
                email: email,
                name: nome,
                expiresInDays: 3
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            return {
                success: true,
                message: 'Account creato con successo',
                user: result.user
            };
        } else {
            return {
                success: false,
                message: result.message
            };
        }
    } catch (error) {
        return {
            success: false,
            message: 'Errore di connessione'
        };
    }
}

// ESEMPIO DI USO:
// Nel tuo form o dopo una registrazione:
creaAccountProva('mario.rossi@example.com', 'Mario Rossi')
    .then(risultato => {
        if (risultato.success) {
            alert('✅ Account creato! Controlla la tua email.');
        } else {
            alert('❌ Errore: ' + risultato.message);
        }
    });
```

## 4. CODICE HTML COMPLETO - Pagina standalone

```html
<!DOCTYPE html>
<html>
<head>
    <title>Richiedi Account di Prova</title>
</head>
<body>
    <h1>Richiedi il tuo account di prova</h1>
    
    <!-- Metodo 1: IFRAME -->
    <iframe 
        src="https://crm.itfplus.it/form-account-iframe.html" 
        width="100%" 
        height="550" 
        frameborder="0"
        style="max-width: 500px;">
    </iframe>
    
    <!-- Metodo 2: Link diretto -->
    <p>Oppure <a href="https://crm.itfplus.it/form-account.html" target="_blank">apri il form in una nuova finestra</a></p>
</body>
</html>
```

## 5. INTEGRAZIONE WORDPRESS

Aggiungi questo codice in una pagina/articolo:

```html
[html]
<div style="display: flex; justify-content: center; padding: 20px;">
    <iframe 
        src="https://crm.itfplus.it/form-account-iframe.html" 
        width="100%" 
        height="550" 
        frameborder="0"
        style="max-width: 500px; border: none; border-radius: 10px;">
    </iframe>
</div>
[/html]
```

## Link Diretti

- **Form completo:** https://crm.itfplus.it/form-account.html
- **Form per iframe:** https://crm.itfplus.it/form-account-iframe.html

## Note Importanti

- ✅ L'iframe funziona su qualsiasi sito
- ✅ Gli script PHP/JS servono per automazioni
- ✅ L'API Key è già configurata
- ✅ Account valido per 3 giorni
- ✅ Email automatica con credenziali
- ⚠️ Non condividere l'API Key pubblicamente


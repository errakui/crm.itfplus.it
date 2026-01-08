<?php
/**
 * SCRIPT DI AUTOMAZIONE - Crea account automaticamente
 * 
 * COME USARE:
 * 1. Includi questo file nel tuo gestionale
 * 2. Chiama la funzione creaAccountProva() quando serve
 * 3. L'account viene creato automaticamente e l'email inviata
 */

function creaAccountProva($email, $nome, $giorni = 3) {
    $url = 'https://crm.itfplus.it/api/public/request-account';
    $apiKey = '933126c4a803a65808eab51db263a5287841a661d648c08196363bd257b08246';
    
    // Validazione
    if (empty($email) || empty($nome)) {
        return [
            'success' => false,
            'message' => 'Email e nome sono obbligatori'
        ];
    }
    
    // Prepara i dati
    $data = [
        'email' => $email,
        'name' => $nome,
        'expiresInDays' => $giorni
    ];
    
    // Chiamata API
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'X-API-Key: ' . $apiKey
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    // Gestione errori di connessione
    if ($error) {
        return [
            'success' => false,
            'message' => 'Errore di connessione: ' . $error
        ];
    }
    
    // Decodifica risposta
    $result = json_decode($response, true);
    
    if ($httpCode === 201 && isset($result['success']) && $result['success']) {
        return [
            'success' => true,
            'message' => 'Account creato con successo',
            'user' => $result['user'] ?? []
        ];
    } else {
        return [
            'success' => false,
            'message' => $result['message'] ?? 'Errore sconosciuto'
        ];
    }
}

// ====== ESEMPI DI USO ======

// Esempio 1: Uso base
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['crea_account'])) {
    $email = $_POST['email'] ?? '';
    $nome = $_POST['nome'] ?? '';
    
    $risultato = creaAccountProva($email, $nome);
    
    if ($risultato['success']) {
        echo "✅ Account creato con successo!<br>";
        echo "Email inviata a: " . htmlspecialchars($email) . "<br>";
        echo "Dati utente: <pre>" . print_r($risultato['user'], true) . "</pre>";
    } else {
        echo "❌ Errore: " . htmlspecialchars($risultato['message']);
    }
}

// Esempio 2: Integrazione con form esistente
/*
// Nel tuo form di registrazione:
$email = $_POST['email'];
$nome = $_POST['nome'] . ' ' . $_POST['cognome'];

// Dopo aver salvato nel tuo database:
$risultato = creaAccountProva($email, $nome, 3);

if ($risultato['success']) {
    // Account ITFPlus creato con successo
    echo "Registrazione completata! Controlla la tua email per le credenziali ITFPlus.";
} else {
    // Errore nella creazione account ITFPlus
    // Ma la registrazione nel tuo sistema è comunque andata a buon fine
    error_log("Errore creazione account ITFPlus: " . $risultato['message']);
}
*/

// Esempio 3: Creazione massiva da CSV
/*
$csv = fopen('utenti.csv', 'r');
while (($riga = fgetcsv($csv)) !== false) {
    $email = $riga[0];
    $nome = $riga[1];
    
    $risultato = creaAccountProva($email, $nome);
    
    if ($risultato['success']) {
        echo "✅ Account creato per: $email\n";
    } else {
        echo "❌ Errore per $email: " . $risultato['message'] . "\n";
    }
    
    // Pausa per non sovraccaricare il server
    sleep(1);
}
fclose($csv);
*/
?>

<!DOCTYPE html>
<html>
<head>
    <title>Test Creazione Account</title>
</head>
<body>
    <h2>Test Automazione Creazione Account</h2>
    
    <form method="POST">
        <div>
            <label>Nome:</label>
            <input type="text" name="nome" required>
        </div>
        <div>
            <label>Email:</label>
            <input type="email" name="email" required>
        </div>
        <button type="submit" name="crea_account">Crea Account di Prova</button>
    </form>
</body>
</html>


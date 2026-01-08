<?php
/**
 * ========================================
 * SCRIPT CREAZIONE ACCOUNT PROVA 3 GIORNI
 * ========================================
 * 
 * COPIA QUESTO CODICE E USALO NEL TUO GESTIONALE
 */

// ====== FUNZIONE PRINCIPALE ======
function creaAccountProva3Giorni($email, $nome) {
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
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $result = json_decode($response, true);
    
    if ($httpCode === 201 && $result['success']) {
        return [
            'success' => true,
            'message' => 'Account creato con successo',
            'email' => $email,
            'user' => $result['user']
        ];
    } else {
        return [
            'success' => false,
            'message' => $result['message'] ?? 'Errore sconosciuto'
        ];
    }
}

// ====== ESEMPIO 1: USO SEMPLICE ======
$email = "mario.rossi@example.com";
$nome = "Mario Rossi";

$risultato = creaAccountProva3Giorni($email, $nome);

if ($risultato['success']) {
    echo "✅ SUCCESSO!\n";
    echo "Account creato per: " . $risultato['email'] . "\n";
    echo "Email inviata con le credenziali\n";
    echo "Valido per 3 giorni\n";
} else {
    echo "❌ ERRORE: " . $risultato['message'] . "\n";
}

// ====== ESEMPIO 2: CON FORM HTML ======
?>
<!DOCTYPE html>
<html>
<head>
    <title>Crea Account Prova 3 Giorni</title>
    <style>
        body { font-family: Arial; max-width: 500px; margin: 50px auto; }
        input { width: 100%; padding: 10px; margin: 10px 0; }
        button { width: 100%; padding: 12px; background: #1B2A4A; color: white; border: none; }
        .result { padding: 15px; margin: 20px 0; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <h2>Crea Account Prova 3 Giorni</h2>
    
    <form method="POST">
        <input type="text" name="nome" placeholder="Nome e Cognome" required>
        <input type="email" name="email" placeholder="Email" required>
        <button type="submit" name="crea">Crea Account</button>
    </form>

    <?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['crea'])) {
        $email = $_POST['email'];
        $nome = $_POST['nome'];
        
        $risultato = creaAccountProva3Giorni($email, $nome);
        
        if ($risultato['success']) {
            echo "<div class='result success'>";
            echo "<strong>✅ Account creato con successo!</strong><br>";
            echo "Email: " . htmlspecialchars($email) . "<br>";
            echo "Controlla la casella email per le credenziali<br>";
            echo "Valido per: 3 giorni";
            echo "</div>";
        } else {
            echo "<div class='result error'>";
            echo "<strong>❌ Errore</strong><br>";
            echo htmlspecialchars($risultato['message']);
            echo "</div>";
        }
    }
    ?>
</body>
</html>
<?php

// ====== ESEMPIO 3: INTEGRAZIONE CON TUO GESTIONALE ======
/*
// Nel tuo form di registrazione:
if (isset($_POST['registra_utente'])) {
    $nome = $_POST['nome'];
    $email = $_POST['email'];
    
    // 1. Salva nel TUO database
    // ... il tuo codice qui ...
    
    // 2. Crea account ITFPlus (3 giorni)
    $risultato = creaAccountProva3Giorni($email, $nome);
    
    if ($risultato['success']) {
        echo "Registrazione completata! Ti abbiamo inviato le credenziali via email.";
    } else {
        // Log errore ma non bloccare la registrazione
        error_log("Errore creazione account ITFPlus: " . $risultato['message']);
    }
}
*/

// ====== ESEMPIO 4: CREAZIONE MASSIVA ======
/*
// Da file CSV o array
$utenti = [
    ['email' => 'user1@test.com', 'nome' => 'Utente 1'],
    ['email' => 'user2@test.com', 'nome' => 'Utente 2'],
    ['email' => 'user3@test.com', 'nome' => 'Utente 3']
];

foreach ($utenti as $utente) {
    $risultato = creaAccountProva3Giorni($utente['email'], $utente['nome']);
    
    if ($risultato['success']) {
        echo "✅ Account creato per: " . $utente['email'] . "\n";
    } else {
        echo "❌ Errore per " . $utente['email'] . ": " . $risultato['message'] . "\n";
    }
    
    sleep(1); // Pausa di 1 secondo tra le chiamate
}
*/
?>


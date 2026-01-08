<?php
/**
 * TEST SCRIPT - Prova la creazione account
 * Apri: https://crm.itfplus.it/test-php.php
 */

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

?>
<!DOCTYPE html>
<html>
<head>
    <title>Test Creazione Account</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
        }
        input {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        button {
            width: 100%;
            padding: 12px;
            background: #1B2A4A;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        .result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 5px;
        }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <h1>🧪 Test Creazione Account ITFPlus</h1>
    <p>Questo script testa la creazione automatica di account</p>

    <form method="POST">
        <label>Nome:</label>
        <input type="text" name="nome" placeholder="Mario Rossi" required>
        
        <label>Email:</label>
        <input type="email" name="email" placeholder="mario@example.com" required>
        
        <button type="submit" name="test">Crea Account di Prova</button>
    </form>

    <?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['test'])) {
        $email = $_POST['email'];
        $nome = $_POST['nome'];
        
        echo "<h2>Risultato:</h2>";
        
        $risultato = creaAccountITFPlus($email, $nome);
        
        if (isset($risultato['success']) && $risultato['success']) {
            echo "<div class='result success'>";
            echo "<h3>✅ SUCCESSO!</h3>";
            echo "<p>Account creato per: <strong>" . htmlspecialchars($email) . "</strong></p>";
            echo "<p>Email inviata con credenziali</p>";
            echo "<p>Valido per: 3 giorni</p>";
            if (isset($risultato['user'])) {
                echo "<pre>" . print_r($risultato['user'], true) . "</pre>";
            }
            echo "</div>";
        } else {
            echo "<div class='result error'>";
            echo "<h3>❌ ERRORE</h3>";
            echo "<p>" . htmlspecialchars($risultato['message'] ?? 'Errore sconosciuto') . "</p>";
            echo "</div>";
        }
    }
    ?>
</body>
</html>


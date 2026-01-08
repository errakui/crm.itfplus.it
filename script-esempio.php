<?php
/**
 * SCRIPT SEMPLICE - Esempio di come chiamare l'API
 * 
 * Questo script puoi metterlo nel tuo gestionale/form
 * Quando un utente compila il form, chiami questo script
 * e crei automaticamente l'account
 */

// ===== CONFIGURAZIONE =====
$API_URL = 'https://crm.itfplus.it/api/public/request-account';
$API_KEY = 'la-tua-chiave-segreta'; // La stessa che metti nel .env

// ===== DATI DAL FORM =====
// Questi arrivano dal tuo form/gestionale
$email = $_POST['email'] ?? '';  // Email dell'utente
$nome = $_POST['nome'] ?? '';    // Nome dell'utente
$giorni = 3; // 3 giorni di trial (puoi cambiare)

// ===== CHIAMATA API =====
$ch = curl_init($API_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-API-Key: ' . $API_KEY
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => $email,
    'name' => $nome,
    'expiresInDays' => $giorni
]));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// ===== RISULTATO =====
$result = json_decode($response, true);

if ($httpCode === 201 && $result['success']) {
    // SUCCESSO - Account creato!
    echo "✅ Account creato! Email inviata a: " . $email;
    // Qui puoi fare altre cose, tipo salvare nel tuo DB, ecc.
} else {
    // ERRORE
    echo "❌ Errore: " . ($result['message'] ?? 'Errore sconosciuto');
}
?>


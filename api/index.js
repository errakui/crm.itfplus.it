// Questo file è il punto di ingresso per le funzioni serverless di Vercel
// Importa e utilizza il server Express dal progetto server

// Importa il modulo path per gestire i percorsi dei file
const path = require('path');

// Determina il percorso alla directory del server
const serverPath = path.join(process.cwd(), 'server/dist/server.js');

// Importa l'app Express dal server
const app = require(serverPath).default;

// Esporta l'app Express per l'utilizzo con Vercel
module.exports = app; 
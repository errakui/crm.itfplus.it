// File principale per avviare il server
// Questo file risolve il problema di nodemon che cerca index.js nella radice

// Importa il file index.js dalla directory api
require('./api/index.js');

console.log('Server avviato tramite index.js nella root'); 
// Script di build per Vercel
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Avvio build personalizzata...');

// Controlla se esiste la directory prisma
if (!fs.existsSync(path.join(__dirname, 'prisma'))) {
  console.error('Directory prisma non trovata!');
  process.exit(1);
}

try {
  // Genera il Prisma Client
  console.log('Generazione Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma Client generato con successo!');
} catch (error) {
  console.error('Errore durante la generazione del Prisma Client:', error);
  process.exit(1);
}

console.log('Build completata con successo!'); 
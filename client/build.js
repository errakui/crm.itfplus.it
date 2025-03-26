const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Esegui la build standard
console.log('Esecuzione della build React...');
execSync('npm run original-build', { stdio: 'inherit' });

// Percorsi
const buildDir = path.join(__dirname, 'build');
const jsDir = path.join(buildDir, 'static', 'js');

console.log('Post-processing dei file buildati...');

// Sostituzione delle URL hardcoded nei file JS
const replaceInFiles = (dir, search, replace) => {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    // Controlla se è un file JS
    if (file.endsWith('.js')) {
      console.log(`Elaborazione di ${file}...`);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Sostituisci tutte le occorrenze
      const originalSize = content.length;
      content = content.replace(new RegExp(search, 'g'), replace);
      const newSize = content.length;
      
      // Scrivi il file aggiornato
      fs.writeFileSync(filePath, content, 'utf8');
      
      console.log(`Modificato ${file}: ${originalSize - newSize} bytes risparmiati`);
    }
  });
};

// Esegui le sostituzioni
replaceInFiles(jsDir, 'http://localhost:8000', '');

console.log('Post-processing completato!'); 
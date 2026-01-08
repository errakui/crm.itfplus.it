const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function monitor() {
  console.log('📊 MONITOR AGGIORNAMENTO CITTÀ - TEMPO REALE');
  console.log('='.repeat(60));
  
  const total = await prisma.document.count();
  
  while (true) {
    try {
      // Conta documenti con città popolate
      const withCities = await prisma.document.count({
        where: {
          cities: {
            not: { equals: [] }
          }
        }
      });
      
      // Conta città uniche trovate
      const citiesResult = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT UNNEST(cities)) as unique_cities
        FROM documents 
        WHERE cities IS NOT NULL AND array_length(cities, 1) > 0
      `;
      
      const uniqueCities = parseInt(citiesResult[0]?.unique_cities || '0');
      
      const percent = ((withCities / total) * 100).toFixed(2);
      const remaining = total - withCities;
      
      // Progress bar
      const barLength = 40;
      const filled = Math.round((withCities / total) * barLength);
      const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
      
      // Clear screen e mostra progress
      process.stdout.write('\x1Bc'); // Clear screen
      
      console.log('🏛️  AGGIORNAMENTO CITTÀ TRIBUNALI - LIVE MONITOR');
      console.log('='.repeat(60));
      console.log(`📊 Progresso: [${bar}] ${percent}%`);
      console.log(`📁 Documenti processati: ${withCities.toLocaleString()}/${total.toLocaleString()}`);
      console.log(`📋 Documenti rimanenti: ${remaining.toLocaleString()}`);
      console.log(`🏛️  Città uniche trovate: ${uniqueCities}`);
      console.log(`⏱️  Ultimo aggiornamento: ${new Date().toLocaleTimeString()}`);
      
      if (withCities >= total) {
        console.log('\n✅ COMPLETATO! Tutti i documenti hanno le città aggiornate.');
        break;
      }
      
      console.log('\n🔄 Aggiornamento in corso... (Ctrl+C per uscire dal monitor)');
      
    } catch (error) {
      console.error('❌ Errore nel monitor:', error);
    }
    
    // Aspetta 5 secondi prima del prossimo aggiornamento
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  await prisma.$disconnect();
}

monitor().catch(console.error);

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Inizializzazione aggiornamento TSV...');
  
  // Conta documenti da aggiornare
  const totalResult = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM documents WHERE tsv IS NULL
  `;
  const total = parseInt(totalResult[0].count);

  if (total === 0) {
    console.log('✅ Tutti i documenti sono già aggiornati!');
    await prisma.$disconnect();
    return;
  }

  let updated = 0;
  const batchSize = 1000;

  console.log(`📊 Totale documenti da aggiornare: ${total}`);
  console.log(`📦 Dimensione batch: ${batchSize}`);
  console.log('');

  const startTime = Date.now();

  while (true) {
    const batchStart = Date.now();
    
    // Esegue aggiornamento batch diretto
    const result = await prisma.$executeRaw`
      UPDATE documents
      SET tsv = to_tsvector(
                  'italian',
                  unaccent(coalesce(title,'') || ' ' || coalesce(content,''))
                )
      WHERE id IN (
        SELECT id FROM documents WHERE tsv IS NULL LIMIT ${batchSize}
      )
    `;
    
    const rows = result;
    
    if (rows === 0) break;

    updated += rows;
    const percent = ((updated / total) * 100).toFixed(2);
    const batchTime = Date.now() - batchStart;
    const avgTime = (Date.now() - startTime) / updated * 1000;
    const eta = Math.round((total - updated) * avgTime / 1000 / 60);

    // Progress bar
    const barLength = 30;
    const filled = Math.round((updated / total) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);

    process.stdout.write(`\r[${bar}] ${percent}% | ${updated}/${total} | Batch: ${batchTime}ms | ETA: ${eta}min`);
  }

  const totalTime = Math.round((Date.now() - startTime) / 1000);
  
  console.log('\n');
  console.log('✅ Aggiornamento completato!');
  console.log(`⏱️  Tempo totale: ${totalTime}s`);
  console.log(`📈 Velocità media: ${Math.round(total/totalTime)} doc/sec`);
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Errore:', e);
  process.exit(1);
});

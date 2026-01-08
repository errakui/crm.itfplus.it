const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Lista completa tribunali (stessa del pdfUtils.ts)
const ITALIAN_CITIES = [
  'L\'Aquila', 'La Spezia', 'Agrigento', 'Alessandria', 'Ancona', 'Aosta', 'Arezzo', 'Ascoli Piceno', 'Asti', 
  'Avellino', 'Avezzano', 'Barcellona Pozzo di Gotto', 'Lipari', 'Bari', 'Belluno', 'Benevento', 'Bergamo', 
  'Biella', 'Bologna', 'Bolzano', 'Brescia', 'Brindisi', 'Busto Arsizio', 'Cagliari', 'Caltagirone', 
  'Caltanissetta', 'Campobasso', 'Cassino', 'Castrovillari', 'Catania', 'Catanzaro', 'Chieti', 'Ortona',
  'Civitavecchia', 'Como', 'Cosenza', 'Cremona', 'Crotone', 'Cuneo', 'Enna', 'Fermo', 'Ferrara', 'Firenze',
  'Foggia', 'Forlì', 'Frosinone', 'Gela', 'Genova', 'Gorizia', 'Grosseto', 'Imperia', 'Isernia', 'Ivrea',
  'Lagonegro', 'Lamezia Terme', 'Lanciano', 'Atessa', 'Lanusei', 'Larino', 'Latina', 'Lecce', 'Lecco',
  'Livorno', 'Portoferraio', 'Locri', 'Lodi', 'Lucca', 'Macerata', 'Mantova', 'Marsala', 'Massa', 'Matera',
  'Messina', 'Milano', 'Modena', 'Monza', 'Napoli', 'Ischia', 'Nocera Inferiore', 'Nola', 'Novara', 'Nuoro',
  'Aversa', 'Oristano', 'Padova', 'Palermo', 'Palmi', 'Paola', 'Parma', 'Patti', 'Pavia', 'Perugia', 'Pesaro',
  'Pescara', 'Piacenza', 'Pisa', 'Pistoia', 'Pordenone', 'Potenza', 'Prato', 'Ragusa', 'Ravenna', 
  'Reggio Calabria', 'Reggio Emilia', 'Rieti', 'Rimini', 'Roma', 'Rovereto', 'Rovigo', 'Salerno', 
  'Santa Maria Capua Vetere', 'Sassari', 'Savona', 'Sciacca', 'Siena', 'Siracusa', 'Sondrio', 'Spoleto',
  'Sulmona', 'Taranto', 'Tempio Pausania', 'Teramo', 'Termini Imerese', 'Terni', 'Tivoli', 'Torino',
  'Torre Annunziata', 'Trani', 'Trapani', 'Trento', 'Treviso', 'Trieste', 'Udine', 'Urbino', 
  'Vallo della Lucania', 'Varese', 'Vasto', 'Velletri', 'Venezia', 'Verbania', 'Vercelli', 'Verona',
  'Vibo Valentia', 'Vicenza', 'Viterbo',
  'Aquila', 'Spezia', 'Reggio di Calabria', 'Napoli Nord', 'Santa Maria C.V.', 'Capua Vetere'
];

// Funzione per identificare città nel testo
const identifyCities = (text, title) => {
  const contentLowerCase = text ? text.toLowerCase() : '';
  const titleLowerCase = title ? title.toLowerCase() : '';
  
  const matchedCities = ITALIAN_CITIES.filter(city => 
    contentLowerCase.includes(city.toLowerCase()) || 
    (title && titleLowerCase.includes(city.toLowerCase()))
  );
  
  return Array.from(new Set(matchedCities));
};

async function main() {
  console.log('🏛️  Aggiornamento città nei documenti esistenti...');
  
  // Conta documenti totali
  const total = await prisma.document.count();
  console.log(`📊 Totale documenti da processare: ${total}`);

  let updated = 0;
  const batchSize = 500; // Batch più piccolo per non sovraccaricare
  let skip = 0;

  const startTime = Date.now();

  while (skip < total) {
    const batchStart = Date.now();
    
    // Prendi batch di documenti
    const documents = await prisma.document.findMany({
      select: { id: true, title: true, content: true },
      skip: skip,
      take: batchSize
    });

    if (documents.length === 0) break;

    // Processa ogni documento nel batch
    const updatePromises = documents.map(async (doc) => {
      const cities = identifyCities(doc.content || '', doc.title);
      
      if (cities.length > 0) {
        await prisma.document.update({
          where: { id: doc.id },
          data: { cities: cities }
        });
        return 1;
      }
      return 0;
    });

    const results = await Promise.all(updatePromises);
    const batchUpdated = results.reduce((sum, r) => sum + r, 0);
    
    updated += batchUpdated;
    skip += batchSize;
    
    const percent = ((skip / total) * 100).toFixed(2);
    const batchTime = Date.now() - batchStart;
    const avgTime = (Date.now() - startTime) / skip * 1000;
    const eta = Math.round((total - skip) * avgTime / 1000 / 60);

    // Progress bar
    const barLength = 30;
    const filled = Math.round((skip / total) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);

    process.stdout.write(`\r[${bar}] ${percent}% | ${skip}/${total} | Aggiornati: ${updated} | Batch: ${batchTime}ms | ETA: ${eta}min`);
  }

  const totalTime = Math.round((Date.now() - startTime) / 1000);
  
  console.log('\n');
  console.log('✅ Aggiornamento città completato!');
  console.log(`📊 Documenti processati: ${skip}`);
  console.log(`🏛️  Documenti con città: ${updated}`);
  console.log(`⏱️  Tempo totale: ${totalTime}s`);
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Errore:', e);
  process.exit(1);
});

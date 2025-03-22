// Script per generare dati di test nel database
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Carica variabili d'ambiente
dotenv.config();

// Inizializza Prisma Client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log('🌱 Inizio seeding del database...');
  
  // Controlla se l'utente admin già esiste
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@itfplus.it' }
  });
  
  if (!existingAdmin) {
    // Crea un utente admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@itfplus.it',
        name: 'Admin ITFPLUS',
        role: 'ADMIN',
        password: hashedPassword
      }
    });
    
    console.log(`✅ Creato utente admin: ${admin.email}`);
  } else {
    console.log(`ℹ️ L'utente admin esiste già: ${existingAdmin.email}`);
  }
  
  // Controlla se esistono dei clienti
  const clientCount = await prisma.client.count();
  
  if (clientCount === 0) {
    // Crea alcuni clienti di esempio
    await prisma.client.createMany({
      data: [
        {
          name: 'Azienda ABC',
          address: 'Via Roma 123, Milano',
          contact: 'Mario Rossi',
          phone: '02 1234567',
          email: 'info@aziendaabc.it'
        },
        {
          name: 'Tech Solutions',
          address: 'Via Garibaldi 45, Roma',
          contact: 'Laura Bianchi',
          phone: '06 7654321',
          email: 'info@techsolutions.it'
        }
      ]
    });
    
    console.log('✅ Creati clienti di esempio');
  } else {
    console.log(`ℹ️ Ci sono già ${clientCount} clienti nel database`);
  }
  
  console.log('✅ Seeding completato con successo!');
}

// Esegui il seeding
main()
  .catch((e) => {
    console.error('❌ Errore durante il seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
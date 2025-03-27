// Script per migrazioni database su Vercel
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Inizio aggiornamento database su Vercel...');

  try {
    // 1. Aggiungi i campi mancanti alla tabella Document
    await prisma.$executeRaw`
      ALTER TABLE "Document" 
      ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "downloadCount" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "favoriteCount" INTEGER NOT NULL DEFAULT 0;
    `;
    console.log('Campi viewCount, downloadCount e favoriteCount aggiunti con successo');

    console.log('Database aggiornato con successo!');
  } catch (e) {
    console.error('Errore durante l\'aggiornamento del database:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
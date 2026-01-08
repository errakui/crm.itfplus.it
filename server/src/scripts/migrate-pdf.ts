import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { extractTextFromPDF, identifyCities } from '../utils/pdfUtils';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const UPLOADS_DIR = path.resolve(__dirname, '../../../server/uploads');

async function processPdfFiles(userId: string) {
  try {
    // Verifica se la directory esiste
    if (!fs.existsSync(UPLOADS_DIR)) {
      console.error(`❌ La directory ${UPLOADS_DIR} non esiste!`);
      return;
    }

    // Ottieni tutti i file PDF dalla directory uploads
    const files = fs.readdirSync(UPLOADS_DIR)
                   .filter(file => file.toLowerCase().endsWith('.pdf'));
    
    console.log(`Trovati ${files.length} file PDF da processare in ${UPLOADS_DIR}`);
    
    // Elaborare l'ultimo batch di file (dal 4001 alla fine)
    const filesToProcess = files.slice(4000);
    console.log(`Verranno elaborati gli ultimi ${filesToProcess.length} file (dal 4001 alla fine)`);
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    for (const file of filesToProcess) {
      const filePath = path.join(UPLOADS_DIR, file);
      // Correggi il percorso URL per il frontend (deve iniziare con /uploads/)
      const fileUrl = `/uploads/${file}`;
      
      try {
        // Verifica se il file esiste
        if (!fs.existsSync(filePath)) {
          console.error(`❌ File non trovato: ${filePath}`);
          errorCount++;
          continue;
        }
        
        // Verifica se esiste già un documento con lo stesso filePath
        const existingDoc = await prisma.document.findFirst({
          where: { filePath }
        });
        
        if (existingDoc) {
          console.log(`⏭️ Documento con filePath ${filePath} già presente nel database, viene saltato`);
          skippedCount++;
          continue;
        }
        
        const fileSize = fs.statSync(filePath).size;
        
        // Estrai il testo dal PDF
        console.log(`⏳ Elaborazione di ${file}...`);
        const content = await extractTextFromPDF(filePath);
        
        if (!content || content.length < 10) {
          console.warn(`⚠️ Testo insufficiente estratto da ${file}, possibile PDF scansionato o protetto`);
        }
        
        // Crea un titolo più leggibile
        let title = file.replace('.pdf', '');
        // Limita la lunghezza del titolo
        if (title.length > 100) {
          title = title.substring(0, 97) + '...';
        }
        
        // Identifica le città menzionate
        const cities = identifyCities(content, title);
        
        // Estrai alcune parole chiave dal contenuto
        const keywords = extractKeywords(content, cities);
        
        // Crea un record nel database collegato all'utente admin
        await prisma.document.create({
          data: {
            title,
            description: `Sentenza ${title.split('_').join(' ')}`,
            fileUrl,
            filePath,
            fileSize,
            content,
            cities,
            keywords,
            uploadDate: new Date(),
            viewCount: 0,
            downloadCount: 0,
            favoriteCount: 0,
            user: {
              connect: { id: userId }
            }
          }
        });
        
        console.log(`✅ Documento ${file} elaborato e salvato con successo`);
        successCount++;
      } catch (error) {
        console.error(`❌ Errore nell'elaborazione di ${file}:`, error);
        errorCount++;
      }
    }
    
    console.log('📊 Statistiche migrazione:');
    console.log(`- Totale file trovati: ${files.length}`);
    console.log(`- File elaborati: ${filesToProcess.length}`);
    console.log(`- Successi: ${successCount}`);
    console.log(`- Errori: ${errorCount}`);
    console.log(`- Saltati (già esistenti): ${skippedCount}`);
  } catch (error) {
    console.error('❌ Errore generale durante la migrazione:', error);
  }
}

// Funzione di utilità per estrarre parole chiave dal contenuto
function extractKeywords(content: string, cities: string[]): string[] {
  const keywords: string[] = [...cities]; // Inizia con le città come parole chiave
  
  // Parole chiave legali comuni
  const legalTerms = [
    'sentenza', 'tribunale', 'corte', 'appello', 'cassazione',
    'giudice', 'ricorso', 'decreto', 'condanna', 'assoluzione',
    'prescrizione', 'risarcimento', 'danni', 'contratto', 'locazione',
    'sfratto', 'morosità', 'inadempimento', 'eredità', 'successione',
    'divorzio', 'separazione', 'affidamento', 'mantenimento', 'alimenti'
  ];
  
  // Verifica quali termini legali sono presenti nel contenuto
  const contentLower = content.toLowerCase();
  const foundTerms = legalTerms.filter(term => contentLower.includes(term));
  
  // Aggiungi i termini trovati alle parole chiave
  keywords.push(...foundTerms);
  
  // Limita il numero di parole chiave e rimuovi i duplicati
  return [...new Set(keywords)].slice(0, 20);
}

// Funzione principale modificata per cercare un utente admin prima
async function main() {
  try {
    // Trova un utente admin nel database o creane uno se non esiste
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!adminUser) {
      console.log('⚠️ Nessun utente admin trovato, ne creo uno temporaneo');
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@itfplus.it',
          password: '$2b$10$7dQ9PBVUbZlG85RW9Op/g.Wa9NYhESlp.7vLNIGyJsA.iBDwZFiPe', // password: admin123
          name: 'Admin',
          role: 'ADMIN'
        }
      });
    }
    
    console.log(`👤 Usando l'utente admin con ID: ${adminUser.id}`);
    
    // Ora processiamo i PDF collegandoli all'utente admin
    await processPdfFiles(adminUser.id);
  } catch (error) {
    console.error('❌ Errore principale:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🏁 Script di migrazione completato');
  }
}

// Chiamiamo la funzione main invece di processPdfFiles direttamente
main()
  .catch(e => console.error('Errore durante la migrazione:', e)); 
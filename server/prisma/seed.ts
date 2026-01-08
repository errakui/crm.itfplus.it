import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Inizializzazione degli utenti di test...');

  // Cancella gli utenti esistenti con email "user" o "admin" se esistono
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: 'user@itfplus.com' },
        { email: 'admin@itfplus.com' }
      ]
    }
  });

  // Crea l'utente normale
  const hashedPasswordUser = await bcrypt.hash('user', 10);
  const user = await prisma.user.create({
    data: {
      email: 'user@itfplus.com',
      password: hashedPasswordUser,
      name: 'Utente Test',
      role: Role.USER
    }
  });
  console.log(`Utente creato: ${user.email} (${user.role})`);

  // Crea l'utente amministratore
  const hashedPasswordAdmin = await bcrypt.hash('admin', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@itfplus.com',
      password: hashedPasswordAdmin,
      name: 'Amministratore',
      role: Role.ADMIN
    }
  });
  console.log(`Utente creato: ${admin.email} (${admin.role})`);

  console.log('Utenti di test inizializzati con successo!');
  console.log('Credenziali:');
  console.log('- Utente normale: user@itfplus.com / user');
  console.log('- Amministratore: admin@itfplus.com / admin');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 
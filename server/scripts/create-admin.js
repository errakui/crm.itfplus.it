const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Verifica se l'utente esiste già
  const existingUser = await prisma.user.findUnique({
    where: {
      email: 'info@itfplus.it'
    }
  });

  if (existingUser) {
    console.log('L\'utente admin esiste già');
    return;
  }

  // Cripta la password
  const hashedPassword = await bcrypt.hash('admin', 10);

  // Crea l'utente admin
  const user = await prisma.user.create({
    data: {
      email: 'info@itfplus.it',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN'
    }
  });

  console.log(`Utente admin creato con ID: ${user.id}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
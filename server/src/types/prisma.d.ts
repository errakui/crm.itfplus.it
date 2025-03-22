import { Prisma } from '@prisma/client';

declare global {
  namespace PrismaTypes {
    // L'estensione deve allinearsi con il modello Prisma attuale
    // isPublic è stato rimosso dallo schema Prisma
    interface DocumentWhereInputExtension extends Prisma.DocumentWhereInput {
      // Campi estesi devono corrispondere allo schema Prisma
    }
  }
}

export {}; 
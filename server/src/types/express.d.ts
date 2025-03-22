import { Request } from 'express';
import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        name?: string;
      };
    }
  }
}

// Questo file è una dichiarazione di tipo, quindi deve essere esportato per essere riconosciuto
export {}; 
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { Role } from '@prisma/client';

/**
 * Middleware per verificare il token JWT
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    console.log(`[Auth] Tentativo di autenticazione con token: ${token ? 'presente' : 'assente'}`);

    if (!token) {
      res.status(401).json({ message: 'Accesso negato. Token mancante.' });
      return;
    }

    try {
      // Verifica il token nella sessione
     // 1. Controlla se esiste una sessione per questo token
const session = await prisma.session.findUnique({
  where: { token }
});

if (!session) {
  console.log(`[Auth] Sessione non trovata. Token non valido: ${token.substring(0, 10)}...`);
  res.status(401).json({ message: 'Sessione non valida. Fai login di nuovo.' });
}

// 2. Controlla se la sessione è scaduta
if (session && new Date() > session.expiresAt) {
  console.log(`[Auth] Sessione scaduta. Eliminazione...`);
  await prisma.session.delete({ where: { id: session.id } });
  res.status(401).json({ message: 'Sessione scaduta. Fai login di nuovo.' });
  return;
}


      if (!session || new Date() > session.expiresAt) {
        if (session) {
          // Elimina la sessione scaduta
          await prisma.session.delete({
            where: { id: session.id }
          });
          console.log(`[Auth] Sessione scaduta per token: ${token.substring(0, 10)}...`);
        } else {
          console.log(`[Auth] Sessione non trovata per token: ${token.substring(0, 10)}...`);
        }
        
        res.status(401).json({ message: 'Sessione scaduta o non valida.' });
        return;
      }

      console.log(`[Auth] Sessione valida trovata per token: ${token.substring(0, 10)}...`);

      // Verifica il token JWT
      jwt.verify(token, process.env.JWT_SECRET || 'secret-fallback', (err, decoded) => {
        if (err) {
          console.error(`[Auth] Errore verifica JWT:`, err);
          res.status(403).json({ message: 'Token non valido.' });
          return;
        }

        // Aggiungi l'utente decodificato alla richiesta
        req.user = {
          id: (decoded as any).id,
          email: (decoded as any).email,
          role: (decoded as any).role as Role,
          name: (decoded as any).name
        };
        
        console.log(`[Auth] Utente autenticato: ${req.user.email} (${req.user.role})`);
        next();
      });
    } catch (error) {
      console.error(`[Auth] Errore durante l'autenticazione:`, error);
      res.status(500).json({ message: 'Errore durante l\'autenticazione.' });
    }
  } catch (error) {
    console.error(`[Auth] Errore generico:`, error);
    res.status(500).json({ message: 'Errore durante l\'autenticazione.' });
  }
};

/**
 * Middleware per verificare il ruolo ADMIN
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  console.log(`[Admin Check] Verifica ruolo admin per utente:`, req.user);
  
  if (!req.user) {
    console.log(`[Admin Check] Nessun utente trovato nella richiesta`);
    res.status(401).json({ message: 'Accesso negato. Autenticazione richiesta.' });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    console.log(`[Admin Check] Utente non admin. Ruolo: ${req.user.role}`);
    res.status(403).json({ message: 'Accesso negato. Autorizzazione ADMIN richiesta.' });
    return;
  }

  console.log(`[Admin Check] Accesso admin confermato per: ${req.user.email}`);
  next();
};

/**
 * Middleware per verificare solo l'autenticazione dell'utente
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  console.log(`[Auth Check] Verifica autenticazione per utente:`, req.user);
  
  if (!req.user) {
    console.log(`[Auth Check] Nessun utente trovato nella richiesta`);
    res.status(401).json({ message: 'Accesso negato. Autenticazione richiesta.' });
    return;
  }

  console.log(`[Auth Check] Utente autenticato: ${req.user.email}`);
  next();
}; 
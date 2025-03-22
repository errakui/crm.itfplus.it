import { Request, Response, NextFunction } from 'express';

/**
 * Middleware per registrare informazioni sulle richieste
 */
export const logMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const { method, path, ip, headers } = req;
  const userAgent = headers['user-agent'] || 'Unknown';
  
  console.log(`[${new Date().toISOString()}] ${method} ${path} - IP: ${ip} - User-Agent: ${userAgent}`);
  
  if (req.user) {
    console.log(`[Request] Utente: ${(req.user as any).email} (${(req.user as any).role})`);
  } else {
    console.log('[Request] Utente: Non autenticato');
  }
  
  next();
}; 
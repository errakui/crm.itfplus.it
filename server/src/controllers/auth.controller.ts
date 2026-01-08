import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { sendAccountEmail, sendPasswordChangedEmail } from '../utils/emailService';

// Enum per i ruoli (corrispondente all'enum nel database)
enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

// Interfacce
interface RegisterUserRequest {
  email: string;
  password: string;
  name?: string;
  role?: Role;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AdminUserRequest {
  email: string;
  name: string;
  role: Role;
  expiresInDays: number; // 30 o 360 giorni
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Controller per la registrazione
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role }: RegisterUserRequest = req.body;

    // Verifica se l'utente esiste già
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({ message: 'L\'utente esiste già' });
      return;
    }

    // Hash della password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creazione utente nel database
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || Role.USER
      }
    });

    // Ometti la password nel risultato
    const { password: _, ...userWithoutPassword } = newUser;

    // Generazione token JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'secret-fallback',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Utente registrato con successo',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Errore nella registrazione:', error);
    res.status(500).json({ message: 'Errore nella registrazione dell\'utente' });
  }
};

// Controller per il login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Verifica se l'utente esiste
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(401).json({ message: 'Credenziali non valide' });
      return;
    }

    // Verifica se l'account è scaduto
    if (user.expiresAt && new Date() > user.expiresAt) {
      res.status(401).json({ message: 'Il tuo account è scaduto. Contatta l\'amministratore.' });
      return;
    }

    // Verifica della password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Credenziali non valide' });
      return;
    }

    // Ometti la password nel risultato
    const { password: _, ...userWithoutPassword } = user;

    // Generazione token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret-fallback',
      { expiresIn: '1d' }
    );

// Elimina tutte le sessioni attive precedenti
await prisma.session.deleteMany({
  where: { userId: user.id },
});

// Salva la nuova sessione
await prisma.session.create({
  data: {
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 ore
  },
});


    res.status(200).json({
      message: 'Login effettuato con successo',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Errore durante il login:', error);
    res.status(500).json({ message: 'Errore durante il login' });
  }
};

// Controller per il logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Token non fornito' });
      return;
    }

    // Elimina la sessione
    await prisma.session.deleteMany({
      where: { token }
    });

    res.status(200).json({ message: 'Logout effettuato con successo' });
  } catch (error) {
    console.error('Errore durante il logout:', error);
    res.status(500).json({ message: 'Errore durante il logout' });
  }
};

// ----- FUNZIONI ADMIN PER GESTIONE UTENTI -----

// Ottiene tutti gli utenti
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Estrai i parametri di query
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const searchTerm = req.query.searchTerm as string;
    const sortBy = req.query.sortBy as string;
    
    console.log(`[API] Ricerca utenti con parametri:`, { 
      page, pageSize, searchTerm, sortBy 
    });
    
    // Calcola l'offset per la paginazione
    const skip = (page - 1) * pageSize;
    
    // Prepara i filtri di ricerca se è presente un termine di ricerca
    let where = {};
    if (searchTerm) {
      where = {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } }
        ]
      };
    }
    
    // Prepara l'ordinamento in base al parametro sortBy
    let orderBy: any = { createdAt: 'desc' }; // Default: più recenti prima
    
    if (sortBy) {
      const [field, direction] = sortBy.split('-');
      
      switch (field) {
        case 'expiresAt':
          orderBy = { 
            expiresAt: direction === 'asc' ? 'asc' : 'desc' 
          };
          break;
        case 'createdAt':
          orderBy = { 
            createdAt: direction === 'asc' ? 'asc' : 'desc' 
          };
          break;
        // Aggiungi altri casi per diversi tipi di ordinamento se necessario
      }
    }
    
    // Esegui due query: una per i dati paginati e una per il conteggio totale
    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          expiresAt: true,
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.user.count({ where })
    ]);
    
    // Calcola il numero totale di pagine
    const totalPages = Math.ceil(totalUsers / pageSize);
    
    console.log(`[API] Risultati ricerca utenti:`, {
      totalUsers,
      users: users.length,
      page,
      totalPages
    });
    
    // Restituisci i risultati con metadati di paginazione
    res.status(200).json({
      users,
      page,
      pageSize,
      total: totalUsers,
      totalPages
    });
  } catch (error) {
    console.error('Errore nel recupero degli utenti:', error);
    res.status(500).json({ message: 'Errore nel recupero degli utenti' });
  }
};

// Ottiene un utente specifico
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'Utente non trovato' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Errore nel recupero dell\'utente:', error);
    res.status(500).json({ message: 'Errore nel recupero dell\'utente' });
  }
};

// Crea un nuovo utente
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, role, expiresInDays }: AdminUserRequest = req.body;

    // Verifica se l'utente esiste già
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ message: 'L\'utente con questa email esiste già' });
      return;
    }

    // Genera una password casuale
    const generatedPassword = Math.random().toString(36).slice(-8);
    
    // Hash della password
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Calcola la data di scadenza dell'account
    let expiresAt = null;
    if (expiresInDays) {
      expiresAt = new Date();
      // Impostiamo la data di scadenza esattamente a expiresInDays giorni dalla creazione
      // Usiamo setUTCHours(0,0,0,0) per impostare l'ora a mezzanotte
      expiresAt.setUTCHours(0, 0, 0, 0);
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays.toString()));
    }

    // Crea l'utente nel database
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        expiresAt,
      },
    });

    // Invia email con le credenziali
    try {
      await sendAccountEmail(email, name, generatedPassword, expiresInDays);
      console.log(`Email di credenziali inviata a ${email}`);
    } catch (emailError) {
      console.error('Errore nell\'invio dell\'email con le credenziali:', emailError);
      // Non interrompiamo la creazione dell'utente se l'email fallisce
    }

    // Ometti la password nel risultato
    const { password, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'Utente creato con successo',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Errore nella creazione dell\'utente:', error);
    res.status(500).json({ message: 'Errore nella creazione dell\'utente' });
  }
};

// Aggiorna un utente esistente
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, name, role, expiresInDays } = req.body;

    // Verifica se l'utente esiste
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      res.status(404).json({ message: 'Utente non trovato' });
      return;
    }

    // Verifica che l'email non sia già in uso da un altro utente
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        res.status(400).json({ message: 'L\'email è già in uso da un altro utente' });
        return;
      }
    }

    // Calcola la nuova data di scadenza dell'account
    let expiresAt = existingUser.expiresAt;
    if (expiresInDays) {
      expiresAt = new Date();
      // Impostiamo la data di scadenza esattamente a expiresInDays giorni
      // Usiamo setUTCHours(0,0,0,0) per impostare l'ora a mezzanotte
      expiresAt.setUTCHours(0, 0, 0, 0);
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays.toString()));
    }

    // Aggiorna l'utente
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email,
        name,
        role,
        expiresAt,
      },
    });

    // Ometti la password nel risultato
    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      message: 'Utente aggiornato con successo',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento dell\'utente:', error);
    res.status(500).json({ message: 'Errore nell\'aggiornamento dell\'utente' });
  }
};

// Elimina un utente
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verifica se l'utente esiste
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      res.status(404).json({ message: 'Utente non trovato' });
      return;
    }

    // Elimina prima tutte le sessioni dell'utente
    await prisma.session.deleteMany({
      where: { userId: id },
    });

    // Elimina l'utente
    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Utente eliminato con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione dell\'utente:', error);
    res.status(500).json({ message: 'Errore nell\'eliminazione dell\'utente' });
  }
};

// Cambio password utente
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: 'Utente non autenticato' });
      return;
    }
    
    const { currentPassword, newPassword }: ChangePasswordRequest = req.body;
    
    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Password attuale e nuova password sono richieste' });
      return;
    }
    
    if (newPassword.length < 6) {
      res.status(400).json({ message: 'La nuova password deve essere di almeno 6 caratteri' });
      return;
    }
    
    // Trova l'utente
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      res.status(404).json({ message: 'Utente non trovato' });
      return;
    }
    
    // Verifica la password attuale
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      res.status(401).json({ message: 'Password attuale non valida' });
      return;
    }
    
    // Hash della nuova password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Aggiorna la password dell'utente
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });
    
    // Invia email di notifica
    await sendPasswordChangedEmail(user.email, user.name || 'Utente');
    
    res.status(200).json({ message: 'Password aggiornata con successo' });
  } catch (error) {
    console.error('Errore nel cambio password:', error);
    res.status(500).json({ message: 'Errore interno durante il cambio password' });
  }
};

// GET /api/auth/admin/stats - Ottieni statistiche per admin
export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Richiesta statistiche admin ricevuta');
    const userRole = (req as any).user?.role;
    if (userRole !== 'ADMIN') {
      res.status(403).json({ message: 'Non autorizzato' });
      return;
    }

    // Esegui tutte le query in parallelo per ottimizzare le prestazioni
    const [totalUsers, activeUsers, totalDocuments, totalSizeResult] = await Promise.all([
      // Conta il numero totale di utenti
      prisma.user.count(),
      
      // Conta il numero di utenti attivi (non scaduti)
      prisma.user.count({
        where: {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      }),
      
      // Conta il numero totale di documenti
      prisma.document.count(),
      
      // Calcola la dimensione totale dei documenti
      prisma.document.aggregate({
        _sum: {
          fileSize: true
        }
      })
    ]);

    // Calcola la dimensione totale, gestendo il caso in cui sia null
    const totalSize = totalSizeResult._sum.fileSize || 0;

    console.log('Statistiche calcolate:', {
      totalUsers,
      activeUsers,
      totalDocuments,
      totalSize
    });

    res.status(200).json({
      stats: {
        totalUsers,
        totalDocuments,
        totalSize,
        activeUsers
      }
    });
  } catch (error) {
    console.error('Errore nel recupero delle statistiche:', error);
    // Se si verifica un errore, restituisci statistiche predefinite
    res.status(200).json({
      stats: {
        totalUsers: 0,
        totalDocuments: 0,
        totalSize: 0,
        activeUsers: 0
      },
      error: 'Errore nel calcolo delle statistiche'
    });
  }
}; 
// Interfacce per i tipi di dati
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  expiresInDays?: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  createdAt?: string;
  uploadDate?: string;
  userId?: string;
  fileName?: string;
  filePath?: string;
  fileUrl?: string;
  cloudinaryPublicId?: string;
  fileSize?: number;
  fileType?: string;
  mimeType?: string;
  keywords?: string[];
  city?: string;
  cities?: string[];
  isActive?: boolean;
  viewCount?: number;
  downloadCount?: number;
  favoriteCount?: number;
  user?: User;
} 
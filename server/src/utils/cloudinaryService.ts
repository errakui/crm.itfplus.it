import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Configurazione Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Carica un file su Cloudinary dalla memoria direttamente
 * @param file - Buffer o percorso del file da caricare
 * @param folder - Cartella dove salvare il file (opzionale)
 * @returns Promise con i dati di Cloudinary
 */
export const uploadBuffer = async (buffer: Buffer, fileOptions: { 
  originalname: string, 
  mimetype: string,
  folder?: string 
}): Promise<any> => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: fileOptions.folder || 'documents',
          resource_type: 'auto',
          public_id: path.parse(fileOptions.originalname).name,
          format: path.parse(fileOptions.originalname).ext.substring(1) || 'pdf'
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Errore durante l\'upload su Cloudinary:', error);
    throw error;
  }
};

/**
 * Carica un file su Cloudinary da un percorso locale
 * @param filePath - Percorso locale del file da caricare
 * @param folder - Cartella dove salvare il file (opzionale)
 * @returns Promise con i dati di Cloudinary
 */
export const uploadFile = async (filePath: string, folder?: string): Promise<any> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder || 'documents',
      resource_type: 'auto'
    });
    return result;
  } catch (error) {
    console.error('Errore durante l\'upload su Cloudinary:', error);
    throw error;
  }
};

/**
 * Elimina un file da Cloudinary usando il public_id
 * @param publicId - ID pubblico del file da eliminare
 * @returns Promise con la risposta di Cloudinary
 */
export const deleteFile = async (publicId: string): Promise<any> => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Errore durante l\'eliminazione da Cloudinary:', error);
    throw error;
  }
};

/**
 * Genera un URL firmato per accedere a un file protetto
 * @param publicId - ID pubblico del file
 * @param expiresAt - Timestamp di scadenza (default: 1 ora)
 * @returns URL firmato
 */
export const getSignedUrl = (publicId: string, expiresAt?: number): string => {
  // Default: scadenza tra un'ora
  const expiration = expiresAt || Math.floor(Date.now() / 1000) + 3600;
  
  return cloudinary.url(publicId, {
    secure: true,
    sign_url: true,
    expires_at: expiration
  });
}; 
import api from './apiService';
import { AxiosResponse } from 'axios';

// Funzioni di utilità per le chiamate API comuni
export const apiService = {
  // Auth
  login: (data: { email: string; password: string }) => 
    api.post('/auth/login', data),
  
  register: (data: { name: string; email: string; password: string }) => 
    api.post('/auth/register', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.post('/auth/change-password', data),
  
  // Documents
  getDocuments: (params?: any) => {
    try {
      // Verifica e pulisci i parametri
      if (!params) params = {};
      
      // Rimuovi i parametri undefined o array vuoti
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => {
          if (Array.isArray(value) && value.length === 0) return false;
          return value !== undefined;
        })
      );
      
      console.log('Parametri puliti:', cleanParams);
      return api.get('/documents', { params: cleanParams });
    } catch (error) {
      console.error('Errore nella preparazione della richiesta:', error);
      throw error;
    }
  },
  
  getDocument: (id: string) => 
    api.get(`/documents/${id}`),
  
  downloadDocument: async (documentId: string): Promise<AxiosResponse> => {
    return api.get(`/documents/${documentId}/download`, {
      responseType: 'arraybuffer'
    });
  },
  
  // Favorites
  getFavorites: () => 
    api.get('/documents/favorites'),
  
  addFavorite: (documentId: string) => 
    api.post('/documents/favorites', { documentId }),
  
  removeFavorite: (documentId: string) => 
    api.delete(`/documents/favorites/${documentId}`),
  
  // Admin
  getUsers: () => 
    api.get('/admin/users'),
  
  createUser: (data: any) => 
    api.post('/admin/users', data),
  
  updateUser: (id: string, data: any) => 
    api.put(`/admin/users/${id}`, data),
  
  deleteUser: (id: string) => 
    api.delete(`/admin/users/${id}`),
  
  getAllDocuments: () => 
    api.get('/documents/admin/all'),
  
  createDocument: (data: any) => 
    api.post('/documents', data),
  
  updateDocument: (id: string, data: any) => 
    api.put(`/documents/${id}`, data),
  
  deleteDocument: (id: string) => 
    api.delete(`/documents/${id}`, {
      timeout: 15000, // 15 secondi di timeout
      headers: {
        'Content-Type': 'application/json',
      }
    }),
  
  bulkUploadDocuments: (formData: FormData) => 
    api.post('/documents/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  
  // Support
  sendSupportRequest: (data: any) => 
    api.post('/support', data),
  
  // Contact
  sendContactForm: (data: any) => 
    api.post('/contact', data),
  
  // Chatbot
  sendChatMessage: (data: any) => 
    api.post('/chatbot/chat', data),
  
  // Cities
  getCities: () => 
    api.get('/documents/cities'),
  
  deleteMultipleDocuments: (documentIds: string[]) => 
    api.post('/documents/bulk-delete', { documentIds }),

  // Aggiungo questa funzione in api constant
  checkApiStatus: () => 
    api.get('/api', { timeout: 5000 }),
};

export default api; 
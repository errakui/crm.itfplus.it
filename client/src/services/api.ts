import axios from 'axios';

// Ottieni l'URL base dell'API dalla variabile d'ambiente o utilizza un URL fallback per lo sviluppo locale
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Crea un'istanza axios con l'URL base
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Necessario per mantenere i cookie di sessione
});

// Funzioni di utilità per le chiamate API comuni
export const apiService = {
  // Auth
  login: (data: { email: string; password: string }) => 
    api.post('/api/auth/login', data),
  
  register: (data: { name: string; email: string; password: string }) => 
    api.post('/api/auth/register', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.post('/api/auth/change-password', data),
  
  // Documents
  getDocuments: (params?: any) => 
    api.get('/api/documents', { params }),
  
  getDocument: (id: string) => 
    api.get(`/api/documents/${id}`),
  
  downloadDocument: (id: string) => 
    api.get(`/api/documents/${id}/download`, { responseType: 'blob' }),
  
  // Favorites
  getFavorites: () => 
    api.get('/api/documents/favorites'),
  
  addFavorite: (documentId: string) => 
    api.post('/api/documents/favorites', { documentId }),
  
  removeFavorite: (documentId: string) => 
    api.delete(`/api/documents/favorites/${documentId}`),
  
  // Admin
  getUsers: () => 
    api.get('/api/admin/users'),
  
  createUser: (data: any) => 
    api.post('/api/admin/users', data),
  
  updateUser: (id: string, data: any) => 
    api.put(`/api/admin/users/${id}`, data),
  
  deleteUser: (id: string) => 
    api.delete(`/api/admin/users/${id}`),
  
  getAllDocuments: () => 
    api.get('/api/documents/admin/all'),
  
  createDocument: (data: any) => 
    api.post('/api/documents', data),
  
  updateDocument: (id: string, data: any) => 
    api.put(`/api/documents/${id}`, data),
  
  deleteDocument: (id: string) => 
    api.delete(`/api/documents/${id}`),
  
  bulkUploadDocuments: (formData: FormData) => 
    api.post('/api/documents/bulk-upload', formData),
  
  // Support
  sendSupportRequest: (data: any) => 
    api.post('/api/support', data),
  
  // Contact
  sendContactForm: (data: any) => 
    api.post('/api/contact', data),
  
  // Chatbot
  sendChatMessage: (data: any) => 
    api.post('/api/chatbot/chat', data),
  
  // Cities
  getCities: () => 
    api.get('/api/documents/cities'),
};

export default api; 
import api from './apiService';

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
  getDocuments: (params?: any) => 
    api.get('/documents', { params }),
  
  getDocument: (id: string) => 
    api.get(`/documents/${id}`),
  
  downloadDocument: (id: string) => 
    api.get(`/documents/${id}/download`, { responseType: 'blob' }),
  
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
    api.delete(`/documents/${id}`),
  
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
};

export default api; 
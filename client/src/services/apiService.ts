import axios from 'axios';

const api = axios.create({
  baseURL: typeof window === "undefined"
    ? "https://crm-itfplus-it-beryl.vercel.app/api"
    : "/api",
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor per aggiungere il token di autenticazione a tutte le richieste
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

export const downloadDocument = async (documentId: string) => {
  return api.get(`/api/documents/${documentId}/download`, {
    responseType: 'arraybuffer'
  });
}; 
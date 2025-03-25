// Configurazione URL base per le API
const getApiBaseUrl = () => {
  // In produzione, usa l'URL relativo (che verrà servito dallo stesso dominio di Vercel)
  if (process.env.NODE_ENV === 'production') {
    return '';
  }
  // In sviluppo, usa localhost
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

export default API_BASE_URL; 
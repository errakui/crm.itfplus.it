// Configurazione URL base per le API
const getApiBaseUrl = () => {
  // In ambiente server-side
  if (typeof window === "undefined") {
    return "https://crm-itfplus-it-beryl.vercel.app/api";
  }
  // In browser (client-side)
  return "/api";
};

const API_BASE_URL = getApiBaseUrl();

export default API_BASE_URL; 
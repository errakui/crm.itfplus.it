import axios, { AxiosRequestConfig } from 'axios';

/**
 * API helper per gestire le richieste con parametri di query e paginazione
 */
const API = {
  /**
   * Esegue una richiesta GET con supporto migliore per parametri di query e paginazione
   */
  get: async <T>(url: string, params: Record<string, any> = {}, config: AxiosRequestConfig = {}) => {
    // Costruisci l'URL con i parametri di query
    let queryParams = new URLSearchParams();
    
    // Aggiungi tutti i parametri non vuoti
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          // Gestisci gli array (es. cities)
          value.forEach(item => queryParams.append(key, item));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
    
    // Converti in stringa e aggiungi all'URL se non è vuota
    const queryString = queryParams.toString();
    const finalUrl = queryString ? `${url}?${queryString}` : url;
    
    console.log(`[API] Richiesta GET a: ${finalUrl}`, { params });
    
    // Esegui la richiesta
    try {
      const response = await axios.get<T>(finalUrl, config);
      
      console.log(`[API] Risposta ricevuta da: ${finalUrl}`, {
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : 'non-array'
      });
      
      return response;
    } catch (error) {
      console.error(`[API] Errore nella richiesta GET a: ${finalUrl}`, error);
      throw error;
    }
  },
  
  /**
   * Esegue una richiesta GET paginata
   */
  getPaginated: async <T>(url: string, page: number, pageSize: number, params: Record<string, any> = {}, config: AxiosRequestConfig = {}) => {
    // Aggiungi i parametri di paginazione
    const paginatedParams = {
      ...params,
      page,
      pageSize
    };
    
    console.log(`[API] Richiesta paginata a: ${url}`, { page, pageSize, params });
    
    return API.get<T>(url, paginatedParams, config);
  }
};

export default API; 
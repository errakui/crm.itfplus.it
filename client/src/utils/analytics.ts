/**
 * Google Analytics 4 - Utility per tracciamento eventi
 * ID: G-YYJSR7QHK1
 */

// Dichiarazione TypeScript per gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

/**
 * Traccia un evento generico su GA4
 */
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, any>
): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
    console.log(`[Analytics] Event tracked: ${eventName}`, parameters);
  }
};

/**
 * Traccia una ricerca effettuata dall'utente
 */
export const trackSearch = (
  searchTerm: string,
  filters?: {
    cities?: string[];
    resultsCount?: number;
  }
): void => {
  trackEvent('search', {
    search_term: searchTerm,
    cities_filter: filters?.cities?.join(', ') || 'none',
    results_count: filters?.resultsCount || 0,
  });
};

/**
 * Traccia l'apertura di un documento/sentenza
 */
export const trackDocumentView = (
  documentId: string,
  documentTitle: string
): void => {
  trackEvent('view_document', {
    document_id: documentId,
    document_title: documentTitle,
  });
};

/**
 * Traccia l'aggiunta ai preferiti
 */
export const trackAddToFavorites = (
  documentId: string,
  documentTitle: string
): void => {
  trackEvent('add_to_favorites', {
    document_id: documentId,
    document_title: documentTitle,
  });
};

/**
 * Traccia la rimozione dai preferiti
 */
export const trackRemoveFromFavorites = (
  documentId: string
): void => {
  trackEvent('remove_from_favorites', {
    document_id: documentId,
  });
};

/**
 * Traccia il login utente
 */
export const trackLogin = (method: string = 'email'): void => {
  trackEvent('login', {
    method: method,
  });
};

/**
 * Traccia la registrazione (trial request)
 */
export const trackSignUp = (method: string = 'trial_popup'): void => {
  trackEvent('sign_up', {
    method: method,
  });
};

/**
 * Traccia l'uso di Booky (chat AI)
 */
export const trackBookyChat = (
  documentId: string,
  messageCount: number
): void => {
  trackEvent('booky_chat', {
    document_id: documentId,
    message_count: messageCount,
  });
};

/**
 * Traccia la visualizzazione di una pagina del blog
 */
export const trackBlogView = (
  articleSlug: string,
  articleTitle: string
): void => {
  trackEvent('blog_view', {
    article_slug: articleSlug,
    article_title: articleTitle,
  });
};

/**
 * Traccia il download di un documento
 */
export const trackDownload = (
  documentId: string,
  documentTitle: string
): void => {
  trackEvent('file_download', {
    document_id: documentId,
    document_title: documentTitle,
  });
};


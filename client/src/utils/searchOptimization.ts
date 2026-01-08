// 🚀 OTTIMIZZAZIONI PERFORMANCE RICERCA v1.0.0
// Solo performance, nessun cambio di design!

import { useCallback, useMemo, useRef } from 'react';

// Debounce function ottimizzata
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Cache semplice per risultati di ricerca
class SearchCache {
  private cache = new Map<string, any>();
  private maxSize = 50;

  set(key: string, value: any) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key: string, maxAge = 300000) { // 5 minuti default
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

// Istanza globale cache
export const searchCache = new SearchCache();

// Hook per debounced search ottimizzato
export const useOptimizedSearch = (callback: (...args: any[]) => void, delay: number = 150) => {
  const debouncedCallback = useCallback(
    debounce(callback, delay),
    [callback, delay]
  );

  return debouncedCallback;
};

// Ottimizzazione fetch con cache
export const optimizedFetch = async (url: string, options: RequestInit = {}) => {
  const cacheKey = `${url}_${JSON.stringify(options)}`;
  
  // Check cache first
  const cached = searchCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch con optimizations
  const response = await fetch(url, {
    ...options,
    keepalive: true, // Riutilizza connessioni
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Cache risultato
  searchCache.set(cacheKey, data);
  
  return data;
};

// Intersection Observer per lazy loading
export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const targetRef = useRef<HTMLElement>(null);

  const observer = useMemo(() => {
    if (typeof window === 'undefined') return null;
    
    return new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
      }
    }, {
      threshold: 0.1,
      ...options
    });
  }, [callback, options]);

  const setTarget = useCallback((element: HTMLElement | null) => {
    if (targetRef.current && observer) {
      observer.unobserve(targetRef.current);
    }
    
    if (element && observer) {
      observer.observe(element);
      targetRef.current = element;
    }
  }, [observer]);

  return { targetRef, setTarget };
};

// Ottimizzazione rendering liste grandi
export const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// Prefetch intelligente per query simili
export const generateSimilarQueries = (query: string): string[] => {
  if (!query || query.length < 3) return [];
  
  const words = query.toLowerCase().split(' ').filter(w => w.length > 2);
  const similar: string[] = [];
  
  // Query con parole singole
  words.forEach(word => {
    if (word !== query.toLowerCase()) similar.push(word);
  });
  
  // Query con combinazioni
  if (words.length > 1) {
    for (let i = 0; i < words.length - 1; i++) {
      similar.push(`${words[i]} ${words[i + 1]}`);
    }
  }
  
  return similar.slice(0, 3);
};

// Performance monitoring
export const measurePerformance = (name: string, fn: Function) => {
  return async (...args: any[]) => {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();
    
    console.log(`🚀 Performance [${name}]: ${(end - start).toFixed(2)}ms`);
    return result;
  };
};

const searchOptimizationUtils = {
  debounce,
  searchCache,
  useOptimizedSearch,
  optimizedFetch,
  useIntersectionObserver,
  chunkArray,
  generateSimilarQueries,
  measurePerformance
};

export default searchOptimizationUtils; 
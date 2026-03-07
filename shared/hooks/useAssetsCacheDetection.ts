'use client';

import { useEffect, useState } from 'react';

/**
 * Detecta si los assets están cargados desde cache HTTP del navegador
 * @returns { isFromCache: boolean, isLoading: boolean }
 */
export function useAssetsCacheDetection() {
  const [isFromCache, setIsFromCache] = useState<boolean | null>(null);

  useEffect(() => {
    // Dar tiempo a que los resources se registren en performance API
    const timer = setTimeout(() => {
      try {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        
        // Si todas las resources tienen transferSize = 0, están en cache
        const allFromCache = resources.length > 0 && resources.every(r => r.transferSize === 0);
        
        setIsFromCache(allFromCache);
      } catch (error) {
        console.error('Error detecting cache:', error);
        setIsFromCache(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return {
    isFromCache: isFromCache ?? false,
    isLoading: isFromCache === null,
  };
}

'use client';

import { useEffect, useState } from 'react';

/**
 * Detecta si los assets están cargados y espera a que las fuentes estén listas
 * @returns { isReady: boolean, isLoading: boolean }
 * 
 * isReady = true cuando:
 * - Assets están en cache, O
 * - Las fuentes han cargado completamente
 */
export function useAssetsCacheDetection() {
  const [isReady, setIsReady] = useState<boolean | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);

  useEffect(() => {
    const checkAssetsAndFonts = async () => {
      try {
        // 1. Check si assets están en cache
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const allFromCache = resources.length > 0 && resources.every(r => r.transferSize === 0);
        setIsFromCache(allFromCache);

        // 2. Si están en cache, no esperar fonts
        if (allFromCache) {
          setIsReady(true);
          return;
        }

        // 3. Si no están en cache, esperar a que fonts carguen indefinidamente
        // (o timeout muy grande en caso de error)
        const fontTimeout = setTimeout(() => {
          console.warn('[useAssetsCacheDetection] Font loading timeout (120s)');
          setIsReady(true);
        }, 120000); // 120 segundos (está algo está muy mal)

        // document.fonts.ready espera a que todas las @font-face estén cargadas
        if (document.fonts) {
          await document.fonts.ready;
          clearTimeout(fontTimeout);
          setIsReady(true);
        } else {
          // Fallback si Font Loading API no está disponible
          clearTimeout(fontTimeout);
          setIsReady(true);
        }
      } catch (error) {
        console.error('[useAssetsCacheDetection] Error:', error);
        setIsReady(true); // Continuar anyway
      }
    };

    // Pequeño delay para que performance API registre recursos
    const timer = setTimeout(() => {
      checkAssetsAndFonts();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return {
    isFromCache,
    isReady: isReady ?? false,
    isLoading: isReady === null,
  };
}

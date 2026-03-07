'use client';

import { useEffect, useState } from 'react';

/**
 * Detecta si los assets están cargados y espera a que las fuentes estén listas
 * GARANTIZA espera mínima de 1 segundo (para que splash screen sea visible)
 * 
 * @returns { isReady: boolean, isLoading: boolean }
 * 
 * isReady = true cuando:
 * - Fuentes han cargado completamente Y pasó 1 segundo mínimo
 * - O timeout de 120s + 1 segundo mínimo
 */
export function useAssetsCacheDetection() {
  const [isReady, setIsReady] = useState<boolean | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);

  useEffect(() => {
    const checkAssetsAndFonts = async () => {
      // Track start time for minimum wait
      const startTime = Date.now();
      const minWaitMs = 1000; // Esperar mínimo 1 segundo

      try {
        // 1. Check si assets están en cache
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const allFromCache = resources.length > 0 && resources.every(r => r.transferSize === 0);
        setIsFromCache(allFromCache);

        // 2. Esperar a fonts + garantizar 1 segundo mínimo
        let fontsReady = false;

        // Timeout fallback de 120 segundos
        const fontTimeout = setTimeout(() => {
          console.warn('[useAssetsCacheDetection] Font loading timeout (120s)');
          fontsReady = true;
        }, 120000);

        // Esperar a que fonts carguen
        if (document.fonts) {
          await document.fonts.ready;
          fontsReady = true;
          clearTimeout(fontTimeout);
        } else {
          // Fallback si Font Loading API no está disponible
          clearTimeout(fontTimeout);
          fontsReady = true;
        }

        // 3. Asegurar que pasó mínimo 1 segundo
        const elapsedMs = Date.now() - startTime;
        if (elapsedMs < minWaitMs) {
          await new Promise(resolve => setTimeout(resolve, minWaitMs - elapsedMs));
        }

        // 4. Ahora sí, marcar como ready
        if (fontsReady) {
          setIsReady(true);
        }
      } catch (error) {
        console.error('[useAssetsCacheDetection] Error:', error);
        
        // Fallback: asegurar 1 segundo mínimo
        const elapsedMs = Date.now() - startTime;
        if (elapsedMs < minWaitMs) {
          await new Promise(resolve => setTimeout(resolve, minWaitMs - elapsedMs));
        }
        
        setIsReady(true);
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

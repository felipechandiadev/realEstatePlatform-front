'use client';

import FullScreenLoader from '@/shared/components/ui/FullScreenLoader/FullScreenLoader';
import { useAssetsCacheDetection } from '@/shared/hooks/useAssetsCacheDetection';
import { usePathname } from 'next/navigation';
import { useSliderImagesReady } from '@/providers/SliderImagesReadyContext';

interface RootClientProps {
  children: React.ReactNode;
}

/**
 * Client wrapper for root layout to handle global loading screen
 * Shows loader on first app load when:
 * - Assets aren't cached AND
 * - Fonts are still loading
 * - AND route is /portal (only for portal pages)
 * 
 * Also waits for slider images to fully load on /portal when no cache
 * 
 * Auto-hides when:
 * - Assets are from cache, OR
 * - Fonts finish loading, AND
 * - Slider images are loaded (on /portal), OR
 * - Route is not /portal
 */
export default function RootClient({ children }: RootClientProps) {
  const { isFromCache, isReady } = useAssetsCacheDetection();
  const pathname = usePathname();
  const { areSliderImagesReady } = useSliderImagesReady();

  // Show loader only if:
  // - On /portal route AND
  // - NOT from cache AND
  // - NOT ready (waiting for fonts) AND
  // - Slider images not ready (if on portal)
  const isPortalRoute = pathname.startsWith('/portal');
  const showLoader = isPortalRoute && !isFromCache && (!isReady || !areSliderImagesReady);

  return (
    <>
      {/* Global full-screen loader - waits for fonts to load */}
      <FullScreenLoader 
        isVisible={showLoader}
        // No duration limit here, waits for fonts (max 4s timeout in hook)
      />

      {/* App content */}
      {children}
    </>
  );
}

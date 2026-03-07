'use client';

import FullScreenLoader from '@/shared/components/ui/FullScreenLoader/FullScreenLoader';
import { useAssetsCacheDetection } from '@/shared/hooks/useAssetsCacheDetection';

interface RootClientProps {
  children: React.ReactNode;
}

/**
 * Client wrapper for root layout to handle global loading screen
 * Shows loader on first app load when:
 * - Assets aren't cached AND
 * - Fonts are still loading
 * 
 * Auto-hides when:
 * - Assets are from cache, OR
 * - Fonts finish loading
 */
export default function RootClient({ children }: RootClientProps) {
  const { isFromCache, isReady } = useAssetsCacheDetection();

  // Show loader if NOT from cache AND NOT ready (waiting for fonts)
  const showLoader = !isFromCache && !isReady;

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

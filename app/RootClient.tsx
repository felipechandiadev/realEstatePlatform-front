'use client';

import { useState } from 'react';
import FullScreenLoader from '@/shared/components/ui/FullScreenLoader/FullScreenLoader';
import { useAssetsCacheDetection } from '@/shared/hooks/useAssetsCacheDetection';

interface RootClientProps {
  children: React.ReactNode;
}

/**
 * Client wrapper for root layout to handle global loading screen
 * Shows loader only on first app load when assets aren't cached
 */
export default function RootClient({ children }: RootClientProps) {
  const { isFromCache } = useAssetsCacheDetection();
  const [loaderComplete, setLoaderComplete] = useState(false);

  // Show loader only if not from cache and not already shown
  const showLoader = !isFromCache && !loaderComplete;

  return (
    <>
      {/* Global full-screen loader */}
      <FullScreenLoader 
        isVisible={showLoader} 
        duration={4000}
        onComplete={() => setLoaderComplete(true)}
      />

      {/* App content */}
      {children}
    </>
  );
}

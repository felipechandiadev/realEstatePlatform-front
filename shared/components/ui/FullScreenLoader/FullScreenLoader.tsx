'use client';

import React, { useEffect, useState } from 'react';
import DotProgress from '@/shared/components/ui/DotProgress/DotProgress';

interface FullScreenLoaderProps {
  isVisible: boolean;
  duration?: number; // milliseconds
  onComplete?: () => void;
}

/**
 * Full-screen loading overlay for app initialization
 * Shows EstateFlow branding + loading animation
 */
export default function FullScreenLoader({
  isVisible,
  duration = 4000,
  onComplete,
}: FullScreenLoaderProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    setShouldRender(true);

    const timer = setTimeout(() => {
      setShouldRender(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [isVisible, duration, onComplete]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-sm">
      <h1 className="text-5xl md:text-6xl font-bold text-primary">
        EstateFlow
      </h1>

      <p className="text-lg text-foreground">
        Servicios Inmobiliarios
      </p>

      <DotProgress className="justify-center" />
    </div>
  );
}

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface SliderImagesReadyContextType {
  areSliderImagesReady: boolean;
  setSliderImagesReady: (ready: boolean) => void;
}

const SliderImagesReadyContext = createContext<SliderImagesReadyContextType | undefined>(undefined);

export function SliderImagesReadyProvider({ children }: { children: React.ReactNode }) {
  const [areSliderImagesReady, setSliderImagesReady] = useState(false);

  return (
    <SliderImagesReadyContext.Provider value={{ areSliderImagesReady, setSliderImagesReady }}>
      {children}
    </SliderImagesReadyContext.Provider>
  );
}

export function useSliderImagesReady() {
  const context = useContext(SliderImagesReadyContext);
  if (!context) {
    throw new Error('useSliderImagesReady must be used within SliderImagesReadyProvider');
  }
  return context;
}

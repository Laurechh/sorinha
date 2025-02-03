import React, { createContext, useContext, useState, useEffect } from 'react';

const BACKGROUND_STORAGE_KEY = 'background_url';

type BackgroundContextType = {
  backgroundUrl: string | null;
  setBackgroundUrl: (url: string | null) => void;
};

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(() => {
    // Initialize state from localStorage
    const savedBackground = localStorage.getItem(BACKGROUND_STORAGE_KEY);
    return savedBackground ? savedBackground : null;
  });

  // Save to localStorage whenever backgroundUrl changes
  useEffect(() => {
    if (backgroundUrl) {
      localStorage.setItem(BACKGROUND_STORAGE_KEY, backgroundUrl);
    } else {
      localStorage.removeItem(BACKGROUND_STORAGE_KEY);
    }
  }, [backgroundUrl]);

  return (
    <BackgroundContext.Provider value={{ backgroundUrl, setBackgroundUrl }}>
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};
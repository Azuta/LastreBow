// src/context/MediaContext.tsx
"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchAllMedia } from '@/services/fetchAniList';

interface MediaRow {
  id: number;
  title: {
    romaji: string;
  };
  coverImage: {
    large: string;
  };
}

interface MediaContextType {
  mediaRows: MediaRow[];
  isLoading: boolean;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider = ({ children }: { children: ReactNode }) => {
  const [mediaRows, setMediaRows] = useState<MediaRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMedia = async () => {
      setIsLoading(true);
      try {
        const rows = await fetchAllMedia(); // Corregido: Llama a la función correcta
        setMediaRows(rows);
      } catch (error) {
        console.error("Failed to fetch media rows:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadMedia();
  }, []);

  return (
    <MediaContext.Provider value={{ mediaRows, isLoading }}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};
// src/context/mediaContext.tsx

"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Media } from "@/types/AniListResponse"; // <-- 1. Importa el tipo Media
import { fetchMediaRows, fetchMediaById as fetchMediaUtil } from "@/services/fetchAniList"; // Asumiendo que moviste tus funciones de fetch

// 2. Define la forma del contexto
interface MediaContextType {
  mediaRows: { title: string; data: Media[] }[];
  mediaDetail: Media | null;
  isLoading: boolean;
  fetchMediaById: (id: number) => Promise<void>;
}

// 3. Usa el tipo al crear el contexto
const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider = ({ children }: { children: ReactNode }) => {
  // 4. Aplica los tipos a tus estados
  const [mediaRows, setMediaRows] = useState<{ title: string; data: Media[] }[]>([]);
  const [mediaDetail, setMediaDetail] = useState<Media | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ... (el resto de tu lógica de fetch)

  const fetchMediaById = async (id: number) => {
    setIsLoading(true);
    try {
      const data = await fetchMediaUtil(id); // Tu función que obtiene datos por ID
      setMediaDetail(data); // El 'data' ya vendrá tipado como 'Media'
    } catch (error) {
      console.error("Failed to fetch media by id:", error);
      setMediaDetail(null);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    const loadMedia = async () => {
      setIsLoading(true);
      try {
        const rows = await fetchMediaRows(); // Tu función que obtiene las filas de medios
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
    <MediaContext.Provider value={{ mediaRows, mediaDetail, isLoading, fetchMediaById }}>
      {children}
    </MediaContext.Provider>
  );
};

// 5. Actualiza tu hook para que TypeScript sepa el tipo
export const useMedia = (): MediaContextType => {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error("useMedia must be used within a MediaProvider");
  }
  return context;
};
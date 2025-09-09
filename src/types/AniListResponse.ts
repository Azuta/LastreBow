// src/types/AniListResponse.ts

// --- NUEVOS TIPOS AÑADIDOS ---
export interface Staff {
  id: number;
  name: string;
  role: string;
  image: string;
}

export interface Character {
  id: number;
  name: string;
  role: 'MAIN' | 'SUPPORTING' | 'BACKGROUND';
  image: string;
}

export interface Relation {
  id: number;
  relationType: 'PREQUEL' | 'SEQUEL' | 'ADAPTATION' | 'SIDE_STORY' | 'SPIN_OFF';
  media: Media;
}

export interface Recommendation {
    id: number;
    media: Media;
}

// --- ESTRUCTURA DE CAPÍTULOS ACTUALIZADA ---

// Representa una única subida de un capítulo por un scan
export interface ChapterUpload {
  id: string; // ID único para la subida, ej: "scan-a-ch-150"
  scanGroup: string;
  uploadedAt: string;
  externalUrl?: string; // URL opcional para leer externamente
  notes?: string;
}

// Representa un número de capítulo que puede contener múltiples subidas
export interface Chapter {
  chapterNumber: string; // ej: "150" o "150.5"
  title?: string;
  uploads: ChapterUpload[];
}
// --- FIN DE LA ACTUALIZACIÓN DE ESTRUCTURA ---

// --- TIPO PRINCIPAL ACTUALIZADO ---
export interface Media {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string;
  };
  coverImage: {
    extraLarge: string;
    large: string;
    medium: string;
    color: string | null;
  };
  bannerImage: string | null;
  description: string;
  episodes: number | null;
  chapters: number | null;
  genres: string[];
  averageScore: number;
  popularity: number;
  status: 'RELEASING' | 'FINISHED' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
  format: string;
  type: 'ANIME' | 'MANGA';
  
  staff?: Staff[];
  characters?: Character[];
  relations?: Relation[];
  recommendations?: Recommendation[];
  trailer?: { id: string; site: string; } | null;
  
  chapterList?: Chapter[];
  collaboratorsCount?: number;
  scanGroupId?: string;
}

export interface PageInfo {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
}

export interface AniListResponse {
  Page: {
    pageInfo: PageInfo;
    media: Media[];
  };
}
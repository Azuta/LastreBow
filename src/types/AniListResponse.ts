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
  
  // --- NUEVOS CAMPOS OPCIONALES ---
  staff?: Staff[];
  characters?: Character[];
  relations?: Relation[];
  recommendations?: Recommendation[];
  trailer?: {
    id: string; // ID del video de YouTube
    site: string;
  } | null;
  
  meanScore?: number;
  favourites?: number;
  startDate?: { year: number | null; month: number | null; day: number | null; };
  endDate?: { year: number | null; month: number | null; day: number | null; };
  season?: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL' | null;
  seasonYear?: number | null;
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
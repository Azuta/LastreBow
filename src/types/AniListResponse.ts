// src/types/index.ts

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
    color: string | null; // Color también puede ser nulo
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

  // 👇 --- CAMPOS CORREGIDOS (HECHOS OPCIONALES) --- 👇
  meanScore?: number;
  favourites?: number;
  startDate?: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  endDate?: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  season?: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL' | null;
  seasonYear?: number | null;
  trailer?: {
    id: string;
    site: string;
    thumbnail: string;
  } | null;
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
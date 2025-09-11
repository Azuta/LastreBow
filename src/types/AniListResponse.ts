// src/types/AniListResponse.ts

// --- Tipos para Logros (Achievements) ---
export interface Achievement {
    id: string;
    name: string;
    description: string;
    type: 'reading' | 'genre' | 'community';
    progress: number;
    goal: number;
    icon: 'BookOpenIcon' | 'FlameIcon' | 'CrownIcon'; // Para renderizado dinámico
}

// --- Tipos para Comentarios ---
export interface CommentUser {
    username: string;
    avatarUrl: string;
}

export interface Comment {
    id: number;
    user: CommentUser;
    text: string;
    createdAt: string;
    likes: number;
    parentId: number | null; // Para anidar respuestas
    replies?: Comment[]; // Para contener las respuestas
}

// --- Tipos para Listas Personalizadas ---
export interface UserList {
    id: string;
    name: string;
    description: string;
    itemCount: number;
    coverImages: string[];
    user: {
        username: string;
    };
    collaborators?: CommentUser[]; // Para listas colaborativas
}

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

export interface ChapterUpload {
  id: string;
  scanGroup: string;
  uploadedAt: string;
  externalUrl?: string;
  notes?: string;
}

export interface Chapter {
  chapterNumber: string;
  title?: string;
  uploads: ChapterUpload[];
}

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
  tags?: string[];
  demographic?: 'Shounen' | 'Shoujo' | 'Seinen' | 'Josei' | null;
  staff?: Staff[];
  characters?: Character[];
  relations?: Relation[];
  recommendations?: Recommendation[];
  trailer?: { id: string; site: string; } | null;
  chapterList?: Chapter[];
  comments?: Comment[];
  collaboratorsCount?: number;
  scanGroupId?: string;
  isPrivate?: boolean;
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

// --- Tipos para la Gestión de Proyectos ---

export type TaskStatus = 'raw' | 'translating' | 'cleaning' | 'typesetting' | 'quality-check' | 'published';

export const StatusColumns: { [key in TaskStatus]: string } = {
  raw: 'RAW Adquirido',
  translating: 'Traducción',
  cleaning: 'Limpieza',
  typesetting: 'Typesetting',
  'quality-check': 'Control de Calidad',
  published: 'Publicado',
};

export interface Task {
  id: string; // "mangaId-chapterNumber"
  mangaId: number;
  chapterNumber: string;
  title: string;
  coverImage: string;
  status: TaskStatus;
  assignedTo?: { username: string; avatarUrl: string }[];
}

export interface Project extends Media {
    tasks: Task[];
}

export interface UserList {
    id: string;
    name: string;
    description: string;
    is_public: boolean; // <-- AÑADE ESTA LÍNEA
    itemCount: number;
    coverImages: string[];
    user: {
        username: string;
    };
    collaborators?: CommentUser[];
}

// --- Nuevo tipo para los plugins del Marketplace ---
export interface Plugin {
    id: string;
    type: 'user' | 'reader' | 'scan';
    name: string;
    description: string;
    isInstalled: boolean;
    icon: string;
}
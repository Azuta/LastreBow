// src/services/fetchAniList.ts

import { Media } from "@/types/AniListResponse";
import { mockMediaRows, mockMediaById } from "@/mock/mediaData";

// La función genérica que se comunica con nuestra propia API interna.
// En un futuro, esta sería la única función que realmente hace una llamada de red.
const fetchFromOurAPI = async <T = any>(query: string, variables: object = {}): Promise<T> => {
  const res = await fetch('/api/anilist', { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }

  const data = await res.json();
  return data.data as T; // La respuesta de AniList viene dentro de la propiedad "data"
};


// Fragmento de GraphQL para reutilizar campos comunes en las consultas de Media.
const mediaFragment = `
  fragment media on Media {
    id
    title {
      romaji
      english
      native
    }
    coverImage {
      extraLarge
      large
      medium
      color
    }
    bannerImage
    description
    episodes
    chapters
    genres
    averageScore
    popularity
    status
    format
    type
  }
`;

/**
 * Obtiene las filas de mangas para la página principal (Trending, Popular, etc.).
 * Actualmente, devuelve datos de prueba.
 */
export const fetchMediaRows = async (): Promise<{ title: string; data: Media[] }[]> => {
    console.log("⚡️ Usando datos de prueba (Mock Data) para las filas de la página principal.");
    return Promise.resolve(mockMediaRows);
};

/**
 * Obtiene los detalles completos de un manga específico por su ID.
 * Actualmente, devuelve un objeto de prueba detallado.
 * @param id - El ID del manga a buscar.
 */
export const fetchMediaById = async (id: number): Promise<Media> => {
  console.log(`⚡️ Usando datos de prueba (Mock Data) para Media ID: ${id}`);
  // Devolvemos el mock detallado que incluye staff, personajes, etc.
  return Promise.resolve(mockMediaById);
};

/**
 * Simula la obtención de mangas filtrados por una categoría y un género.
 * @param category - La categoría (ej. 'trending', 'popular').
 * @param genre - El género (ej. 'Action', 'all').
 */
export const fetchAllMediaByCategoryAndGenre = async (category: string, genre: string): Promise<Media[]> => {
  console.log(`⚡️ Usando Mocks para Categoria: ${category}, Genero: ${genre}`);
  
  // Usamos los datos de las filas como nuestra fuente principal
  const sourceData = mockMediaRows.flatMap(row => row.data);

  if (genre !== 'all') {
    return sourceData.filter(manga => 
      manga.genres.some(g => g.toLowerCase() === genre.toLowerCase())
    );
  }
  
  // Devolvemos una versión sin duplicados si el género es 'all'
  const uniqueMedia = sourceData.reduce((acc, current) => {
    if (!acc.find(item => item.id === current.id)) {
      acc.push(current);
    }
    return acc;
  }, [] as Media[]);

  return Promise.resolve(uniqueMedia);
};

/**
 * Simula la obtención de TODOS los mangas disponibles para la página de exploración general.
 */
export const fetchAllMedia = async (): Promise<Media[]> => {
  console.log("⚡️ Usando Mocks para obtener todos los mangas para la página de Explorar.");

  // Combinamos todos los datos de las filas de la página principal en un solo array
  const allMockMedia = mockMediaRows.flatMap(row => row.data);

  // Eliminamos duplicados basados en el ID del manga para tener una lista limpia
  const uniqueMedia = allMockMedia.reduce((acc, current) => {
    if (!acc.find(item => item.id === current.id)) {
      acc.push(current);
    }
    return acc;
  }, [] as Media[]);

  return Promise.resolve(uniqueMedia);
};

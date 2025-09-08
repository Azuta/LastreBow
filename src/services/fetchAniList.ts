// src/services/anilist.ts

import { Media } from "@/types/AniListResponse";
import { mockMediaRows, mockMediaById, dailyRankingMock, weeklyRankingMock, monthlyRankingMock } from "@/mock/mediaData";

// #################################################################
// ESTA ES LA ÚNICA FUNCIÓN QUE CAMBIA
// #################################################################

// La función genérica ahora llama a NUESTRA API, no a la de AniList
const fetchFromOurAPI = async <T = any>(query: string, variables: object = {}): Promise<T> => {
  //                                     👇 La llamada ahora es a nuestra API interna
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


// #################################################################
// ESTAS FUNCIONES NO NECESITAN CAMBIAR NADA
// #################################################################

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

export const fetchMediaRows = async (): Promise<{ title: string; data: Media[] }[]> => {
   if (process.env.NODE_ENV === 'development') {
    console.log("⚡️ Usando datos de prueba (Mock Data) para Media Rows");
    // Retorna los datos de prueba directamente, simulando una llamada a la API
    return Promise.resolve(mockMediaRows);
  } else {

  const trendingQuery = /* ... (tu query de trending) ... */ `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(sort: TRENDING_DESC, type: MANGA) {
          ...media
        }
      }
    }
    ${mediaFragment}
  `;
  const popularQuery = /* ... (tu query de popularidad) ... */ `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(sort: POPULARITY_DESC, type: MANGA) {
          ...media
        }
      }
    }
    ${mediaFragment}
  `;
  const favoritesQuery = /* ... (tu query de favoritos) ... */ `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(sort: FAVOURITES_DESC, type: MANGA) {
          ...media
        }
      }
    }
    ${mediaFragment}
  `;

  const variables = { page: 1, perPage: 10 };

  const [trendingData, popularData, favoritesData] = await Promise.all([
    fetchFromOurAPI<{ Page: { media: Media[] } }>(trendingQuery, variables),
    fetchFromOurAPI<{ Page: { media: Media[] } }>(popularQuery, variables),
    fetchFromOurAPI<{ Page: { media: Media[] } }>(favoritesQuery, variables),
  ]);

  return [
    { title: "Trending", data: trendingData.Page.media },
    { title: "Popular", data: popularData.Page.media },
    { title: "Most Favorited", data: favoritesData.Page.media },
  ];
  }
};

export const fetchMediaById = async (id: number): Promise<Media> => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`⚡️ Usando datos de prueba (Mock Data) para Media ID: ${id}`);
    return Promise.resolve(mockMediaById);
  } else {

  const query = `
    query ($id: Int) {
      Media(id: $id) {
        ...media
      }
    }
    ${mediaFragment}
  `;
  const variables = { id };
  const data = await fetchFromOurAPI<{ Media: Media }>(query, variables);
  return data.Media;
  }
};

// --- NUEVA FUNCIÓN AÑADIDA ---
// Simula la obtención de todos los mangas para una categoría y género específicos.
export const fetchAllMediaByCategoryAndGenre = async (category: string, genre: string): Promise<Media[]> => {
  console.log(`⚡️ Usando Mocks para Categoria: ${category}, Genero: ${genre}`);
  
  // En una aplicación real, aquí harías una llamada a la API con paginación y filtros.
  // Por ahora, usamos los datos de prueba del ranking y los filtramos.
  let sourceData: Media[] = [];
  
  // Elegimos una lista grande de mangas para simular
  if (category.toLowerCase() === 'popular') {
    sourceData = weeklyRankingMock;
  } else if (category.toLowerCase() === 'trending') {
      sourceData = dailyRankingMock;
  } else {
    sourceData = monthlyRankingMock;
  }
  
  // Si el género no es 'all', filtramos por ese género.
  if (genre !== 'all') {
    return sourceData.filter(manga => 
      manga.genres.some(g => g.toLowerCase() === genre.toLowerCase())
    );
  }

  // Si es 'all', devolvemos la lista completa.
  return sourceData;
};
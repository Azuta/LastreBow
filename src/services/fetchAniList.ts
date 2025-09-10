// src/services/fetchAniList.ts
import { Media } from "@/types/AniListResponse";
import { createClient } from "@/lib/supabaseClient";

const supabase = createClient();

/**
 * **FUNCIÓN CLAVE DE TRANSFORMACIÓN (ACTUALIZADA)**
 * Convierte un objeto de manga plano de la base de datos
 * al formato anidado que esperan tus componentes de React,
 * manejando correctamente las estructuras con "edges".
 */
const transformMedia = (dbMedia: any): Media => {
  // Función auxiliar para extraer datos de la estructura "edges" de forma segura
  const transformEdges = (edgeObject: any) => {
    if (edgeObject && Array.isArray(edgeObject.edges)) {
      return edgeObject.edges.map((edge: any) => ({
        ...edge.node, // Extrae los datos del manga/personaje/staff
        ...(edge.relationType && { relationType: edge.relationType }), // Añade el tipo de relación si existe
        ...(edge.role && { role: edge.role }), // Añade el rol si existe
      }));
    }
    return []; // Devuelve un array vacío si no hay datos
  };

  return {
    id: dbMedia.id,
    title: {
      romaji: dbMedia.title_romaji,
      english: dbMedia.title_english,
      native: dbMedia.title_native,
    },
    coverImage: {
      extraLarge: dbMedia.cover_image_extra_large,
      large: dbMedia.cover_image_large,
      medium: '',
      color: dbMedia.cover_image_color,
    },
    bannerImage: dbMedia.banner_image,
    description: dbMedia.description_en || '',
    chapters: dbMedia.chapters,
    genres: dbMedia.genres || [],
    averageScore: dbMedia.average_score,
    popularity: dbMedia.popularity,
    status: dbMedia.status,
    format: dbMedia.format,
    type: 'MANGA',
    episodes: dbMedia.episodes,
    trailer: dbMedia.trailer,
    // --- CAMPOS CORREGIDOS ---
    staff: transformEdges(dbMedia.staff),
    characters: transformEdges(dbMedia.characters),
    relations: transformEdges(dbMedia.relations),
    // -------------------------
    recommendations: dbMedia.recommendations || [], // Asumimos que este ya es un array
    comments: dbMedia.comments || [],
  };
};

export const fetchMediaRows = async (): Promise<{ title: string; data: Media[] }[]> => {
    console.log("⚡️ Fetching media from Supabase DB.");
    
    const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('popularity', { ascending: false })
        .limit(14);

    if (error) {
        console.error("Error fetching media rows:", error);
        return [];
    }

    const transformedData = data.map(transformMedia);

    return [
        { title: "Trending", data: transformedData.slice(0, 7) },
        { title: "Popular", data: transformedData.slice(7, 14) }
    ];
};

export const fetchAllMedia = async (): Promise<Media[]> => {
    const { data, error } = await supabase.from('media').select('*');
    if (error) {
        console.error('Error fetching all media:', error);
        return [];
    }
    return data.map(transformMedia);
};

export const fetchMediaById = async (id: number): Promise<Media | null> => {
  console.log(`⚡️ Fetching Media ID: ${id} from Supabase DB.`);
  
  const { data, error } = await supabase
    .from('media')
    .select('*, comments(*, profile:profiles(*))')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching media by id ${id}:`, error);
    return null;
  }
  
  return transformMedia(data);
};
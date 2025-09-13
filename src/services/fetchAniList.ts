// src/services/fetchAniList.ts
import { Media } from "@/types/AniListResponse";
import { createClient } from "@/lib/supabaseClient";

const supabase = createClient();

const transformMedia = (dbMedia: any): Media => {
  const transformEdges = (edgeObject: any) => {
    if (edgeObject && Array.isArray(edgeObject.edges)) {
      return edgeObject.edges.map((edge: any) => ({
        ...edge.node,
        ...(edge.relationType && { relationType: edge.relationType }),
        ...(edge.role && { role: edge.role }),
      }));
    }
    return [];
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
    staff: transformEdges(dbMedia.staff),
    characters: transformEdges(dbMedia.characters),
    relations: transformEdges(dbMedia.relations),
    recommendations: dbMedia.recommendations || [],
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

export const fetchFavoritesByUserId = async (userId: string): Promise<Media[]> => {
    const { data, error } = await supabase
        .from('user_favorites')
        .select('media:media_id (*)')
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching user favorites:", error);
        return [];
    }
    
    const mappedAndTransformed = (data || []).map(f => transformMedia(f.media));
    return mappedAndTransformed;
};

// <--- NUEVA FUNCIÓN AÑADIDA ---
export const fetchNewChaptersForUser = async (userId: string): Promise<Media[]> => {
    const { data, error } = await supabase.rpc('get_new_chapters_for_favorites', { user_id: userId });
    
    if (error) {
        console.error('Error fetching new chapters:', error);
        return [];
    }
    
    return data.map(transformMedia);
};

// <--- NUEVAS FUNCIONES DE RECOMENDACIÓN ---
export const fetchRecommendationsByAuthor = async (userId: string): Promise<Media[]> => {
    const { data, error } = await supabase.rpc('get_recommendations_by_author', { user_id: userId });
    if (error) {
        console.error('Error fetching author recommendations:', error);
        return [];
    }
    // Suponiendo que la función RPC devuelve IDs de media,
    // puedes mapearlos para obtener los datos completos.
    // Aquí usamos un mock por simplicidad.
    const mockRecommendations = [{
        "id": 87216, "title": { "english": "Demon Slayer", "romaji": "Kimetsu no Yaiba", "native": "Kimetsu no Yaiba" }, "coverImage": { "large": "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx87216-c9bSNVD10UuD.png", "extraLarge": "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx87216-c9bSNVD10UuD.png", "medium": "", "color": null }, "genres": ["Action", "Supernatural"], "averageScore": 79, "bannerImage": null, "chapters": null, "description": "", "episodes": null, "format": "MANGA", "popularity": 0, "status": "RELEASING", "type": "MANGA" 
    },
    { "id": 63327, "title": { "english": "Tokyo Ghoul", "romaji": "Tokyo Ghoul", "native": "Tokyo Ghoul" }, "coverImage": { "large": "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx63327-glC9cDxYBja9.png", "extraLarge": "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx63327-glC9cDxYBja9.png", "medium": "", "color": null }, "genres": ["Horror", "Psychological"], "averageScore": 84, "bannerImage": null, "chapters": null, "description": "", "episodes": null, "format": "MANGA", "popularity": 0, "status": "RELEASING", "type": "MANGA" }]
    return mockRecommendations;
};

export const fetchSocialRecommendations = async (userId: string): Promise<Media[]> => {
    const { data, error } = await supabase.rpc('get_social_recommendations', { user_id: userId });
    if (error) {
        console.error('Error fetching social recommendations:', error);
        return [];
    }
    // Simulación de datos
    const mockRecommendations = [{
        "id": 101517, "title": { "english": "Jujutsu Kaisen", "romaji": "Jujutsu Kaisen", "native": "Jujutsu Kaisen" }, "coverImage": { "large": "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx101517-H3TdM3g5ZUe9.jpg", "extraLarge": "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx101517-H3TdM3g5ZUe9.jpg", "medium": "", "color": null }, "genres": ["Action", "Supernatural"], "averageScore": 80, "bannerImage": null, "chapters": null, "description": "", "episodes": null, "format": "MANGA", "popularity": 0, "status": "RELEASING", "type": "MANGA"
    }];
    return mockRecommendations;
};

// <-- NUEVAS FUNCIONES PARA EL PROGRESO
export const updateReadingProgress = async (userId: string, mediaId: number, chapterNumber: string) => {
    const { error } = await supabase.rpc('update_reading_progress', {
        user_id: userId,
        media_id: mediaId,
        chapter_number: chapterNumber,
    });

    if (error) {
        console.error("Error updating reading progress:", error);
    }
};

export const fetchContinueReadingList = async (userId: string): Promise<Media[]> => {
    const { data, error } = await supabase
        .from('user_reading_progress')
        .select(`
            last_chapter_read,
            media:media_id (
                id,
                title_romaji,
                title_english,
                cover_image_large,
                cover_image_extra_large,
                chapters,
                genres,
                average_score,
                format,
                popularity
            )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error("Error fetching continue reading list:", error);
        return [];
    }
    
    // Mapear los datos para que coincidan con la estructura de Media
    return data.map(item => ({
        ...transformMedia(item.media),
        lastChapterRead: item.last_chapter_read,
    }));
};

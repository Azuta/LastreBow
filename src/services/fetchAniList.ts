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
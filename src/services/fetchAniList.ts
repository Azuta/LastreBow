// src/services/fetchAniList.ts
import { Media } from "@/types/AniListResponse";
import { createClient } from "@/lib/supabaseClient";

const supabase = createClient();

// Esta función ahora obtendrá los datos de tu propia BD
export const fetchMediaRows = async (): Promise<{ title: string; data: Media[] }[]> => {
    console.log("⚡️ Fetching media from Supabase DB.");
    
    // Ejemplo: Obtener los 7 más populares para "Trending"
    const { data: trendingData, error: trendingError } = await supabase
        .from('media')
        .select('*')
        .order('popularity', { ascending: false })
        .limit(7);

    if (trendingError) {
        console.error("Error fetching trending media:", trendingError);
    }
    
    // Aquí puedes añadir más consultas para otras secciones como "Popular"
    
    return [
        { title: "Trending", data: trendingData as Media[] || [] },
        // Puedes añadir más filas aquí
    ];
};

// Obtiene los detalles de un manga específico por su ID desde tu BD
export const fetchMediaById = async (id: number): Promise<Media | null> => {
  console.log(`⚡️ Fetching Media ID: ${id} from Supabase DB.`);
  
  const { data, error } = await supabase
    .from('media')
    .select(`
      *,
      comments (
        *,
        profile:profiles (*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching media by id ${id}:`, error);
    return null;
  }
  
  return data as Media;
};

// Y así sucesivamente para tus otras funciones de fetch...
export const fetchAllMedia = async (): Promise<Media[]> => {
    const { data, error } = await supabase.from('media').select('*');
    if (error) {
        console.error('Error fetching all media:', error);
        return [];
    }
    return data as Media[];
}
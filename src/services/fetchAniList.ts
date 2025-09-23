// src/services/fetchAniList.ts
import { Media, Task, ProjectProposal, Announcement, ScanHistoryItem } from '@/types/AniListResponse';
import { createClient } from '@/lib/supabaseClient';

const supabase = createClient();

// --- FUNCIÓN AUXILIAR MEJORADA PARA TRANSFORMAR LOS DATOS ---
const transformMedia = (item: any): Media => {
  if (!item) return null;

  // Helper para convertir datos de GraphQL a arrays planos
  const arrayFromEdges = (data: any) => {
    if (Array.isArray(data)) return data;
    if (data && data.edges) return data.edges.map((edge: any) => edge.node);
    if (data && data.nodes) return data.nodes;
    return [];
  };

  // --- NUEVO HELPER ESPECÍFICO PARA RELACIONES ---
  const relationsFromArray = (data: any) => {
      if (Array.isArray(data)) return data; // Si ya tiene el formato correcto
      if (data && data.edges) {
          // Mapeamos para crear el objeto { id, relationType, media } que el componente espera
          return data.edges.map((edge: any) => ({
              id: edge.id,
              relationType: edge.relationType,
              media: edge.node // 'node' contiene el objeto de media
          }));
      }
      return [];
  };
  
  return {
    id: item.id,
    title: {
      romaji: item.title_romaji || '',
      english: item.title_english || null,
      native: item.title_native || '',
    },
    coverImage: {
      extraLarge: item.cover_image_extra_large || '',
      large: item.cover_image_large || '',
      medium: '', 
      color: item.cover_image_color || null,
    },
    bannerImage: item.banner_image || null,
    description: item.description_en || item.description_es || '',
    episodes: item.episodes || null,
    chapters: item.chapters || null,
    genres: item.genres || [],
    averageScore: item.average_score || 0,
    popularity: item.popularity || 0,
    status: item.status || 'FINISHED',
    format: item.format || 'MANGA',
    type: item.type || 'MANGA',
    // --- AQUÍ SE USA LA NUEVA LÓGICA ---
    tags: Array.isArray(item.tags) ? item.tags : [],
    relations: relationsFromArray(item.relations),
    characters: arrayFromEdges(item.characters),
    staff: arrayFromEdges(item.staff),
    trailer: item.trailer || null,
    // Campos que no necesitan anidación
    title_romaji: item.title_romaji,
    title_english: item.title_english,
    cover_image_large: item.cover_image_large,
    cover_image_extra_large: item.cover_image_extra_large,
    isAdult: item.is_adult || false,
    startDate: item.start_date || {},
    endDate: item.end_date || {},
    season: item.season || null,
    seasonYear: item.season_year || null,
    duration: item.duration || null,
    countryOfOrigin: item.country_of_origin || null,
    source: item.source || null,
    hashtag: item.hashtag || null,
    synonyms: item.synonyms || [],
    meanScore: item.mean_score || 0,
    anilist_url: item.anilist_url || null,
    mal_id: item.mal_id || null,
  };
};


export const fetchMediaById = async (id: number): Promise<Media | null> => {
    const { data, error } = await supabase.from('media').select('*').eq('id', id).single();
    if (error) {
        console.error("Error fetching media:", error);
        return null;
    }
    return transformMedia(data);
};

export const fetchTrendingMedia = async (): Promise<Media[]> => {
    const { data, error } = await supabase.from('media').select('*').order('popularity', { ascending: false }).limit(10);
    if (error) { console.error("Error fetching trending media:", error); return []; }
    return data.map(transformMedia);
};

export const fetchPopularMedia = async (): Promise<Media[]> => {
    const { data, error } = await supabase.from('media').select('*').order('popularity', { ascending: false }).limit(20);
    if (error) { console.error("Error fetching popular media:", error); return []; }
    return data.map(transformMedia);
};

export const fetchRecentMedia = async (): Promise<Media[]> => {
    const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false }).limit(10);
    if (error) { console.error("Error fetching recent media:", error); return []; }
    return data.map(transformMedia);
};

export const fetchFavoritesByUserId = async (userId: string): Promise<Media[] | null> => {
    const { data, error } = await supabase.from('user_favorites').select('media:media_id(*)').eq('user_id', userId);
    if (error) { console.error("Error fetching favorites:", error); return null; }
    return data.map(fav => transformMedia(fav.media));
};

export const fetchAllMedia = async (): Promise<Media[]> => {
    const { data, error } = await supabase.from('media').select('*');
    if (error) { console.error('Error fetching all media:', error); return []; }
    return data.map(transformMedia);
};

export const createProjectProposal = async (groupId: string, proposerId: string, media: Media, note: string): Promise<void> => { const { error } = await supabase.from('project_proposals').insert({ scan_group_id: groupId, proposer_id: proposerId, media_id: media.id, note: note }); if (error) throw error; };
export const createAnnouncement = async (groupId: string, userId: string, content: string, isNotificationSent: boolean): Promise<void> => { const { error } = await supabase.from('announcements').insert({ group_id: groupId, user_id: userId, content: content, is_notification_sent: isNotificationSent }); if (error) throw error; };
export const addProjectToGroup = async (groupId: string, mediaId: number): Promise<void> => { const { error } = await supabase.from('scan_projects').insert({ group_id: groupId, media_id: mediaId }); if (error) throw error; };
export const fetchGroupAnnouncements = async (groupId: string): Promise<Announcement[]> => { const { data, error } = await supabase.from('announcements').select('*, user:user_id(username, avatar_url)').eq('group_id', groupId).order('created_at', { ascending: false }); if (error) { console.error("Error fetching announcements:", error); return []; } return data as Announcement[]; };
export const fetchScanHistory = async (groupId: string): Promise<ScanHistoryItem[]> => { const { data, error } = await supabase.from('scan_history').select('*, user:user_id(username, avatar_url)').eq('group_id', groupId).order('created_at', { ascending: false }); if (error) { console.error("Error fetching scan history:", error); return []; } return data as ScanHistoryItem[]; };
export const fetchProjectProposals = async (groupId: string): Promise<ProjectProposal[]> => { const { data, error } = await supabase.from('project_proposals').select('*, media:media_id(*), proposer:proposer_id(username, avatar_url)').eq('scan_group_id', groupId); if (error) { console.error("Error fetching proposals:", error); return []; } return data as ProjectProposal[]; };

export const fetchMediaRows = async (): Promise<{ title: string; data: Media[] }[]> => {
    try {
        const [trending, popular, recent] = await Promise.all([ fetchTrendingMedia(), fetchPopularMedia(), fetchRecentMedia() ]);
        return [
            { title: 'Trending', data: trending },
            { title: 'Popular', data: popular },
            { title: 'Recent', data: recent }
        ];
    } catch (error) {
        console.error("Error fetching all media rows:", error);
        return [];
    }
};

export const fetchRankingMedia = async ( criteria: 'popularity' | 'average_score' = 'popularity', limit: number = 12 ): Promise<Media[]> => {
  const { data, error } = await supabase.from('media').select('*').order(criteria, { ascending: false }).limit(limit);
  if (error) { console.error(`Error fetching ranking media by ${criteria}:`, error); return []; }
  return data.map(transformMedia);
};

export const fetchContinueReadingList = async (userId: string): Promise<Media[]> => {
    const { data, error } = await supabase.from('user_reading_progress').select(`last_chapter_read, media:media_id ( *, lastChapterRead:user_reading_progress(last_chapter_read) )`).eq('user_id', userId);
    if (error) { console.error("Error fetching continue reading list:", error); return []; }
    return data.map(item => transformMedia({ ...item.media, lastChapterRead: item.last_chapter_read, }));
};

export const fetchNewChaptersForUser = async (userId: string): Promise<Media[]> => {
    const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false }).limit(10);
    if (error) { console.error("Error fetching new chapters for user:", error); return []; }
    return data.map(transformMedia);
};

export const fetchRecommendationsByAuthor = async (userId: string): Promise<Media[]> => {
    const { data, error } = await supabase.from('media').select('*').limit(5);
    if(error) return [];
    return data.map(transformMedia);
}

export const fetchSocialRecommendations = async (userId: string): Promise<Media[]> => {
    const { data, error } = await supabase.from('media').select('*').limit(5);
    if(error) return [];
    return data.map(transformMedia);
}

export const fetchGroupProjects = async (groupId: string): Promise<Media[]> => {
  const { data, error } = await supabase.from('scan_projects').select('media:media_id(*)').eq('group_id', groupId);
  if (error) { console.error("Error fetching group projects:", error); return []; }
  return data.map(p => transformMedia(p.media));
};

export const fetchKanbanTasks = async (groupId: string): Promise<Task[]> => {
  const { data, error } = await supabase.from('kanban_tasks').select(`id, title, status, color, description, due_date, assignedTo:assigned_users ( profile:profiles ( id, username, avatar_url ) ), subtasks:kanban_subtasks ( *, assignees:kanban_subtask_assignees ( profile:profiles ( id, username, avatar_url ) ) )`).eq('group_id', groupId);
  if (error) { console.error("Error fetching kanban tasks:", error); return []; }
  return data.map(task => ({ ...task, assignedTo: task.assignedTo.map((a: any) => ({ id: a.profile.id, username: a.profile.username, avatarUrl: a.profile.avatar_url })), })) as Task[];
};
// src/services/fetchAniList.ts
import { Media, Task, ProjectProposal, Announcement, ScanHistoryItem } from '@/types/AniListResponse';
import { createClient } from '@/lib/supabaseClient';

const supabase = createClient();

export const fetchMediaById = async (id: number): Promise<Media | null> => { const { data, error } = await supabase.from('media').select('*').eq('id', id).single(); if (error) { console.error("Error fetching media:", error); return null; } return data as Media; };
export const fetchTrendingMedia = async (): Promise<Media[]> => { const { data, error } = await supabase.from('media').select('*').order('popularity', { ascending: false }).limit(10); if (error) { console.error("Error fetching trending media:", error); return []; } return data as Media[]; };
export const fetchPopularMedia = async (): Promise<Media[]> => { const { data, error } = await supabase.from('media').select('*').order('popularity', { ascending: false }).limit(20); if (error) { console.error("Error fetching popular media:", error); return []; } return data as Media[]; };
export const fetchRecentMedia = async (): Promise<Media[]> => { const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false }).limit(10); if (error) { console.error("Error fetching recent media:", error); return []; } return data as Media[]; };
export const fetchFavoritesByUserId = async (userId: string): Promise<Media[] | null> => { const { data, error } = await supabase.from('user_favorites').select('media:media_id(*)').eq('user_id', userId); if (error) { console.error("Error fetching favorites:", error); return null; } return data.map(fav => fav.media) as Media[]; };
export const fetchAllMedia = async (): Promise<Media[]> => { const { data, error } = await supabase.from('media').select('id, title_romaji, cover_image_large'); if (error) { console.error('Error fetching all media:', error); return []; } return data.map(m => ({ id: m.id, title: { romaji: m.title_romaji }, coverImage: { large: m.cover_image_large } })) as Media[]; };
export const createProjectProposal = async (groupId: string, proposerId: string, media: Media, note: string): Promise<void> => { const { error } = await supabase.from('project_proposals').insert({ scan_group_id: groupId, proposer_id: proposerId, media_id: media.id, note: note }); if (error) throw error; };
export const createAnnouncement = async (groupId: string, userId: string, content: string, isNotificationSent: boolean): Promise<void> => { const { error } = await supabase.from('announcements').insert({ group_id: groupId, user_id: userId, content: content, is_notification_sent: isNotificationSent }); if (error) throw error; };
export const addProjectToGroup = async (groupId: string, mediaId: number): Promise<void> => { const { error } = await supabase.from('scan_projects').insert({ group_id: groupId, media_id: mediaId }); if (error) throw error; };
export const fetchGroupAnnouncements = async (groupId: string): Promise<Announcement[]> => { const { data, error } = await supabase.from('announcements').select('*, user:user_id(username, avatar_url)').eq('group_id', groupId).order('created_at', { ascending: false }); if (error) { console.error("Error fetching announcements:", error); return []; } return data as Announcement[]; };
export const fetchScanHistory = async (groupId: string): Promise<ScanHistoryItem[]> => { const { data, error } = await supabase.from('scan_history').select('*, user:user_id(username, avatar_url)').eq('group_id', groupId).order('created_at', { ascending: false }); if (error) { console.error("Error fetching scan history:", error); return []; } return data as ScanHistoryItem[]; };
export const fetchProjectProposals = async (groupId: string): Promise<ProjectProposal[]> => { const { data, error } = await supabase.from('project_proposals').select('*, media:media_id(*), proposer:proposer_id(username, avatar_url)').eq('scan_group_id', groupId); if (error) { console.error("Error fetching proposals:", error); return []; } return data as ProjectProposal[]; };

export const fetchGroupProjects = async (groupId: string): Promise<Media[]> => {
  const { data, error } = await supabase
    .from('scan_projects')
    .select('media:media_id(*)')
    .eq('group_id', groupId);

  if (error) {
    console.error("Error fetching group projects:", error);
    return [];
  }

  return data.map(p => ({
    id: p.media.id,
    title: {
      romaji: p.media.title_romaji,
      english: p.media.title_english,
      native: p.media.title_native,
    },
    coverImage: {
      large: p.media.cover_image_large,
      extraLarge: p.media.cover_image_extra_large,
      medium: p.media.cover_image_medium,
      color: p.media.cover_image_color,
    },
    description: p.media.description,
    episodes: p.media.episodes,
    chapters: p.media.chapters,
    genres: p.media.genres,
    averageScore: p.media.average_score,
    popularity: p.media.popularity,
    status: p.media.status,
    format: p.media.format,
    type: p.media.type,
    bannerImage: p.media.banner_image,
  })) as Media[];
};

export const fetchKanbanTasks = async (groupId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('kanban_tasks')
    .select(`
      id, title, status, color, description, due_date,
      assignedTo:assigned_users ( profile:profiles ( id, username, avatar_url ) ),
      subtasks:kanban_subtasks ( *, assignees:kanban_subtask_assignees ( profile:profiles ( id, username, avatar_url ) ) )
    `)
    .eq('group_id', groupId);

  if (error) { console.error("Error fetching kanban tasks:", error); return []; }

  return data.map(task => ({
    ...task,
    assignedTo: task.assignedTo.map((a: any) => ({
        id: a.profile.id,
        username: a.profile.username,
        avatarUrl: a.profile.avatar_url
    })),
  })) as Task[];
};
// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { ToastContainer, ToastProps } from '@/components/ui/Toast';
import { Media, UserList } from '@/types/AniListResponse';
import { fetchFavoritesByUserId } from '@/services/fetchAniList';


type ToastType = 'success' | 'error' | 'info' | 'favorite-add' | 'favorite-remove';
type Toast = Omit<ToastProps, 'onDismiss'>;

interface Profile {
    id: string;
    username: string;
    avatar_url: string;
    role: string;
    scan_group_id?: string | null;
    has_completed_onboarding: boolean;
    bio?: string;
    banner_url?: string;
    social_links?: { [key: string]: string };
}

type NewListData = { name: string; description: string; is_public: boolean };

type ProfileUpdate = Partial<Profile>;

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    isLoggedIn: boolean;
    isVerified: boolean;
    favorites: Media[];
    userLists: UserList[];
    login: () => Promise<void>;
    logout: () => Promise<void>;
    followedScanGroups: string[];
    signInWithEmail: (email: string, password: string) => Promise<boolean>;
    signUpWithEmail: (username: string, email: string, password: string) => Promise<boolean>;
    updateUserProfile: (updates: ProfileUpdate) => Promise<Profile | null>;
    resendVerificationEmail: () => Promise<void>;
    toggleFavorite: (media: Media) => Promise<void>;
    createList: (listData: NewListData) => Promise<boolean>;
    toggleFollowGroup: (groupId: string, groupName: string) => Promise<void>;
    toggleListItem: (listId: number, media: Media) => Promise<void>;
    addToast: (message: string, type?: ToastType) => void;
    logUserActivity: (actionType: string, mediaId: number | null, isPrivate: boolean, actionData?: any) => Promise<void>;
    addMangasToList: (listId: string, mediaIds: number[]) => Promise<void>;
    removeMangaFromList: (listId: string, mediaId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const supabase = createClient();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [favorites, setFavorites] = useState<Media[]>([]);
    const [userLists, setUserLists] = useState<UserList[]>([]);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [followedScanGroups, setFollowedScanGroups] = useState<string[]>([]);
    const router = useRouter();

    const isVerified = !!user?.email_confirmed_at;

    useEffect(() => {
        const getSessionAndData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                await fetchUserData(session.user);
            }
        };
        getSessionAndData();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                const fetchedProfile = await fetchUserData(session.user);
                if (event === 'SIGNED_IN' && fetchedProfile && !fetchedProfile.has_completed_onboarding) {
                    router.push('/welcome');
                }
            } else {
                setProfile(null);
                setFavorites([]);
                setUserLists([]);
                setFollowedScanGroups([]);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [router]);

    const fetchUserData = async (user: User): Promise<Profile | null> => {
        const { data: profileData, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (error) {
            console.error("Error fetching profile:", error);
            setProfile(null);
            return null;
        }
        setProfile(profileData);
        const favoritesData = await fetchFavoritesByUserId(profileData.id);
        setFavorites(favoritesData || []);
        
        const { data: listsData } = await supabase.from('user_lists').select(`*, user:profiles!user_id(username)`).eq('user_id', profileData.id);
        setUserLists(listsData as UserList[] || []);
        
        const { data: followedGroupsData } = await supabase.from('user_followed_groups').select('group_id').eq('user_id', profileData.id);
        setFollowedScanGroups(followedGroupsData?.map(group => group.group_id) || []);
        return profileData;
    };

    const login = async () => { await supabase.auth.signInWithOAuth({ provider: 'discord' }); };
    const logout = async () => { await supabase.auth.signOut(); router.push('/'); };
    const signInWithEmail = async (email: string, password: string): Promise<boolean> => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { addToast(error.message, 'error'); return false; }
        return true;
    };

const signUpWithEmail = async (username: string, email: string, password: string): Promise<boolean> => {
    // BUG FIX: Añadimos un bloque try/catch para una captura de errores más robusta
    try {
        const { data, error } = await supabase.auth.signUp({
            email, password,
            options: {
                data: { username, avatar_url: `https://i.pravatar.cc/150?u=${username}` },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        
        if (error) { 
            throw new Error(error.message); 
        }

        if (data.user?.identities?.length === 0) {
            throw new Error('El correo electrónico ya existe. Por favor, inicia sesión o usa otro correo.');
        }

        addToast('Confirma tu correo para continuar', 'info');
        return true;

    } catch (error) {
        let errorMessage = 'No se pudo crear la cuenta. Inténtalo de nuevo más tarde.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        addToast(errorMessage, 'error'); 
        console.error("Error en signUpWithEmail:", error);
        return false;
    }
};


    const updateUserProfile = async (updates: ProfileUpdate): Promise<Profile | null> => {
        if (!user) return null;
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();
            
        if (error) {
            addToast(error.message, 'error');
            return null;
        }
        
        setProfile(data as Profile);
        return data as Profile;
    };
    
    const resendVerificationEmail = async () => {
        if (!user) return;
        const { error } = await supabase.auth.resend({ type: 'signup', email: user.email! });
        if (error) addToast(error.message, 'error'); else addToast('Correo de verificación reenviado.', 'success');
    };

    const logUserActivity = async (actionType: string, mediaId: number | null, isPrivate: boolean = false, actionData: any = {}) => {
      if (!user) return;
      
      const insertData: { [key: string]: any } = {
        user_id: user.id,
        action_type: actionType,
        action_data: actionData,
        is_private: isPrivate,
      };

      if (mediaId !== null) {
        insertData.media_id = mediaId;
      }
      
      const { error } = await supabase.from('user_activity').insert(insertData);

      if (error) {
        console.error("Error al registrar actividad del usuario:", error);
      }
    };
    
    const toggleFavorite = async (media: Media) => {
        if (!user) { addToast('Debes iniciar sesión para añadir a favoritos.', 'error'); return; }
        const isFavorite = favorites.some(fav => fav.id === media.id);
        if (isFavorite) {
            const { error } = await supabase.from('user_favorites').delete().match({ user_id: user.id, media_id: media.id });
            if (!error) {
                setFavorites(favorites.filter(fav => fav.id !== media.id));
                logUserActivity('remove_favorite', media.id, false, { title: media.title.romaji });
            }
        } else {
            const { error } = await supabase.from('user_favorites').insert({ user_id: user.id, media_id: media.id });
            if (!error) {
                setFavorites([...favorites, media]);
                const isAdultContent = media.genres.includes('Erotica');
                const isPrivate = isAdultContent && profile?.hideAdultContentOnProfile;
                logUserActivity('add_favorite', media.id, isPrivate, { title: media.title.romaji });
            }
        }
    };
    
    const toggleFollowGroup = async (groupId: string, groupName: string) => {
        if (!user) { addToast('Debes iniciar sesión para seguir a un grupo.', 'error'); return; }
        const isFollowing = followedScanGroups.includes(groupId);
        if (isFollowing) {
            const { error } = await supabase.from('user_followed_groups').delete().match({ user_id: user.id, group_id: groupId });
            if (!error) { 
                setFollowedScanGroups(followedScanGroups.filter(id => id !== groupId)); 
                addToast(`Dejaste de seguir a ${groupName}.`, 'info'); 
                logUserActivity('unfollow_group', null, false, { groupId, groupName });
            }
        } else {
            const { error } = await supabase.from('user_followed_groups').insert({ user_id: user.id, group_id: groupId });
            if (!error) { 
                setFollowedScanGroups([...followedScanGroups, groupId]); 
                addToast(`Ahora sigues a ${groupName}.`, 'success'); 
                logUserActivity('follow_group', null, false, { groupId, groupName });
            }
        }
    };

    const createList = async (listData: NewListData): Promise<boolean> => {
        if (!user) return false;
        const { data, error } = await supabase.from('user_lists').insert({ ...listData, user_id: user.id }).select().single();
        if (error) { 
            addToast(error.message, 'error'); 
            return false; 
        }
        setUserLists([...userLists, data as UserList]);
        if (data.id) {
          logUserActivity('create_list', null, !listData.is_public, { listId: data.id, listName: data.name });
        }
        return true;
    };

    const toggleListItem = async (listId: number, media: Media) => {
        addToast("Función 'Añadir a lista' aún no implementada.", 'info');
    };

    const addMangasToList = async (listId: string, mediaIds: number[]) => {
      if (!user) {
          addToast('Debes iniciar sesión para añadir mangas a una lista.', 'error');
          return;
      }
      const itemsToInsert = mediaIds.map(mediaId => ({
          list_id: listId,
          media_id: mediaId
      }));
      const { error } = await supabase.from('list_items').insert(itemsToInsert);
      if (error) {
          console.error("Error al añadir mangas a la lista:", error);
          addToast('Hubo un error al añadir los mangas.', 'error');
      } else {
          addToast(`Se añadieron ${mediaIds.length} manga(s) a la lista.`, 'success');
          logUserActivity('add_to_list', null, false, { listId, mangaCount: mediaIds.length });
      }
    };
    
    // --- NUEVA FUNCIÓN AÑADIDA ---
    const removeMangaFromList = async (listId: string, mediaId: number) => {
        if (!user) {
            addToast('Debes iniciar sesión para eliminar mangas de una lista.', 'error');
            return;
        }

        const { error } = await supabase.from('list_items').delete().match({
            list_id: listId,
            media_id: mediaId,
        });

        if (error) {
            console.error("Error al eliminar manga de la lista:", error);
            addToast('Hubo un error al eliminar el manga.', 'error');
        } else {
            addToast('Manga eliminado de la lista.', 'favorite-remove');
        }
    };

    const addToast = (message: string, type: ToastType = 'info') => {
        const newToast: Toast = { id: crypto.randomUUID(), message, type };
        setToasts(currentToasts => [...currentToasts, newToast]);
    };

    const removeToast = (id: string | number) => {
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    };

    const value = { user, profile, isLoggedIn: !!user, isVerified, favorites, userLists, followedScanGroups, login, logout, signInWithEmail, signUpWithEmail, updateUserProfile, resendVerificationEmail, toggleFavorite, toggleFollowGroup, createList, addMangasToList, removeMangaFromList, toggleListItem, addToast, logUserActivity };

    return (
        <AuthContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
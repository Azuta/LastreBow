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

interface ScanGroup {
    id: string;
    name: string;
    role: string;
}

interface Profile {
    id: string;
    username: string;
    avatar_url: string;
    role: string;
    has_completed_onboarding: boolean;
    bio?: string;
    banner_url?: string;
    social_links?: { [key: string]: string };
    hide_adult_content_on_profile: boolean;
    memberOfGroups: ScanGroup[];
    followed_groups: string[];
}

interface ProfileUpdate {
    username?: string;
    avatar_url?: string;
    bio?: string;
    banner_url?: string;
    social_links?: { [key: string]: string };
    hide_adult_content_on_profile?: boolean;
}

interface NewListData {
    name: string;
    is_private: boolean;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    isLoggedIn: boolean;
    isVerified: boolean;
    favorites: Media[];
    userLists: UserList[];
    followedScanGroups: string[];
    login: () => Promise<void>;
    logout: () => Promise<void>;
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
    updatePrimaryScan: (scanId: string | null) => Promise<void>;
    createGroup: (name: string, description: string) => Promise<string | null>;
    updateGroupImagesAndSocials: (groupId: string, updates: { logo_url?: string | null, banner_url?: string | null, social_links?: any }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const supabase = createClient();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [favorites, setFavorites] = useState<Media[]>([]);
    const [userLists, setUserLists] = useState<UserList[]>([]);
    const [followedScanGroups, setFollowedScanGroups] = useState<string[]>([]);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const router = useRouter();

    const addToast = (message: string, type: ToastType = 'info') => {
        const newToast = { id: Date.now(), message, type };
        setToasts(prev => [...prev, newToast]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const fetchUserData = async (user: User): Promise<Profile | null> => {
        const { data: profileData, error } = await supabase
            .from('profiles')
            // Corregido: Usar LEFT JOIN (`!left`) para incluir perfiles sin grupos.
            .select(`*, user_groups!left(role, scan_groups(id, name))`)
            .eq('id', user.id)
            .single();

        if (error) {
            console.error("Error fetching profile:", error);
            return null;
        }

        const memberOfGroups = profileData.user_groups.map(ug => ({
            id: ug.scan_groups.id,
            name: ug.scan_groups.name,
            role: ug.role,
        }));
        
        const finalProfile = {
            ...profileData,
            memberOfGroups,
        } as Profile;
        
        setProfile(finalProfile);
        const favoritesData = await fetchFavoritesByUserId(finalProfile.id);
        setFavorites(favoritesData || []);
        
        const { data: listsData } = await supabase.from('user_lists').select(`*, user:profiles!user_id(username)`).eq('user_id', finalProfile.id);
        setUserLists(listsData as UserList[] || []);
        
        const { data: followedGroupsData } = await supabase.from('user_followed_groups').select('group_id').eq('user_id', finalProfile.id);
        setFollowedScanGroups(followedGroupsData?.map(group => group.group_id) || []);
        return finalProfile;
    };

    const handleAuthChange = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setIsLoggedIn(!!user);
        setIsVerified(!!user?.email_confirmed_at);
        if (user) {
            await fetchUserData(user);
        } else {
            setProfile(null);
            setFavorites([]);
            setUserLists([]);
            setFollowedScanGroups([]);
        }
    };

    useEffect(() => {
        handleAuthChange();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            handleAuthChange();
        });
        return () => subscription.unsubscribe();
    }, []);

    const signInWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            addToast(error.message, 'error');
            return false;
        }
        addToast("Inicio de sesión exitoso. ¡Bienvenido de nuevo!", 'success');
        return true;
    };

    const signUpWithEmail = async (username: string, email: string, password: string) => {
        const { data: { user: newUser }, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { username } },
        });

        if (error) {
            addToast(error.message, 'error');
            return false;
        }

        if (newUser) {
            await supabase.from('profiles').insert({
                id: newUser.id,
                username: username,
                avatar_url: newUser.user_metadata.avatar_url,
                role: 'user',
            });
            addToast("Registro exitoso. Por favor, revisa tu correo para verificar tu cuenta.", 'success');
            return true;
        }
        return false;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error logging out:", error);
            addToast("Error al cerrar sesión.", 'error');
        } else {
            router.push('/login');
            addToast("Sesión cerrada correctamente.", 'success');
        }
    };

    const updateUserProfile = async (updates: ProfileUpdate): Promise<Profile | null> => {
        if (!user) return null;
        const { data, error } = await supabase.from('profiles').update(updates).eq('id', user.id).select().single();
        if (error) {
            console.error("Error updating profile:", error);
            return null;
        }
        setProfile(prev => prev ? { ...prev, ...data } : null);
        return data as Profile;
    };

    const toggleFavorite = async (media: Media) => {
        if (!user) {
            addToast("Necesitas iniciar sesión para añadir a favoritos.", "error");
            return;
        }
        
        const isCurrentlyFavorite = favorites.some(fav => fav.id === media.id);
        if (isCurrentlyFavorite) {
            const { error } = await supabase
                .from('user_favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('media_id', media.id);
            if (!error) {
                setFavorites(favorites.filter(fav => fav.id !== media.id));
            } else {
                console.error("Error removing favorite:", error);
            }
        } else {
            const { error } = await supabase
                .from('user_favorites')
                .insert({ user_id: user.id, media_id: media.id });
            if (!error) {
                setFavorites([...favorites, media]);
            } else {
                console.error("Error adding favorite:", error);
            }
        }
    };

    const createList = async (listData: NewListData) => {
        if (!user) {
            addToast("Debes iniciar sesión para crear una lista.", "error");
            return false;
        }
        const { data, error } = await supabase
            .from('user_lists')
            .insert({ user_id: user.id, name: listData.name, is_public: listData.is_private })
            .select()
            .single();

        if (error) {
            console.error("Error creating list:", error);
            addToast(`Error al crear la lista: ${error.message}`, "error");
            return false;
        }

        setUserLists(prevLists => [...prevLists, { ...data, items: [] }]);
        addToast(`Lista '${listData.name}' creada con éxito.`, 'success');
        return true;
    };

    const toggleFollowGroup = async (groupId: string, groupName: string) => {
        if (!user) {
            addToast("Debes iniciar sesión para seguir a un scan.", "error");
            return;
        }

        const isFollowing = followedScanGroups.includes(groupId);
        if (isFollowing) {
            const { error } = await supabase
                .from('user_followed_groups')
                .delete()
                .eq('user_id', user.id)
                .eq('group_id', groupId);
            if (!error) {
                setFollowedScanGroups(prev => prev.filter(id => id !== groupId));
                addToast(`Dejaste de seguir a ${groupName}.`, 'success');
            } else {
                console.error("Error unfollowing group:", error);
                addToast("Error al dejar de seguir al grupo.", 'error');
            }
        } else {
            const { error } = await supabase
                .from('user_followed_groups')
                .insert({ user_id: user.id, group_id: groupId });
            if (!error) {
                setFollowedScanGroups(prev => [...prev, groupId]);
                addToast(`Ahora sigues a ${groupName}.`, 'success');
            } else {
                console.error("Error following group:", error);
                addToast("Error al seguir al grupo.", 'error');
            }
        }
    };

    const toggleListItem = async (listId: number, media: Media) => {
        if (!user) return;
        const listToUpdate = userLists.find(l => l.id === listId);
        if (!listToUpdate) return;
        
        const isItemInList = listToUpdate.items.some(item => item.media_id === media.id);
        
        if (isItemInList) {
            const { error } = await supabase
                .from('user_list_items')
                .delete()
                .eq('list_id', listId)
                .eq('media_id', media.id);
            if (error) {
                console.error("Error removing item from list:", error);
            }
        } else {
            const { error } = await supabase
                .from('user_list_items')
                .insert({ list_id: listId, media_id: media.id });
            if (error) {
                console.error("Error adding item to list:", error);
            }
        }
    };
    
    const addMangasToList = async (listId: string, mediaIds: number[]) => {
        if (!user) {
            addToast("Debes iniciar sesión para añadir mangas a una lista.", "error");
            return;
        }

        const itemsToAdd = mediaIds.map(mediaId => ({ list_id: listId, media_id: mediaId }));
        
        const { error } = await supabase
            .from('user_list_items')
            .insert(itemsToAdd);

        if (error) {
            console.error("Error adding mangas to list:", error);
            addToast("Error al añadir mangas a la lista.", "error");
        } else {
            const updatedLists = userLists.map(list => 
                list.id === parseInt(listId) ? {
                    ...list,
                    items: [...list.items, ...itemsToAdd.map(item => ({ media_id: item.media_id }))]
                } : list
            );
            setUserLists(updatedLists as UserList[]);
            addToast("Mangas añadidos a la lista con éxito.", "success");
        }
    };

    const removeMangaFromList = async (listId: string, mediaId: number) => {
        if (!user) return;

        const { error } = await supabase
            .from('user_list_items')
            .delete()
            .eq('list_id', listId)
            .eq('media_id', mediaId);

        if (error) {
            console.error("Error removing manga from list:", error);
            addToast("Error al remover manga de la lista.", "error");
        } else {
            const updatedLists = userLists.map(list => 
                list.id === parseInt(listId) ? {
                    ...list,
                    items: list.items.filter(item => item.media_id !== mediaId)
                } : list
            );
            setUserLists(updatedLists as UserList[]);
            addToast("Manga removido de la lista con éxito.", "success");
        }
    };
    
    const logUserActivity = async (actionType: string, mediaId: number | null, isPrivate: boolean, actionData?: any) => {
        if (!user) return;
        const { error } = await supabase.from('user_activity').insert({
            user_id: user.id,
            action_type: actionType,
            media_id: mediaId,
            is_private: isPrivate,
            action_data: actionData,
        });
        if (error) {
            console.error("Error logging user activity:", error);
        }
    };
    
    const resendVerificationEmail = async () => {
        if (!user || user.email_confirmed_at) return;
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: user.email!,
        });

        if (error) {
            addToast(`Error al reenviar el correo: ${error.message}`, "error");
            console.error(error);
        } else {
            addToast("Correo de verificación reenviado. Revisa tu bandeja de entrada.", "success");
        }
    };

    const updatePrimaryScan = async (scanId: string | null) => {
        if (!user) return;
        const { error } = await supabase
            .from('user_groups')
            .update({ role: 'member' })
            .eq('user_id', user.id)
            .neq('group_id', scanId);

        if (error) {
            addToast(`Error al guardar el scan.`, 'error');
            console.error(error);
        } else {
            await supabase.from('user_groups').update({ role: 'primary' }).eq('user_id', user.id).eq('group_id', scanId);
            await fetchUserData(user);
            addToast(`Scan actualizado con éxito.`, 'success');
        }
    };

    const createGroup = async (name: string, description: string): Promise<string | null> => {
        if (!user) return null;
        
        const { data: group, error: groupError } = await supabase
            .from('scan_groups')
            .insert({ name, description, owner_id: user.id })
            .select('id')
            .single();

        if (groupError) {
            console.error("Error creating group:", groupError);
            addToast("Error al crear el grupo, puede que el nombre ya exista.", 'error');
            return null;
        }
        
        // Asignar al creador como miembro y admin
        const { error: memberError } = await supabase
            .from('user_groups')
            .insert({ user_id: user.id, group_id: group.id, role: 'admin' });

        if (memberError) {
            console.error("Error adding group creator as member:", memberError);
            addToast("El grupo fue creado, pero hubo un error al asignarte como miembro.", 'error');
            return null;
        }

        addToast(`Grupo "${name}" creado con éxito.`, 'success');
        await fetchUserData(user);
        return group.id;
    };
    
    const updateGroupImagesAndSocials = async (groupId: string, updates: { logo_url?: string | null, banner_url?: string | null, social_links?: any }) => {
        if (!user) return;
        
        const { error } = await supabase
            .from('scan_groups')
            .update(updates)
            .eq('id', groupId);

        if (error) {
            console.error("Error updating group images and socials:", error);
            addToast("Error al actualizar la información del grupo.", 'error');
        }
    };

    const value = {
        user,
        profile,
        isLoggedIn,
        isVerified,
        favorites,
        userLists,
        followedScanGroups,
        login: () => supabase.auth.signInWithOAuth({ provider: 'discord' }),
        logout,
        signInWithEmail,
        signUpWithEmail,
        updateUserProfile,
        resendVerificationEmail,
        toggleFavorite,
        createList,
        toggleFollowGroup,
        toggleListItem,
        addToast,
        logUserActivity,
        addMangasToList,
        removeMangaFromList,
        updatePrimaryScan,
        createGroup,
        updateGroupImagesAndSocials,
    };

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
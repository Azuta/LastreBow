// azuta/mangauserpage/MangaUserPage-main/src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { ToastContainer, ToastProps } from '@/components/ui/Toast';
import { Media, UserList } from '@/types/AniListResponse';

type ToastType = 'success' | 'error' | 'info';
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
    favorites: number[];
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const supabase = createClient();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [favorites, setFavorites] = useState<number[]>([]);
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
        const { data: favoritesData } = await supabase.from('user_favorites').select('media_id').eq('user_id', user.id);
        setFavorites(favoritesData?.map(fav => fav.media_id) || []);
        const { data: listsData } = await supabase.from('user_lists').select('*').eq('user_id', user.id);
        setUserLists(listsData as UserList[] || []);
        const { data: followedGroupsData } = await supabase.from('user_followed_groups').select('group_id').eq('user_id', user.id);
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
        const { data, error } = await supabase.auth.signUp({
            email, password,
            options: {
                data: { username, avatar_url: `https://i.pravatar.cc/150?u=${username}` },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) { addToast(error.message, 'error'); return false; }
        return true;
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

    const toggleFavorite = async (media: Media) => {
        if (!user) { addToast('Debes iniciar sesión para añadir a favoritos.', 'error'); return; }
        const isFavorite = favorites.includes(media.id);
        if (isFavorite) {
            const { error } = await supabase.from('user_favorites').delete().match({ user_id: user.id, media_id: media.id });
            if (!error) setFavorites(favorites.filter(id => id !== media.id));
        } else {
            const { error } = await supabase.from('user_favorites').insert({ user_id: user.id, media_id: media.id });
            if (!error) setFavorites([...favorites, media.id]);
        }
    };
    
    const toggleFollowGroup = async (groupId: string, groupName: string) => {
        if (!user) { addToast('Debes iniciar sesión para seguir a un grupo.', 'error'); return; }
        const isFollowing = followedScanGroups.includes(groupId);
        if (isFollowing) {
            const { error } = await supabase.from('user_followed_groups').delete().match({ user_id: user.id, group_id: groupId });
            if (!error) { setFollowedScanGroups(followedScanGroups.filter(id => id !== groupId)); addToast(`Dejaste de seguir a ${groupName}.`, 'info'); }
        } else {
            const { error } = await supabase.from('user_followed_groups').insert({ user_id: user.id, group_id: groupId });
            if (!error) { setFollowedScanGroups([...followedScanGroups, groupId]); addToast(`Ahora sigues a ${groupName}.`, 'success'); }
        }
    };

    const createList = async (listData: NewListData): Promise<boolean> => {
        if (!user) return false;
        const { data, error } = await supabase.from('user_lists').insert({ ...listData, user_id: user.id }).select().single();
        if (error) { addToast(error.message, 'error'); return false; }
        setUserLists([...userLists, data as UserList]);
        return true;
    };

    const toggleListItem = async (listId: number, media: Media) => {
        addToast("Función 'Añadir a lista' aún no implementada.", 'info');
    };

    const addToast = (message: string, type: ToastType = 'info') => {
        const newToast: Toast = { id: crypto.randomUUID(), message, type };
        setToasts(currentToasts => [...currentToasts, newToast]);
    };

    const removeToast = (id: string | number) => {
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    };

    const value = { user, profile, isLoggedIn: !!user, isVerified, favorites, userLists, followedScanGroups, login, logout, signInWithEmail, signUpWithEmail, updateUserProfile, resendVerificationEmail, toggleFavorite, toggleFollowGroup, createList, toggleListItem, addToast };

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
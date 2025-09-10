"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // Importar useRouter
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
    has_completed_onboarding: boolean; // <-- Nuevo campo
}

type NewListData = { name: string; description: string; is_public: boolean };
type ProfileUpdate = {
    username?: string;
    avatar_url?: string;
    scan_group_id?: string | null;
    has_completed_onboarding?: boolean; // <-- Nuevo campo
};

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    isLoggedIn: boolean;
    favorites: number[];
    userLists: UserList[];
    login: () => Promise<void>;
    logout: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<boolean>;
    signUpWithEmail: (username: string, email: string, password: string) => Promise<boolean>;
    updateUserProfile: (updates: ProfileUpdate) => Promise<boolean>;
    toggleFavorite: (media: Media) => Promise<void>;
    createList: (listData: NewListData) => Promise<boolean>;
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
    const router = useRouter(); // <-- Hook para la navegación

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
                // --- LÓGICA DE REDIRECCIÓN ---
                if (event === 'SIGNED_IN' && fetchedProfile && !fetchedProfile.has_completed_onboarding) {
                    router.push('/welcome');
                }
            } else {
                setProfile(null);
                setFavorites([]);
                setUserLists([]);
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

        return profileData;
    };
    
    // ... (El resto de funciones como login, logout, signInWithEmail, etc. no necesitan cambios)

    const login = async () => { /* ... */ };
    const logout = async () => { /* ... */ };
    const signInWithEmail = async (email: string, password: string): Promise<boolean> => { /* ... */ };
    const signUpWithEmail = async (username: string, email: string, password: string): Promise<boolean> => { /* ... */ };
    const updateUserProfile = async (updates: ProfileUpdate): Promise<boolean> => { /* ... */ };
    const toggleFavorite = async (media: Media) => { /* ... */ };
    const createList = async (listData: NewListData): Promise<boolean> => { /* ... */ };
    const toggleListItem = async (listId: number, media: Media) => { /* ... */ };

    const addToast = (message: string, type: ToastType = 'info') => {
        const newToast: Toast = { id: Date.now(), message, type };
        setToasts(currentToasts => [...currentToasts, newToast]);
    };
    
    const removeToast = (id: number) => {
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    };

    const value = { user, profile, isLoggedIn: !!user, favorites, userLists, login, logout, signInWithEmail, signUpWithEmail, updateUserProfile, toggleFavorite, createList, toggleListItem, addToast };

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
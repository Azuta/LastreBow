// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { ToastContainer, ToastProps } from '@/components/ui/Toast';
import { Media, UserList } from '@/types/AniListResponse'; // Importar UserList

type ToastType = 'success' | 'error' | 'info';
type Toast = Omit<ToastProps, 'onDismiss'>;

interface Profile {
    username: string;
    avatar_url: string;
    role: string;
}

// Definimos el tipo para los datos de una nueva lista
type NewListData = { name: string; description: string; is_public: boolean };

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    isLoggedIn: boolean;
    favorites: number[];
    userLists: UserList[]; // <-- NUEVO: Estado para las listas del usuario
    login: () => Promise<void>;
    logout: () => Promise<void>;
    toggleFavorite: (media: Media) => Promise<void>;
    createList: (listData: NewListData) => Promise<boolean>; // <-- NUEVA FUNCIÓN
    addToast: (message: string, type?: ToastType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const supabase = createClient();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [favorites, setFavorites] = useState<number[]>([]);
    const [userLists, setUserLists] = useState<UserList[]>([]); // <-- NUEVO ESTADO
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const getSessionAndData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserData(session.user);
            }
        };
        getSessionAndData();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserData(session.user);
            } else {
                setProfile(null);
                setFavorites([]);
                setUserLists([]); // Limpiar listas al cerrar sesión
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const fetchUserData = async (user: User) => {
        // Obtenemos perfil, favoritos y listas
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(profileData);

        const { data: favoritesData } = await supabase.from('user_favorites').select('media_id').eq('user_id', user.id);
        setFavorites(favoritesData?.map(fav => fav.media_id) || []);
        
        const { data: listsData } = await supabase.from('user_lists').select('*').eq('user_id', user.id);
        setUserLists(listsData as UserList[] || []);
    };

    const login = async () => { /* ... (sin cambios) ... */ };
    const logout = async () => { /* ... (sin cambios) ... */ };
    const toggleFavorite = async (media: Media) => { /* ... (sin cambios) ... */ };
    
    // <-- NUEVA FUNCIÓN PARA CREAR LISTAS -->
    const createList = async (listData: NewListData): Promise<boolean> => {
        if (!user) {
            addToast("Necesitas iniciar sesión para crear una lista", "error");
            return false;
        }

        const { data, error } = await supabase
            .from('user_lists')
            .insert({ ...listData, user_id: user.id })
            .select()
            .single();

        if (error) {
            addToast("Error al crear la lista", "error");
            console.error(error);
            return false;
        }

        // Añadimos la nueva lista al estado local para que la UI se actualice
        setUserLists(prev => [...prev, data as UserList]);
        addToast(`Lista "${listData.name}" creada con éxito`, "success");
        return true;
    };

        // --- NUEVA FUNCIÓN PARA AÑADIR/QUITAR MANGAS DE UNA LISTA ---
    const toggleListItem = async (listId: number, media: Media) => {
        if (!user) return;

        // Primero, verificamos si el item ya existe en la lista
        const { data: existingItem, error: checkError } = await supabase
            .from('list_items')
            .select('*')
            .eq('list_id', listId)
            .eq('media_id', media.id)
            .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
            addToast("Error al verificar la lista", "error");
            console.error(checkError);
            return;
        }

        const listName = userLists.find(l => l.id === listId)?.name || 'una lista';

        if (existingItem) {
            // Si existe, lo eliminamos
            const { error: deleteError } = await supabase.from('list_items').delete().match({ list_id: listId, media_id: media.id });
            if (deleteError) {
                addToast("Error al quitar de la lista", "error");
            } else {
                addToast(`"${media.title.romaji}" quitado de "${listName}"`, "info");
            }
        } else {
            // Si no existe, lo insertamos
            const { error: insertError } = await supabase.from('list_items').insert({ list_id: listId, media_id: media.id });
            if (insertError) {
                addToast("Error al añadir a la lista", "error");
            } else {
                addToast(`"${media.title.romaji}" añadido a "${listName}"`, "success");
            }
        }
    };


    const addToast = (message: string, type: ToastType = 'info') => {
        const newToast: Toast = { id: Date.now(), message, type };
        setToasts(currentToasts => [...currentToasts, newToast]);
    };
    
    const removeToast = (id: number) => {
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    };
    
    const value = { user, profile, isLoggedIn: !!user, favorites, userLists, login, logout, toggleFavorite, createList, addToast };

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
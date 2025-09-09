// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { ToastContainer, ToastProps } from '@/components/ui/Toast';

// --- Definición de Tipos ---
interface User {
    username: string;
    avatarUrl: string;
    role: string;
    scanGroupId?: string;
    followedScanGroups: string[];
    notifications: Notification[];
}

interface Notification {
    id: number;
    message: string;
    link: string;
    timestamp: string;
    read: boolean;
}

// Tipos para Toasts
type ToastType = 'success' | 'error' | 'info';
type Toast = Omit<ToastProps, 'onDismiss'>;

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    login: (userData: User) => void;
    logout: () => void;
    toggleFollowGroup: (groupId: string, groupName: string) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markNotificationsAsRead: () => void;
    addToast: (message: string, type?: ToastType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Datos de Prueba ---
const MOCK_USER_DATA: User = {
    username: "Dymedis",
    avatarUrl: "https://mangadex.org/covers/8754fb67-d7f1-45f8-ad40-e4c218ba5836/605caded-f8d6-483b-a5e7-bd0ead4244b7.png.512.jpg",
    role: "Líder",
    scanGroupId: "group001",
    followedScanGroups: ['group002'],
    notifications: [
        { id: 1, message: 'Shadow Garden Scans ha subido el capítulo 15 de "Kage no Jitsuryokusha ni Naritakute!"', link: '/media/115786', timestamp: 'hace 1 hora', read: false },
        { id: 2, message: 'Bienvenido a MangaList!', link: '/user/Dymedis', timestamp: 'hace 1 día', read: true },
    ]
};

// --- Proveedor del Contexto ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);

    const login = (userData: User) => setUser(userData);
    const logout = () => setUser(null);
    const handleLogin = () => {
        login(MOCK_USER_DATA);
        addToast("¡Bienvenido de vuelta, Dymedis!", "success");
    };

    const addToast = (message: string, type: ToastType = 'info') => {
        const newToast: Toast = { id: Date.now(), message, type };
        setToasts(currentToasts => [...currentToasts, newToast]);
    };
    
    const removeToast = (id: number) => {
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    };

    const toggleFollowGroup = (groupId: string, groupName: string) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            const isFollowing = currentUser.followedScanGroups.includes(groupId);
            
            if (isFollowing) {
                addToast(`Dejaste de seguir a ${groupName}`, 'info');
            } else {
                addToast(`Ahora sigues a ${groupName}`, 'success');
            }

            const updatedFollows = isFollowing
                ? currentUser.followedScanGroups.filter(id => id !== groupId)
                : [...currentUser.followedScanGroups, groupId];
            return { ...currentUser, followedScanGroups: updatedFollows };
        });
    };

    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            const newNotification: Notification = {
                ...notification,
                id: Date.now(),
                timestamp: 'justo ahora',
                read: false,
            };
            return { ...currentUser, notifications: [newNotification, ...currentUser.notifications] };
        });
    };

    const markNotificationsAsRead = () => {
        setUser(currentUser => {
            if (!currentUser) return null;
            const readNotifications = currentUser.notifications.map(n => ({ ...n, read: true }));
            return { ...currentUser, notifications: readNotifications };
        });
    };

    const value = { user, isLoggedIn: !!user, login: handleLogin, logout, toggleFollowGroup, addNotification, markNotificationsAsRead, addToast };

    return (
        <AuthContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </AuthContext.Provider>
    );
};

// --- Hook Personalizado ---
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
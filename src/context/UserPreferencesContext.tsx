// azuta/mangauserpage/MangaUserPage-main/src/context/UserPreferencesContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ViewMode = 'grid' | 'list';
type PaginationStyle = 'pagination' | 'infinite';

export interface UserPreferences {
  viewMode: ViewMode;
  paginationStyle: PaginationStyle;
  warnOnExternalLinks: boolean;
  hideExternalLinks: boolean;
  showAdultContent: boolean;
  hideAdultContentOnProfile: boolean;
  profileIsPrivate: boolean;
  notifyByEmail: boolean;
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  savePreferences: () => void;
  isDirty: boolean;
  resetPreferences: () => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

// Define la configuración por defecto para usar si no hay nada en localStorage
const DEFAULT_PREFERENCES: UserPreferences = {
  viewMode: 'grid',
  paginationStyle: 'pagination',
  warnOnExternalLinks: true,
  hideExternalLinks: false,
  showAdultContent: false,
  hideAdultContentOnProfile: false,
  profileIsPrivate: false,
  notifyByEmail: true,
};

export const UserPreferencesProvider = ({ children }: { children: ReactNode }) => {
  // Lógica para inicializar el estado
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedPrefs = localStorage.getItem('userPreferences');
        // Combina las preferencias guardadas con las por defecto para evitar perder configuraciones
        return savedPrefs ? { ...DEFAULT_PREFERENCES, ...JSON.parse(savedPrefs) } : DEFAULT_PREFERENCES;
      }
    } catch (error) {
      console.error("Error al leer localStorage", error);
    }
    return DEFAULT_PREFERENCES;
  });
  
  const [initialPreferences, setInitialPreferences] = useState<UserPreferences>(preferences);

  // El resto de los efectos y funciones se mantienen igual
  const setPreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };
  
  const savePreferences = () => {
    try {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      setInitialPreferences(preferences);
      console.log('Preferencias guardadas:', preferences);
    } catch (error) {
      console.error("Error al guardar en localStorage", error);
    }
  };
  
  const resetPreferences = () => {
    setPreferences(initialPreferences);
  };

  const isDirty = JSON.stringify(preferences) !== JSON.stringify(initialPreferences);

  const value = { 
    preferences, 
    setPreference,
    savePreferences,
    isDirty,
    resetPreferences,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};
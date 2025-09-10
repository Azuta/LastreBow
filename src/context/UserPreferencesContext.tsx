// azuta/mangauserpage/MangaUserPage-main/src/context/UserPreferencesContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ViewMode = 'grid' | 'list';
type PaginationStyle = 'pagination' | 'infinite';

// --- NUEVO TIPO PARA LAS PREFERENCIAS ---
export interface UserPreferences {
  viewMode: ViewMode;
  paginationStyle: PaginationStyle;
  warnOnExternalLinks: boolean;
  hideExternalLinks: boolean;
  showAdultContent: boolean;
  hideAdultContentOnProfile: boolean;
  profileIsPrivate: boolean; // <-- Nueva
  notifyByEmail: boolean;    // <-- Nueva
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  savePreferences: () => void; // <-- Nueva función para guardar
  isDirty: boolean; // <-- Nuevo estado para saber si hay cambios sin guardar
  resetPreferences: () => void; // <-- Para descartar cambios
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    viewMode: 'grid',
    paginationStyle: 'pagination',
    warnOnExternalLinks: true,
    hideExternalLinks: false,
    showAdultContent: false,
    hideAdultContentOnProfile: false,
    profileIsPrivate: false,
    notifyByEmail: true,
  });
  
  const [initialPreferences, setInitialPreferences] = useState<UserPreferences>(preferences);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem('userPreferences');
      if (savedPrefs) {
        const parsedPrefs = JSON.parse(savedPrefs);
        setPreferences(currentPrefs => ({ ...currentPrefs, ...parsedPrefs }));
        setInitialPreferences(currentPrefs => ({ ...currentPrefs, ...parsedPrefs }));
      }
    } catch (error) {
      console.error("Error al leer localStorage", error);
    }
    setIsHydrated(true);
  }, []);
  
  const setPreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };
  
  const savePreferences = () => {
    if (isHydrated) {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      setInitialPreferences(preferences); // Actualiza el estado inicial para que isDirty sea false
      // Aquí también llamarías a tu API para guardar en la base de datos
      console.log('Preferencias guardadas:', preferences);
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
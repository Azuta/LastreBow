"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ViewMode = 'grid' | 'list';
type PaginationStyle = 'pagination' | 'infinite';

interface UserPreferencesContextType {
  viewMode: ViewMode;
  paginationStyle: PaginationStyle;
  warnOnExternalLinks: boolean;
  hideExternalLinks: boolean;
  // --- NUEVAS OPCIONES DE PRIVACIDAD ---
  showAdultContent: boolean;
  hideAdultContentOnProfile: boolean;
  // ------------------------------------
  toggleViewMode: () => void;
  togglePaginationStyle: () => void;
  setWarnOnExternalLinks: (value: boolean) => void;
  setHideExternalLinks: (value: boolean) => void;
  // --- NUEVOS SETTERS ---
  setShowAdultContent: (value: boolean) => void;
  setHideAdultContentOnProfile: (value: boolean) => void;
  // --------------------
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [paginationStyle, setPaginationStyle] = useState<PaginationStyle>('pagination');
  const [warnOnExternalLinks, setWarnOnExternalLinks] = useState<boolean>(true);
  const [hideExternalLinks, setHideExternalLinks] = useState<boolean>(false);
  // --- NUEVOS ESTADOS ---
  const [showAdultContent, setShowAdultContent] = useState<boolean>(true);
  const [hideAdultContentOnProfile, setHideAdultContentOnProfile] = useState<boolean>(false);
  // --------------------
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedViewMode = localStorage.getItem('viewMode') as ViewMode;
      if (savedViewMode) setViewMode(savedViewMode);

      const savedPaginationStyle = localStorage.getItem('paginationStyle') as PaginationStyle;
      if (savedPaginationStyle) setPaginationStyle(savedPaginationStyle);
      
      const savedWarn = localStorage.getItem('warnOnExternalLinks');
      if (savedWarn) setWarnOnExternalLinks(JSON.parse(savedWarn));
      
      const savedHide = localStorage.getItem('hideExternalLinks');
      if (savedHide) setHideExternalLinks(JSON.parse(savedHide));

      // Cargar nuevas preferencias
      const savedShowAdult = localStorage.getItem('showAdultContent');
      if (savedShowAdult) setShowAdultContent(JSON.parse(savedShowAdult));
      
      const savedHideAdultProfile = localStorage.getItem('hideAdultContentOnProfile');
      if (savedHideAdultProfile) setHideAdultContentOnProfile(JSON.parse(savedHideAdultProfile));

    } catch (error) {
      console.error("Error al leer localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => { if (isHydrated) localStorage.setItem('viewMode', viewMode); }, [viewMode, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('paginationStyle', paginationStyle); }, [paginationStyle, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('warnOnExternalLinks', JSON.stringify(warnOnExternalLinks)); }, [warnOnExternalLinks, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('hideExternalLinks', JSON.stringify(hideExternalLinks)); }, [hideExternalLinks, isHydrated]);
  // Guardar nuevas preferencias
  useEffect(() => { if (isHydrated) localStorage.setItem('showAdultContent', JSON.stringify(showAdultContent)); }, [showAdultContent, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('hideAdultContentOnProfile', JSON.stringify(hideAdultContentOnProfile)); }, [hideAdultContentOnProfile, isHydrated]);


  const toggleViewMode = () => setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'));
  const togglePaginationStyle = () => setPaginationStyle(prev => (prev === 'pagination' ? 'infinite' : 'pagination'));

  const value = { 
    viewMode, paginationStyle, warnOnExternalLinks, hideExternalLinks, showAdultContent, hideAdultContentOnProfile,
    toggleViewMode, togglePaginationStyle, setWarnOnExternalLinks, setHideExternalLinks, setShowAdultContent, setHideAdultContentOnProfile
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
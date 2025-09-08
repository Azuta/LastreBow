"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ViewMode = 'grid' | 'list';
type PaginationStyle = 'pagination' | 'infinite';

interface UserPreferencesContextType {
  viewMode: ViewMode;
  paginationStyle: PaginationStyle;
  warnOnExternalLinks: boolean; // <-- NUEVO
  hideExternalLinks: boolean;   // <-- NUEVO
  toggleViewMode: () => void;
  togglePaginationStyle: () => void;
  setWarnOnExternalLinks: (value: boolean) => void; // <-- NUEVO
  setHideExternalLinks: (value: boolean) => void;   // <-- NUEVO
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [paginationStyle, setPaginationStyle] = useState<PaginationStyle>('pagination');
  const [warnOnExternalLinks, setWarnOnExternalLinks] = useState<boolean>(true);
  const [hideExternalLinks, setHideExternalLinks] = useState<boolean>(false);
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

    } catch (error) {
      console.error("Error al leer localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => { if (isHydrated) localStorage.setItem('viewMode', viewMode); }, [viewMode, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('paginationStyle', paginationStyle); }, [paginationStyle, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('warnOnExternalLinks', JSON.stringify(warnOnExternalLinks)); }, [warnOnExternalLinks, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('hideExternalLinks', JSON.stringify(hideExternalLinks)); }, [hideExternalLinks, isHydrated]);

  const toggleViewMode = () => setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'));
  const togglePaginationStyle = () => setPaginationStyle(prev => (prev === 'pagination' ? 'infinite' : 'pagination'));

  const value = { viewMode, paginationStyle, warnOnExternalLinks, hideExternalLinks, toggleViewMode, togglePaginationStyle, setWarnOnExternalLinks, setHideExternalLinks };

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
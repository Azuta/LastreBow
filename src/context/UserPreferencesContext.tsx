"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipos para las preferencias y el contexto
type ViewMode = 'grid' | 'list';
type PaginationStyle = 'pagination' | 'infinite';

interface UserPreferencesContextType {
  viewMode: ViewMode;
  paginationStyle: PaginationStyle;
  toggleViewMode: () => void;
  togglePaginationStyle: () => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider = ({ children }: { children: ReactNode }) => {
  // 1. El estado se inicializa con valores por defecto que se usarán en el servidor.
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [paginationStyle, setPaginationStyle] = useState<PaginationStyle>('pagination');
  
  // 2. Nuevo estado para controlar la hidratación.
  const [isHydrated, setIsHydrated] = useState(false);

  // 3. Este useEffect se ejecuta solo una vez en el cliente, después del renderizado inicial.
  useEffect(() => {
    try {
      // Se leen las preferencias guardadas de forma segura.
      const savedViewMode = localStorage.getItem('viewMode') as ViewMode;
      if (savedViewMode && ['grid', 'list'].includes(savedViewMode)) {
        setViewMode(savedViewMode);
      }

      const savedPaginationStyle = localStorage.getItem('paginationStyle') as PaginationStyle;
      if (savedPaginationStyle && ['pagination', 'infinite'].includes(savedPaginationStyle)) {
        setPaginationStyle(savedPaginationStyle);
      }
    } catch (error) {
      console.error("Error al leer localStorage", error);
    }
    // Se marca que el componente ya se ha hidratado.
    setIsHydrated(true);
  }, []);

  // 4. Estos useEffects ahora guardan los cambios en localStorage, pero solo si el
  //    componente ya se ha hidratado, evitando ejecuciones innecesarias en el servidor.
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('viewMode', viewMode);
    }
  }, [viewMode, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('paginationStyle', paginationStyle);
    }
  }, [paginationStyle, isHydrated]);

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'));
  };

  const togglePaginationStyle = () => {
    setPaginationStyle(prev => (prev === 'pagination' ? 'infinite' : 'pagination'));
  };

  const value = { viewMode, paginationStyle, toggleViewMode, togglePaginationStyle };

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


"use client";

import React from 'react';

// --- Tipos de las props que recibirá el componente ---
interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  allGenres: string[];
  selectedGenres: string[];
  handleGenreChange: (genre: string) => void;
  resetFilters: () => void;
}

// --- Icono para el botón de cerrar ---
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


const AdvancedFilters = ({ isOpen, onClose, allGenres, selectedGenres, handleGenreChange, resetFilters }: AdvancedFiltersProps) => {
  // Si no está abierto, no renderiza nada
  if (!isOpen) return null;

  return (
    <>
      {/* Fondo oscuro semi-transparente */}
      <div 
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel lateral */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-[#1a1a24] shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Encabezado del panel */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Filtros Avanzados</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <CloseIcon />
            </button>
          </div>

          {/* Contenedor de los filtros con scroll */}
          <div className="flex-grow p-4 overflow-y-auto">
            <h3 className="font-semibold text-white mb-3">Géneros</h3>
            <div className="flex flex-wrap gap-2">
              {allGenres.map(genre => (
                <button
                  key={genre}
                  onClick={() => handleGenreChange(genre)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                    selectedGenres.includes(genre)
                      ? 'bg-[#ffbade] text-black'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/80'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            {/* Aquí se pueden agregar más secciones de filtros (Formato, Estado, etc.) */}
          </div>

          {/* Pie del panel con los botones de acción */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-4">
              <button 
                onClick={resetFilters}
                className="w-full px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-600/80 transition-colors"
              >
                Limpiar
              </button>
              <button 
                onClick={onClose}
                className="w-full px-4 py-2 bg-[#ffbade] text-black rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdvancedFilters;

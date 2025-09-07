"use client";
import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDayMode, setIsDayMode] = useState(false);

  // Efecto para añadir/quitar la clase 'day-mode' del body
  useEffect(() => {
    document.body.classList.toggle('day-mode', isDayMode);
  }, [isDayMode]);

  // --- Clases dinámicas basadas en el estado del tema ---

  // Clases para el fondo de la barra de navegación
  const navClasses = `
    shadow-lg sticky top-0 z-50
    ${isDayMode ? 'bg-white' : 'bg-[#201f31]'}
  `;

  // Clases para el texto del logo
  const brandClasses = `
    flex-shrink-0 text-2xl font-bold
    ${isDayMode ? 'text-gray-900' : 'text-white'}
  `;

  // Clases para los enlaces de navegación (incluyendo el hover)
  // Esta es la corrección clave
  const linkClasses = `
    px-3 py-2 rounded-md text-sm font-medium transition-colors
    ${isDayMode 
      ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-900' // Estilos para modo día
      : 'text-gray-300 hover:bg-gray-700 hover:text-white'   // Estilos para modo noche
    }
  `;

  return (
    <nav className={navClasses}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center">
            <div className={brandClasses}>
              Manga<span className="text-[#ffbade]">List</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#" className={linkClasses}>Explorar</a>
                <a href="#" className={linkClasses}>Géneros</a>
                <a href="#" className={linkClasses}>Nuevos</a>
                <a href="#" className={linkClasses}>Sorpréndeme!</a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <input 
              type="text" 
              placeholder="Buscar manga..." 
              className={`
                rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffbade] hidden sm:block
                ${isDayMode ? 'bg-gray-200 text-gray-900' : 'bg-gray-700 text-white'}
              `}
            />
            
            <label className="theme-switch">
              <input 
                type="checkbox" 
                checked={isDayMode}
                onChange={() => setIsDayMode(!isDayMode)}
              />
              <span className="slider"></span>
            </label>
            
            <div>
              {isLoggedIn ? (
                <img 
                  src="https://placehold.co/32x32/7c3aed/ffffff?text=U" 
                  className="w-8 h-8 rounded-full cursor-pointer" 
                  alt="User Avatar"
                  onClick={() => setIsLoggedIn(false)}
                />
              ) : (
                <button 
                  onClick={() => setIsLoggedIn(true)} 
                  className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
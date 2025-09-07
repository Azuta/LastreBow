"use client";
import React, { useState, useMemo } from 'react';
import { Media } from '@/types/AniListResponse';
import MangaCard from '@/components/ui/cards/MangaCard'; // Asegúrate de usar tu componente de tarjeta preferido

interface MangaSectionProps {
  title: string;
  media: Media[];
}

const MangaSection = ({ title, media }: MangaSectionProps) => {
  // 1. Estado para saber qué pestaña está activa. Inicia con el título principal.
  const [activeTab, setActiveTab] = useState(title);

  // 2. Definimos las pestañas de filtro.
  const filterTabs = [`P. Seinen`, `P. Josei`];

  // 3. Lógica para filtrar los mangas
  // useMemo optimiza el rendimiento, solo vuelve a filtrar si la lista o la pestaña activa cambian.
  const filteredMedia = useMemo(() => {
    // Si la pestaña activa es la principal (ej. "Popular"), muestra todos los mangas.
    if (activeTab === title) {
      return media;
    }
    // Extrae el género de la pestaña (ej. "Seinen" de "P. Seinen")
    const genreToFilter = activeTab.split(' ')[1];
    
    // Filtra el array de media para incluir solo los que contienen el género.
    return media.filter(manga => 
      manga.genres.some(genre => genre.toLowerCase() === genreToFilter.toLowerCase())
    );
  }, [activeTab, media, title]);

  return (
    <section>
      {/* Encabezado de la Sección */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="flex items-center space-x-2 border border-gray-700 rounded-full p-1">
          {/* Botón Principal */}
          <button 
            onClick={() => setActiveTab(title)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              activeTab === title ? 'bg-[#ffbade] text-black' : 'text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            {title}
          </button>
          
          {/* Botones de Filtro */}
          {filterTabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                activeTab === tab ? 'bg-[#ffbade] text-black' : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <a href="#" className="text-sm text-gray-400 hover:text-[#ffbade] transition-colors self-end sm:self-center">
          Ver más &rarr;
        </a>
      </div>

      {/* 4. Cuadrícula de Mangas (ahora usa la lista filtrada) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-x-4 gap-y-6">
        {filteredMedia.map((manga, index) => (
          <MangaCard 
            key={`${manga.id}-${index}`}
            media={manga}
          />
        ))}
      </div>
    </section>
  );
};

export default MangaSection;
"use client";
import React, { useState, useMemo } from 'react';
import { Media } from '@/types/AniListResponse';
import MangaCard from '@/components/ui/cards/MangaCard';
import Link from 'next/link';

interface MangaSectionProps {
  title: string;
  media: Media[];
}

const MangaSection = ({ title, media }: MangaSectionProps) => {
  const [activeTab, setActiveTab] = useState(title);
  const filterTabs = [`P. Seinen`, `P. Josei`];

  const filteredMedia = useMemo(() => {
    // 1. AÑADIMOS UN FILTRO DE SEGURIDAD
    // Esto asegura que solo procesemos mangas que tengan un ID y un título.
    const validMedia = media.filter(manga => manga && manga.id && manga.title);

    if (activeTab === title) {
      return validMedia;
    }
    const genreToFilter = activeTab.split(' ')[1];
    return validMedia.filter(manga => 
      manga.genres.some(genre => genre.toLowerCase() === genreToFilter.toLowerCase())
    );
  }, [activeTab, media, title]);

  const viewMoreLink = useMemo(() => {
      const category = title.toLowerCase().split(' ')[0];
      let genre = 'all';
      if (activeTab !== title) {
          genre = activeTab.split(' ')[1].toLowerCase();
      }
      return `/browse/${category}/${genre}`;
  }, [activeTab, title]);

  return (
    <section>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="flex items-center space-x-2 border border-gray-700 rounded-full p-1">
          <button 
            onClick={() => setActiveTab(title)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              activeTab === title ? 'bg-[#ffbade] text-black' : 'text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            {title}
          </button>
          
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
        <Link href={viewMoreLink} className="text-sm text-gray-400 hover:text-[#ffbade] transition-colors self-end sm:self-center">
          Ver más &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-x-4 gap-y-6">
        {filteredMedia.slice(0, 7).map((manga) => (
          <MangaCard 
            // 2. CORREGIMOS EL 'key' PARA QUE SEA MÁS SEGURO
            // Usar solo el ID es la forma más segura y recomendada en React.
            key={manga.id}
            media={manga}
          />
        ))}
      </div>
    </section>
  );
};

export default MangaSection;
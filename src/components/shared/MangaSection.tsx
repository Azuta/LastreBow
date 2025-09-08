"use client";
import React, { useState, useMemo } from 'react';
import { Media } from '@/types/AniListResponse';
import MangaCard from '@/components/ui/cards/MangaCard';
import Link from 'next/link'; // <-- 1. Importar Link

interface MangaSectionProps {
  title: string;
  media: Media[];
}

const MangaSection = ({ title, media }: MangaSectionProps) => {
  const [activeTab, setActiveTab] = useState(title);
  const filterTabs = [`P. Seinen`, `P. Josei`];

  const filteredMedia = useMemo(() => {
    if (activeTab === title) {
      return media;
    }
    const genreToFilter = activeTab.split(' ')[1];
    return media.filter(manga => 
      manga.genres.some(genre => genre.toLowerCase() === genreToFilter.toLowerCase())
    );
  }, [activeTab, media, title]);

  // <-- 2. Lógica para determinar el enlace "Ver más"
  const viewMoreLink = useMemo(() => {
      const category = title.toLowerCase().split(' ')[0]; // "trending", "popular"
      let genre = 'all';
      if (activeTab !== title) {
          genre = activeTab.split(' ')[1].toLowerCase(); // "seinen", "josei"
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
        {/* 3. Reemplazar <a> con <Link> */}
        <Link href={viewMoreLink} className="text-sm text-gray-400 hover:text-[#ffbade] transition-colors self-end sm:self-center">
          Ver más &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-x-4 gap-y-6">
        {filteredMedia.slice(0, 7).map((manga) => ( // Mostramos solo 7 en la página principal
          <MangaCard 
            key={`${manga.id}-${manga.title.romaji}`}
            media={manga}
          />
        ))}
      </div>
    </section>
  );
};

export default MangaSection;

"use client";
import React, { useState } from 'react';
import { mockMediaRows } from '@/mock/mediaData'; // Usamos los datos de prueba
import Image from 'next/image';

// Un componente pequeño para cada item del ranking
const RankingItem = ({ media, rank }: { media: any; rank: number }) => {
  const title = media.title.english || media.title.romaji;
  return (
    <li className="flex items-center space-x-3 group">
      <span className={`text-lg font-bold w-8 text-center ${rank === 1 ? 'text-[#ffbade]' : 'text-gray-400'}`}>
        {rank}
      </span>
      <div className="relative w-10 h-14 flex-shrink-0">
        <Image
          src={media.coverImage.large}
          alt={title}
          fill
          sizes="40px"
          className="object-cover rounded"
        />
      </div>
      <div>
        <h4 className="font-semibold text-sm text-white group-hover:text-[#ffbade] cursor-pointer truncate max-w-[150px]">
          {title}
        </h4>
        <p className="text-xs text-gray-400">{media.genres.slice(0, 2).join(', ')}</p>
      </div>
    </li>
  );
};

const RankingList = () => {
  const [activeTab, setActiveTab] = useState('Diario');
  const [showMore, setShowMore] = useState(false);
  const tabs = ['Diario', 'Semanal', 'Mensual'];

  // Usamos los datos de "Trending" del mock para llenar el ranking
  const rankingData = mockMediaRows.find(row => row.title === 'Trending')?.data || [];

  return (
    <div className="sidebar-component bg-[#201f31] p-4 rounded-lg shadow-lg">
      <div className="mb-4">
        <div className="flex border-b border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab 
                ? 'text-white border-b-2 border-[#ffbade]' 
                : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <ol className="space-y-3">
        {rankingData.slice(0, showMore ? 10 : 5).map((media, index) => (
          <RankingItem key={media.id} media={media} rank={index + 1} />
        ))}
        {!showMore && rankingData.length > 5 && (
            <li 
                onClick={() => setShowMore(true)} 
                className="pt-2 cursor-pointer text-center text-gray-400 hover:text-white"
            >
                <span className="text-2xl tracking-widest">...</span>
            </li>
        )}
      </ol>
    </div>
  );
};

export default RankingList;
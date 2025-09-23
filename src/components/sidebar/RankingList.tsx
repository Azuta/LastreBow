"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { fetchRankingMedia } from '@/services/fetchAniList';
import Image from 'next/image';
import { Media } from '@/types/AniListResponse';

const RankingItem = ({ media, rank }: { media: Media; rank: number }) => {
  // Esta línea ahora funcionará porque `media.title` será un objeto.
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
  const [rankingData, setRankingData] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const tabs = ['Diario', 'Semanal', 'Mensual'];

  useEffect(() => {
    const loadRankingData = async () => {
      setIsLoading(true);
      let criteria: 'popularity' | 'average_score' = 'popularity';
      if (activeTab === 'Semanal') {
        criteria = 'average_score';
      }
      const data = await fetchRankingMedia(criteria);
      setRankingData(data);
      setIsLoading(false);
    };
    loadRankingData();
  }, [activeTab]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setShowMore(false);
  };

  return (
    <div className="sidebar-component bg-[#201f31] p-4 rounded-lg shadow-lg">
      <div className="mb-4">
        <div className="flex border-b border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
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
        {isLoading ? (
            <p className="text-xs text-gray-400 text-center">Cargando...</p>
        ) : (
            rankingData.slice(0, showMore ? 12 : 5).map((media, index) => (
                <RankingItem key={`${activeTab}-${media.id}`} media={media} rank={index + 1} />
            ))
        )}
        {!isLoading && !showMore && rankingData.length > 5 && (
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
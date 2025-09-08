"use client";
import React from 'react';
import { Media } from '@/types/AniListResponse';
import Link from 'next/link';

interface MangaCardProps {
  media: Media;
  isPrivate?: boolean; // <-- Prop opcional para indicar si es privado
}

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

// --- Icono de Candado ---
const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);


const MangaCard = ({ media, isPrivate = false }: MangaCardProps) => {
  const title = media.title.english || media.title.romaji;
  const score = media.averageScore ? (media.averageScore / 10).toFixed(2) : 'N/A';
  const genre = media.genres[0] || 'Unknown';

  const getGenreColor = (genre: string) => {
    switch (genre.toLowerCase()) {
      case 'seinen': return 'bg-red-600';
      case 'shounen': return 'bg-yellow-600';
      case 'action': return 'bg-red-700';
      case 'comedy': return 'bg-pink-500';
      case 'fantasy': return 'bg-purple-600';
      default: return 'bg-gray-700';
    }
  };

  return (
    <Link href={`/media/${media.id}`} className="block">
    <div className="relative aspect-[2/3] w-full rounded-md overflow-hidden group text-white">
      <img
        src={media.coverImage.extraLarge}
        alt={title}
        className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      
      {/* --- Indicador de Privacidad --- */}
      {isPrivate && (
          <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full backdrop-blur-sm z-10">
              <LockIcon />
          </div>
      )}

      <div className="relative h-full flex flex-col justify-between p-2">
        <div className="flex justify-between items-start">
          <span className="bg-black/50 text-white px-2 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm">
            {media.format}
          </span>
          <div className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-full text-xs font-bold backdrop-blur-sm">
            <StarIcon />
            <span>{score}</span>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-sm leading-tight mb-1">{title}</h3>
          <div className={`text-center py-1 rounded-sm text-xs font-semibold ${getGenreColor(genre)}`}>
            {genre}
          </div>
        </div>
      </div>
    </div>
    </Link>
  );
};
export default MangaCard;
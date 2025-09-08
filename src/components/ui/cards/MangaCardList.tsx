import React from 'react';
import { Media } from '@/types/AniListResponse';
import Link from 'next/link';
import Image from 'next/image';

interface MangaCardListProps {
  media: Media;
}

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const MangaCardList = ({ media }: MangaCardListProps) => {
  const title = media.title.english || media.title.romaji;
  const score = media.averageScore ? (media.averageScore / 10).toFixed(2) : 'N/A';
  
  // Limita la descripción a un número de caracteres
  const shortDescription = media.description.replace(/<br>/g, ' ').substring(0, 150) + '...';

  return (
    <div className="flex bg-[#201f31] rounded-lg overflow-hidden shadow-lg w-full transition-transform hover:scale-[1.02]">
      <Link href={`/media/${media.id}`} className="flex-shrink-0">
        <div className="relative w-24 h-36">
          <Image
            src={media.coverImage.large}
            alt={title}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
      </Link>
      <div className="p-4 flex flex-col justify-between">
        <div>
          <Link href={`/media/${media.id}`}>
            <h3 className="font-bold text-lg text-white hover:text-[#ffbade]">{title}</h3>
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                <StarIcon/> {score}
            </div>
            <span className="text-gray-400 text-sm">&bull;</span>
            <p className="text-gray-400 text-sm">{media.format}</p>
          </div>
          <p className="text-gray-400 text-sm mt-2 hidden md:block">
            {shortDescription}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
            {media.genres.slice(0, 3).map(genre => (
                <span key={genre} className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs font-semibold">{genre}</span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MangaCardList;

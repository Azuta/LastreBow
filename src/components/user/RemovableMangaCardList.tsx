// src/components/user/RemovableMangaCardList.tsx
"use client";
import React from 'react';
import { Media } from '@/types/AniListResponse';
import MangaCardList from '@/components/ui/cards/MangaCardList';

// Icono de eliminar
const TrashIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

interface RemovableMangaCardListProps {
  media: Media;
  onRemove: (mediaId: number) => void;
  isEditing: boolean;
}

export function RemovableMangaCardList({ media, onRemove, isEditing }: RemovableMangaCardListProps) {
  const mediaTitle = media.title?.romaji ?? media.title?.english ?? 'Manga sin título';

  return (
    <div className="relative group">
      {isEditing && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRemove(media.id);
          }}
          className="absolute top-1/2 right-2 z-30 p-2 -translate-y-1/2 bg-red-900/70 text-white rounded-full opacity-100 transition-opacity"
          aria-label={`Eliminar ${mediaTitle} de la lista`}
        >
          <TrashIcon />
        </button>
      )}
      <MangaCardList media={media} />
    </div>
  );
}
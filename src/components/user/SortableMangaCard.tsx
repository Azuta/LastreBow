// src/components/user/SortableMangaCard.tsx
"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Media } from '@/types/AniListResponse';
import MangaCard from '@/components/ui/cards/MangaCard';
import { useAuth } from '@/context/AuthContext';

// Icono de eliminar
const TrashIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;


interface SortableMangaCardProps {
  media: Media;
  onRemove: (mediaId: number) => void;
}

export function SortableMangaCard({ media, onRemove }: SortableMangaCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: media.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
    touchAction: 'none'
  };

  const mediaTitle = media.title?.romaji ?? media.title?.english ?? 'Manga sin título';

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group">
      <button 
        onClick={(e) => {
          e.stopPropagation(); // Evita que se active el drag and drop
          onRemove(media.id);
        }}
        className="absolute top-2 right-2 z-30 p-2 bg-red-900/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`Eliminar ${mediaTitle} de la lista`}
      >
        <TrashIcon />
      </button>
      <MangaCard media={media} />
    </div>
  );
}
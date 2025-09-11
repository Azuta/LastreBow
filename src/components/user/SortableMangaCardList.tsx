// src/components/user/SortableMangaCardList.tsx
"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Media } from '@/types/AniListResponse';
import MangaCardList from '@/components/ui/cards/MangaCardList';

const TrashIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const GripVertical = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>;

interface SortableMangaCardListProps {
  media: Media;
  onRemove: (mediaId: number) => void;
  isEditing: boolean;
}

export function SortableMangaCardList({ media, onRemove, isEditing }: SortableMangaCardListProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: media.id, disabled: !isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isEditing ? 'grab' : 'default',
    touchAction: 'none'
  };

  const mediaTitle = media.title?.romaji ?? media.title?.english ?? 'Manga sin título';

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group p-2 rounded-lg transition-colors hover:bg-gray-700/50">
      {isEditing && (
        <div className="absolute inset-y-0 right-0 flex items-center gap-2 p-2 z-30">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemove(media.id);
            }}
            className="p-2 bg-red-900/70 text-white rounded-full opacity-100 transition-opacity hover:bg-red-800"
            aria-label={`Eliminar ${mediaTitle} de la lista`}
          >
            <TrashIcon />
          </button>
          <button {...attributes} {...listeners} className="p-2 cursor-grab text-gray-400 hover:text-white" aria-label="Reordenar manga">
            <GripVertical />
          </button>
        </div>
      )}
      <MangaCardList media={media} />
    </div>
  );
}
// src/components/user/ReviewEditModal.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Media } from '@/types/AniListResponse';
import { createClient } from '@/lib/supabaseClient';
import Image from 'next/image';

interface ReviewEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // Callback para refrescar la lista de reseñas
}

const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24"><path d="M18 6L6 18" stroke="currentColor" strokeWidth="2"/><path d="M6 6L18 18" stroke="currentColor" strokeWidth="2"/></svg>;
const StarIcon = ({ filled = false }: { filled?: boolean }) => (
    <svg
        className={`w-6 h-6 cursor-pointer transition-colors duration-200 ${filled ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-300'}`}
        fill="currentColor" viewBox="0 0 24 24"
    >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);

// Componente para la selección de estrellas
const StarRating = ({ value, onChange }: { value: number; onChange: (newValue: number) => void }) => {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} onClick={() => onChange(star * 20)}> {/* Multiplicamos por 20 para mantener la escala de 0-100 */}
                    <StarIcon filled={value / 20 >= star} />
                </div>
            ))}
        </div>
    );
};


const ReviewEditModal = ({ isOpen, onClose, onSave }: ReviewEditModalProps) => {
  const [step, setStep] = useState(1); // 1: Buscar manga, 2: Escribir reseña
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [score, setScore] = useState(0); // <-- Cambiado a 0 inicialmente
  const [content, setContent] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  // Búsqueda de manga con "debouncing" para no saturar la API
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      const { data } = await supabase
        .from('media')
        .select('*')
        .or(`title_romaji.ilike.%${searchQuery}%,title_english.ilike.%${searchQuery}%`)
        .limit(5);

      const transformedData = (data || []).map((item: any): Media => ({
          id: item.id,
          title: {
            romaji: item.title_romaji,
            english: item.title_english,
            native: item.title_native,
          },
          coverImage: {
            extraLarge: item.cover_image_extra_large || '',
            large: item.cover_image_large || '',
            medium: '',
            color: item.cover_image_color || '',
          },
          bannerImage: item.banner_image || null,
          description: item.description_en || '',
          chapters: item.chapters || null,
          episodes: item.episodes || null,
          genres: item.genres || [],
          averageScore: item.average_score || 0,
          popularity: item.popularity || 0,
          status: item.status || 'FINISHED',
          format: item.format || 'MANGA',
          type: 'MANGA',
      }));

      setSearchResults(transformedData);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, supabase]);

  const handleSelectMedia = (media: Media) => {
    setSelectedMedia(media);
    setScore(75); // <-- Puedes establecer un valor por defecto al seleccionar el manga
    setStep(2);
  };

  const resetState = () => {
    setStep(1);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedMedia(null);
    setScore(0); // <-- Reseteado a 0
    setContent('');
    setIsSearching(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedia || !content.trim() || score === 0) { // Añadimos validación para score
        alert('Por favor, selecciona un manga, una puntuación y escribe el contenido de tu reseña.');
        return;
    }

    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('reviews').insert({
        user_id: user.id,
        media_id: selectedMedia.id,
        score: score,
        content: content,
    });

    if (error) {
        console.error("Error creating review:", error);
    } else {
        onSave();
        handleClose();
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-[#201f31] rounded-lg shadow-lg w-full max-w-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">
              {step === 1 ? 'Paso 1: Busca el Manga' : `Paso 2: Escribe tu reseña para ${selectedMedia?.title.romaji}`}
            </h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
        </div>
        
        {step === 1 && (
            <div>
              <input
                type="text"
                placeholder="Escribe el nombre de un manga..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-[#ffbade]"
              />
              <div className="mt-4 h-64 overflow-y-auto">
                {isSearching && <p className="text-gray-400">Buscando...</p>}
                {searchResults.length > 0 && !isSearching && (
                  <div className="space-y-2">
                    {searchResults.map(media => (
                      <div key={media.id} onClick={() => handleSelectMedia(media)} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer">
                        <Image src={media.coverImage.large} alt={media.title.romaji} width={40} height={60} className="rounded" />
                        <span className="text-white font-semibold">{media.title.romaji}</span>
                      </div>
                    ))}
                  </div>
                )}
                {!searchResults.length && searchQuery.length >=3 && !isSearching && <p className="text-gray-400">No se encontraron resultados.</p>}
              </div>
            </div>
        )}

        {step === 2 && selectedMedia && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="review-score" className="block text-sm font-medium text-gray-300 mb-2">Puntuación:</label>
                <StarRating value={score} onChange={setScore} /> {/* Nuestro nuevo componente */}
              </div>
              <div>
                <label htmlFor="review-content" className="block text-sm font-medium text-gray-300 mb-2">Contenido de la reseña</label>
                <textarea
                  id="review-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  placeholder="Escribe tus pensamientos..."
                  className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffbade]"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Para un editor de texto completo (Rich Text Editor) con opciones como añadir imágenes, necesitaríamos una página de edición separada.
                </p>
              </div>
              <div className="flex justify-between items-center pt-4">
                  <button type="button" onClick={() => setStep(1)} className="text-sm font-semibold text-[#ffbade] hover:underline">
                      &larr; Cambiar de manga
                  </button>
                  <div className="flex gap-4">
                    <button type="button" onClick={handleClose} className="w-full px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg font-semibold hover:bg-gray-600/80">Cancelar</button>
                    <button type="submit" disabled={isSubmitting || score === 0 || !content.trim()} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50">
                      {isSubmitting ? 'Publicando...' : 'Publicar Reseña'}
                    </button>
                  </div>
              </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default ReviewEditModal;
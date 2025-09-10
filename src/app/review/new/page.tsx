// src/app/review/new/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Media } from '@/types/AniListResponse';
import { createClient } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';
import TiptapEditor from '@/components/editor/TiptapEditor'; // Correctamente importado

// --- Componente StarRating ---
const StarIcon = ({ filled = false }: { filled?: boolean }) => (
    <svg className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${filled ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-300'}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);
const StarRating = ({ value, onChange }: { value: number; onChange: (newValue: number) => void }) => (
    <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
            <div key={star} onClick={() => onChange(star * 20)}>
                <StarIcon filled={value / 20 >= star} />
            </div>
        ))}
    </div>
);

// --- Página Principal ---
const CreateReviewPage = () => {
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Media[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [score, setScore] = useState(0);
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user, profile } = useAuth();
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => { if (!user) router.push('/login'); }, [user, router]);

    useEffect(() => {
        if (searchQuery.length < 3) { setSearchResults([]); return; }
        setIsSearching(true);
        const handler = setTimeout(async () => {
            const { data } = await supabase.from('media').select('*').or(`title_romaji.ilike.%${searchQuery}%,title_english.ilike.%${searchQuery}%`).limit(5);
            // La transformación de datos es correcta
            const transformedData = (data || []).map((item: any): Media => ({ id: item.id, title: { romaji: item.title_romaji, english: item.title_english, native: '' }, coverImage: { large: item.cover_image_large || '', extraLarge: '', medium: '', color: '' }, bannerImage: '', description: '', chapters: null, episodes: null, genres: [], averageScore: 0, popularity: 0, status: 'FINISHED', format: 'MANGA', type: 'MANGA' }));
            setSearchResults(transformedData);
            setIsSearching(false);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery, supabase]);

    const handleSelectMedia = (media: Media) => {
        setSelectedMedia(media);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleSubmit = async () => {
        if (!selectedMedia || !content.trim() || score === 0 || !user) {
            alert("Por favor, completa todos los campos: selecciona un manga, una puntuación y escribe tu reseña.");
            return;
        }
        setIsSubmitting(true);
        const { error } = await supabase.from('reviews').insert({
            user_id: user.id,
            media_id: selectedMedia.id,
            score: score,
            content: content,
        });

        if (error) {
            console.error("Error al crear la reseña:", error);
            alert("Hubo un error al publicar tu reseña.");
        } else {
            router.push(`/user/${profile?.username}?tab=reviews`);
        }
        setIsSubmitting(false);
    };

    return (
        <>
            <Navbar />
            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 text-white">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Escribir Nueva Reseña</h1>
                    <button onClick={handleSubmit} disabled={isSubmitting || !selectedMedia} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                        {isSubmitting ? 'Publicando...' : 'Publicar'}
                    </button>
                </div>

                <section className="bg-[#201f31] p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-xl font-bold mb-4">{selectedMedia ? 'Manga Seleccionado' : '1. Selecciona el Manga'}</h2>
                    {!selectedMedia ? (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Empieza a escribir el nombre de un manga..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-[#ffbade]"
                            />
                            {searchQuery.length >= 3 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#2b2d42] rounded-lg shadow-xl z-10 max-h-80 overflow-y-auto">
                                    {isSearching && <div className="p-4 text-gray-400">Buscando...</div>}
                                    {searchResults.length > 0 && !isSearching && searchResults.map(media => (
                                        <div key={media.id} onClick={() => handleSelectMedia(media)} className="flex items-center gap-4 p-3 hover:bg-gray-700/50 cursor-pointer">
                                            <Image src={media.coverImage.large} alt={media.title.romaji} width={40} height={60} className="rounded" />
                                            <span className="text-white font-semibold">{media.title.romaji}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Image src={selectedMedia.coverImage.large} alt={selectedMedia.title.romaji} width={50} height={75} className="rounded" />
                                <h3 className="text-2xl font-bold">{selectedMedia.title.romaji}</h3>
                            </div>
                            <button onClick={() => setSelectedMedia(null)} className="text-sm font-semibold text-red-400 hover:underline">Cambiar</button>
                        </div>
                    )}
                </section>

                {selectedMedia && (
                    <section className="bg-[#201f31] p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold mb-4">2. Tu Opinión</h2>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Puntuación</label>
                            <StarRating value={score} onChange={setScore} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Contenido de la Reseña</label>
                            {/* --- INICIO DE LA CORRECCIÓN --- */}
                            <TiptapEditor content={content} onChange={setContent} />
                            {/* --- FIN DE LA CORRECCIÓN --- */}
                        </div>
                    </section>
                )}
            </main>
        </>
    );
};

export default CreateReviewPage;
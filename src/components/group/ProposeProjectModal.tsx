// src/components/group/ProposeProjectModal.tsx
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Media } from '@/types/AniListResponse';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabaseClient';

const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6L18 18"/></svg>;
const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;

interface ProposeProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { media: Media, note: string, notify: boolean }) => void;
    isMember: boolean; // Para diferenciar el rol
}

const supabase = createClient();
const DEFAULT_MANGA_COVER = "https://pub-429d871e8d3c43d486ddf826e3b19f8e.r2.dev/b2cc0ddf-339e-4bfc-ae06-f7b6473c6f9c/manga_list_default.jpg";

const ProposeProjectModal = ({ isOpen, onClose, onSubmit, isMember }: ProposeProjectModalProps) => {
    const { addToast } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Media[]>([]);
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
    const [note, setNote] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [notifyMembers, setNotifyMembers] = useState(true); // Checkbox activado por defecto

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setSearchResults([]);
            setSelectedMedia(null);
            setNote('');
            setNotifyMembers(true);
        }
    }, [isOpen]);
    
    // Autosugerencia de mangas
    useEffect(() => {
        if (searchTerm.length < 3) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        const handler = setTimeout(async () => {
            const { data, error } = await supabase
                .from('media')
                .select('*')
                .or(`title_romaji.ilike.%${searchTerm}%,title_english.ilike.%${searchTerm}%`)
                .limit(5);

            if (error) {
                console.error("Error searching media:", error);
                setSearchResults([]);
            } else {
                 const transformedData = (data || []).map((item: any): Media => ({
                    id: item.id,
                    title: { romaji: item.title_romaji, english: item.title_english, native: item.title_native },
                    coverImage: { large: item.cover_image_large || '', extraLarge: item.cover_image_extra_large || '', medium: '', color: item.cover_image_color || '' },
                    bannerImage: item.banner_image || '',
                    description: item.description_en || '',
                    chapters: item.chapters || null,
                    episodes: item.episodes || null,
                    genres: item.genres || [],
                    averageScore: item.average_score || 0,
                    popularity: item.popularity || 0,
                    status: item.status || 'FINISHED',
                    format: item.format || 'MANGA',
                    type: item.type || 'MANGA',
                }));
                setSearchResults(transformedData);
            }
            setIsSearching(false);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMedia) {
            addToast('Debes seleccionar un manga para continuar.', 'error');
            return;
        }
        onSubmit({ media: selectedMedia, note, notify: notifyMembers });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#201f31] rounded-lg shadow-lg w-full max-w-xl p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">
                        {isMember ? 'Sugerir Nuevo Proyecto' : 'Crear Nuevo Proyecto'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sección de búsqueda y selección de manga */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Selecciona un manga</label>
                        {!selectedMedia ? (
                            <div className="relative">
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        placeholder="Busca un manga por título..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-gray-700/50 text-white rounded-lg pl-10 pr-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#ffbade]"
                                    />
                                    <div className="absolute left-3 text-gray-400"><SearchIcon /></div>
                                </div>
                                {isSearching && <p className="text-gray-400 text-sm mt-2">Buscando...</p>}
                                {searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#2b2d42] rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                                        {searchResults.map(media => (
                                            <div key={media.id} onClick={() => setSelectedMedia(media)} className="flex items-center gap-4 p-3 hover:bg-gray-700/50 cursor-pointer">
                                                <Image src={media.coverImage?.large || DEFAULT_MANGA_COVER} alt={media.title.romaji} width={40} height={60} className="rounded" />
                                                <span className="text-white font-semibold">{media.title.romaji}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Image src={selectedMedia.coverImage?.large || DEFAULT_MANGA_COVER} alt={selectedMedia.title.romaji} width={50} height={75} className="rounded" />
                                    <span className="text-white font-semibold">{selectedMedia.title.romaji}</span>
                                </div>
                                <button type="button" onClick={() => setSelectedMedia(null)} className="text-sm font-semibold text-red-400 hover:underline">Cambiar</button>
                            </div>
                        )}
                    </div>

                    {/* Sección de la nota */}
                    <div>
                        <label htmlFor="note" className="block text-sm font-medium text-gray-300 mb-2">Nota (opcional)</label>
                        <textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            placeholder="Añade una nota o una pequeña descripción sobre este proyecto..."
                            className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffbade]"
                        />
                    </div>
                    
                    {/* Checkbox de notificación */}
                    <div className="flex items-center">
                        <input
                            id="notify-members"
                            type="checkbox"
                            checked={notifyMembers}
                            onChange={(e) => setNotifyMembers(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="notify-members" className="ml-2 text-sm font-medium text-gray-300">
                            Notificar a los miembros del scan
                        </label>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg font-semibold hover:bg-gray-600/80">Cancelar</button>
                        <button type="submit" className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
                            Enviar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProposeProjectModal;
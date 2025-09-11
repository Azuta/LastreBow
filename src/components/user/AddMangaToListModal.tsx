// src/components/user/AddMangaToListModal.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Media } from '@/types/AniListResponse';
import Image from 'next/image';
import { fetchAllMedia } from '@/services/fetchAniList';

const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24"><path d="M18 6L6 18" stroke="currentColor" strokeWidth="2"/><path d="M6 6L18 18" stroke="currentColor" strokeWidth="2"/></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>;
const RemoveIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;


interface AddMangaToListModalProps {
    isOpen: boolean;
    onClose: () => void;
    listId: string;
    onMangaAdded: () => void;
    currentListMediaIds: number[];
}

const AddMangaToListModal = ({ isOpen, onClose, listId, onMangaAdded, currentListMediaIds }: AddMangaToListModalProps) => {
    const { profile, favorites, addMangasToList, addToast } = useAuth();
    const [activeTab, setActiveTab] = useState('search');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Media[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMangaIds, setSelectedMangaIds] = useState<number[]>(currentListMediaIds);
    const [isAdding, setIsAdding] = useState(false);
    const [allMedia, setAllMedia] = useState<Media[]>([]);

    const supabase = createClient();

    const DEFAULT_MANGA_COVER = "https://pub-429d871e8d3c43d486ddf826e3b19f8e.r2.dev/b2cc0ddf-339e-4bfc-ae06-f7b6473c6f9c/manga_list_default.jpg";
    
    useEffect(() => {
        const loadMedia = async () => {
            const data = await fetchAllMedia();
            setAllMedia(data);
        };
        loadMedia();
    }, []);

    useEffect(() => {
        if (searchTerm.length < 3) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        const handler = setTimeout(() => {
            const results = allMedia.filter(manga =>
                manga.title.romaji.toLowerCase().includes(searchTerm.toLowerCase()) ||
                manga.title.english?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResults(results);
            setIsSearching(false);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, allMedia]);

    const handleToggleSelect = (mangaId: number) => {
        // Prevén la deselección de mangas que ya están en la lista original
        if (currentListMediaIds.includes(mangaId)) {
            return;
        }

        setSelectedMangaIds(prev =>
            prev.includes(mangaId) ? prev.filter(id => id !== mangaId) : [...prev, mangaId]
        );
    };
    
    const handleAddMangas = async () => {
        const mangasToAdd = selectedMangaIds.filter(id => !currentListMediaIds.includes(id));
        
        if (mangasToAdd.length === 0) {
            addToast('No hay mangas nuevos para añadir.', 'info');
            onClose();
            return;
        }
        
        setIsAdding(true);
        await addMangasToList(listId, mangasToAdd);
        setIsAdding(false);
        
        onMangaAdded();
        onClose();
    };
    
    const handleRemoveFromQueue = (mangaId: number) => {
        setSelectedMangaIds(prev => prev.filter(id => id !== mangaId));
    };

    if (!isOpen) return null;

    const tabs = [{ id: 'search', name: 'Buscar' }, { id: 'favorites', name: 'Mis Favoritos' }];
    
    const availableFavorites = favorites; 
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#201f31] rounded-lg shadow-lg w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">Añadir mangas a la lista</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
                </div>
                
                <div className="p-6">
                    <div className="flex border-b border-gray-700 mb-4">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.id ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'search' && (
                        <div>
                            <input
                                type="text"
                                placeholder="Busca un manga..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ffbade]"
                            />
                            <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
                                {isSearching ? (
                                    <p className="text-gray-400">Buscando...</p>
                                ) : (
                                    searchResults.map(media => (
                                        <div key={media.id} onClick={() => handleToggleSelect(media.id)} className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer ${selectedMangaIds.includes(media.id) ? 'bg-gray-600/50' : 'hover:bg-gray-700/50'}`}>
                                            <div className="relative w-12 h-16 flex-shrink-0">
                                                <Image 
                                                    src={media.coverImage?.large || DEFAULT_MANGA_COVER} 
                                                    alt={media.title?.romaji ?? media.title?.english ?? 'Sin título'} 
                                                    fill 
                                                    className="rounded"
                                                    sizes="48px"
                                                />
                                            </div>
                                            <span className="text-white font-semibold flex-grow">{media.title?.romaji ?? media.title?.english ?? 'Sin título'}</span>
                                            {selectedMangaIds.includes(media.id) && <CheckIcon className="text-green-500"/>}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'favorites' && (
                         <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
                            {availableFavorites.length > 0 ? (
                                availableFavorites.map(media => (
                                    <div key={media.id} onClick={() => handleToggleSelect(media.id)} className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer ${selectedMangaIds.includes(media.id) ? 'bg-gray-600/50' : 'hover:bg-gray-700/50'}`}>
                                        <div className="relative w-12 h-16 flex-shrink-0">
                                            <Image 
                                                src={media.coverImage?.large || DEFAULT_MANGA_COVER} 
                                                alt={media.title?.romaji ?? media.title?.english ?? 'Sin título'} 
                                                fill 
                                                className="rounded"
                                            />
                                        </div>
                                        <span className="text-white font-semibold flex-grow">{media.title?.romaji ?? media.title?.english ?? 'Sin título'}</span>
                                        {selectedMangaIds.includes(media.id) && <CheckIcon className="text-green-500"/>}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400">Aún no tienes favoritos o ya están todos en esta lista.</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-700 flex flex-col gap-4">
                    <h4 className="text-sm font-semibold text-white">Manga(s) seleccionados ({selectedMangaIds.length})</h4>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                        {selectedMangaIds.map(id => {
                            const manga = searchResults.find(m => m.id === id) || allMedia.find(m => m.id === id);
                            return manga ? (
                                <div key={manga.id} className={`relative group inline-block text-black text-xs font-semibold px-2 py-1 rounded-full transition-colors ${currentListMediaIds.includes(id) ? 'bg-gray-400' : 'bg-[#ffbade]'}`}>
                                    <span className={currentListMediaIds.includes(id) ? 'text-gray-700' : ''}>
                                        {manga.title?.romaji ?? manga.title?.english ?? 'Sin título'}
                                    </span>
                                    {/* Muestra el icono de remover solo si no está ya en la lista original */}
                                    {!currentListMediaIds.includes(id) && (
                                        <button 
                                            onClick={() => handleRemoveFromQueue(manga.id)}
                                            className="absolute top-0 right-0 -mt-1 -mr-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <RemoveIcon />
                                        </button>
                                    )}
                                </div>
                            ) : null;
                        })}
                    </div>
                    <div className="flex justify-end gap-4">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg font-semibold hover:bg-gray-600/80">Cancelar</button>
                        <button
                            onClick={handleAddMangas}
                            disabled={isAdding}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isAdding ? 'Añadiendo...' : `Añadir (${selectedMangaIds.filter(id => !currentListMediaIds.includes(id)).length})`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddMangaToListModal;
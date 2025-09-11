// src/app/user/[username]/list/[listId]/page.tsx
"use client";

import { useState, useEffect, use, useMemo, useRef, useCallback } from 'react';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import MangaCard from '@/components/ui/cards/MangaCard';
import MangaCardList from '@/components/ui/cards/MangaCardList';
import { Media, UserList } from '@/types/AniListResponse';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import AddMangaToListModal from '@/components/user/AddMangaToListModal';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { SortableMangaCard } from '@/components/user/SortableMangaCard';
import { useAuth } from '@/context/AuthContext';
import DiscardChangesModal from '@/components/user/DiscardChangesModal'; 
import { SortableMangaCardList } from '@/components/user/SortableMangaCardList';


// Definimos un tipo para la lista con sus items
interface ListWithItems extends UserList {
    items: { media: Media }[];
}

// Iconos...
const PlusIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const SaveIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const UnsavedIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const EditIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const GridIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3H4C3.44772 3 3 3.44772 3 4V10C3 10.5523 3.44772 11 4 11H10C10.5523 11 11 10.5523 11 10V4C11 3.44772 10.5523 3 10 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 3H14C13.4477 3 13 3.44772 13 4V10C13 10.5523 13.4477 11 14 11H20C20.5523 11 21 10.5523 21 10V4C21 3.44772 20.5523 3 20 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 13H4C3.44772 13 3 13.4477 3 14V20C3 20.5523 3.44772 21 4 21H10C10.5523 21 11 20.5523 11 20V14C11 13.4477 10.5523 13 10 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 13H14C13.4477 13 13 13.4477 13 14V20C13 20.5523 13.4477 21 14 21H20C20.5523 21 21 20.5523 21 20V14C21 13.4477 20.5523 13 20 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ListIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 6H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 12H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 18H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ReloadIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6"></path><path d="M2.5 22v-6h6"></path><path d="M2.5 16a9 9 0 0 1 15.6-7.8L21.5 8"></path><path d="M21.5 8a9 9 0 0 1-15.6 7.8L2.5 16"></path></svg>;


const ListDetailPage = ({ params }: { params: { username: string, listId: string } }) => {
    const { listId: listIdWithSlug, username } = use(params);
    const listId = listIdWithSlug.split('-')[0];
    
    const [listData, setListData] = useState<ListWithItems | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddMangaModalOpen, setIsAddMangaModalOpen] = useState(false);
    const [sortedMediaItems, setSortedMediaItems] = useState<Media[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [removedMangaIds, setRemovedMangaIds] = useState<number[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); 
    
    const [paginationStyle, setPaginationStyle] = useState<'pagination' | 'infinite'>('pagination');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = viewMode === 'grid' ? 21 : 14;

    const supabase = createClient();
    const { addToast } = useAuth();

    const [originalViewSettings, setOriginalViewSettings] = useState({
        viewMode: 'grid' as 'grid' | 'list',
        paginationStyle: 'pagination' as 'pagination' | 'infinite',
        currentPage: 1
    });

    const fetchListData = async () => {
        setIsLoading(true);
        
        const { data, error } = await supabase
            .from('user_lists')
            .select(`
                *,
                items:list_items (
                    media:media (*),
                    order
                )
            `)
            .eq('id', listId)
            .single();

        if (error || !data) {
            console.error("Error fetching list data:", error);
            return notFound();
        }

        const mediaItems = data.items
            .filter(item => item.media)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(item => item.media);

        setListData(data as ListWithItems);
        setSortedMediaItems(mediaItems);
        setIsLoading(false);
        setHasUnsavedChanges(false);
        setRemovedMangaIds([]);
        setIsEditing(false);
        
        const newViewMode = (data.view_mode as string).replace(/'/g, "") as 'grid' | 'list';
        const newPaginationStyle = (data.pagination_style as string).replace(/'/g, "") as 'pagination' | 'infinite';
        
        setViewMode(newViewMode);
        setPaginationStyle(newPaginationStyle);
        
        setOriginalViewSettings({
          viewMode: newViewMode,
          paginationStyle: newPaginationStyle,
          currentPage: 1
        });
        
        setCurrentPage(1);
    };

    useEffect(() => {
        fetchListData();
    }, [listId]);

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = sortedMediaItems.findIndex(item => item.id === active.id);
        const newIndex = sortedMediaItems.findIndex(item => item.id === over.id);
        const newOrder = arrayMove(sortedMediaItems, oldIndex, newIndex);
        setSortedMediaItems(newOrder);
        setHasUnsavedChanges(true);
      }
    };
    
    const handleSaveOrder = async () => {
        setIsSaving(true);

        const upsertData = sortedMediaItems.map((media, index) => ({
            list_id: listId,
            media_id: media.id,
            order: index + 1,
        }));
        
        const removeData = removedMangaIds.map(mediaId => ({
            list_id: listId,
            media_id: mediaId,
        }));

        try {
            if (upsertData.length > 0) {
                const { error: upsertError } = await supabase.from('list_items').upsert(upsertData, { onConflict: 'list_id, media_id' });
                if (upsertError) throw upsertError;
            }

            if (removeData.length > 0) {
                const { error: removeError } = await supabase.from('list_items').delete().in('media_id', removedMangaIds).eq('list_id', listId);
                if (removeError) throw removeError;
            }

            const { error: settingsError } = await supabase.from('user_lists').update({
                view_mode: viewMode,
                pagination_style: paginationStyle,
            }).eq('id', listId);
            
            if (settingsError) throw settingsError;

            setHasUnsavedChanges(false);
            setRemovedMangaIds([]);
            addToast("Lista actualizada con éxito.", 'success');
            fetchListData();
        } catch (error) {
            console.error("Error al guardar los cambios:", error);
            addToast("Hubo un error al guardar los cambios.", 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveManga = (mediaId: number) => {
        setSortedMediaItems(prevItems => prevItems.filter(item => item.id !== mediaId));
        setRemovedMangaIds(prevIds => [...prevIds, mediaId]);
        setHasUnsavedChanges(true);
    };
    
    const handleConfirmDiscard = () => {
        setIsDiscardModalOpen(false);
        // Restaurar el estado de vista original
        setViewMode(originalViewSettings.viewMode);
        setPaginationStyle(originalViewSettings.paginationStyle);
        setCurrentPage(originalViewSettings.currentPage);
        fetchListData();
    };

    const handleToggleEditMode = () => {
        if (isEditing && hasUnsavedChanges) {
            setIsDiscardModalOpen(true);
        } else {
            // Guardar el estado actual antes de entrar en modo de edición
            setOriginalViewSettings({
                viewMode,
                paginationStyle,
                currentPage
            });
            setIsEditing(!isEditing);
        }
    };

    useEffect(() => {
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        if (hasUnsavedChanges) {
          event.preventDefault();
          event.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
        }
      };

      if (hasUnsavedChanges) {
        window.addEventListener('beforeunload', handleBeforeUnload);
      } else {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }, [hasUnsavedChanges]);


    const mediaItems = sortedMediaItems;
    const currentListMediaIds = mediaItems.map(m => m.id);

    const totalPages = Math.ceil(mediaItems.length / ITEMS_PER_PAGE);
    const currentItems = useMemo(() => {
        if (paginationStyle === 'infinite') return mediaItems.slice(0, currentPage * ITEMS_PER_PAGE);
        const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
        const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
        return mediaItems.slice(indexOfFirstItem, indexOfLastItem);
    }, [mediaItems, currentPage, ITEMS_PER_PAGE, paginationStyle]);

    const observer = useRef<IntersectionObserver>();
    const lastElementRef = useCallback((node: HTMLElement | null) => {
        if (isLoading || paginationStyle !== 'infinite') return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && currentPage < totalPages) setCurrentPage(prev => prev + 1);
        });
        if (node) observer.current.observe(node);
    }, [isLoading, paginationStyle, currentPage, totalPages]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    if (isLoading || !listData) {
        return (
            <>
                <Navbar />
                <div className="text-center py-20 text-white">Cargando lista...</div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <nav className="text-sm text-gray-400 mb-2">
                            <Link href={`/user/${username}`} className="hover:text-[#ffbade]">{`Perfil de ${username}`}</Link>
                            <span className="mx-2">&rsaquo;</span>
                            <span className="text-white">Lista</span>
                        </nav>
                        <h1 className="text-4xl font-bold text-white">{listData.name}</h1>
                        <p className="text-gray-400 mt-2">{listData.description}</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        {isEditing && hasUnsavedChanges && (
                            <div className="flex items-center gap-2 text-sm text-yellow-400 font-semibold transition-opacity duration-300">
                                <UnsavedIcon /> 
                                <span className="hidden sm:inline">Cambios sin guardar</span>
                            </div>
                        )}
                        <button
                            onClick={handleToggleEditMode}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                                isEditing
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-gray-700/50 text-white hover:bg-gray-600/80'
                            }`}
                        >
                            <EditIcon /> {isEditing ? 'Salir de Edición' : 'Editar'}
                        </button>
                        {isEditing && (
                            <button
                                onClick={handleSaveOrder}
                                disabled={!hasUnsavedChanges || isSaving}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <SaveIcon /> {isSaving ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        )}
                        <button
                            onClick={() => setIsAddMangaModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 text-white rounded-lg text-sm font-semibold hover:bg-gray-600/80 transition-colors"
                        >
                            <PlusIcon /> Añadir
                        </button>
                    </div>
                </div>

                {isEditing && (
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-2 bg-gray-700/50 rounded-full p-1">
                            <button 
                                onClick={() => { setPaginationStyle('pagination'); setCurrentPage(1); setHasUnsavedChanges(true); }} 
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${paginationStyle === 'pagination' ? 'bg-[#ffbade] text-black' : 'text-gray-300 hover:bg-gray-600/80'}`}
                            >
                                Paginación
                            </button>
                            <button 
                                onClick={() => { setPaginationStyle('infinite'); setHasUnsavedChanges(true); }}
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${paginationStyle === 'infinite' ? 'bg-[#ffbade] text-black' : 'text-gray-300 hover:bg-gray-600/80'}`}
                            >
                                Scroll Infinito
                            </button>
                        </div>
                         <div className="flex items-center space-x-2">
                             <div className="flex items-center bg-gray-700/50 rounded-full p-1">
                                <button onClick={() => { setViewMode('grid'); setHasUnsavedChanges(true); }} className={`p-1.5 rounded-full ${viewMode === 'grid' ? 'bg-[#ffbade] text-black' : 'text-gray-300'}`} aria-label="Vista de cuadrícula">
                                    <GridIcon />
                                </button>
                                <button onClick={() => { setViewMode('list'); setHasUnsavedChanges(true); }} className={`p-1.5 rounded-full ${viewMode === 'list' ? 'bg-[#ffbade] text-black' : 'text-gray-300'}`} aria-label="Vista de lista">
                                    <ListIcon />
                                </button>
                            </div>
                            <button onClick={handleConfirmDiscard} className="p-2 bg-gray-700/50 hover:bg-gray-600/80 text-gray-300 rounded-full transition-colors" aria-label="Reiniciar vista"><ReloadIcon /></button>
                         </div>
                    </div>
                )}


                {mediaItems.length > 0 ? (
                    <>
                        <DndContext
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext items={mediaItems.map(item => item.id)} disabled={!isEditing} strategy={verticalListSortingStrategy}>
                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-4 gap-y-6">
                                        {currentItems.map((manga, index) => (
                                            <div key={manga.id} ref={paginationStyle === 'infinite' && index === currentItems.length - 1 ? lastElementRef : null}>
                                                <SortableMangaCard
                                                    media={manga}
                                                    onRemove={handleRemoveManga}
                                                    isEditing={isEditing}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {currentItems.map((manga, index) => (
                                            <div key={manga.id} ref={paginationStyle === 'infinite' && index === currentItems.length - 1 ? lastElementRef : null}>
                                                <SortableMangaCardList
                                                    media={manga} 
                                                    onRemove={handleRemoveManga} 
                                                    isEditing={isEditing} 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </SortableContext>
                        </DndContext>
                    
                    {totalPages > 1 && paginationStyle === 'pagination' && (
                        <div className="flex justify-center items-center mt-12">
                            <nav className="flex items-center gap-2" aria-label="Pagination">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/80 text-gray-300 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Anterior</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button key={page} onClick={() => handlePageChange(page)} className={`w-8 h-8 rounded-md text-sm font-semibold transition-colors ${ currentPage === page ? 'bg-[#ffbade] text-black' : 'bg-gray-700/50 hover:bg-gray-600/80 text-gray-300'}`}>{page}</button>
                                ))}
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/80 text-gray-300 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Siguiente</button>
                            </nav>
                        </div>
                    )}
                    </>
                ) : (
                    <div className="text-center py-20 bg-[#201f31] rounded-lg">
                        <p className="text-gray-400">Esta lista aún no tiene mangas.</p>
                        <p className="text-sm text-gray-500 mt-2">Usa el botón 'Añadir' para agregar mangas aquí.</p>
                    </div>
                )}
            </main>
            
            <AddMangaToListModal
                isOpen={isAddMangaModalOpen}
                onClose={() => setIsAddMangaModalOpen(false)}
                listId={listId}
                onMangaAdded={fetchListData}
                currentListMediaIds={currentListMediaIds}
            />

            <DiscardChangesModal
                isOpen={isDiscardModalOpen}
                onConfirm={handleConfirmDiscard}
                onCancel={() => setIsDiscardModalOpen(false)}
            />
        </>
    );
};

export default ListDetailPage;
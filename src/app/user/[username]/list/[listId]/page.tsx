// src/app/user/[username]/list/[listId]/page.tsx
"use client";

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import MangaCard from '@/components/ui/cards/MangaCard';
import { Media, UserList } from '@/types/AniListResponse';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import AddMangaToListModal from '@/components/user/AddMangaToListModal';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { SortableMangaCard } from '@/components/user/SortableMangaCard';
import { useAuth } from '@/context/AuthContext';

// Definimos un tipo para la lista con sus items
interface ListWithItems extends UserList {
    items: { media: Media }[];
}

// Iconos...
const PlusIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const SaveIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const UnsavedIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;


const ListDetailPage = ({ params }: { params: { username: string, listId: string } }) => {
    const { listId: listIdWithSlug, username } = use(params);
    const listId = listIdWithSlug.split('-')[0];
    
    const [listData, setListData] = useState<ListWithItems | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddMangaModalOpen, setIsAddMangaModalOpen] = useState(false);
    const [sortedMediaItems, setSortedMediaItems] = useState<Media[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const supabase = createClient();
    const { addToast, removeMangaFromList } = useAuth();


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
        const updates = sortedMediaItems.map((media, index) => ({
            list_id: listId,
            media_id: media.id,
            order: index + 1,
        }));
        const { error } = await supabase.from('list_items').upsert(updates, { onConflict: 'list_id, media_id' });
        if (error) {
            console.error("Error al guardar el nuevo orden:", error);
            addToast("Hubo un error al guardar el orden.", 'error');
        } else {
            setHasUnsavedChanges(false);
            addToast("Orden guardado con éxito.", 'success');
        }
        setIsSaving(false);
    };

    const handleRemoveManga = async (mediaId: number) => {
        // Lógica para actualizar el estado antes de la llamada a la API para una respuesta instantánea
        setSortedMediaItems(prevItems => prevItems.filter(item => item.id !== mediaId));

        // Llamar a la función del contexto para manejar la eliminación en la base de datos
        await removeMangaFromList(listId, mediaId);
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
      }

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }, [hasUnsavedChanges]);


    if (isLoading || !listData) {
        return (
            <>
                <Navbar />
                <div className="text-center py-20 text-white">Cargando lista...</div>
            </>
        );
    }

    const mediaItems = sortedMediaItems;
    const currentListMediaIds = mediaItems.map(m => m.id);

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
                        {hasUnsavedChanges && (
                            <div className="flex items-center gap-2 text-sm text-yellow-400 font-semibold transition-opacity duration-300">
                                <UnsavedIcon /> 
                                <span className="hidden sm:inline">Cambios sin guardar</span>
                            </div>
                        )}
                        <button
                            onClick={handleSaveOrder}
                            disabled={!hasUnsavedChanges || isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <SaveIcon /> {isSaving ? 'Guardando...' : 'Guardar orden'}
                        </button>
                        <button
                            onClick={() => setIsAddMangaModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 text-white rounded-lg text-sm font-semibold hover:bg-gray-600/80 transition-colors"
                        >
                            <PlusIcon /> Añadir
                        </button>
                    </div>
                </div>

                {mediaItems.length > 0 ? (
                    <DndContext
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={mediaItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-4 gap-y-6">
                                {mediaItems.map(manga => (
                                    <SortableMangaCard key={manga.id} media={manga} onRemove={handleRemoveManga} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
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
        </>
    );
};

export default ListDetailPage;
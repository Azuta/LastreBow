// src/app/user/[username]/list/[listId]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import MangaCard from '@/components/ui/cards/MangaCard';
import { Media, UserList } from '@/types/AniListResponse';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';

// Definimos un tipo para la lista con sus items
interface ListWithItems extends UserList {
    items: { media: Media }[];
}

const ListDetailPage = ({ params }: { params: { username: string, listId: string } }) => {
    const [listData, setListData] = useState<ListWithItems | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchListData = async () => {
            setIsLoading(true);
            
            const { data, error } = await supabase
                .from('user_lists')
                .select(`
                    *,
                    items:list_items (
                        media:media (*)
                    )
                `)
                .eq('id', params.listId)
                .single();

            if (error || !data) {
                console.error("Error fetching list data:", error);
                notFound();
            }

            setListData(data as ListWithItems);
            setIsLoading(false);
        };

        fetchListData();
    }, [params.listId]);

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className="text-center py-20 text-white">Cargando lista...</div>
            </>
        );
    }

    if (!listData) {
        return notFound();
    }

    const mediaItems = listData.items.map(item => item.media).filter(Boolean); // Filtramos por si algún media es nulo

    return (
        <>
            <Navbar />
            <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <nav className="text-sm text-gray-400 mb-2">
                        <Link href={`/user/${params.username}`} className="hover:text-[#ffbade]">Perfil de {params.username}</Link>
                        <span className="mx-2">&rsaquo;</span>
                        <span className="text-white">Lista</span>
                    </nav>
                    <h1 className="text-4xl font-bold text-white">{listData.name}</h1>
                    <p className="text-gray-400 mt-2">{listData.description}</p>
                </div>

                {mediaItems.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-4 gap-y-6">
                        {mediaItems.map(manga => (
                            <MangaCard key={manga.id} media={manga} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-[#201f31] rounded-lg">
                        <p className="text-gray-400">Esta lista aún no tiene mangas.</p>
                        <p className="text-sm text-gray-500 mt-2">Usa el botón '+' en las tarjetas de manga para añadirlos aquí.</p>
                    </div>
                )}
            </main>
        </>
    );
};

export default ListDetailPage;
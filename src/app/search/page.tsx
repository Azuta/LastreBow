// src/app/search/page.tsx
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import MangaCard from '@/components/ui/cards/MangaCard';
import { Media } from '@/types/AniListResponse';
import { createClient } from '@/lib/supabaseClient';

const supabase = createClient();

const SearchResults = () => {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState<Media[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const performSearch = async () => {
            if (!query) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            // Usamos .ilike para una búsqueda flexible que no distingue mayúsculas/minúsculas
            const { data, error } = await supabase
                .from('media')
                .select('*')
                .or(`title_romaji.ilike.%${query}%,title_english.ilike.%${query}%`)
                .limit(28); // Limitar a un número razonable de resultados

            if (error) {
                console.error("Error performing search:", error);
                setResults([]);
            } else {
                setResults(data as Media[]);
            }
            setIsLoading(false);
        };

        performSearch();
    }, [query]);

    return (
        <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-white mb-8">
                {query ? `Resultados para: "${query}"` : 'Realiza una búsqueda'}
            </h1>

            {isLoading ? (
                <p className="text-center text-white">Buscando...</p>
            ) : results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-4 gap-y-6">
                    {results.map(manga => (
                        <MangaCard key={manga.id} media={manga} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-[#201f31] rounded-lg">
                    <p className="text-gray-400">
                        {query ? 'No se encontraron resultados.' : 'Usa la barra de búsqueda para encontrar tu manga favorito.'}
                    </p>
                </div>
            )}
        </main>
    );
};

const SearchPage = () => {
    return (
        <>
            <Navbar />
            {/* Suspense es necesario porque useSearchParams solo funciona en Client Components */}
            <Suspense fallback={<div className="text-center py-20 text-white">Cargando...</div>}>
                <SearchResults />
            </Suspense>
        </>
    );
};

export default SearchPage;
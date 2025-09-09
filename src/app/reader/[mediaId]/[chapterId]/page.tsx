// src/app/reader/[mediaId]/[chapterId]/page.tsx
"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

// --- Iconos (Sin cambios) ---
const SettingsIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const ChevronLeftIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRightIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const RowsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="12" x2="21" y2="12"></line></svg>;
const FullscreenEnterIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 4H4v6m16 4v6h-6m-10 0H4v-6m16-4V4h-6"/></svg>;
const FullscreenExitIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 14h6v6m10-16h-6V4M4 10V4h6m10 16v-6h-6"/></svg>;
const HomeIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;

type ReadingMode = 'long-strip' | 'single-page';

const ReaderPage = ({ params }: { params: { mediaId: string; chapterId: string } }) => {
    const [pages, setPages] = useState<string[]>([]);
    const [chapterInfo, setChapterInfo] = useState<{ number: string, title?: string, mediaTitle: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [readingMode, setReadingMode] = useState<ReadingMode>('long-strip');
    const readerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchChapterPages = async () => {
            setIsLoading(true);
            
            const { data, error } = await supabase
                .from('chapters')
                .select(`
                    chapter_number,
                    title,
                    page_urls,
                    media:media_id (
                        title_romaji,
                        title_english
                    )
                `)
                .eq('id', params.chapterId)
                .single();

            if (error || !data) {
                console.error("Error fetching chapter:", error);
                return notFound();
            }
            
            setPages(data.page_urls || []);
            setChapterInfo({
                number: data.chapter_number,
                title: data.title || undefined,
                mediaTitle: data.media.title_english || data.media.title_romaji
            });
            setIsLoading(false);
        };

        fetchChapterPages();
    }, [params.chapterId, params.mediaId]);
    
    // ... (El resto de los hooks y funciones como goToNextPage, toggleFullscreen, etc., no necesitan cambios)

    if (isLoading || !chapterInfo) {
        return <div className="bg-[#101114] min-h-screen text-white flex justify-center items-center">Cargando capítulo...</div>;
    }

    return (
        <div ref={readerRef} className="bg-[#101114] min-h-screen text-white">
            <header className={`bg-[#1a1a24]/80 backdrop-blur-sm sticky top-0 z-50 h-16 flex items-center justify-between px-4 shadow-md transition-transform ${isFullscreen ? '-translate-y-full' : 'translate-y-0'}`}>
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push(`/media/${params.mediaId}`)} className="hover:bg-gray-700 p-2 rounded-full">
                        <HomeIcon />
                    </button>
                    <div>
                        <h1 className="font-bold truncate max-w-xs">{chapterInfo.mediaTitle}</h1>
                        <p className="text-sm text-gray-400">Capítulo {chapterInfo.number}</p>
                    </div>
                </div>
                {/* Aquí podrías implementar la navegación entre capítulos */}
                <div className="flex items-center gap-2">
                    <button className="hover:bg-gray-700 p-2 rounded-full"><ChevronLeftIcon /></button>
                    <select className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-sm">
                        <option>Capítulo {chapterInfo.number}</option>
                    </select>
                    <button className="hover:bg-gray-700 p-2 rounded-full"><ChevronRightIcon /></button>
                </div>

                <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`p-2 rounded-full transition-colors ${isSettingsOpen ? 'bg-[#ffbade] text-black' : 'hover:bg-gray-700 text-white'}`}>
                    <SettingsIcon />
                </button>
            </header>

            {isSettingsOpen && (
                <div className={`bg-[#201f31] p-4 flex justify-center items-center gap-8 text-sm border-b border-gray-700 sticky top-16 z-40`}>
                    <div className="flex flex-col items-center">
                        <span className="font-semibold mb-2">Modo de Lectura</span>
                        <div className="flex gap-1 bg-gray-700 p-1 rounded-lg">
                            <button onClick={() => setReadingMode('long-strip')} className={`px-3 py-1 rounded-md flex items-center gap-2 ${readingMode === 'long-strip' ? 'bg-[#ffbade] text-black' : ''}`}><RowsIcon /> Tira Larga</button>
                            {/* Podrías añadir otros modos si lo deseas */}
                        </div>
                    </div>
                     <div className="flex flex-col items-center">
                        <span className="font-semibold mb-2">Vista</span>
                         <button className="px-3 py-1 rounded-lg flex items-center gap-2 bg-gray-700 hover:bg-gray-600">
                            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
                            {isFullscreen ? 'Salir' : 'Pantalla Completa'}
                        </button>
                    </div>
                </div>
            )}

            <main className="max-w-4xl mx-auto py-4">
                {readingMode === 'long-strip' && (
                    <div className="flex flex-col items-center">
                        {pages.map((pageUrl, index) => (
                            <img key={index} src={pageUrl} alt={`Página ${index + 1}`} className="max-w-full h-auto mb-1" />
                        ))}
                    </div>
                )}
                {/* Aquí iría la lógica para otros modos de lectura si los implementas */}
            </main>
        </div>
    );
};

export default ReaderPage;
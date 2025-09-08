"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { fetchAllMediaByCategoryAndGenre } from "@/services/fetchAniList";
import { Media } from "@/types/AniListResponse";
import Navbar from "@/components/layout/Navbar";
import MangaCard from "@/components/ui/cards/MangaCard";
import MangaCardList from "@/components/ui/cards/MangaCardList";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import Link from "next/link";
import AdvancedFilters from "@/app/browse/AdvancedFilters";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// --- Iconos ---
const GridIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3H4C3.44772 3 3 3.44772 3 4V10C3 10.5523 3.44772 11 4 11H10C10.5523 11 11 10.5523 11 10V4C11 3.44772 10.5523 3 10 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 3H14C13.4477 3 13 3.44772 13 4V10C13 10.5523 13.4477 11 14 11H20C20.5523 11 21 10.5523 21 10V4C21 3.44772 20.5523 3 20 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 13H4C3.44772 13 3 13.4477 3 14V20C3 20.5523 3.44772 21 4 21H10C10.5523 21 11 20.5523 11 20V14C11 13.4477 10.5523 13 10 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 13H14C13.4477 13 13 13.4477 13 14V20C13 20.5523 13.4477 21 14 21H20C20.5523 21 21 20.5523 21 20V14C21 13.4477 20.5523 13 20 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ListIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 6H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 12H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 18H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const FilterIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ShareIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8.59 13.51L15.42 17.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M15.41 6.51001L8.59 10.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const CopyIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 16H20C20.5304 16 21.0391 15.7893 21.4142 15.4142C21.7893 15.0391 22 14.5304 22 14V4C22 3.46957 21.7893 2.96086 21.4142 2.58579C21.0391 2.21071 20.5304 2 20 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 8H4C3.46957 8 2.96086 8.21071 2.58579 8.58579C2.21071 8.96086 2 9.46957 2 10V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H14C14.5304 22 15.0391 21.7893 15.4142 21.4142C15.7893 21.0391 16 20.5304 16 20V8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

// --- Componente para el Pop-up de Compartir ---
const ShareModal = ({ isOpen, onClose, url }: { isOpen: boolean; onClose: () => void; url: string }) => {
  const [copyText, setCopyText] = useState("Copiar");
  useEffect(() => { if (isOpen) setCopyText("Copiar"); }, [isOpen]);
  const handleCopy = () => { navigator.clipboard.writeText(url); setCopyText("¡Copiado!"); };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#201f31] rounded-lg shadow-lg p-6 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white"><CloseIcon /></button>
        <h3 className="text-lg font-bold text-white mb-4">Compartir Vista</h3>
        <p className="text-sm text-gray-400 mb-2">Copia este enlace para compartir los filtros actuales:</p>
        <div className="flex gap-2">
          <input type="text" readOnly value={url} className="w-full bg-gray-800 text-gray-300 rounded-md px-3 py-1.5 text-sm border border-gray-600 focus:outline-none" />
          <button onClick={handleCopy} className="flex-shrink-0 flex items-center gap-2 px-4 py-1.5 bg-[#ffbade] text-black rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"><CopyIcon />{copyText}</button>
        </div>
      </div>
    </div>
  );
};

// --- Constantes para los filtros y ordenamiento ---
const ALL_AVAILABLE_GENRES = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mecha', 'Music', 'Mystery', 'Psychological', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller', 'Seinen', 'Josei'];
const ALL_AVAILABLE_FORMATS = ['MANGA', 'ONE_SHOT', 'MANHWA', 'NOVEL'];
const ALL_AVAILABLE_STATUSES = ['RELEASING', 'FINISHED', 'NOT_YET_RELEASED', 'CANCELLED', 'HIATUS'];
const SORT_OPTIONS = { POPULARITY_DESC: 'Popularidad', SCORE_DESC: 'Puntuación', TITLE_ROMAJI: 'Alfabético' };
type SortOptionsKey = keyof typeof SORT_OPTIONS;

// --- Componente principal de la página ---
const BrowsePage = ({ params: routeParams }: { params: { category: string; genre: string; } }) => {
    const { viewMode, toggleViewMode, paginationStyle } = useUserPreferences();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [allMedia, setAllMedia] = useState<Media[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [urlToShare, setUrlToShare] = useState("");

    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortOptionsKey>('POPULARITY_DESC');
    const [searchTerm, setSearchTerm] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = viewMode === 'grid' ? 14 : 7;
    const category = decodeURIComponent(routeParams.category);
    const genre = decodeURIComponent(routeParams.genre);
    const pageTitle = genre === 'all' ? category.charAt(0).toUpperCase() + category.slice(1) : genre.charAt(0).toUpperCase() + genre.slice(1);

    // Efecto para inicializar los filtros DESDE la URL, solo una vez.
    useEffect(() => {
        setSelectedGenres(searchParams.get('genres')?.split(',').filter(Boolean) || []);
        setSelectedFormats(searchParams.get('formats')?.split(',').filter(Boolean) || []);
        setSelectedStatus(searchParams.get('status')?.split(',').filter(Boolean) || []);
        setSortBy((searchParams.get('sortBy') as SortOptionsKey) || 'POPULARITY_DESC');
        setSearchTerm(searchParams.get('search') || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Se ejecuta solo al montar el componente

    // Carga inicial de datos, solo cuando cambia la categoría/género de la ruta
    useEffect(() => {
        const loadMedia = async () => {
            setIsLoading(true);
            const data = await fetchAllMediaByCategoryAndGenre(category, genre);
            setAllMedia(data);
            if (genre.toLowerCase() !== 'all' && !searchParams.has('genres')) {
                setSelectedGenres(prev => [...new Set([...prev, pageTitle])]);
            }
            setIsLoading(false);
        };
        loadMedia();
    }, [category, genre]);

    // Efecto para sincronizar el estado de los filtros HACIA la URL
    useEffect(() => {
        const params = new URLSearchParams();
        const setParam = (key: string, value: string[]) => { if (value.length > 0) params.set(key, value.join(',')) };

        setParam('genres', selectedGenres);
        setParam('formats', selectedFormats);
        setParam('status', selectedStatus);
        if (searchTerm) params.set('search', searchTerm);
        if (sortBy !== 'POPULARITY_DESC') params.set('sortBy', sortBy);

        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

        router.replace(newUrl, { scroll: false });
        setUrlToShare(window.location.origin + newUrl);
    }, [selectedGenres, selectedFormats, selectedStatus, searchTerm, sortBy, pathname, router]);

    const sortedAndFilteredMedia = useMemo(() => {
        const filtered = allMedia.filter(media => {
            const searchMatch = !searchTerm || (media.title.english?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (media.title.romaji?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            const genreMatch = selectedGenres.length === 0 || selectedGenres.every(g => media.genres.includes(g));
            const formatMatch = selectedFormats.length === 0 || selectedFormats.includes(media.format);
            const statusMatch = selectedStatus.length === 0 || selectedStatus.includes(media.status);
            return searchMatch && genreMatch && formatMatch && statusMatch;
        });
        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'SCORE_DESC': return (b.averageScore || 0) - (a.averageScore || 0);
                case 'TITLE_ROMAJI': return a.title.romaji.localeCompare(b.title.romaji);
                default: return b.popularity - a.popularity;
            }
        });
    }, [allMedia, searchTerm, selectedGenres, selectedFormats, selectedStatus, sortBy]);

    const totalPages = Math.ceil(sortedAndFilteredMedia.length / ITEMS_PER_PAGE);
    const currentItems = useMemo(() => {
        if (paginationStyle === 'infinite') return sortedAndFilteredMedia.slice(0, currentPage * ITEMS_PER_PAGE);
        const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
        const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
        return sortedAndFilteredMedia.slice(indexOfFirstItem, indexOfLastItem);
    }, [sortedAndFilteredMedia, currentPage, ITEMS_PER_PAGE, paginationStyle]);

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
    
    const createHandler = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>) => (itemToToggle: T) => {
        setter(prev => prev.includes(itemToToggle) ? prev.filter(i => i !== itemToToggle) : [...prev, itemToToggle]);
    };
    
    const handleGenreChange = createHandler(setSelectedGenres);
    const handleFormatChange = createHandler(setSelectedFormats);
    const handleStatusChange = createHandler(setSelectedStatus);

    const resetFilters = () => { setSelectedGenres([]); setSelectedFormats([]); setSelectedStatus([]); };

    return (
        <>
            <Navbar />
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <header className="mb-8">
                    <nav className="text-sm text-gray-400 mb-2">
                        <Link href="/" className="hover:text-[#ffbade]">Inicio</Link>
                        <span className="mx-2">&rsaquo;</span>
                        <span className="text-white">{pageTitle}</span>
                    </nav>
                    <h1 className="text-4xl font-bold text-white">Mangas <span className="text-[#ffbade]">{pageTitle}</span></h1>
                </header>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#201f31] p-4 rounded-lg mb-8">
                    <input type="text" placeholder="Buscar en esta sección..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-auto bg-gray-700/50 text-gray-300 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffbade]" />
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsShareModalOpen(true)} className="p-2 bg-gray-700/50 hover:bg-gray-600/80 text-gray-300 rounded-full transition-colors" aria-label="Compartir"><ShareIcon /></button>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOptionsKey)} className="bg-gray-700/50 text-gray-300 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffbade]">
                            {Object.entries(SORT_OPTIONS).map(([key, value]) => (<option key={key} value={key}>{value}</option>))}
                        </select>
                        <button onClick={() => setIsFiltersOpen(true)} className="flex items-center gap-2 px-4 py-1.5 bg-gray-700/50 hover:bg-gray-600/80 text-gray-300 rounded-full text-sm font-semibold transition-colors"><FilterIcon />Filtros</button>
                        <div className="flex items-center bg-gray-700/50 rounded-full p-1">
                            <button onClick={toggleViewMode} className={`p-1.5 rounded-full ${viewMode === 'grid' ? 'bg-[#ffbade] text-black' : 'text-gray-300'}`}><GridIcon /></button>
                            <button onClick={toggleViewMode} className={`p-1.5 rounded-full ${viewMode === 'list' ? 'bg-[#ffbade] text-black' : 'text-gray-300'}`}><ListIcon /></button>
                        </div>
                    </div>
                </div>
                
                {isLoading ? <p className="text-center text-white">Cargando mangas...</p> : (
                    <>
                        <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-4 gap-y-6" : "flex flex-col gap-4"}>
                            {currentItems.map((media, index) => (
                                <div key={media.id} ref={index === currentItems.length - 1 ? lastElementRef : null}>
                                    {viewMode === 'grid' ? <MangaCard media={media} /> : <MangaCardList media={media} />}
                                </div>
                            ))}
                        </div>
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
                )}
            </div>

            <AdvancedFilters isOpen={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} resultCount={sortedAndFilteredMedia.length} allGenres={ALL_AVAILABLE_GENRES} selectedGenres={selectedGenres} handleGenreChange={handleGenreChange} allFormats={ALL_AVAILABLE_FORMATS} selectedFormats={selectedFormats} handleFormatChange={handleFormatChange} allStatuses={ALL_AVAILABLE_STATUSES} selectedStatus={selectedStatus} handleStatusChange={handleStatusChange} resetFilters={resetFilters} />
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} url={urlToShare} />
        </>
    );
};

export default BrowsePage;
"use client";
import { useState, useEffect } from 'react';

// --- Iconos para la UI del lector ---
const SettingsIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const ChevronLeftIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRightIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const BookOpenIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const ColumnsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="3" x2="12" y2="21"></line></svg>;
const RowsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="12" x2="21" y2="12"></line></svg>;

// --- Iconos de Redes Sociales ---
const TwitterIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>;
const DiscordIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.369a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.443.866-.608 1.25a18.294 18.294 0 00-5.487 0 12.35 12.35 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.683 4.37a.077.077 0 00-.035.079C3.388 6.273 3.084 8.978 3.028 11.352a16.208 16.208 0 00.002.524.077.077 0 00.037.063c.41.272.883.626 1.343.998a.077.077 0 00.086-.02c.083-.092.162-.188.238-.285a.077.077 0 00-.013-.102c-.042-.03-.083-.06-.12-.087a.08.08 0 01-.01-.05c-.04-.05-.075-.1-.112-.153a.077.077 0 00-.04-.047c-.6-.412-1.13-1-1.6-1.576.244.148.493.29.747.425a.076.076 0 00.118-.044c.33-.578.62-1.172.87-1.78a15.187 15.187 0 002.66.074c.45.318.86.685 1.227 1.077a.077.077 0 00.04.047c-.035.05-.07.1-.11.153a.076.076 0 01-.01.05c-.04.028-.08.058-.12.087a.076.076 0 00-.014.102c.076.096.155.192.238.285a.076.076 0 00.086.02c.46-.372.932-.727 1.342-.998a.076.076 0 00.037-.063 16.278 16.278 0 00.002-.524c-.052-2.374-.356-5.079-.61-6.9a.077.077 0 00-.035-.08zM8.02 15.33c-.832 0-1.513-.73-1.513-1.636s.68-1.636 1.513-1.636c.832 0 1.513.73 1.513 1.636.001.905-.68 1.636-1.513 1.636zm7.96 0c-.832 0-1.513-.73-1.513-1.636s.68-1.636 1.513-1.636c.832 0 1.513.73 1.513 1.636s-.68 1.636-1.513 1.636z"></path></svg>;
const FacebookIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0015.06 3c-2.434 0-4.108 1.49-4.108 4.223v2.355H8.351v3.209h2.607v8.196h2.438z"></path></svg>;

// --- Datos de prueba ---
const MOCK_PAGES = Array.from({ length: 18 }, (_, i) => `https://placehold.co/800x1200/101114/7f8c8d?text=Página+${i + 1}`);
const MOCK_SCAN_INFO = {
    name: "Scanlation Group",
    socials: {
        twitter: "https://twitter.com/scanlationgroup",
        discord: "https://discord.gg/scanlationgroup",
        facebook: "https://facebook.com/scanlationgroup"
    }
};

const ReaderPage = ({ params }: { params: { mediaId: string; chapterId: string } }) => {
    const [pages, setPages] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    // --- Opciones de Lector ---
    type ReadingMode = 'long-strip' | 'single-page' | 'double-page';
    const [readingMode, setReadingMode] = useState<ReadingMode>('long-strip');

    useEffect(() => {
        // Simula la carga de las imágenes del capítulo
        setPages(MOCK_PAGES);
    }, [params.chapterId]);

    const totalPages = pages.length;

    // --- Navegación ---
    const goToNextPage = () => setCurrentPage(p => Math.min(p + (readingMode === 'double-page' ? 2 : 1), totalPages));
    const goToPrevPage = () => setCurrentPage(p => Math.max(p - (readingMode === 'double-page' ? 2 : 1), 1));

    // --- Renderizado de Páginas ---
    const renderPages = () => {
        switch (readingMode) {
            case 'single-page':
                return (
                    <div className="flex justify-center items-start pt-8">
                        <img src={pages[currentPage - 1]} alt={`Página ${currentPage}`} className="max-w-full h-auto max-h-[85vh] shadow-lg" />
                    </div>
                );
            case 'double-page':
                 return (
                    <div className="flex justify-center items-start pt-8 gap-2">
                        {/* Muestra la página derecha (siguiente) solo si no es la última */}
                        {currentPage < totalPages && (
                           <img src={pages[currentPage]} alt={`Página ${currentPage + 1}`} className="max-w-[48%] h-auto max-h-[85vh] shadow-lg" />
                        )}
                        {/* Muestra la página izquierda (actual) */}
                        <img src={pages[currentPage - 1]} alt={`Página ${currentPage}`} className="max-w-[48%] h-auto max-h-[85vh] shadow-lg" />
                    </div>
                );
            case 'long-strip':
            default:
                return (
                    <div className="flex flex-col items-center">
                        {pages.map((src, index) => (
                            <img key={index} src={src} alt={`Página ${index + 1}`} className="max-w-full h-auto" />
                        ))}
                    </div>
                );
        }
    };

    return (
        <div className="bg-[#101114] min-h-screen text-white">
            {/* --- Cabecera de Navegación y Opciones --- */}
            <header className="bg-[#1a1a24]/80 backdrop-blur-sm sticky top-0 z-50 h-16 flex items-center justify-between px-4 shadow-md">
                <div className="flex items-center gap-4">
                    <a href={`/media/${params.mediaId}`} className="hover:bg-gray-700 p-2 rounded-full">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </a>
                    <div>
                        <h1 className="font-bold">Nombre del Manga</h1>
                        <p className="text-sm text-gray-400">Capítulo {params.chapterId}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="hover:bg-gray-700 p-2 rounded-full"><ChevronLeftIcon /></button>
                    <select className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-sm">
                        <option>Capítulo {params.chapterId}</option>
                        {/* Otros capítulos... */}
                    </select>
                    <button className="hover:bg-gray-700 p-2 rounded-full"><ChevronRightIcon /></button>
                </div>

                <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`p-2 rounded-full transition-colors ${isSettingsOpen ? 'bg-[#ffbade] text-black' : 'hover:bg-gray-700 text-white'}`}>
                    <SettingsIcon />
                </button>
            </header>
            
            {/* --- Panel de Opciones Desplegable --- */}
            {isSettingsOpen && (
                <div className="bg-[#201f31] p-4 flex justify-center items-center gap-8 text-sm border-b border-gray-700">
                    <div className="flex flex-col items-center">
                        <span className="font-semibold mb-2">Modo de Lectura</span>
                        <div className="flex gap-1 bg-gray-700 p-1 rounded-lg">
                            <button onClick={() => setReadingMode('long-strip')} className={`px-3 py-1 rounded-md flex items-center gap-2 ${readingMode === 'long-strip' ? 'bg-[#ffbade] text-black' : ''}`}><RowsIcon /> Tira Larga</button>
                            <button onClick={() => setReadingMode('single-page')} className={`px-3 py-1 rounded-md flex items-center gap-2 ${readingMode === 'single-page' ? 'bg-[#ffbade] text-black' : ''}`}><ColumnsIcon /> Paginado</button>
                             <button onClick={() => setReadingMode('double-page')} className={`px-3 py-1 rounded-md flex items-center gap-2 ${readingMode === 'double-page' ? 'bg-[#ffbade] text-black' : ''}`}><BookOpenIcon /> Doble Página</button>
                        </div>
                    </div>
                </div>
            )}


            {/* --- Contenido Principal del Lector --- */}
            <main className="max-w-4xl mx-auto py-4">
                {renderPages()}

                {/* --- Sección de Apoyo al Scan --- */}
                <div className="text-center border-t-2 border-dashed border-gray-700 mt-12 pt-8 pb-4">
                    <h2 className="text-2xl font-bold text-white mb-2">¡Fin del capítulo!</h2>
                    <p className="text-gray-400 mb-6">Si te gustó, considera apoyar al scanlation group.</p>
                    <div className="flex justify-center items-center gap-6">
                        <a href={MOCK_SCAN_INFO.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                            <TwitterIcon />
                        </a>
                        <a href={MOCK_SCAN_INFO.socials.discord} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Discord">
                            <DiscordIcon />
                        </a>
                        <a href={MOCK_SCAN_INFO.socials.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                            <FacebookIcon />
                        </a>
                    </div>
                </div>
            </main>
            
             {/* --- Navegación Inferior para Modo Paginado --- */}
            {(readingMode === 'single-page' || readingMode === 'double-page') && (
                <footer className="sticky bottom-0 bg-[#1a1a24]/80 backdrop-blur-sm h-16 flex items-center justify-center gap-4">
                    <button onClick={goToPrevPage} disabled={currentPage === 1} className="hover:bg-gray-700 p-2 rounded-full disabled:opacity-50"><ChevronLeftIcon /></button>
                    <span className="text-sm">{currentPage} / {totalPages}</span>
                    <button onClick={goToNextPage} disabled={currentPage >= totalPages - (readingMode === 'double-page' ? 1 : 0)} className="hover:bg-gray-700 p-2 rounded-full disabled:opacity-50"><ChevronRightIcon /></button>
                </footer>
            )}
        </div>
    );
};

export default ReaderPage;


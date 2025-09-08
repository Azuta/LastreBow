"use client";
import { useState, useMemo } from 'react';

// --- Iconos ---
const ExternalLinkIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/><path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/></svg>;
const SortIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 17H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const UnreadIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const CheckIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;


// --- Datos de prueba (sin cambios) ---
const MOCK_CHAPTERS_DATA = Array.from({ length: 500 }, (_, i) => {
    const chapterNum = 500 - i;
    const numUploads = Math.floor(Math.random() * 3) + 1; 
    const scanGroups = ["Scanlation Group", "Fans Trad", "Manga Plus", "Unofficial Scans"];
    return {
        id: chapterNum,
        uploads: Array.from({ length: numUploads }, (__, j) => ({
            id: `scan-${chapterNum}-${j}`,
            group: scanGroups[j % scanGroups.length],
            url: `https://example.com/manga/123/chapter/${chapterNum}/scan/${j+1}`,
            views: `${Math.floor(Math.random() * 50)}k`,
            date: `hace ${i % 20 + 1} días`,
            isRead: chapterNum < 50
        }))
    };
});

// --- Modal para seleccionar Scan (sin cambios) ---
const ScanSelectionModal = ({ chapter, onClose, onMarkAsRead }: { chapter: any; onClose: () => void; onMarkAsRead: (chapterId: number) => void; }) => {
    if (!chapter) return null;
    const handleScanClick = (upload: any) => {
        onMarkAsRead(chapter.id);
        // En una aplicación real, esto navegaría a la página del lector.
        window.location.href = `/reader/123/${chapter.id}`; // Simula la navegación
        onClose(); 
    };
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#2a2c3a] rounded-lg shadow-lg w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white">Capítulo {chapter.id}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
                </div>
                <div className="p-2 flex flex-col gap-1">
                    {chapter.uploads.map((upload: any) => (
                         <a key={upload.id} href={upload.url} onClick={(e) => { e.preventDefault(); handleScanClick(upload); }} target="_blank" rel="noopener noreferrer" className="flex justify-between items-center p-3 rounded-md hover:bg-gray-700/50 cursor-pointer w-full text-left">
                            <div className="flex items-center gap-3">
                                <img src={`https://www.google.com/s2/favicons?domain=example.com&sz=16`} alt="Favicon" className="w-4 h-4 rounded-full"/>
                                <div>
                                    <p className="text-sm font-semibold text-white">{upload.group}</p>
                                    <p className="text-xs text-gray-400">Vistas: {upload.views} &bull; {upload.date}</p>
                                </div>
                            </div>
                            <ExternalLinkIcon />
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};


const ChaptersTab = ({ onLinkClick }: { onLinkClick: (url: string) => void }) => {
    const [chapters, setChapters] = useState(MOCK_CHAPTERS_DATA);
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [showOnlyUnread, setShowOnlyUnread] = useState(false);
    const [selectedChapterForModal, setSelectedChapterForModal] = useState<any | null>(null);

    const handleMarkAsRead = (clickedChapterId: number) => {
        setChapters(prevChapters => 
            prevChapters.map(chapter => 
                chapter.id <= clickedChapterId
                ? { ...chapter, uploads: chapter.uploads.map(up => ({ ...up, isRead: true })) }
                : chapter
            )
        );
    };

    const visibleChapters = useMemo(() => {
        let processedChapters = [...chapters];
        if (showOnlyUnread) {
            processedChapters = processedChapters.filter(ch => ch.uploads.some(up => !up.isRead));
        }
        processedChapters.sort((a, b) => sortOrder === 'asc' ? a.id - b.id : b.id - a.id);
        return processedChapters;
    }, [chapters, sortOrder, showOnlyUnread]);

    return (
        <>
            <div id="chapters-content" className="content-section">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h3 className="text-xl font-bold text-white">Lista de Capítulos</h3>
                    <div className="flex items-center gap-2">
                        {/* Aquí podrías añadir un input para "Saltar al capítulo" */}
                        <button onClick={() => setShowOnlyUnread(!showOnlyUnread)} className={`p-2 rounded-full transition-colors ${showOnlyUnread ? 'bg-[#ffbade] text-black' : 'bg-gray-700/50 hover:bg-gray-600/80 text-gray-300'}`} aria-label="Mostrar no leídos">
                            <UnreadIcon />
                        </button>
                        <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-2 bg-gray-700/50 hover:bg-gray-600/80 text-gray-300 rounded-full transition-colors" aria-label="Invertir orden">
                            <SortIcon />
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                    {visibleChapters.map(chapter => {
                        const isRead = chapter.uploads.every(up => up.isRead);
                        return (
                            <button 
                                key={chapter.id}
                                onClick={() => setSelectedChapterForModal(chapter)}
                                className={`relative aspect-square flex items-center justify-center rounded-md font-bold text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1a1a24] focus:ring-[#ffbade]
                                ${isRead 
                                    ? 'bg-gray-800 text-gray-600 hover:bg-gray-700' 
                                    : 'bg-[#2b2d42] text-white hover:bg-[#3a3d58]'
                                }`}
                            >
                                {isRead && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-green-400"><CheckIcon /></div>}
                                <span className={isRead ? 'opacity-30' : ''}>{chapter.id}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
            
            <ScanSelectionModal 
                chapter={selectedChapterForModal}
                onClose={() => setSelectedChapterForModal(null)}
                onMarkAsRead={handleMarkAsRead}
            />
        </>
    );
};

export default ChaptersTab;
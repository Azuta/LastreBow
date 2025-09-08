"use client";
import { useState, useMemo, useEffect } from 'react';
import { useUserPreferences } from "@/context/UserPreferencesContext";

// --- Iconos ---
const ExternalLinkIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/><path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/></svg>;
const SortIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 17H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const UnreadIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

// --- DATOS DE PRUEBA CORREGIDOS: isRead ya no es aleatorio ---
const MOCK_CHAPTERS_DATA = Array.from({ length: 1052 }, (_, i) => {
    const chapterNum = i + 1;
    return {
        id: chapterNum,
        title: `Capítulo ${chapterNum}: Aventura Épica #${chapterNum}`,
        uploads: [
            { id: `ext-${chapterNum}`, group: "Scanlation Group", url: `https://example.com/ext/${chapterNum}`, views: `${Math.floor(Math.random() * 20)}k`, date: `hace ${chapterNum % 30 + 1} días`, type: 'external', 
              // CORRECCIÓN: Usamos una lógica predecible para que el servidor y el cliente generen lo mismo.
              isRead: chapterNum % 4 === 0 
            }
        ]
    };
});

// --- Componente para renderizar cada fila de subida ---
const UploadRow = ({ chapterId, upload, onMarkAsRead, onLinkClick }: { chapterId: number, upload: any, onMarkAsRead: (chapterId: number) => void, onLinkClick: (url: string) => void }) => {
    const isInternal = upload.type === 'internal';

    const handleClick = () => {
        onMarkAsRead(chapterId);

        if (isInternal) {
            window.location.href = upload.url; 
        } else {
            onLinkClick(upload.url);
        }
    };

    return (
        <div 
            key={upload.id} 
            className={`relative group flex justify-between items-center p-2 rounded-md hover:bg-gray-700/50 cursor-pointer border-l-4 transition-colors ${upload.isRead ? 'border-green-500' : 'border-red-500'}`}
            onClick={handleClick}
        >
            <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                    {!isInternal && (
                        <div className="w-full h-full rounded-full bg-gray-600 flex items-center justify-center">
                             <ExternalLinkIcon />
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-sm text-white group-hover:underline">{upload.group}</p>
                    <p className="text-xs text-gray-500">Vistas: {upload.views}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">{upload.date}</span>
            </div>
        </div>
    );
};

const ChaptersTab = ({ onLinkClick }: { onLinkClick: (url: string) => void }) => {
    const { hideExternalLinks, setHideExternalLinks } = useUserPreferences();
    const [chapters, setChapters] = useState(MOCK_CHAPTERS_DATA);
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [showOnlyUnread, setShowOnlyUnread] = useState(false);
    const [activeRange, setActiveRange] = useState('');

    const handleMarkAsRead = (chapterId: number) => {
        setChapters(prev => prev.map(ch => ch.id === chapterId ? { ...ch, uploads: ch.uploads.map(up => ({...up, isRead: true})) } : ch));
    };

    const chapterRanges = useMemo(() => {
        const ranges = [];
        for (let i = 0; i < chapters.length; i += 100) {
            const start = i + 1;
            const end = Math.min(i + 100, chapters.length);
            ranges.push(`${start}-${end}`);
        }
        return ranges.reverse();
    }, [chapters.length]);
    
    useEffect(() => {
        if(chapterRanges.length > 0 && !activeRange) {
            setActiveRange(chapterRanges[0]);
        }
    }, [chapterRanges, activeRange]);


    const visibleChapters = useMemo(() => {
        let processedChapters = [...chapters];
        if (showOnlyUnread) {
            processedChapters = processedChapters.filter(ch => ch.uploads.some(up => !up.isRead));
        }
        if (activeRange) {
            const [start, end] = activeRange.split('-').map(Number);
            processedChapters = processedChapters.filter(ch => ch.id >= start && ch.id <= end);
        }
        processedChapters.sort((a, b) => sortOrder === 'asc' ? a.id - b.id : b.id - a.id);
        return processedChapters;
    }, [chapters, activeRange, sortOrder, showOnlyUnread]);

    return (
        <div id="chapters-content" className="content-section">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <h3 className="text-xl font-bold text-white">Lista de Capítulos</h3>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowOnlyUnread(!showOnlyUnread)} className={`p-2 rounded-full transition-colors ${showOnlyUnread ? 'bg-[#ffbade] text-black' : 'bg-gray-700/50 hover:bg-gray-600/80 text-gray-300'}`} aria-label="Mostrar no leídos">
                        <UnreadIcon />
                    </button>
                    <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-2 bg-gray-700/50 hover:bg-gray-600/80 text-gray-300 rounded-full transition-colors" aria-label="Invertir orden">
                        <SortIcon />
                    </button>
                </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
                {chapterRanges.map(range => (
                    <button 
                        key={range}
                        onClick={() => setActiveRange(range)}
                        className={`range-button px-3 py-1 rounded-full text-sm font-semibold transition-colors ${activeRange === range ? 'bg-[#ffbade] text-black' : 'bg-gray-800/60 hover:bg-gray-700/80 text-gray-300'}`}
                    >
                        {range}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-2 chapter-accordion">
                {visibleChapters.map(chapter => (
                    <div key={chapter.id}>
                        {chapter.uploads.map(upload => (
                             <UploadRow 
                                key={upload.id}
                                chapterId={chapter.id}
                                upload={upload}
                                onLinkClick={onLinkClick}
                                onMarkAsRead={handleMarkAsRead}
                             />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChaptersTab;


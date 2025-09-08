"use client";
import { useState, useMemo } from 'react';
import { Chapter } from '@/types/AniListResponse'; // Importar el tipo Chapter

// --- Iconos ---
const ExternalLinkIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5-.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/><path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/></svg>;
const SortIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 17H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const NoteIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z"></path><polyline points="14 3 14 9 20 9"></polyline></svg>;

// --- Datos de prueba ---
const MOCK_CHAPTERS_DATA: Chapter[] = Array.from({ length: 5 }, (_, i) => ({
    id: `${377 - i}`,
    title: i % 2 === 0 ? `El Rugido del Dragón #${377 - i}` : '',
    uploadedAt: `hace ${i + 1} días`,
    scanGroup: "No Sleep Scans",
    // @ts-ignore
    notes: i === 0 ? "¡Disfruten del nuevo capítulo! Tuvimos que rehacer varias páginas para asegurar la máxima calidad." : undefined,
}));

// --- Componente para una fila de capítulo ---
const ChapterRow = ({ chapter, onEditChapter }: { chapter: Chapter; onEditChapter?: (chapter: Chapter) => void; }) => {
    return (
        <div className="flex items-center justify-between p-3 bg-[#201f31] rounded-lg">
            <a href={`/reader/123/${chapter.id}`} className="flex flex-col group">
                <span className="font-semibold text-white group-hover:text-[#ffbade]">Capítulo {chapter.id} {chapter.title && `- ${chapter.title}`}</span>
                <span className="text-xs text-gray-400">{chapter.scanGroup} &bull; {chapter.uploadedAt}</span>
            </a>
            <div className="flex items-center gap-4">
                {/* @ts-ignore */}
                {chapter.notes && (
                    <div className="relative group">
                        <NoteIcon />
                        <div className="absolute bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 right-0">
                            <strong className="block mb-1">Nota del Scanlation:</strong>
                            {/* @ts-ignore */}
                            {chapter.notes}
                        </div>
                    </div>
                )}
                {onEditChapter && (
                    <button onClick={() => onEditChapter(chapter)} className="text-gray-400 hover:text-white" title="Editar Capítulo">
                        <EditIcon />
                    </button>
                )}
                <a href={`/reader/123/${chapter.id}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><ExternalLinkIcon /></a>
            </div>
        </div>
    );
};

// --- Componente principal de la pestaña ---
const ChaptersTab = ({ onEditChapter }: { onLinkClick: (url: string) => void; onEditChapter?: (chapter: Chapter) => void; }) => {
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    
    const sortedChapters = useMemo(() => {
        return [...MOCK_CHAPTERS_DATA].sort((a, b) => {
            const numA = parseFloat(a.id);
            const numB = parseFloat(b.id);
            return sortOrder === 'asc' ? numA - numB : numB - numA;
        });
    }, [sortOrder]);

    return (
        <div className="content-section">
            <div className="flex justify-end mb-4">
                <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-2 bg-gray-700/50 hover:bg-gray-600/80 text-gray-300 rounded-full" aria-label="Invertir orden">
                    <SortIcon />
                </button>
            </div>
            <div className="space-y-2">
                {sortedChapters.map(chapter => (
                    <ChapterRow key={chapter.id} chapter={chapter} onEditChapter={onEditChapter} />
                ))}
            </div>
        </div>
    );
};

export default ChaptersTab;
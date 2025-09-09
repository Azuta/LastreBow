"use client";
import { useState, useMemo, useEffect, useRef } from 'react';
import { Chapter, ChapterUpload } from '@/types/AniListResponse';
import { mockChaptersList } from '@/mock/mediaData'; 
import { useUserPreferences } from '@/context/UserPreferencesContext';
import ExternalLinkModal from './ExternalLinkModal';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link'; // <-- CORRECCIÓN AQUÍ

// --- Iconos ---
const ExternalLinkIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w.org/2000/svg"><path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5-.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/><path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/></svg>;
const SortIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 17H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const NoteIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z"></path><polyline points="14 3 14 9 20 9"></polyline></svg>;
const ChevronDownIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;

const ChaptersTab = ({ onEditChapter }: { onEditChapter?: (chapter: ChapterUpload, chapterNumber: string, title?: string) => void; }) => {
    const searchParams = useSearchParams();
    const chapterRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const { warnOnExternalLinks, setWarnOnExternalLinks, setHideExternalLinks } = useUserPreferences();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [externalLink, setExternalLink] = useState('');
    
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
    const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
    
    const BATCH_SIZE = 10;

    useEffect(() => {
        const newChapter = searchParams.get('newChapter');
        if (newChapter) {
            const batchStart = Math.floor((parseFloat(newChapter) - 1) / BATCH_SIZE) * BATCH_SIZE + 1;
            const batchEnd = batchStart + BATCH_SIZE - 1;
            setExpandedBatch(`${batchStart}-${batchEnd}`);
            setExpandedChapter(newChapter);

            setTimeout(() => {
                chapterRefs.current[newChapter]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100); 
        }
    }, [searchParams]);
    
    const sortedChapters = useMemo(() => {
        return [...mockChaptersList].sort((a, b) => {
            const numA = parseFloat(a.chapterNumber);
            const numB = parseFloat(b.chapterNumber);
            return sortOrder === 'asc' ? numA - numB : numB - numA;
        });
    }, [sortOrder]);

    const chapterBatches = useMemo(() => {
        const batches: { [key: string]: Chapter[] } = {};
        sortedChapters.forEach(ch => {
            const num = parseFloat(ch.chapterNumber);
            const batchStart = Math.floor((num - 1) / BATCH_SIZE) * BATCH_SIZE + 1;
            const batchEnd = batchStart + BATCH_SIZE - 1;
            const key = `${batchStart}-${batchEnd}`;
            if (!batches[key]) batches[key] = [];
            batches[key].push(ch);
        });
        return batches;
    }, [sortedChapters]);
    
    const handleLinkClick = (url: string) => {
        if (warnOnExternalLinks) {
            setExternalLink(url);
            setIsModalOpen(true);
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };
    
    const handleConfirmRedirect = (dontShowAgain: boolean) => {
        if (dontShowAgain) setWarnOnExternalLinks(false);
        window.open(externalLink, '_blank', 'noopener,noreferrer');
        setIsModalOpen(false);
    };

    const handleHideAll = () => {
        setHideExternalLinks(true);
        setIsModalOpen(false);
    };

    return (
        <div className="content-section">
            <div className="flex justify-end mb-4">
                <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-2 bg-gray-700/50 hover:bg-gray-600/80 text-gray-300 rounded-full" aria-label="Invertir orden">
                    <SortIcon />
                </button>
            </div>
            <div className="space-y-2">
                {Object.entries(chapterBatches).map(([batchKey, chapters]) => (
                    <div key={batchKey} className="bg-[#201f31] rounded-lg">
                        <button onClick={() => setExpandedBatch(expandedBatch === batchKey ? null : batchKey)} className="w-full flex justify-between items-center p-3 font-semibold text-white">
                            <span>Capítulos {batchKey}</span>
                            <ChevronDownIcon />
                        </button>
                        {expandedBatch === batchKey && (
                            <div className="px-3 pb-3 space-y-2">
                                {chapters.map(chapter => (
                                    <div 
                                        key={chapter.chapterNumber}
                                        ref={el => chapterRefs.current[chapter.chapterNumber] = el}
                                        className={`rounded-lg ${searchParams.get('newChapter') === chapter.chapterNumber ? 'bg-green-900/50' : ''}`}
                                    >
                                        <button onClick={() => setExpandedChapter(expandedChapter === chapter.chapterNumber ? null : chapter.chapterNumber)} className="w-full flex justify-between items-center p-2 bg-[#2b2d42]/50 hover:bg-[#2b2d42] rounded-md">
                                            <span>Capítulo {chapter.chapterNumber}{chapter.title ? ` - ${chapter.title}` : ''}</span>
                                            <span className="text-xs text-gray-400">{chapter.uploads.length} Versión(es)</span>
                                        </button>
                                        {expandedChapter === chapter.chapterNumber && (
                                            <div className="pl-6 pr-2 py-2 space-y-2">
                                                {chapter.uploads.map(upload => (
                                                    <div key={upload.id} className="flex items-center justify-between p-2 bg-[#201f31] rounded-lg">
                                                        <div>
                                                            <p className="font-semibold text-sm text-white">{upload.scanGroup}</p>
                                                            <p className="text-xs text-gray-400">{upload.uploadedAt}</p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            {upload.notes && <div className="relative group"><NoteIcon /><div className="absolute bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 right-0">{upload.notes}</div></div>}
                                                            {onEditChapter && <button onClick={() => onEditChapter(upload, chapter.chapterNumber, chapter.title)} className="text-gray-400 hover:text-white"><EditIcon /></button>}
                                                            {upload.externalUrl ? 
                                                                <button onClick={() => handleLinkClick(upload.externalUrl!)} className="text-gray-400 hover:text-white"><ExternalLinkIcon /></button>
                                                                : <Link href={`/reader/123/${upload.id}`} className="text-gray-400 hover:text-white"><ExternalLinkIcon /></Link>
                                                            }
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <ExternalLinkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmRedirect} onHideAll={handleHideAll} />
        </div>
    );
};

export default ChaptersTab;
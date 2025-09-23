"use client";
import { useState, useMemo, useEffect } from 'react';
import { Chapter } from '@/types/AniListResponse';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabaseClient';

// --- Iconos ---
const SortIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7H21" /><path d="M6 12H18" /><path d="M10 17H14" /></svg>;
const CheckCircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const CircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle></svg>;
const InfoIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const CheckSquareIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;
const XSquareIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>;
const AlertTriangleIcon = () => <svg className="h-6 w-6 text-red-400" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>;

const supabase = createClient();

const ConfirmationModal = ({ isOpen, onClose, onConfirm, chapterNumber, lastReadChapter }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, chapterNumber: string, lastReadChapter: string }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-[#201f31] rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <div className="flex items-start gap-4">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                       <AlertTriangleIcon />
                    </div>
                    <div className="mt-0 text-left">
                        <h3 className="text-lg leading-6 font-bold text-white">Confirmación Requerida</h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-300">
                                Tu capítulo leído más reciente es el <span className="font-bold text-white">{lastReadChapter}</span>.
                            </p>
                            <p className="text-sm text-gray-300 mt-2">
                                Estás a punto de desmarcar desde el capítulo <span className="font-bold text-white">{chapterNumber}</span> en adelante. Esto cambiará tu progreso de lectura.
                            </p>
                            <p className="font-bold text-white mt-4">¿Estás seguro de que quieres continuar?</p>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700/50 rounded-md hover:bg-gray-600/50">
                        Cancelar
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">
                        Sí, desmarcar
                    </button>
                </div>
            </div>
        </div>
    );
};


const ChaptersTab = ({ chapters, mediaId }: { chapters: any[], mediaId: number }) => {
    const { user, isLoggedIn, addToast } = useAuth();
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [readChapters, setReadChapters] = useState<Set<string>>(new Set());
    const [isLoadingProgress, setIsLoadingProgress] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chapterToConfirm, setChapterToConfirm] = useState<string | null>(null);

    useEffect(() => {
        const fetchProgress = async () => {
            if (!user) { setIsLoadingProgress(false); return; }
            setIsLoadingProgress(true);
            const { data } = await supabase.from('user_reading_progress').select('read_chapters').eq('user_id', user.id).eq('media_id', mediaId).single();
            if (data?.read_chapters) { setReadChapters(new Set(data.read_chapters)); }
            setIsLoadingProgress(false);
        };
        fetchProgress();
    }, [user, mediaId]);

    const numericallySortedChapters = useMemo(() => {
        return [...chapters].sort((a, b) => parseFloat(a.chapter_number) - parseFloat(b.chapter_number));
    }, [chapters]);

    const displaySortedChapters = useMemo(() => {
        return sortOrder === 'asc' ? numericallySortedChapters : [...numericallySortedChapters].reverse();
    }, [sortOrder, numericallySortedChapters]);
    
    const lastReadChapter = useMemo(() => {
        const readNumbers = Array.from(readChapters).map(parseFloat);
        if (readNumbers.length === 0) return null;
        return Math.max(...readNumbers).toString();
    }, [readChapters]);

    const updateProgress = async (newReadChapters: Set<string>, successMessage: string) => {
        if (!isLoggedIn || !user) { addToast('Necesitas iniciar sesión para marcar capítulos.', 'error'); return; }
        setIsSaving(true);
        const originalReadChapters = new Set(readChapters);
        setReadChapters(newReadChapters);
        const { error } = await supabase.from('user_reading_progress').upsert({ user_id: user.id, media_id: mediaId, read_chapters: Array.from(newReadChapters) }, { onConflict: 'user_id, media_id' });
        if (error) {
            console.error("Error saving progress:", error);
            addToast('No se pudo guardar tu progreso.', 'error');
            setReadChapters(originalReadChapters);
        } else {
            addToast(successMessage, 'success');
        }
        setIsSaving(false);
    };
    
    const handleToggleRead = (clickedChapterNumber: string) => {
        const isMarkingAsRead = !readChapters.has(clickedChapterNumber);
        const clickedChapterNum = parseFloat(clickedChapterNumber);

        if (isMarkingAsRead) {
            const newReadSet = new Set(readChapters);
            const clickedChapterIndex = numericallySortedChapters.findIndex(c => c.chapter_number === clickedChapterNumber);
            for (let i = 0; i <= clickedChapterIndex; i++) {
                newReadSet.add(numericallySortedChapters[i].chapter_number);
            }
            const chaptersAdded = newReadSet.size - readChapters.size;
            updateProgress(newReadSet, `¡Marcados ${chaptersAdded} capítulo(s) hasta el ${clickedChapterNumber}!`);
        } else {
            const lastReadNum = lastReadChapter ? parseFloat(lastReadChapter) : -1;
            if (clickedChapterNum < lastReadNum) {
                setChapterToConfirm(clickedChapterNumber);
                setIsModalOpen(true);
            } else {
                performUnmark(clickedChapterNumber);
            }
        }
    };
    
    const performUnmark = (chapterNumber: string) => {
        const newReadSet = new Set<string>();
        const chapterNumToUnmark = parseFloat(chapterNumber);
        
        numericallySortedChapters.forEach(c => {
            if (parseFloat(c.chapter_number) < chapterNumToUnmark) {
                newReadSet.add(c.chapter_number);
            }
        });
        const chaptersRemoved = readChapters.size - newReadSet.size;
        updateProgress(newReadSet, `¡Desmarcados ${chaptersRemoved} capítulo(s) desde el ${chapterNumber}!`);
    };

    const handleConfirmUnmark = () => {
        if (chapterToConfirm) {
            performUnmark(chapterToConfirm);
        }
        setIsModalOpen(false);
        setChapterToConfirm(null);
    };

    const handleMarkAll = () => updateProgress(new Set(chapters.map(c => c.chapter_number)), '¡Todos los capítulos han sido marcados!');
    const handleUnmarkAll = () => updateProgress(new Set(), 'Se han desmarcado todos los capítulos.');

    return (
        <>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmUnmark}
                chapterNumber={chapterToConfirm || ''}
                lastReadChapter={lastReadChapter || ''}
            />
            <div className="content-section">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h3 className="text-xl font-bold text-white">Lista de Capítulos</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={handleMarkAll} disabled={isSaving || chapters.length === 0} className="flex items-center gap-2 px-3 py-2 bg-green-600/20 text-green-300 rounded-lg text-sm font-semibold hover:bg-green-600/40 transition-colors disabled:opacity-50"><CheckSquareIcon /> Marcar Todos</button>
                        <button onClick={handleUnmarkAll} disabled={isSaving || chapters.length === 0} className="flex items-center gap-2 px-3 py-2 bg-red-600/20 text-red-300 rounded-lg text-sm font-semibold hover:bg-red-600/40 transition-colors disabled:opacity-50"><XSquareIcon /> Desmarcar Todos</button>
                        <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-2 bg-gray-700/50 hover:bg-gray-600/80 text-gray-300 rounded-full" aria-label="Invertir orden"><SortIcon /></button>
                    </div>
                </div>
                <div className="space-y-2">
                    {isLoadingProgress ? (
                        <p className="text-gray-400 text-center py-10">Cargando progreso...</p>
                    ) : displaySortedChapters.length > 0 ? (
                        displaySortedChapters.map(chapter => {
                            const isRead = readChapters.has(chapter.chapter_number);
                            return (
                                <div key={chapter.id} className={`bg-[#201f31] p-3 rounded-lg flex justify-between items-center transition-opacity ${isRead ? 'opacity-50' : ''}`}>
                                    <div>
                                        <p className="font-semibold text-white">Capítulo {chapter.chapter_number} {chapter.title ? `- ${chapter.title}` : ''}</p>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-1">
                                            <p className="text-xs text-gray-400">Publicado por <a href={`/group/${chapter.profile?.scan_group_id}`} className="font-medium text-gray-300 hover:text-[#ffbade]">{chapter.profile?.username || 'desconocido'}</a></p>
                                            {chapter.notes && (<div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1 sm:mt-0"><InfoIcon /><p>{chapter.notes}</p></div>)}
                                        </div>
                                    </div>
                                    <button onClick={() => handleToggleRead(chapter.chapter_number)} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isRead ? <CheckCircleIcon /> : <CircleIcon />}
                                        {isRead ? 'Leído' : 'Marcar Leído'}
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-10 bg-[#201f31] rounded-lg">
                            <p className="text-gray-400">No existen capítulos actualmente.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ChaptersTab;
"use client";
import { useState, useMemo, useEffect, useRef } from 'react';
import { Chapter } from '@/types/AniListResponse'; // Importa tu tipo Chapter si lo tienes definido
import { useUserPreferences } from '@/context/UserPreferencesContext';
import ExternalLinkModal from './ExternalLinkModal';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// --- Iconos (Sin cambios) ---
const SortIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7H21" /><path d="M6 12H18" /><path d="M10 17H14" /></svg>;
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const BookOpenIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;

// NOTA: El tipo 'any' se usa porque la data de Supabase es ligeramente diferente al mock.
// Idealmente, crearías un tipo específico para `chapters` de Supabase.
const ChaptersTab = ({ chapters, mediaId }: { chapters: any[], mediaId: number }) => {
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    
    const sortedChapters = useMemo(() => {
        return [...chapters].sort((a, b) => {
            const numA = parseFloat(a.chapter_number);
            const numB = parseFloat(b.chapter_number);
            return sortOrder === 'asc' ? numA - numB : numB - numA;
        });
    }, [sortOrder, chapters]);

    return (
        <div className="content-section">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Lista de Capítulos</h3>
                <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-2 bg-gray-700/50 hover:bg-gray-600/80 text-gray-300 rounded-full" aria-label="Invertir orden">
                    <SortIcon />
                </button>
            </div>
            <div className="space-y-2">
                {sortedChapters.map(chapter => (
                    <div key={chapter.id} className="bg-[#201f31] p-3 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-white">Capítulo {chapter.chapter_number} {chapter.title ? `- ${chapter.title}` : ''}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                Subido por <span className="font-medium text-gray-300">{chapter.profile?.username || 'desconocido'}</span>
                            </p>
                        </div>
                        <Link href={`/reader/${mediaId}/${chapter.id}`} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
                            <BookOpenIcon />
                            Leer
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChaptersTab;
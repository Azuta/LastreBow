// src/app/media/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchMediaById } from "@/services/fetchAniList";
import { Media, Chapter } from "@/types/AniListResponse";
import Navbar from "@/components/layout/Navbar";
import OverviewTab from "@/components/media/OverviewTab";
import ChaptersTab from "@/components/media/ChaptersTab";
import { useAuth } from "@/context/AuthContext";

// --- Icono ---
const UploadCloudIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;

// --- Pestaña para Subir/Editar Capítulos ---
const ChapterManagementTab = ({ media, existingChapter, onSave }: { media: Media; existingChapter: Chapter | null; onSave: (data: any, isEditing: boolean) => void; }) => {
    const isEditing = existingChapter !== null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            id: formData.get('chapter-number'),
            title: formData.get('chapter-title'),
            notes: formData.get('chapter-notes'),
        };
        onSave(data, isEditing);
    };

    return (
        <div className="max-w-screen-md mx-auto bg-[#201f31] p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-white mb-6">
                {isEditing ? `Editando Capítulo ${existingChapter.id}` : `Subir capítulo para: ${media.title.romaji}`}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="chapter-number" className="block text-sm font-medium text-gray-300 mb-2">Número</label>
                        <input key={existingChapter?.id} type="text" name="chapter-number" defaultValue={existingChapter?.id || ''} placeholder="Ej: 125 o 125.5" required className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2" readOnly={isEditing} />
                    </div>
                    <div>
                        <label htmlFor="chapter-title" className="block text-sm font-medium text-gray-300 mb-2">Título (Opcional)</label>
                        <input key={existingChapter?.id} type="text" name="chapter-title" defaultValue={existingChapter?.title || ''} placeholder="Ej: El Despertar" className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2" />
                    </div>
                </div>
                <div>
                    <label htmlFor="chapter-notes" className="block text-sm font-medium text-gray-300 mb-2">Notas del Autor (Opcional)</label>
                    <textarea key={existingChapter?.id} name="chapter-notes" defaultValue={existingChapter?.notes || ''} rows={3} placeholder="Notas sobre el lanzamiento, agradecimientos, etc." className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2"></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Archivos del Capítulo</label>
                    <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-gray-600 px-6 py-10">
                        <div className="text-center">
                            <UploadCloudIcon />
                            <p className="mt-4 text-sm text-gray-400">{isEditing ? 'Sube nuevos archivos para reemplazar los actuales.' : 'Sube los archivos del nuevo capítulo.'}</p>
                            <input name="file-upload" type="file" className="text-xs text-gray-500 mt-2" multiple required={!isEditing} />
                        </div>
                    </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">{isEditing ? 'Guardar Cambios' : 'Subir Capítulo'}</button>
            </form>
        </div>
    );
};

const MediaDetailPage = ({ params }: { params: { id: string } }) => {
    const [media, setMedia] = useState<Media | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'chapters' | 'overview' | 'manage_chapter'>('chapters');
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const { user, isLoggedIn, addNotification } = useAuth(); // <-- Añadir "addNotification"

    useEffect(() => { const loadMedia = async () => { setIsLoading(true); const mediaData = await fetchMediaById(Number(params.id)); setMedia(mediaData); setIsLoading(false); }; loadMedia(); }, [params.id]);

    // --- Lógica de Permisos Mejorada ---
    // El usuario puede gestionar capítulos si ha iniciado sesión Y si el ID del grupo del manga coincide con el ID de su grupo.
    // @ts-ignore
    const canManageChapters = isLoggedIn && media?.scanGroupId && user?.scanGroupId === media.scanGroupId;

    const handleEditChapter = (chapter: Chapter) => { setSelectedChapter(chapter); setActiveTab('manage_chapter'); };
    const handleShowUpload = () => { setSelectedChapter(null); setActiveTab('manage_chapter'); };
    const handleSaveChapter = (data: any, isEditing: boolean) => {
        const message = isEditing 
            ? `Se actualizó el capítulo ${data.id} de "${media.title.romaji}"`
            : `¡Nuevo capítulo! ${data.id} de "${media.title.romaji}" ya está disponible`;

        // Simular la creación de la notificación
        addNotification({
            message: message,
            link: `/media/${media.id}`,
        });

        alert(isEditing ? 'Cambios guardados' : 'Capítulo subido');
        setActiveTab('chapters');
    };

    if (isLoading || !media) return <div className="bg-[#1a1a24] min-h-screen text-white text-center p-8">Cargando...</div>;

    return (
        <>
            <Navbar />
            <main>
                <div className="relative h-64 md:h-80 w-full"><Image src={media.bannerImage || ''} alt={`${media.title.romaji} Banner`} fill style={{ objectFit: 'cover' }} /><div className="absolute inset-0 bg-gradient-to-t from-[#1a1a24] via-[#1a1a24]/50 to-transparent"></div></div>
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 md:-mt-40">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-shrink-0 w-48 md:w-64"><Image src={media.coverImage.extraLarge} alt={media.title.romaji} width={400} height={600} className="w-full h-auto rounded-lg shadow-2xl" /></div>
                        <div className="flex-grow pt-32 md:pt-48 text-white"><h1 className="text-3xl md:text-5xl font-bold">{media.title.english || media.title.romaji}</h1><p dangerouslySetInnerHTML={{ __html: media.description }} className="mt-6 text-gray-300 text-sm leading-relaxed max-w-3xl" /></div>
                    </div>
                </div>
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-12">
                    <div className="w-full">
                        <div className="flex border-b border-gray-700 mb-6">
                            <button onClick={() => setActiveTab('chapters')} className={`px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'chapters' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Capítulos</button>
                            <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'overview' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Overview</button>
                            {canManageChapters && (
                                <button onClick={handleShowUpload} className={`px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'manage_chapter' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>
                                    {selectedChapter ? 'Editar Capítulo' : 'Subir Capítulo'}
                                </button>
                            )}
                        </div>
                        {activeTab === 'overview' && <OverviewTab media={media} />}
                        {activeTab === 'chapters' && <ChaptersTab onLinkClick={() => {}} onEditChapter={canManageChapters ? handleEditChapter : undefined} />}
                        {activeTab === 'manage_chapter' && canManageChapters && <ChapterManagementTab media={media} existingChapter={selectedChapter} onSave={handleSaveChapter} />}
                    </div>
                </div>
            </main>
        </>
    );
};

export default MediaDetailPage;
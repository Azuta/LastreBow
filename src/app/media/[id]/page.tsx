// src/app/media/[id]/page.tsx
"use client";

import { useEffect, useState, useRef, use } from "react";
import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { fetchMediaById } from "@/services/fetchAniList";
import { Media, Chapter, ChapterUpload } from "@/types/AniListResponse";
import Navbar from "@/components/layout/Navbar";
import OverviewTab from "@/components/media/OverviewTab";
import ChaptersTab from "@/components/media/ChaptersTab";
import CommentsSection from "@/components/media/CommentsSection"; // <-- AÑADIDO
import { useAuth } from "@/context/AuthContext";
import ConfirmationModal from "@/components/media/ConfirmationModal";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


// --- Iconos (sin cambios) ---
const UploadCloudIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
const GripVerticalIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>;

// --- Componente SortablePagePreview (sin cambios) ---
const SortablePagePreview = ({ id, src, index, isDragging }: { id: string; src: string; index: number, isDragging: boolean }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 };
    return (
        <div ref={setNodeRef} style={style} {...attributes} className="relative aspect-[2/3] bg-gray-800 rounded-md p-1">
            <img src={src} alt={`Página ${index + 1}`} className="w-full h-full object-cover rounded-sm"/>
            <span className="absolute top-1 right-1 text-xs bg-black/50 text-white rounded-full px-1.5 py-0.5">{index + 1}</span>
            <div {...listeners} className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"><GripVerticalIcon/></div>
        </div>
    );
};

// --- Componente PagePreviewOverlay (sin cambios) ---
const PagePreviewOverlay = ({ src, index }: { src: string, index: number }) => (
    <div className="relative aspect-[2/3] bg-gray-800 rounded-md p-1 shadow-2xl scale-105">
        <img src={src} alt={`Página ${index + 1}`} className="w-full h-full object-cover rounded-sm"/>
        <span className="absolute top-1 right-1 text-xs bg-black/50 text-white rounded-full px-1.5 py-0.5">{index + 1}</span>
    </div>
);

// --- Pestaña para Subir/Editar Capítulos ---
const ChapterManagementTab = ({ media, existingChapter, onSave, chapterTitle }: { media: Media; existingChapter: ChapterUpload | null; onSave: (data: any, isEditing: boolean) => void; chapterTitle?: string; }) => {
    const isEditing = existingChapter !== null;
    const { user } = useAuth();
    const [pages, setPages] = useState<File[]>([]);
    const [pagePreviews, setPagePreviews] = useState<{ id: string; url: string }[]>([]);
    const [isScheduling, setIsScheduling] = useState(false);
    const [publishDate, setPublishDate] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formDataForModal, setFormDataForModal] = useState<any>(null);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [chapterNumberError, setChapterNumberError] = useState<string>('');
    const chapterNumberInputRef = useRef<HTMLInputElement>(null);
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    useEffect(() => {
        const previews = pages.map((file, index) => ({ id: `${file.name}-${index}`, url: URL.createObjectURL(file) }));
        setPagePreviews(previews);
        return () => previews.forEach(p => URL.revokeObjectURL(p.url));
    }, [pages]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) setPages(Array.from(e.target.files)); };
    const handleDragStart = (event: DragStartEvent) => setActiveDragId(event.active.id as string);
    const handleDragEnd = (event: DragEndEvent) => {
        setActiveDragId(null);
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = pagePreviews.findIndex(item => item.id === active.id);
            const newIndex = pagePreviews.findIndex(item => item.id === over.id);
            setPagePreviews((items) => arrayMove(items, oldIndex, newIndex));
            setPages((currentPages) => arrayMove(currentPages, oldIndex, newIndex));
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formElements = new FormData(e.currentTarget);
        const chapterNumber = formElements.get('chapter-number') as string;

        if (!chapterNumber || chapterNumber.trim() === '') {
            setChapterNumberError('El número del capítulo es obligatorio.');
            chapterNumberInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        setChapterNumberError('');

        setFormDataForModal({
            manga: media.title.romaji,
            chapter: chapterNumber,
            title: formElements.get('chapter-title'),
            notes: formElements.get('chapter-notes'),
            publishDate: isScheduling && publishDate ? new Date(publishDate).toLocaleString() : 'Inmediatamente',
            totalPages: pages.length || "No se cambiarán",
            scan: existingChapter?.scanGroup || user?.scanGroupId || "Tu Scanlation",
            user: user?.username || 'Desconocido',
        });
        setIsModalOpen(true);
    };

    const handleConfirmUpload = async () => {
        if (!chapterNumberInputRef.current?.form) return;
        const form = chapterNumberInputRef.current.form;
        const apiFormData = new FormData(form);

        pages.forEach(file => apiFormData.append('file-upload', file));
        apiFormData.append('scan-group', existingChapter?.scanGroup || user?.scanGroupId || "Desconocido");
        apiFormData.append('is-editing', String(isEditing));
        if (isEditing && existingChapter) apiFormData.append('upload-id', existingChapter.id);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: apiFormData,
            });
            const responseText = await response.text();
            if (!response.ok) {
                try {
                    const errorResult = JSON.parse(responseText);
                    throw new Error(errorResult.message || `Server responded with status: ${response.status}`);
                } catch (e) {
                    console.error("Server returned non-JSON error response:", responseText);
                    throw new Error(`Server error: ${response.status} ${response.statusText}`);
                }
            }
            const result = JSON.parse(responseText);
            onSave(result.chapter, isEditing);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            console.error("Error al subir:", errorMessage);
            alert(`Error al subir: ${errorMessage}`);
        } finally {
            setIsModalOpen(false);
        }
    };

    const activePage = activeDragId ? pagePreviews.find(p => p.id === activeDragId) : null;
    const activeIndex = activePage ? pagePreviews.indexOf(activePage) : -1;

    return (
        <>
            <div className="max-w-screen-md mx-auto bg-[#201f31] p-8 rounded-lg">
                <h3 className="text-2xl font-bold text-white mb-6">{isEditing ? `Editando la subida para el Capítulo ${existingChapter?.id}` : `Subir capítulo para: ${media.title.romaji}`}</h3>
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div>
                        <label htmlFor="chapter-number" className="block text-sm font-medium text-gray-300 mb-2">Número de Capítulo</label>
                        <input ref={chapterNumberInputRef} key={existingChapter?.id} type="text" name="chapter-number" defaultValue={existingChapter?.id || ''} placeholder="Ej: 125 o 125.5" className={`w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 border-2 ${chapterNumberError ? 'border-red-500' : 'border-transparent'} focus:ring-2 focus:ring-[#ffbade] focus:border-transparent read-only:bg-gray-800`} readOnly={isEditing} onChange={() => setChapterNumberError('')}/>
                        {chapterNumberError && <p className="text-red-500 text-xs mt-1">{chapterNumberError}</p>}
                    </div>
                    <div>
                        <label htmlFor="chapter-title" className="block text-sm font-medium text-gray-300 mb-2">Título del Capítulo (Opcional)</label>
                        <input key={existingChapter?.id} type="text" name="chapter-title" defaultValue={chapterTitle || ''} placeholder="Ej: El Despertar" className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2" />
                    </div>
                    <div>
                        <label htmlFor="chapter-notes" className="block text-sm font-medium text-gray-300 mb-2">Notas del Scan (Opcional)</label>
                        <textarea key={existingChapter?.id} name="chapter-notes" defaultValue={existingChapter?.notes || ''} rows={3} placeholder="Notas sobre el lanzamiento..." className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Páginas del Capítulo {isEditing && "(dejar vacío para no cambiar)"}</label>
                        <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-gray-600 px-6 py-10">
                            <div className="text-center">
                                <UploadCloudIcon />
                                <p className="mt-4 text-sm text-gray-400">Arrastra o selecciona las páginas</p>
                                <input name="file-upload" type="file" onChange={handleFileChange} className="text-xs text-gray-500 mt-2" multiple accept="image/*"/>
                            </div>
                        </div>
                        {pagePreviews.length > 0 && (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                                <SortableContext items={pagePreviews} strategy={rectSortingStrategy}>
                                    <p className="text-xs text-gray-400 mt-4 mb-2">Puedes arrastrar y soltar las imágenes para reordenarlas.</p>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                        {pagePreviews.map((page, index) => (<SortablePagePreview key={page.id} id={page.id} src={page.url} index={index} isDragging={activeDragId === page.id}/>))}
                                    </div>
                                </SortableContext>
                                <DragOverlay>{activePage ? <PagePreviewOverlay src={activePage.url} index={activeIndex} /> : null}</DragOverlay>
                            </DndContext>
                        )}
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-sm text-gray-300">
                            <input type="checkbox" checked={isScheduling} onChange={() => setIsScheduling(!isScheduling)} className="h-4 w-4 bg-gray-700 border-gray-600 rounded text-indigo-600" />
                            Programar publicación
                        </label>
                        {isScheduling && (<div className="mt-4"><input type="datetime-local" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2" /></div>)}
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">{isEditing ? 'Guardar Cambios' : 'Subir Capítulo'}</button>
                </form>
            </div>
            {formDataForModal && (<ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmUpload} summary={formDataForModal} />)}
        </>
    );
};

// --- Componente principal de la página (MODIFICADO) ---
const MediaDetailPage = ({ params }: { params: { id: string } }) => {
    const { id } = use(params);

    const [media, setMedia] = useState<Media | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'chapters' | 'overview' | 'comments' | 'manage_chapter'>('chapters'); // <-- AÑADIDO 'comments'
    const [selectedChapter, setSelectedChapter] = useState<ChapterUpload | null>(null);
    const [chapterToEditTitle, setChapterToEditTitle] = useState<string | undefined>(undefined);
    const { user, isLoggedIn, addNotification } = useAuth();
    const router = useRouter();

    const loadMedia = async () => {
        setIsLoading(true);
        const mediaData = await fetchMediaById(Number(id));
        setMedia(mediaData);
        setIsLoading(false);
    };

    useEffect(() => {
        setActiveTab('chapters');
        loadMedia();
    }, [id]);

    const canManageChapters = isLoggedIn && media?.scanGroupId && user?.scanGroupId === media.scanGroupId;

    const handleEditChapter = (upload: ChapterUpload, chapterNumber: string, title?: string) => {
        setSelectedChapter({ ...upload, id: chapterNumber });
        setChapterToEditTitle(title);
        setActiveTab('manage_chapter');
    };
    const handleShowUpload = () => {
        setSelectedChapter(null);
        setChapterToEditTitle(undefined);
        setActiveTab('manage_chapter');
    };

    const handleSaveChapter = (chapterData: any, isEditing: boolean) => {
        if (!media) return;
        const message = isEditing
            ? `Se actualizó el capítulo ${chapterData.chapterNumber} de "${media.title.romaji}"`
            : `¡Nuevo capítulo! ${chapterData.chapterNumber} de "${media.title.romaji}" ya está disponible`;

        addNotification({ message, link: `/media/${media.id}` });

        loadMedia().then(() => {
            router.push(`/media/${media.id}?newChapter=${chapterData.chapterNumber}`, { scroll: false });
            setActiveTab('chapters');
        });
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
                            <button onClick={() => setActiveTab('comments')} className={`px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'comments' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Comentarios</button>
                            {canManageChapters && (
                                <button onClick={handleShowUpload} className={`px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'manage_chapter' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>
                                    {selectedChapter ? 'Editar Capítulo' : 'Subir Capítulo'}
                                </button>
                            )}
                        </div>
                        {activeTab === 'overview' && <OverviewTab media={media} />}
                        {activeTab === 'chapters' && <ChaptersTab onEditChapter={canManageChapters ? handleEditChapter : undefined} />}
                        {activeTab === 'comments' && <CommentsSection comments={media.comments || []} mediaId={media.id} />}
                        {activeTab === 'manage_chapter' && canManageChapters && <ChapterManagementTab media={media} existingChapter={selectedChapter} onSave={handleSaveChapter} chapterTitle={chapterToEditTitle} />}
                    </div>
                </div>
            </main>
        </>
    );
};

export default MediaDetailPage;
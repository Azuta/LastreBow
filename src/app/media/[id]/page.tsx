// src/app/media/[id]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Media } from "@/types/AniListResponse";
import Navbar from "@/components/layout/Navbar";
import OverviewTab from "@/components/media/OverviewTab";
import ChaptersTab from "@/components/media/ChaptersTab";
import CommentsSection from "@/components/media/CommentsSection";
import { useAuth } from "@/context/AuthContext";
import { createClient } from '@/lib/supabaseClient';

// --- Icono para el formulario de subida ---
const UploadCloudIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;

// --- Componente para la Pestaña de Subida/Edición de Capítulos ---
const ChapterManagementTab = ({ media, onSave }: { media: Media; onSave: () => void; }) => {
    const { user, addToast } = useAuth();
    const [pages, setPages] = useState<File[]>([]);
    const [pagePreviews, setPagePreviews] = useState<{ id: string; url: string }[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        const previews = pages.map((file, index) => ({ id: `${file.name}-${index}`, url: URL.createObjectURL(file) }));
        setPagePreviews(previews);
        // Limpia las URLs de los objetos cuando el componente se desmonta para liberar memoria
        return () => previews.forEach(p => URL.revokeObjectURL(p.url));
    }, [pages]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setPages(Array.from(e.target.files));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            addToast("Necesitas iniciar sesión para subir un capítulo", "error");
            return;
        }
        if (pages.length === 0) {
            addToast("Debes seleccionar al menos una imagen para el capítulo", "error");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        const formElements = new FormData(e.currentTarget);
        const chapterNumber = formElements.get('chapter-number') as string;
        const title = formElements.get('chapter-title') as string | null;
        const notes = formElements.get('chapter-notes') as string | null;

        const pageUrls: string[] = [];
        let uploadedCount = 0;

        for (const file of pages) {
            // Crear una ruta única para cada imagen
            const filePath = `${media.id}/${chapterNumber}/${Date.now()}_${file.name}`;
            const { data, error: uploadError } = await supabase.storage.from('chapter-images').upload(filePath, file);

            if (uploadError) {
                console.error("Error uploading file:", uploadError);
                addToast(`Error al subir ${file.name}. Inténtalo de nuevo.`, "error");
                setIsUploading(false);
                return;
            }
            
            const { data: { publicUrl } } = supabase.storage.from('chapter-images').getPublicUrl(data.path);
            pageUrls.push(publicUrl);

            uploadedCount++;
            setUploadProgress((uploadedCount / pages.length) * 100);
        }

        // Guardar los metadatos en la tabla 'chapters'
        const { error: dbError } = await supabase.from('chapters').insert({
            media_id: media.id,
            user_id: user.id,
            chapter_number: chapterNumber,
            title: title || null,
            notes: notes || null,
            page_urls: pageUrls
        });

        if (dbError) {
            console.error("Error saving chapter metadata:", dbError);
            addToast("Error al guardar la información del capítulo.", "error");
        } else {
            addToast(`Capítulo ${chapterNumber} subido con éxito!`, "success");
            onSave(); // Llama a la función para recargar y cambiar de pestaña
        }
        
        setIsUploading(false);
        setUploadProgress(0);
        setPages([]);
        (e.target as HTMLFormElement).reset();
    };

    return (
        <div className="max-w-screen-md mx-auto bg-[#201f31] p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-white mb-6">Subir capítulo para: {media.title.romaji}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="chapter-number" className="block text-sm font-medium text-gray-300 mb-2">Número de Capítulo</label>
                    <input type="text" name="chapter-number" placeholder="Ej: 125 o 125.5" className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#ffbade] focus:outline-none" required />
                </div>
                <div>
                    <label htmlFor="chapter-title" className="block text-sm font-medium text-gray-300 mb-2">Título (Opcional)</label>
                    <input type="text" name="chapter-title" placeholder="Ej: El Despertar" className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#ffbade] focus:outline-none" />
                </div>
                <div>
                    <label htmlFor="chapter-notes" className="block text-sm font-medium text-gray-300 mb-2">Notas del Scan (Opcional)</label>
                    <textarea name="chapter-notes" rows={3} placeholder="Notas sobre el lanzamiento..." className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#ffbade] focus:outline-none"></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Páginas del Capítulo</label>
                    <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-gray-600 px-6 py-10">
                        <div className="text-center">
                            <UploadCloudIcon />
                            <p className="mt-4 text-sm text-gray-400">Arrastra o selecciona las páginas</p>
                            <input name="file-upload" type="file" onChange={handleFileChange} className="text-xs text-gray-500 mt-2" multiple accept="image/*" required/>
                        </div>
                    </div>
                     {pagePreviews.length > 0 && <p className="text-xs text-gray-400 mt-4">{pagePreviews.length} imágenes seleccionadas.</p>}
                </div>
                {isUploading && (
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                )}
                <button type="submit" disabled={isUploading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50">
                    {isUploading ? `Subiendo... ${Math.round(uploadProgress)}%` : 'Subir Capítulo'}
                </button>
            </form>
        </div>
    );
};


const MediaDetailPage = ({ params }: { params: { id: string } }) => {
    const { id } = use(params);
    const [media, setMedia] = useState<Media | null>(null);
    const [chapters, setChapters] = useState<any[]>([]); // Usamos 'any' por simplicidad, se podría crear un tipo específico
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'chapters' | 'overview' | 'comments' | 'manage_chapter'>('chapters');
    const { user, isLoggedIn } = useAuth();
    const supabase = createClient();

    const loadMediaAndChapters = async () => {
        setIsLoading(true);

        const { data: mediaData, error: mediaError } = await supabase
            .from('media')
            .select('*, comments(*, profile:profiles(*))') // Cargar comentarios y perfiles asociados
            .eq('id', Number(id))
            .single();

        if (mediaError || !mediaData) {
            console.error("Media not found:", mediaError);
            return notFound();
        }
        setMedia(mediaData as Media);

        const { data: chaptersData, error: chaptersError } = await supabase
            .from('chapters')
            .select('*, profile:profiles!user_id(*)') // Cargar perfiles de quien subió el capítulo
            .eq('media_id', Number(id))
            .order('created_at', { ascending: false });

        if (chaptersError) console.error("Error fetching chapters:", chaptersError);
        setChapters(chaptersData || []);

        setIsLoading(false);
    };

    useEffect(() => {
        loadMediaAndChapters();
    }, [id]);

    const handleSaveChapter = () => {
        loadMediaAndChapters();
        setActiveTab('chapters');
    };
    
    // Simplificamos esta lógica. En un caso real, compararías el `scan_group_id` del perfil con el del manga.
    const canManageChapters = isLoggedIn; 

    if (isLoading || !media) {
        return (
            <>
                <Navbar />
                <div className="bg-[#1a1a24] min-h-screen text-white text-center p-8">Cargando...</div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main>
                <div className="relative h-64 md:h-80 w-full">
                    <Image src={media.banner_image || ''} alt={`${media.title_romaji} Banner`} fill style={{ objectFit: 'cover' }} priority />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a24] via-[#1a1a24]/50 to-transparent"></div>
                </div>
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 md:-mt-40">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-shrink-0 w-48 md:w-64">
                            <Image src={media.cover_image_extra_large} alt={media.title_romaji} width={400} height={600} className="w-full h-auto rounded-lg shadow-2xl" priority />
                        </div>
                        <div className="flex-grow pt-32 md:pt-48 text-white">
                            <h1 className="text-3xl md:text-5xl font-bold">{media.title_english || media.title_romaji}</h1>
                            <p dangerouslySetInnerHTML={{ __html: media.description_en || '' }} className="mt-6 text-gray-300 text-sm leading-relaxed max-w-3xl" />
                        </div>
                    </div>
                </div>
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-12">
                    <div className="w-full">
                        <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
                            <button onClick={() => setActiveTab('chapters')} className={`px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'chapters' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Capítulos</button>
                            <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'overview' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Overview</button>
                            <button onClick={() => setActiveTab('comments')} className={`px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'comments' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Comentarios</button>
                            {canManageChapters && (
                                <button onClick={() => setActiveTab('manage_chapter')} className={`px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'manage_chapter' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>
                                    Subir Capítulo
                                </button>
                            )}
                        </div>
                        {activeTab === 'overview' && <OverviewTab media={media} />}
                        {activeTab === 'chapters' && <ChaptersTab chapters={chapters} mediaId={media.id}/>}
                        {activeTab === 'comments' && <CommentsSection initialComments={media.comments || []} mediaId={media.id} />}
                        {activeTab === 'manage_chapter' && canManageChapters && <ChapterManagementTab media={media} onSave={handleSaveChapter} />}
                    </div>
                </div>
            </main>
        </>
    );
};

export default MediaDetailPage;
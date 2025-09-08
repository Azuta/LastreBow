// src/app/media/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { fetchMediaById } from "@/services/fetchAniList";
import { Media } from "@/types/AniListResponse";
import Navbar from "@/components/layout/Navbar";
import OverviewTab from "@/components/media/OverviewTab";
import ChaptersTab from "@/components/media/ChaptersTab";
import ExternalLinkModal from "@/components/media/ExternalLinkModal";
import { useUserPreferences } from "@/context/UserPreferencesContext";

type Tab = 'overview' | 'chapters';

const MediaDetailPage = ({ params }: { params: { id: string } }) => {
    const [media, setMedia] = useState<Media | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('chapters');

    // Estado para el modal de enlaces externos
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetUrl, setTargetUrl] = useState('');
    const { warnOnExternalLinks, setWarnOnExternalLinks, hideExternalLinks, setHideExternalLinks } = useUserPreferences();

    useEffect(() => {
        const loadMedia = async () => {
            setIsLoading(true);
            const mediaData = await fetchMediaById(Number(params.id));
            setMedia(mediaData);
            setIsLoading(false);
        };
        loadMedia();
    }, [params.id]);

    const handleExternalLinkClick = (url: string) => {
        if (hideExternalLinks) return; // Si el usuario los ocultó, no hacer nada

        if (warnOnExternalLinks) {
            setTargetUrl(url);
            setIsModalOpen(true);
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const confirmRedirect = (dontShowAgain: boolean) => {
        if (dontShowAgain) {
            setWarnOnExternalLinks(false);
        }
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
        setIsModalOpen(false);
    };

    const confirmHideAll = () => {
        setHideExternalLinks(true);
        setIsModalOpen(false);
    };

    if (isLoading || !media) {
        return <div className="bg-[#1a1a24] min-h-screen text-white text-center p-8">Cargando...</div>;
    }

    return (
        <>
            <Navbar />
            <main>
                <div className="relative h-64 md:h-80 w-full">
                    <img src={media.bannerImage || ''} alt={`${media.title.romaji} Banner`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a24] via-[#1a1a24]/50 to-transparent"></div>
                </div>

                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 md:-mt-40">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-shrink-0 w-48 md:w-64">
                            <img src={media.coverImage.extraLarge} alt={media.title.romaji} className="w-full h-auto rounded-lg shadow-2xl" />
                            <div className="mt-4 flex flex-col gap-2">
                                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-md text-sm font-semibold transition-colors">Seguir</button>
                                <button className="w-full bg-gray-700/50 hover:bg-gray-600/80 text-gray-300 py-2.5 rounded-md text-sm font-semibold transition-colors">Añadir a mi lista</button>
                            </div>
                        </div>
                        <div className="flex-grow pt-32 md:pt-48 text-white">
                            <h1 className="text-3xl md:text-5xl font-bold">{media.title.english || media.title.romaji}</h1>
                            <p className="text-lg text-gray-400 mt-1">{media.title.native}</p>
                            <p dangerouslySetInnerHTML={{ __html: media.description }} className="mt-6 text-gray-300 text-sm leading-relaxed max-w-3xl" />
                        </div>
                    </div>
                </div>

                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-12">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="w-full lg:w-3/4">
                            <div className="flex border-b border-gray-700 mb-6">
                                <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'overview' ? 'tab-active' : 'text-gray-400 border-transparent hover:text-white'}`}>Overview</button>
                                <button onClick={() => setActiveTab('chapters')} className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'chapters' ? 'tab-active' : 'text-gray-400 border-transparent hover:text-white'}`}>Capítulos</button>
                            </div>

                            {activeTab === 'overview' && <OverviewTab media={media} />}
                            {activeTab === 'chapters' && <ChaptersTab onLinkClick={handleExternalLinkClick} />}
                        </div>
                        
                        <aside className="w-full lg:w-1/4">
                            <div className="bg-[#201f31] p-4 rounded-lg sticky top-24">
                                <h3 className="text-lg font-bold text-white border-b border-gray-700 pb-3 mb-4">Detalles</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between"><strong className="text-gray-400">Formato:</strong> <span className="text-white">{media.format}</span></div>
                                    <div className="flex justify-between"><strong className="text-gray-400">Estado:</strong> <span className="text-green-400">{media.status}</span></div>
                                    <div className="flex justify-between"><strong className="text-gray-400">Puntuación:</strong> <span className="text-white">{media.averageScore} / 100</span></div>
                                    <div className="flex justify-between"><strong className="text-gray-400">Popularidad:</strong> <span className="text-white">#{media.popularity}</span></div>
                                    <div className="flex justify-between"><strong className="text-gray-400">Capítulos:</strong> <span className="text-white">{media.chapters || 'N/A'}</span></div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <h4 className="text-md font-bold text-white mb-2">Géneros</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {media.genres.map(genre => <span key={genre} className="bg-gray-700 text-gray-300 px-2.5 py-1 rounded-full text-xs font-semibold">{genre}</span>)}
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
            <ExternalLinkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={confirmRedirect} onHideAll={confirmHideAll} />
        </>
    );
};

export default MediaDetailPage;
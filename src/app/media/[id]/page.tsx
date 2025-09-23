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
import { fetchMediaById } from '@/services/fetchAniList'; 

const MediaDetailPage = ({ params }: { params: { id: string } }) => {
    const { id } = use(params);
    const [media, setMedia] = useState<Media | null>(null);
    const [chapters, setChapters] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'chapters' | 'overview' | 'comments'>('chapters');
    const { isLoggedIn, profile, logUserActivity } = useAuth();
    const supabase = createClient();

    const loadMediaAndChapters = async () => {
        setIsLoading(true);

        const mediaData = await fetchMediaById(Number(id));
        
        if (!mediaData) {
            console.error("Media not found");
            return notFound();
        }
        setMedia(mediaData);

        const { data: chaptersData, error: chaptersError } = await supabase
            .from('chapters')
            .select('*, profile:profiles!user_id(*)')
            .eq('media_id', Number(id))
            .order('created_at', { ascending: false });

        if (chaptersError) console.error("Error fetching chapters:", chaptersError);
        setChapters(chaptersData || []);

        setIsLoading(false);
    };

    useEffect(() => {
        if (isLoggedIn && media) {
            logUserActivity('visit_media', media.id, media.isAdult ?? false, { title: media.title.romaji });
        }
    }, [isLoggedIn, media, logUserActivity]);

    useEffect(() => {
        loadMediaAndChapters();
    }, [id]);

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
                    <Image src={media.bannerImage || ''} alt={`${media.title.romaji} Banner`} fill style={{ objectFit: 'cover' }} priority sizes="100vw" />
                    <div className="relative inset-0 bg-gradient-to-t from-[#1a1a24] via-[#1a1a24]/50 to-transparent"></div>
                </div>
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 md:-mt-40">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-shrink-0 w-48 md:w-64">
                            <Image src={media.coverImage.extraLarge} alt={media.title.romaji} width={400} height={600} className="w-full h-auto rounded-lg shadow-2xl" priority />
                        </div>
                        <div className="flex-grow pt-32 md:pt-48 text-white">
                            <h1 className="text-3xl md:text-5xl font-bold">{media.title.english || media.title.romaji}</h1>
                            <p dangerouslySetInnerHTML={{ __html: media.description || '' }} className="mt-6 text-gray-300 text-sm leading-relaxed max-w-3xl" />
                        </div>
                    </div>
                </div>
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-12">
                    <div className="w-full">
                        <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
                             <button onClick={() => setActiveTab('chapters')} className={`px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'chapters' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Capítulos</button>
                            <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'overview' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Overview</button>
                            <button onClick={() => setActiveTab('comments')} className={`px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'comments' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Comentarios</button>
                        </div>
                        {activeTab === 'overview' && <OverviewTab media={media} />}
                        {activeTab === 'chapters' && <ChaptersTab chapters={chapters} mediaId={media.id}/>}
                        {activeTab === 'comments' && <CommentsSection initialComments={media.comments || []} mediaId={media.id} />}
                    </div>
                </div>
            </main>
        </>
    );
};

export default MediaDetailPage;
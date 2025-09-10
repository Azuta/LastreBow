// azuta/mangauserpage/MangaUserPage-main/src/app/user/[username]/page.tsx
"use client";

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import MangaCard from '@/components/ui/cards/MangaCard';
import CustomListsTab from '@/components/user/CustomListsTab';
import OverviewTab from '@/components/user/OverviewTab';
import SettingsTab from '@/components/user/SettingsTab'; // <-- NUEVO
import { Media, UserList } from '@/types/AniListResponse';
import { createClient } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

const supabase = createClient();

interface UserProfile {
    id: string;
    username: string;
    avatar_url: string;
    role: string;
    favorites: Media[];
    lists: UserList[];
    profile_comments: any[];
    reviews: any[]; // <-- NUEVO
}

const UserProfilePage = ({ params }: { params: { username: string } }) => {
    const { username } = use(params);
    const { profile: loggedInUserProfile } = useAuth();
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const isOwnProfile = loggedInUserProfile?.username === username;

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);

            const { data: profile, error: profileError } = await supabase
                .from('profiles').select('*').eq('username', username).single();

            if (profileError || !profile) notFound();

            const { data: favorites } = await supabase.from('user_favorites').select('media:media_id (*)').eq('user_id', profile.id);
            const { data: lists } = await supabase.from('user_lists').select('*').eq('user_id', profile.id);
            const { data: comments } = await supabase.from('profile_comments').select('*, author:profiles!author_id(*)').eq('profile_id', profile.id).order('created_at', { ascending: false });
            
            // --- NUEVO: Cargar reseñas del usuario ---
            const { data: reviews } = await supabase.from('reviews').select('*, media:media_id(*)').eq('user_id', profile.id).order('created_at', { ascending: false });

            setUserData({
                ...profile,
                favorites: favorites?.map(f => f.media as Media) || [],
                lists: lists || [],
                profile_comments: comments || [],
                reviews: reviews || [],
            });

            setIsLoading(false);
        };

        fetchUserData();
    }, [username]);

    if (isLoading) return (<><Navbar /><div className="text-center py-20 text-white">Cargando perfil...</div></>);
    if (!userData) return notFound();

    return (
        <>
            <Navbar />
            <main>
                <div className="relative h-48 md:h-64 w-full bg-gray-800"></div>
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20">
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-[#1a1a24] shadow-lg flex-shrink-0">
                            <Image src={userData.avatar_url} alt={userData.username} layout="fill" objectFit="cover" />
                        </div>
                        <div className="ml-0 sm:ml-6 mt-4 sm:mb-4 text-center sm:text-left">
                            <h1 className="text-3xl md:text-4xl font-bold text-white">{userData.username}</h1>
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
                           <button onClick={() => setActiveTab('overview')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'overview' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Resumen</button>
                           <button onClick={() => setActiveTab('favorites')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'favorites' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Favoritos ({userData.favorites.length})</button>
                           <button onClick={() => setActiveTab('lists')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'lists' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Listas ({userData.lists.length})</button>
                           <button onClick={() => setActiveTab('reviews')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'reviews' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Reseñas ({userData.reviews.length})</button>
                           <button onClick={() => setActiveTab('history')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'history' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Historial</button>
                           {isOwnProfile && (
                                <button onClick={() => setActiveTab('settings')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'settings' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Configuración</button>
                           )}
                        </div>
                        <div>
                            {activeTab === 'overview' && <OverviewTab userId={userData.id} username={userData.username} recentFavorites={userData.favorites.slice(0, 7)} initialComments={userData.profile_comments}/>}
                            {activeTab === 'favorites' && (<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-4 gap-y-6 py-8">{userData.favorites.map(manga => <MangaCard key={manga.id} media={manga} />)}</div>)}
                            {activeTab === 'lists' && <CustomListsTab lists={userData.lists} username={userData.username} />}
                            {activeTab === 'reviews' && <div className="text-center py-20 text-gray-400">La sección de reseñas estará disponible próximamente.</div>}
                            {activeTab === 'history' && <div className="text-center py-20 text-gray-400">El historial de lectura estará disponible próximamente.</div>}
                            {activeTab === 'settings' && isOwnProfile && <SettingsTab />}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default UserProfilePage;
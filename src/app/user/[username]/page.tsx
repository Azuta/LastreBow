// src/app/user/[username]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import MangaCard from '@/components/ui/cards/MangaCard';
import CustomListsTab from '@/components/user/CustomListsTab';
import { Media, UserList, Achievement } from '@/types/AniListResponse';
import { createClient } from '@/lib/supabaseClient';

const supabase = createClient();

// Definimos un tipo para el perfil completo que vamos a cargar
interface UserProfile {
    id: string;
    username: string;
    avatar_url: string;
    role: string;
    favorites: Media[];
    lists: UserList[];
}

const UserProfilePage = ({ params }: { params: { username: string } }) => {
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);

            // 1. Obtener el perfil del usuario
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', params.username)
                .single();

            if (profileError || !profile) {
                notFound();
            }

            // 2. Obtener los mangas favoritos de ese usuario
            const { data: favorites, error: favoritesError } = await supabase
                .from('user_favorites')
                .select('media:media_id (*)') // Esto es un JOIN en Supabase
                .eq('user_id', profile.id);

            // 3. Obtener las listas del usuario
            const { data: lists, error: listsError } = await supabase
                .from('user_lists')
                .select('*')
                .eq('user_id', profile.id);


            if (favoritesError || listsError) {
                console.error("Error fetching user data:", favoritesError || listsError);
            }

            setUserData({
                ...profile,
                favorites: favorites?.map(f => f.media) || [],
                lists: lists || [],
            });

            setIsLoading(false);
        };

        fetchUserData();
    }, [params.username]);

    if (isLoading) return (<><Navbar /><div className="text-center py-20 text-white">Cargando perfil...</div></>);
    if (!userData) return notFound();

    return (
        <>
            <Navbar />
            <main>
                <div className="relative h-48 md:h-64 w-full bg-gray-800">
                    {/* Podrías añadir un banner_url a tu tabla de perfiles */}
                </div>
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
                        </div>
                        <div>
                            {activeTab === 'overview' && (
                                <div className="py-8">
                                    <h3 className="text-xl font-bold text-white mb-4">Favoritos Recientes</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-4 gap-y-6">
                                        {userData.favorites.slice(0, 7).map(manga => <MangaCard key={manga.id} media={manga} />)}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'favorites' && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-4 gap-y-6 py-8">
                                    {userData.favorites.map(manga => <MangaCard key={manga.id} media={manga} />)}
                                </div>
                            )}
                            {activeTab === 'lists' && (
                                <CustomListsTab lists={userData.lists} username={userData.username} />
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default UserProfilePage;
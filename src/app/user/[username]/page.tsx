// azuta/mangauserpage/MangaUserPage-main/src/app/user/[username]/page.tsx
"use client";

import { useState, useEffect, useCallback, use } from 'react';
import Image from 'next/image';
import { notFound, useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import MangaCard from '@/components/ui/cards/MangaCard';
import CustomListsTab from '@/components/user/CustomListsTab';
import OverviewTab from '@/components/user/OverviewTab';
import SettingsTab from '@/components/user/SettingsTab';
import ReviewsTab from '@/components/user/ReviewsTab';
import { Media, UserList } from '@/types/AniListResponse';
import { createClient } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import ProfileEditModal from '@/components/user/ProfileEditModal';

const supabase = createClient();

const EditIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const TwitterIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>;
const DiscordIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current"><path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.446.824-.618 1.252a17.296 17.296 0 0 0-5.462 0 17.595 17.595 0 0 0-.618-1.252.074.074 0 0 0-.079-.037A19.718 19.718 0 0 0 3.68 4.37a.074.074 0 0 0-.037.079C3.818 5.383 4.01 6.33 4.156 7.29a16.584 16.584 0 0 0-1.566 2.047.074.074 0 0 0 .013.103c.759.537 1.503.99 2.213 1.373a.074.074 0 0 0 .087-.004c.044-.03.075-.074.087-.118a13.33 13.33 0 0 0-1.129-2.11.074.074 0 0 0 .013-.118c.03-.013.074-.013.103 0a15.438 15.438 0 0 0 2.262 1.343.074.074 0 0 0 .087 0c.262-.118.511-.249.747-.393a12.72 12.72 0 0 0-1.889-1.215.074.074 0 0 0-.062-.132c-.343-.03-.673-.042-.988-.042-1.103 0-2.144.262-3.119.747a.074.074 0 0 0-.042.087c.07.388.165.812.274 1.252a18.238 18.238 0 0 0 4.72 1.83.074.074 0 0 0 .087 0c1.533-.556 2.94-1.233 4.72-1.83.109-.44.204-.864.274-1.252a.074.074 0 0 0-.042-.087c-.975-.485-2.016-.747-3.119-.747-.315 0-.645.013-.988.042a.074.074 0 0 0-.062.132 12.72 12.72 0 0 0-1.889 1.215c.236.144.485.275.747.393a.074.074 0 0 0 .087 0c.75-.425 1.48-0.908 2.262-1.343a.074.074 0 0 0 .013-.118c-.356-.757-.787-1.418-1.129-2.11a.074.074 0 0 0 .087-.118c.012-.012.042-.012.057 0a13.33 13.33 0 0 0 2.213 1.373.074.074 0 0 0 .013-.103 16.584 16.584 0 0 0-1.566-2.047c.153-.986.32-1.97.496-2.915a.074.074 0 0 0-.037-.08Z"/></svg>;
const WebsiteIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.01 21.842c-2.31-.225-4.437-1.228-6.113-2.735l.89-1.543c1.455 1.34 3.257 2.19 5.223 2.4V21.84zm1.967-.008v-1.85c2.043-.22 3.9-.1.08 5.31-2.22l.85-1.558c-1.32-1.22-2.148-2.88-2.39-4.75h4.78v-2.02h-4.75c.23-1.82.1.05-3.52 2.34-4.7h-4.8v-2.01h4.75c-.24-1.87-1.07-3.53-2.39-4.75l.85-1.558c1.32 1.22 2.148 2.88 2.39 4.75h4.78v2.01h-4.75c-.23 1.82-1.05 3.52-2.34 4.7h4.8v2.02h-4.78zm.05-19.68v1.843c2.062.217 3.916 1.077 5.337 2.22l.86-1.554c-1.673-1.504-3.8-2.507-6.197-2.734l-.001-.002zm-1.956.01c-2.322.223-4.457 1.22-6.136 2.722l.886 1.55c1.46-1.336 3.266-2.188 5.25-2.4V2.164z"/></svg>;

interface UserProfile {
    id: string;
    username: string;
    avatar_url: string;
    banner_url?: string;
    bio?: string;
    social_links?: { [key: string]: string };
    role: string;
    favorites: Media[];
    lists: UserList[];
    profile_comments: any[];
    reviews: any[];
}

const UserProfilePage = ({ params }: { params: { username: string } }) => {
    const { username: initialUsername } = use(params);
    const { profile: loggedInUserProfile, addToast } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const isOwnProfile = loggedInUserProfile?.username === initialUsername;

    const fetchUserData = useCallback(async () => {
        setIsLoading(true);
        const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('username', initialUsername).single();
        if (profileError || !profile) {
            return notFound();
        }

        const { data: favorites } = await supabase.from('user_favorites').select('media:media_id (*)').eq('user_id', profile.id);
        const { data: lists } = await supabase.from('user_lists').select('*').eq('user_id', profile.id);
        const { data: comments } = await supabase.from('profile_comments').select('*, author:profiles!author_id(*)').eq('profile_id', profile.id).order('created_at', { ascending: false });
        const { data: reviews } = await supabase.from('reviews').select('*, media:media_id(*)').eq('user_id', profile.id).order('created_at', { ascending: false });
        
        setUserData({
            ...profile,
            favorites: favorites?.map(f => f.media as Media) || [],
            lists: lists || [],
            profile_comments: comments || [],
            reviews: reviews || [],
        });
        setIsLoading(false);
    }, [initialUsername]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleSaveSuccess = async (updatedProfile: UserProfile) => {
        addToast('Perfil actualizado con éxito', 'success');
        if (updatedProfile.username !== initialUsername) {
            router.push(`/user/${updatedProfile.username}`);
        } else {
            setUserData(prevData => ({ ...prevData!, ...updatedProfile }));
        }
    };

    if (isLoading || !userData) {
        return (<><Navbar /><div className="text-center py-20 text-white">Cargando perfil...</div></>);
    }

    return (
        <>
            <Navbar />
            <ProfileEditModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveSuccess as any}
            />
            <main>
                <div className="relative h-48 md:h-64 w-full">
                    {userData.banner_url ? (
                        <Image src={userData.banner_url} alt="User Banner" fill style={{ objectFit: 'cover' }} priority />
                    ) : (
                        <div className="w-full h-full bg-gray-800"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a24] via-[#1a1a24]/50 to-transparent"></div>
                </div>

                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20 relative">
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#1a1a24] shadow-lg flex-shrink-0">
                            <Image src={userData.avatar_url} alt={userData.username} layout="fill" objectFit="cover" className="rounded-full" />
                        </div>

                        <div className="ml-0 sm:ml-6 mt-4 sm:mb-4 text-center sm:text-left flex-grow">
                             <div className="flex items-center justify-center sm:justify-start gap-4">
                                <h1 className="text-3xl md:text-4xl font-bold text-white">{userData.username}</h1>
                                <div className="flex items-center gap-3 text-gray-400">
                                    {userData.social_links?.twitter && <a href={userData.social_links.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-white"><TwitterIcon /></a>}
                                    {userData.social_links?.discord && <a href={userData.social_links.discord} target="_blank" rel="noopener noreferrer" className="hover:text-white"><DiscordIcon /></a>}
                                    {userData.social_links?.website && <a href={userData.social_links.website} target="_blank" rel="noopener noreferrer" className="hover:text-white"><WebsiteIcon /></a>}
                                </div>
                            </div>
                            <p className="text-gray-400 mt-2 max-w-2xl">{userData.bio || 'Este usuario no ha añadido una biografía.'}</p>
                        </div>

                        {isOwnProfile && (
                            <div className="flex mt-4 sm:mt-0 sm:absolute sm:top-20 sm:right-0">
                                <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 text-white rounded-lg text-sm font-semibold hover:bg-gray-600/80">
                                    <EditIcon /> Editar Perfil
                                </button>
                            </div>
                        )}
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
                            {activeTab === 'overview' && (
                                <OverviewTab
                                    userId={userData.id}
                                    username={userData.username}
                                    recentFavorites={userData.favorites.slice(0, 7)}
                                    initialComments={userData.profile_comments}
                                    totalFavorites={userData.favorites.length}
                                    totalLists={userData.lists.length}
                                    totalReviews={userData.reviews.length}
                                />
                            )}
                            {activeTab === 'favorites' && (<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-4 gap-y-6 py-8">{userData.favorites.map(manga => <MangaCard key={manga.id} media={manga} />)}</div>)}
                            {activeTab === 'lists' && <CustomListsTab lists={userData.lists} username={userData.username} />}
                            {activeTab === 'reviews' && (
                                <ReviewsTab
                                    reviews={userData.reviews}
                                    username={userData.username}
                                    isOwnProfile={isOwnProfile}
                                    onReviewAdded={fetchUserData}
                                />
                            )}
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
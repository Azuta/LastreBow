// src/app/user/[username]/page.tsx
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
import { fetchFavoritesByUserId } from '@/services/fetchAniList';
import HistoryTab from '@/components/user/HistoryTab';
import MarketplaceTab from '@/components/user/MarketplaceTab';

const supabase = createClient();

const EditIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const TwitterIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>;
const DiscordIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current"><path d="M20.317 4.369a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4464.8245-.618 1.2525a17.2969 17.2969 0 00-5.4624 0 17.5951 17.5951 0 00-.618-1.2525.0741.0741 0 00-.0785-.0371A19.7157 19.7157 0 003.6796 4.3698a.0741.0741 0 00-.0371.0785c.1755.9378.3428 1.921.4962 2.9158a16.5847 16.5847 0 00-1.5663 2.0468.0741.0741 0 00.0128.1024c.759  .5368 1.5032.9898 2.2132 1.3731a.0741.0741 0 00.0869-.004c.0438-.0299.0741-.07.0869-.1182a13.3313 13.3313 0 00-1.129-2.111.0741.0741 0 00.0128-.1182c.0299-.0128.07-.0128.1024-.0128a15.4383 15.4383 0 002.2618 1.3432.0741.0741 0 00.0869 0c.262-.1182.5112-.2492.7476-.393a12.7199 12.7199 0 00-1.8894-1.2155.0741.0741 0 00-.0615-.131c-.3428-.0299-.6728-.0427-.988-.0427-1.1031 0-2.1444.262-3.1189.7476a.0741.0741 0 00-.0427.0869c.07.388.1654.8117.2748 1.2525a18.2384 18.2384 0 004.7212 1.83.0741.0741 0 00.0869 0 16.529 16.529 0 004.7212-1.83c.1094-.4408.2048-.8645.2748-1.2525a.0741.0741 0 00-.0427-.0869 15.4383 15.4383 0 00-3.1189-.7476c-.3151 0-.6451.0128-.988.0427a.0741.0741 0 00-.0615.131 12.7199 12.7199 0 00-1.8894 1.2155c.2364.1438.4856.2748.7476.393a.0741.0741 0 00.0869 0 15.4383 15.4383 0 002.2618-1.3432.0741.0741 0 00.0128.1182c-.3428.691-.7736 1.3522-1.129 2.111a.0741.0741 0 00.0869.1182c.0128 0 .0427-.0128.0574-.0299a13.3313 13.3313 0 002.2132-1.3731.0741.0741 0 00.0128-.1024 16.5847 16.5847 0 00-1.5663-2.0468c.1534-.9948.3216-1.978.4962-2.9158a.0741.0741 0 00-.0371-.0785z" fill="currentColor"/></svg>;
const WebsiteIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.01 21.842c-2.31-.225-4.437-1.228-6.113-2.735l.89-1.543c1.455 1.34 3.257 2.19 5.223 2.4V21.84zm1.967-.008v-1.85c2.043-.22 3.9-.1.08 5.31-2.22l.85-1.558c-1.32-1.22-2.148-2.88-2.39-4.75h4.78v-2.02h-4.75c.23-1.82.1.05-3.52 2.34-4.7h-4.8v-2.01h4.75c-.24-1.87-1.07-3.53-2.39-4.75l.85-1.558c1.32 1.22 2.148 2.88 2.39 4.75h4.78v2.01h-4.75c-.23 1.82-1.05 3.52-2.34 4.7h4.8v2.02h-4.78zm.05-19.68v1.843c2.062.217 3.916 1.077 5.337 2.22l.86-1.554c-1.673-1.504-3.8-2.507-6.197-2.734l-.001-.002zm-1.956.01c-2.322.223-4.457 1.22-6.136 2.722l.886 1.55c1.46-1.336 3.266-2.188 5.25-2.4V2.164z"/></svg>;
const HistoryIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v10l4 4"></path><circle cx="12" cy="12" r="10"></circle></svg>;
const SettingsIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.39a2 2 0 0 0 .73 2.73l.15.08a2 2 0 0 1 1 1.73v.18a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.73v-.18a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>;


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
    activity: any[];
    hide_adult_content_on_profile: boolean;
}

const mapToMediaProps = (manga: any): Media => ({
    id: manga.id,
    title: {
        romaji: manga.title_romaji,
        english: manga.title_english,
        native: manga.title_native,
    },
    coverImage: {
        extraLarge: manga.cover_image_extra_large,
        large: manga.cover_image_large,
        medium: '',
        color: manga.cover_image_color,
    },
    bannerImage: manga.banner_image,
    description: manga.description_en,
    chapters: manga.chapters,
    genres: manga.genres,
    averageScore: manga.average_score,
    popularity: manga.popularity,
    status: manga.status,
    format: manga.format,
    type: manga.type,
    episodes: manga.episodes,
    trailer: manga.trailer,
    staff: manga.staff,
    characters: manga.characters,
    relations: manga.relations,
    recommendations: manga.recommendations,
});

const UserProfilePage = ({ params }: { params: { username: string } }) => {
    const { username: initialUsername } = use(params);
    const { profile: loggedInUserProfile, addToast, favorites, userLists } = useAuth();
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
        
        const favoritesData = await fetchFavoritesByUserId(profile.id);

        const { data: lists } = await supabase.from('user_lists').select('*').eq('user_id', profile.id);
        const { data: comments } = await supabase.from('profile_comments').select('*, author:profiles!author_id(*)').eq('profile_id', profile.id).order('created_at', { ascending: false });
        const { data: reviews } = await supabase.from('reviews').select('*, media:media_id(*)').eq('user_id', profile.id).order('created_at', { ascending: false });
        
        const { data: activity } = await supabase
            .from('user_activity')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false });
        
        setUserData({
            ...profile,
            favorites: favoritesData,
            lists: lists || [],
            profile_comments: comments || [],
            reviews: reviews || [],
            activity: activity || [],
        });
        setIsLoading(false);
    }, [initialUsername]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    useEffect(() => {
      if (isOwnProfile) {
        fetchUserData();
      }
    }, [favorites, isOwnProfile, fetchUserData]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleSaveSuccess = async (updatedProfile: UserProfile | null) => {
        if (updatedProfile && updatedProfile.username) {
            addToast('Perfil actualizado con éxito', 'success');
            if (updatedProfile.username !== initialUsername) {
                router.push(`/user/${updatedProfile.username}`);
            } else {
                setUserData(prevData => ({ ...prevData!, ...updatedProfile }));
            }
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
                        <Image src={userData.banner_url} alt="User Banner" fill style={{ objectFit: 'cover' }} priority sizes="100vw" />
                    ) : (
                        <div className="w-full h-full bg-gray-800"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a24] via-[#1a1a24]/50 to-transparent"></div>
                </div>

                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20 relative">
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#1a1a24] shadow-lg flex-shrink-0">
                            <Image src={userData.avatar_url} alt={userData.username} fill style={{ objectFit: 'cover' }} className="rounded-full" sizes="(max-width: 640px) 128px, 160px" priority />
                        </div>

                        <div className="ml-0 sm:ml-6 mt-4 sm:mb-4 text-center sm:text-left flex-grow">
                             <div className="flex items-center justify-center sm:justify-start gap-4">
                                <h1 className="text-3xl md:text-4xl font-bold text-white">{userData.username}</h1>
                                <div className="flex items-center gap-3 text-gray-400">
                                    {userData.social_links?.twitter && <a href={userData.social_links.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-white"><TwitterIcon /></a>}
                                    {userData.social_links?.discord && <a href={userData.social_links.discord} target="_blank" rel="noopener noreferrer" className="hover:text-white"><DiscordIcon /></a>}
                                    {userData.social_links?.website && <a href={userData.social_links?.website} target="_blank" rel="noopener noreferrer" className="hover:text-white"><WebsiteIcon /></a>}
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
                           <button onClick={() => setActiveTab('favorites')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'favorites' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Favoritos ({favorites.length})</button>
                           <button onClick={() => setActiveTab('lists')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'lists' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Listas ({userLists.length})</button>
                           <button onClick={() => setActiveTab('reviews')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'reviews' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Reseñas ({userData.reviews.length})</button>
                           <button onClick={() => setActiveTab('history')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 ${activeTab === 'history' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>
                                <HistoryIcon /> Historial ({userData.activity.length})
                           </button>
                           {isOwnProfile && (
                                <button onClick={() => setActiveTab('marketplace')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'marketplace' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Marketplace</button>
                           )}
                           {isOwnProfile && (
                                <button onClick={() => setActiveTab('settings')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 ${activeTab === 'settings' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>
                                    <SettingsIcon /> Configuración
                                </button>
                            )}
                        </div>
                        <div>
                            {activeTab === 'overview' && (
                                <OverviewTab
                                    userId={userData.id}
                                    username={userData.username}
                                    recentFavorites={userData.favorites.slice(0, 7)}
                                    initialComments={userData.profile_comments}
                                    totalFavorites={favorites.length}
                                    totalLists={userLists.length}
                                    totalReviews={userData.reviews.length}
                                />
                            )}
                            {activeTab === 'favorites' && (<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-4 gap-y-6 py-8">{userData.favorites.map(manga => <MangaCard key={manga.id} media={manga} />)}</div>)}
                            {activeTab === 'lists' && <CustomListsTab />}
                            {activeTab === 'reviews' && (
                                <ReviewsTab
                                    reviews={userData.reviews}
                                    username={userData.username}
                                    isOwnProfile={isOwnProfile}
                                    onReviewAdded={fetchUserData}
                                />
                            )}
                            {activeTab === 'history' && (
                                <HistoryTab 
                                    activity={userData.activity} 
                                    isOwnProfile={isOwnProfile}
                                    hideAdultContentOnProfile={userData.hide_adult_content_on_profile}
                                />
                            )}
                            {activeTab === 'settings' && isOwnProfile && <SettingsTab />}
                            {activeTab === 'marketplace' && isOwnProfile && <MarketplaceTab />}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default UserProfilePage;
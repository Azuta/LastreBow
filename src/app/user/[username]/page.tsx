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
import ScansTab from '@/components/user/ScansTab';

const TwitterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c-1.6 1.8-3.9 2.1-6 2.1-1.3 0-2.6-.2-3.8-.7a13.34 13.34 0 0 1-5-3c-.1 0-.1 0-.1.1a10 10 0 0 0 2 6c-2.4-1-4.7-3.6-5.4-5.9-.6-2.5-1.1-5.1-.1-7.7A22.84 22.84 0 0 1 2 6.5C3.3 8 5 9 7.2 9a11.1 11.1 0 0 0-4.4 2.8c.8.2 1.6.4 2.4.4-4.8 0-8.8-4-8.8-8.8A9.79 9.79 0 0 1 2.8 2c-1.3 0-2.6-.5-3.8-1.5-.6.2-1.3.4-1.9.4A9.8 9.8 0 0 1 0 10.4a10.29 10.29 0 0 0 16 0A9.95 9.95 0 0 1 22 4z"></path></svg>;
const DiscordIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 2.5a.5.5 0 0 1 .5.5v19a.5.5 0 0 1-1 0V3a.5.5 0 0 1 .5-.5z"/><path d="M13.5 13.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5z"/><path d="M12.5 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-8a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5z"/></svg>;
const WebsiteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2.16 7.42h19.68M2.16 16.58h19.68M8.5 2.16v19.68M15.5 2.16v19.68"/></svg>;
const EditIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const SettingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83l-2.6 2.6a2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.07 1.07c-.16.33-.48.57-.88.57s-.72-.24-.88-.57a1.65 1.65 0 0 0-1.07-1.07 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0l-2.6-2.6a2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.07-1.07c-.16-.33-.48-.57-.88-.57s-.72-.24-.88-.57a1.65 1.65 0 0 0-1.07-1.07c-.16-.33-.48-.57-.88-.57s-.72-.24-.88-.57a1.65 1.65 0 0 0 .33-1.82l.06-.06a2 2 0 0 1 0-2.83l2.6-2.6a2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1.07-1.07c.16-.33.48-.57.88-.57s.72.24.88.57a1.65 1.65 0 0 0-1.82-.33l-.06-.06a2 2 0 0 1 0 2.83l2.6 2.6a2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82z"></path></svg>;
const HistoryIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path><path d="M12 7v5l2 2"></path></svg>;

interface UserProfile {
    id: string;
    username: string;
    avatar_url: string;
    role: string;
    bio: string;
    banner_url: string;
    social_links: { [key: string]: string };
    hide_adult_content_on_profile: boolean;
    primary_scan_id?: string | null;
    primary_scan_name?: string | null;
    followed_groups: string[];
    favorites: Media[];
    lists: UserList[];
    profile_comments: any[];
    reviews: any[];
    activity: any[];
}

const UserProfilePage = ({ params }: { params: { username: string } }) => {
    const { username: initialUsername } = use(params);
    const { profile: loggedInUserProfile, addToast, favorites, userLists, followedScanGroups } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const supabase = createClient();

    const isOwnProfile = loggedInUserProfile?.username === initialUsername;

    const fetchUserData = useCallback(async () => {
        setIsLoading(true);
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select(`
                *,
                scan_groups!profiles_scan_group_id_fkey(id, name)
            `)
            .eq('username', initialUsername)
            .single();
        // -------------------------
        if (profileError || !profile) {
            return notFound();
        }

        const favoritesData = await fetchFavoritesByUserId(profile.id);
        const { data: lists } = await supabase.from('user_lists').select('*').eq('user_id', profile.id);
        const { data: comments } = await supabase.from('profile_comments').select('*, author:profiles!author_id(*)').eq('profile_id', profile.id).order('created_at', { ascending: false });
        const { data: reviews } = await supabase.from('reviews').select('*, media:media_id(*)').eq('user_id', profile.id).order('created_at', { ascending: false });
        const { data: activity } = await supabase.from('user_activity').select('*').eq('user_id', profile.id).order('created_at', { ascending: false });

        const formattedProfile = {
            ...profile,
            primary_scan_id: profile.primary_scan?.id,
            primary_scan_name: profile.primary_scan?.name,
            followed_groups: profile.followed_scans?.map(s => s.group_id) || [],
            favorites: favoritesData,
            lists: lists || [],
            profile_comments: comments || [],
            reviews: reviews || [],
            activity: activity || [],
        };

        setUserData(formattedProfile);
        setIsLoading(false);
    }, [initialUsername, supabase]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    useEffect(() => {
        if (isOwnProfile) {
          fetchUserData();
        }
    }, [favorites, userLists, followedScanGroups, isOwnProfile, fetchUserData]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleSaveSuccess = async (updatedProfile: any | null) => {
        if (updatedProfile && updatedProfile.username) {
            addToast('Perfil actualizado con éxito', 'success');
            if (updatedProfile.username !== initialUsername) {
                router.push(`/user/${updatedProfile.username}`);
            } else {
                setUserData(prevData => {
                    if (prevData) {
                        return { ...prevData, ...updatedProfile };
                    }
                    return null;
                });
            }
        }
    };
    
    if (isLoading || !userData) {
        return (<><Navbar /><div className="text-center py-20 text-white">Cargando perfil...</div></>);
    }

    const scanTabTitle = userData.primary_scan_id ? 'Mi Scan' : `Scans (${userData.followed_groups.length})`;

    return (
        <>
            <Navbar />
            <ProfileEditModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveSuccess}
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
                            <button onClick={() => setActiveTab('scans')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'scans' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>
                                {scanTabTitle}
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
                                                        {/* Renderiza el nuevo componente ScansTab */}
                            {activeTab === 'scans' && <ScansTab />}

                            {activeTab === 'history' && (
                                <HistoryTab 
                                    activity={userData.activity} 
                                    isOwnProfile={isOwnProfile}
                                    hideAdultContentOnProfile={userData.hide_adult_content_on_profile}
                                />
                            )}
                            {activeTab === 'scans' && (
                                <div className="text-center py-20">
                                  {userData.primary_scan_id ? (
                                    <div className="flex flex-col items-center">
                                      <p className="text-xl font-semibold text-white">Mi Scan Único: <span className="text-indigo-400 font-medium">{userData.primary_scan_name}</span></p>
                                      <p className="text-gray-400 mt-2">Próximamente más detalles sobre los scans del usuario.</p>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center">
                                      <p className="text-xl font-semibold text-white">Scans Seguidos</p>
                                      <p className="text-gray-400 mt-2">Próximamente podrás ver los scans que sigues aquí.</p>
                                    </div>
                                  )}
                                </div>
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
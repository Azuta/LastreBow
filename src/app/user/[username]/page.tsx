// src/app/user/[username]/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import MangaCard from '@/components/ui/cards/MangaCard';
import { dailyRankingMock, weeklyRankingMock, monthlyRankingMock, mockUserLists, mockAchievements } from '@/mock/mediaData';
import { Media, UserList, Achievement } from '@/types/AniListResponse';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CustomListsTab from '@/components/user/CustomListsTab';
import AchievementsTab from '@/components/user/AchievementsTab'; // <-- AÑADIDO

// --- Iconos Reutilizables ---
const BookIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const HeartIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const EyeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;

// --- Pestaña de Configuración ---
const SettingsSwitch = ({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void; }) => ( <div className="flex items-center justify-between p-4 rounded-lg bg-gray-700/30"><div_><h4 className="font-semibold text-white">{label}</h4><p className="text-sm text-gray-400">{description}</p></div_><label className="theme-switch"><input type="checkbox" checked={checked} onChange={onChange} /><span className="slider"></span></label></div> );
const SettingsOption = ({ label, description, value, options, onChange }: { label: string; description: string; value: string; options: string[]; onChange: (value: any) => void; }) => ( <div className="p-4 rounded-lg bg-gray-700/30"><div><h4 className="font-semibold text-white">{label}</h4><p className="text-sm text-gray-400 mb-3">{description}</p></div><div className="flex gap-2 bg-gray-800/50 p-1 rounded-lg">{options.map(option => ( <button key={option} onClick={() => onChange(option)} className={`flex-1 capitalize py-1.5 text-sm font-semibold rounded-md transition-colors ${value === option ? 'bg-[#ffbade] text-black' : 'hover:bg-gray-600/50 text-gray-300'}`}>{option}</button>))}</div></div>);
const SettingsTab = () => {
    const { viewMode, paginationStyle, warnOnExternalLinks, hideExternalLinks, showAdultContent, hideAdultContentOnProfile, toggleViewMode, togglePaginationStyle, setWarnOnExternalLinks, setHideExternalLinks, setShowAdultContent, setHideAdultContentOnProfile } = useUserPreferences();
    return (
        <div className="max-w-screen-md mx-auto space-y-10 py-8">
            <section>
                <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-2 mb-6">Navegación</h2>
                <div className="space-y-4">
                    <SettingsOption label="Modo de Vista" description="Elige cómo se muestran las listas de mangas." value={viewMode} options={['grid', 'list']} onChange={toggleViewMode} />
                    <SettingsOption label="Paginación" description="Selecciona entre páginas numeradas o scroll infinito." value={paginationStyle} options={['pagination', 'infinite']} onChange={togglePaginationStyle} />
                </div>
            </section>
            <section>
                <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-2 mb-6">Contenido y Seguridad</h2>
                <div className="space-y-4">
                    <SettingsSwitch label="Advertir sobre enlaces externos" description="Muestra un aviso antes de redirigirte a un sitio externo." checked={warnOnExternalLinks} onChange={() => setWarnOnExternalLinks(!warnOnExternalLinks)} />
                    <SettingsSwitch label="Ocultar enlaces externos" description="Esconde los botones que llevan a sitios de lectura externos." checked={hideExternalLinks} onChange={() => setHideExternalLinks(!hideExternalLinks)} />
                    <SettingsSwitch label="Mostrar contenido +18 en el sitio" description="Permite ver mangas y contenido para adultos mientras navegas." checked={showAdultContent} onChange={() => setShowAdultContent(!showAdultContent)} />
                    <SettingsSwitch label="Ocultar contenido +18 en mi perfil" description="Oculta tus mangas para adultos de tu perfil público (aparecerán con un candado)." checked={hideAdultContentOnProfile} onChange={() => setHideAdultContentOnProfile(!hideAdultContentOnProfile)} />
                </div>
            </section>
        </div>
    );
};

// --- Pestaña de Siguiendo ---
const MOCK_FOLLOWED_USERS = [ { id: 'user001', username: 'MangaReaderX', avatarUrl: 'https://i.pravatar.cc/150?u=user001', listsCount: 5, favoritesCount: 25 }, { id: 'user002', username: 'SakuraFan', avatarUrl: 'https://i.pravatar.cc/150?u=user002', listsCount: 3, favoritesCount: 18 }, ];
const FollowedUserCard = ({ user, onUnfollow }: { user: typeof MOCK_FOLLOWED_USERS[0], onUnfollow: (userId: string) => void }) => ( <div className="bg-[#201f31] rounded-lg p-4 flex items-center gap-4 justify-between"><Link href={`/user/${user.username}`} className="flex items-center gap-4 group w-full"><div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0"><Image src={user.avatarUrl} alt={user.username} layout="fill" objectFit="cover" /></div><div><h3 className="font-bold text-lg text-white group-hover:text-[#ffbade] transition-colors">{user.username}</h3><p className="text-sm text-gray-400">{user.listsCount} listas · {user.favoritesCount} favoritos</p></div></Link><button onClick={() => onUnfollow(user.id)} className="w-full sm:w-auto px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg text-sm font-semibold hover:bg-red-900/60 hover:text-red-300 transition-colors flex-shrink-0">Dejar de seguir</button></div>);
const FollowsTab = () => { const [followedUsers, setFollowedUsers] = useState(MOCK_FOLLOWED_USERS); const handleUnfollow = (userId: string) => setFollowedUsers(p => p.filter(u => u.id !== userId)); return (<div className="max-w-screen-md mx-auto space-y-4 py-8">{followedUsers.map(user => <FollowedUserCard key={user.id} user={user} onUnfollow={handleUnfollow} />)}</div>); };

// --- Pestaña de Grupos ---
const MOCK_SCAN_GROUPS = [ { id: 'group001', name: 'No Sleep Scans', logoUrl: 'https://i.pravatar.cc/150?u=group001', membersCount: 12, projectsCount: 5 }, { id: 'group002', name: 'Shadow Garden Scans', logoUrl: 'https://i.pravatar.cc/150?u=group002', membersCount: 8, projectsCount: 3 }, ];
const ScanGroupCard = ({ group, onLeave }: { group: typeof MOCK_SCAN_GROUPS[0], onLeave: (groupId: string) => void }) => ( <div className="bg-[#201f31] rounded-lg p-4 flex items-center gap-4 justify-between"><Link href={`/group/${group.id}`} className="flex items-center gap-4 group w-full"><div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0"><Image src={group.logoUrl} alt={group.name} layout="fill" objectFit="cover" /></div><div><h3 className="font-bold text-lg text-white group-hover:text-[#ffbade] transition-colors">{group.name}</h3><p className="text-sm text-gray-400">{group.membersCount} miembros · {group.projectsCount} proyectos</p></div></Link><button onClick={() => onLeave(group.id)} className="w-full sm:w-auto px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg text-sm font-semibold hover:bg-red-900/60 hover:text-red-300 transition-colors flex-shrink-0">Abandonar</button></div>);
const GroupsTab = () => { const [groups, setGroups] = useState(MOCK_SCAN_GROUPS); const handleLeaveGroup = (groupId: string) => setGroups(p => p.filter(g => g.id !== groupId)); return (<div className="max-w-screen-md mx-auto space-y-4 py-8">{groups.map(group => <ScanGroupCard key={group.id} group={group} onLeave={handleLeaveGroup} />)}</div>); };

// --- Pestaña de Actividad ---
const ActivityFeed = ({ activities }: { activities: any[] }) => ( <div className="max-w-screen-md mx-auto space-y-6 py-8">{activities.map(act => (<div key={act.id} className="flex items-start gap-4"><div className="bg-gray-700/50 p-2 rounded-full mt-1">{act.type === 'read' ? <BookIcon /> : act.type === 'favorite' ? <HeartIcon /> : <EyeIcon />}</div><div className="text-sm text-gray-300"><span className="font-bold text-white">{act.user}</span> {act.action} <Link href={`/media/${act.mediaId}`} className="font-semibold text-[#ffbade] hover:underline">{act.mediaTitle}</Link>.<p className="text-xs text-gray-500 mt-1">{act.timestamp}</p></div></div>))}</div>);

// --- Pestaña de Estadísticas ---
const COLORS = ['#ffbade', '#8884d8', '#82ca9d', '#ffc658', '#FF8042'];
const StatsTab = ({ genreData, scoreData }: { genreData: any[], scoreData: any[] }) => (
    <div className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
                <h3 className="text-xl font-bold text-white mb-4 text-center">Géneros Favoritos</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={genreData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{genreData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div>
                <h3 className="text-xl font-bold text-white mb-4 text-center">Distribución de Puntuaciones</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={scoreData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                        <YAxis stroke="#888888" fontSize={12} />
                        <Tooltip wrapperClassName="!bg-[#201f31] !border-gray-700" />
                        <Bar dataKey="count" fill="#ffbade" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
);

// --- Tipos y Datos de Prueba ---
type UserProfile = { username: string; avatarUrl: string; bannerUrl: string; bio: string; pinnedFavorites: Media[]; stats: { mangasLeidos: number; capitulosLeidos: number; meGustaDados: number; }; favorites: Media[]; activity: any[]; genreStats: any[]; scoreStats: any[]; lists: UserList[]; achievements: Achievement[]; };
const fetchUserDataFromAPI = async (username: string): Promise<UserProfile | null> => {
    const MOCK_USER_DATABASE: { [key: string]: UserProfile } = {
        Dymedis: { username: "Dymedis", avatarUrl: "https://mangadex.org/covers/8754fb67-d7f1-45f8-ad40-e4c218ba5836/605caded-f8d6-483b-a5e7-bd0ead4244b7.png.512.jpg", bannerUrl: "https://s4.anilist.co/file/anilistcdn/user/banner/b608823-1ZJ0Z6dM224R.jpg", bio: "Amante del seinen y los isekai bien construidos. Siempre en busca de la próxima joya oculta.", pinnedFavorites: dailyRankingMock.slice(0, 3).map(m => ({...m, isPrivate: Math.random() > 0.5})), stats: { mangasLeidos: 124, capitulosLeidos: 4820, meGustaDados: 890 }, favorites: dailyRankingMock.slice(0, 14).map(m => ({...m, isPrivate: Math.random() > 0.5})), activity: [ {id: 1, user: 'Dymedis', action: 'marcó el capítulo 180 de', mediaTitle: 'Berserk', mediaId: 30002, timestamp: 'hace 2 horas', type: 'read'}, {id: 2, user: 'Dymedis', action: 'añadió a favoritos', mediaTitle: 'Vagabond', mediaId: 30656, timestamp: 'hace 5 horas', type: 'favorite'}, {id: 3, user: 'Dymedis', action: 'empezó a seguir a', mediaTitle: 'MangaReaderX', mediaId: 'user001', timestamp: 'hace 1 día', type: 'follow'} ], genreStats: [ { name: 'Acción', value: 40 }, { name: 'Fantasía', value: 30 }, { name: 'Seinen', value: 20 }, { name: 'Drama', value: 10 } ], scoreStats: [ { name: '10', count: 15 }, { name: '9', count: 30 }, { name: '8', count: 45 }, { name: '7', count: 20 }, { name: '6', count: 5 } ], lists: mockUserLists, achievements: mockAchievements }
    };
    await new Promise(resolve => setTimeout(resolve, 500));
    // @ts-ignore
    const user = MOCK_USER_DATABASE[username];
    return user || null;
};

// --- Componente Principal de la Página de Perfil ---
const UserProfilePage = ({ params }: { params: { username: string } }) => {
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'favorites' | 'lists' | 'achievements' | 'activity' | 'stats' | 'follows' | 'groups' | 'settings'>('overview');
    const { hideAdultContentOnProfile } = useUserPreferences();

    useEffect(() => { const loadUserData = async () => { setIsLoading(true); const data = await fetchUserDataFromAPI(params.username); if (data) { setUserData(data); } else { notFound(); } setIsLoading(false); }; loadUserData(); }, [params.username]);

    const visibleFavorites = useMemo(() => {
        if (!userData) return [];
        if (hideAdultContentOnProfile) {
            return userData.favorites.filter(fav => !fav.isPrivate);
        }
        return userData.favorites;
    }, [userData, hideAdultContentOnProfile]);

    if (isLoading) return (<><Navbar /><div className="text-center py-20 text-white">Cargando perfil...</div></>);
    if (!userData) return notFound();

    return (
        <>
            <Navbar />
            <main>
                <div className="relative h-48 md:h-64 w-full"><Image src={userData.bannerUrl} alt={`${userData.username}'s Banner`} layout="fill" objectFit="cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#1a1a24] to-transparent"></div></div>
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20">
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-[#1a1a24] shadow-lg flex-shrink-0"><Image src={userData.avatarUrl} alt={userData.username} layout="fill" objectFit="cover" /></div>
                        <div className="ml-0 sm:ml-6 mt-4 sm:mb-4 text-center sm:text-left">
                            <h1 className="text-3xl md:text-4xl font-bold text-white">{userData.username}</h1>
                            <p className="text-gray-400 mt-2 max-w-lg">{userData.bio}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#201f31] p-4 rounded-lg my-8">
                        <div className="text-center"><p className="text-2xl font-bold text-[#ffbade]">{userData.stats.mangasLeidos}</p><p className="text-sm text-gray-400">Mangas Leídos</p></div>
                        <div className="text-center"><p className="text-2xl font-bold text-[#ffbade]">{userData.stats.capitulosLeidos}</p><p className="text-sm text-gray-400">Capítulos Leídos</p></div>
                        <div className="text-center"><p className="text-2xl font-bold text-[#ffbade]">{userData.stats.meGustaDados}</p><p className="text-sm text-gray-400">Me Gusta</p></div>
                        <div className="text-center self-center"><button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">Editar Perfil</button></div>
                    </div>
                    <div>
                        <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
                            <button onClick={() => setActiveTab('overview')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-colors flex-shrink-0 ${activeTab === 'overview' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Resumen</button>
                            <button onClick={() => setActiveTab('favorites')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-colors flex-shrink-0 ${activeTab === 'favorites' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Favoritos</button>
                            <button onClick={() => setActiveTab('lists')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-colors flex-shrink-0 ${activeTab === 'lists' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Listas</button>
                            <button onClick={() => setActiveTab('achievements')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-colors flex-shrink-0 ${activeTab === 'achievements' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Logros</button>
                            <button onClick={() => setActiveTab('activity')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-colors flex-shrink-0 ${activeTab === 'activity' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Actividad</button>
                            <button onClick={() => setActiveTab('stats')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-colors flex-shrink-0 ${activeTab === 'stats' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Estadísticas</button>
                            <button onClick={() => setActiveTab('follows')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-colors flex-shrink-0 ${activeTab === 'follows' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Siguiendo</button>
                            <button onClick={() => setActiveTab('groups')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-colors flex-shrink-0 ${activeTab === 'groups' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Grupos</button>
                            <button onClick={() => setActiveTab('settings')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-colors flex-shrink-0 ${activeTab === 'settings' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Configuración</button>
                        </div>
                        <div>
                            {activeTab === 'overview' && (<div className="py-8"><h3 className="text-xl font-bold text-white mb-4">Favoritos Fijados</h3><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-4 gap-y-6">{userData.pinnedFavorites.map(manga => (<MangaCard key={manga.id} media={manga} isPrivate={manga.isPrivate && hideAdultContentOnProfile} />))}</div></div>)}
                            {activeTab === 'favorites' && (<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-4 gap-y-6">{visibleFavorites.map(manga => (<MangaCard key={manga.id} media={manga} isPrivate={manga.isPrivate && hideAdultContentOnProfile} />))}</div>)}
                            {activeTab === 'lists' && <CustomListsTab lists={userData.lists} username={userData.username} />}
                            {activeTab === 'achievements' && <AchievementsTab achievements={userData.achievements} />}
                            {activeTab === 'activity' && <ActivityFeed activities={userData.activity} />}
                            {activeTab === 'stats' && <StatsTab genreData={userData.genreStats} scoreData={userData.scoreStats} />}
                            {activeTab === 'follows' && <FollowsTab />}
                            {activeTab === 'groups' && <GroupsTab />}
                            {activeTab === 'settings' && <SettingsTab />}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default UserProfilePage;
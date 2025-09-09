// src/app/group/[groupId]/page.tsx
"use client";

import { useState, useEffect, use} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import ProjectCard from '@/components/ui/cards/ProjectCard';
import { dailyRankingMock } from '@/mock/mediaData';
import { Media } from '@/types/AniListResponse';
import { useAuth } from '@/context/AuthContext';

// --- Iconos ---
const UserIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const BookOpenIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;

// --- Tipos y Datos de Prueba Completos ---
type ScanGroup = { id: string; name: string; logoUrl: string; bannerUrl: string; description: string; membersCount: number; projectsCount: number; projects: Media[]; members: { id: string; username: string; avatarUrl: string; role: 'Líder' | 'Miembro' }[]; socials: { twitter?: string; discord?: string; website?: string; } };

const MOCK_GROUP_DATA: { [key: string]: ScanGroup } = {
    'group001': { id: 'group001', name: 'No Sleep Scans', logoUrl: 'https://i.pravatar.cc/150?u=group001', bannerUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/banner/m105778-y0sYV9Z5W2oA.jpg', description: 'Dedicados a traer los mejores mangas de acción y seinen.', membersCount: 12, projectsCount: 5, projects: dailyRankingMock.slice(0, 5).map(p => ({...p, chapters: Math.floor(Math.random()*200), collaboratorsCount: Math.floor(Math.random()*10)+2})), members: [ { id: 'user004', username: 'Kaiser', avatarUrl: 'https://i.pravatar.cc/150?u=user004', role: 'Líder' }, { id: 'user005', username: 'Zephyr', avatarUrl: 'https://i.pravatar.cc/150?u=user005', role: 'Miembro' } ], socials: { twitter: 'https://twitter.com/NoSleep', discord: 'https://discord.gg/nosleep' } },
    'group002': { id: 'group002', name: 'Shadow Garden Scans', logoUrl: 'https://i.pravatar.cc/150?u=group002', bannerUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/banner/m30002-Qxs7j430c4aE.jpg', description: 'Traducciones de alta calidad para obras de misterio y fantasía.', membersCount: 8, projectsCount: 3, projects: dailyRankingMock.slice(5, 8).map(p => ({...p, chapters: Math.floor(Math.random()*100), collaboratorsCount: Math.floor(Math.random()*5)+2})), members: [ { id: 'user006', username: 'Alpha', avatarUrl: 'https://i.pravatar.cc/150?u=user006', role: 'Líder' } ], socials: { discord: 'https://discord.gg/shadow' } },
    'group003': { id: 'group003', name: 'Isekai Fanatics', logoUrl: 'https://i.pravatar.cc/150?u=group003', bannerUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/banner/m105398-fJ272A9Txd5j.jpg', description: '¡Tu fuente número uno para todo lo relacionado con el Isekai!', membersCount: 25, projectsCount: 15, projects: dailyRankingMock.slice(2, 7).map(p => ({...p, chapters: Math.floor(Math.random()*50), collaboratorsCount: Math.floor(Math.random()*15)+2})), members: [ { id: 'user007', username: 'Truck-kun', avatarUrl: 'https://i.pravatar.cc/150?u=user007', role: 'Líder' } ], socials: { website: 'https://isekaifans.com' } },
    'group004': { id: 'group004', name: 'Romance Lovers', logoUrl: 'https://i.pravatar.cc/150?u=group004', bannerUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/banner/m99324-h5e2jCB2N34g.jpg', description: 'Especialistas en Shojo y Josei. Historias que te tocarán el corazón.', membersCount: 18, projectsCount: 9, projects: [], members: [], socials: {}}
};

// --- CORRECCIÓN AQUÍ ---
const GroupPage = ({ params }: { params: { groupId: string } }) => {
    const { groupId } = use(params); // Modified: Used the 'use' hook
    // -------------------

    const [groupData, setGroupData] = useState<ScanGroup | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'projects' | 'members' | 'settings'>('projects');
    const { user, toggleFollowGroup, isLoggedIn } = useAuth();

    useEffect(() => {
        const loadGroupData = async () => {
            setIsLoading(true);
            const data = MOCK_GROUP_DATA[groupId]; // Usar la variable desestructurada
            if (data) {
                setGroupData(data);
            } else {
                notFound();
            }
            setIsLoading(false);
        };
        loadGroupData();
    }, [groupId]); // Usar la variable en el array de dependencias

    const isFollowing = user?.followedScanGroups.includes(groupId) || false;

    if (isLoading || !groupData) {
        return <><Navbar /><div className="text-center py-20 text-white">Cargando grupo...</div></>;
    }

    return (
        <>
            <Navbar />
            <main>
                <div className="relative h-48 md:h-64 w-full">
                    <Image src={groupData.bannerUrl} alt={`${groupData.name} Banner`} fill style={{ objectFit: 'cover' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a24] to-transparent"></div>
                </div>
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20">
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-md overflow-hidden border-4 border-[#1a1a24] shadow-lg flex-shrink-0">
                            <Image src={groupData.logoUrl} alt={groupData.name} fill style={{ objectFit: 'cover' }} />
                        </div>
                        <div className="ml-0 sm:ml-6 mt-4 sm:mb-4 text-center sm:text-left">
                            <h1 className="text-3xl md:text-4xl font-bold text-white">{groupData.name}</h1>
                            <p className="text-gray-400 mt-2 max-w-lg">{groupData.description}</p>
                            <div className="flex flex-wrap gap-4 mt-4 justify-center sm:justify-start">
                                <div className="flex items-center gap-1 text-sm text-gray-400"><UserIcon /> {groupData.membersCount} Miembros</div>
                                <div className="flex items-center gap-1 text-sm text-gray-400"><BookOpenIcon /> {groupData.projectsCount} Proyectos</div>
                                {isLoggedIn && (
                                    <button 
                                        onClick={() => toggleFollowGroup(groupId)}
                                        className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${
                                            isFollowing 
                                                ? 'bg-[#ffbade] text-black' 
                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                        }`}
                                    >
                                        {isFollowing ? 'Siguiendo' : 'Seguir'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-8">
                        <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
                            <button onClick={() => setActiveTab('projects')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-colors flex-shrink-0 ${activeTab === 'projects' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Proyectos</button>
                            <button onClick={() => setActiveTab('members')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-colors flex-shrink-0 ${activeTab === 'members' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Miembros</button>
                            <button onClick={() => setActiveTab('settings')} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-colors flex-shrink-0 ${activeTab === 'settings' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Settings</button>
                        </div>
                        <div>
                            {activeTab === 'projects' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {groupData.projects.map(project => <ProjectCard key={project.id} project={project} />)}
                                </div>
                            )}
                            {activeTab === 'members' && (
                                <div className="max-w-screen-md mx-auto space-y-4 py-8">
                                    {groupData.members.map(member => <div key={member.id} className="bg-[#201f31] rounded-lg p-4 flex items-center gap-4"><div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0"><Image src={member.avatarUrl} alt={member.username} fill style={{ objectFit: 'cover' }} /></div><div><h3 className="font-bold text-white">{member.username}</h3><p className="text-sm text-[#ffbade]">{member.role}</p></div></div>)}
                                </div>
                            )}
                            {activeTab === 'settings' && (
                                <div className="max-w-screen-md mx-auto bg-[#201f31] p-8 rounded-lg">
                                    <form className="space-y-6">
                                        <h3 className="text-2xl font-bold text-white">Redes Sociales</h3>
                                        <div><label htmlFor="twitter" className="block text-sm font-medium text-gray-300 mb-2">Twitter</label><input type="url" id="twitter" defaultValue={groupData.socials.twitter} placeholder="https://twitter.com/usuario" className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffbade]" /></div>
                                        <div><label htmlFor="discord" className="block text-sm font-medium text-gray-300 mb-2">Discord</label><input type="url" id="discord" defaultValue={groupData.socials.discord} placeholder="https://discord.gg/servidor" className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffbade]" /></div>
                                        <div><label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-2">Sitio Web</label><input type="url" id="website" defaultValue={groupData.socials.website} placeholder="https://miscan.com" className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffbade]" /></div>
                                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">Guardar Cambios</button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default GroupPage;
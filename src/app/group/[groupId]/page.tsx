// src/app/group/[groupId]/page.tsx
"use client";

import { useState, useEffect, use, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ProjectCard from "@/components/ui/cards/ProjectCard";
import { dailyRankingMock } from "@/mock/mediaData";
import { Media, ScanGroup } from "@/types/AniListResponse";
import { useAuth } from "@/context/AuthContext";
import CommentsSection from "@/components/media/CommentsSection";
import { createClient } from '@/lib/supabaseClient';

const supabase = createClient();

// --- NUEVOS IMPORTS ---
import ProjectKanban from '@/components/management/ProjectKanban';
import RecruitmentTab from '@/components/group/RecruitmentTab';
import AnalyticsTab from '@/components/group/AnalyticsTab';

// --- Iconos ---
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
  </svg>
);
const BookOpenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);
const ClipboardIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>;
const BriefcaseIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const BarChartIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>;
const DollarSignIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;

// Datos de prueba para simular datos que no están en la tabla `scan_groups`
const MOCK_GROUP_DATA: { [key: string]: { projects: Media[]; members: any[]; socials: any; announcements: any[]; } } = {
  group001: {
    projects: dailyRankingMock
      .slice(0, 5)
      .map((p) => ({
        ...p,
        chapters: Math.floor(Math.random() * 200),
        collaboratorsCount: Math.floor(Math.random() * 10) + 2,
      })),
    members: [
      { id: "user004", username: "Kaiser", avatarUrl: "https://i.pravatar.cc/150?u=user004", role: "Líder" },
      { id: "user005", username: "Zephyr", avatarUrl: "https://i.pravatar.cc/150?u=user005", role: "Miembro" },
    ],
    socials: {
      twitter: "https://twitter.com/NoSleep",
      discord: "https://discord.gg/nosleep",
      patreon: "https://www.patreon.com/nosleep",
    },
    announcements: [
      { id: 1, title: "¡Buscamos Editores!", content: "Estamos buscando editores con experiencia en Photoshop para unirse a nuestro equipo.", date: "hace 2 días" },
    ],
  },
  group002: {
    projects: dailyRankingMock
      .slice(5, 8)
      .map((p) => ({
        ...p,
        chapters: Math.floor(Math.random() * 100),
        collaboratorsCount: Math.floor(Math.random() * 5) + 2,
      })),
    members: [
      { id: "user006", username: "Alpha", avatarUrl: "https://i.pravatar.cc/150?u=user006", role: "Líder" },
    ],
    socials: { discord: "https://discord.gg/shadow" },
    announcements: [],
  },
};

const GroupPage = ({ params }: { params: { groupId: string } }) => {
    const { groupId } = use(params);
    const [groupData, setGroupData] = useState<ScanGroup | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("projects");
    const { profile, followedScanGroups, toggleFollowGroup, isLoggedIn } = useAuth();

    useEffect(() => {
      const loadGroupData = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('scan_groups')
            .select(`*, members:profiles!profiles_scan_group_id_fkey(id, username, avatar_url, role)`)
            .eq('id', groupId)
            .single();

        if (error || !data) {
            console.error("Error fetching group:", error);
            const mockData = MOCK_GROUP_DATA[groupId];
            if (mockData) {
                setGroupData({ ...mockData, id: groupId, name: `Mock Group ${groupId}`, logo_url: mockData.members[0]?.avatarUrl || '', banner_url: dailyRankingMock[0]?.bannerImage });
            } else {
                notFound();
            }
        } else {
            setGroupData(data);
        }
        setIsLoading(false);
      };
      loadGroupData();
    }, [groupId]);

    const isFollowing = followedScanGroups.includes(groupId);
    const isMember = profile?.scan_group_id === groupId;

    if (isLoading || !groupData) {
        return (
            <>
                <Navbar />
                <div className="text-center py-20 text-white">Cargando grupo...</div>
            </>
        );
    }
    
    const extraData = MOCK_GROUP_DATA[groupData.id] || { projects: dailyRankingMock.slice(0, 5), members: [], socials: {}, announcements: [] };


    return (
        <>
            <Navbar />
            <main>
                <div className="relative h-48 md:h-64 w-full">
                    {groupData.banner_url && (
                         <Image src={groupData.banner_url} alt={`${groupData.name} Banner`} fill style={{ objectFit: "cover" }} sizes="100vw" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a24] to-transparent"></div>
                </div>
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-32 relative">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-4">
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-md overflow-hidden border-4 border-[#1a1a24] shadow-lg flex-shrink-0">
                            {groupData.logo_url && (
                                <Image src={groupData.logo_url} alt={groupData.name} fill style={{ objectFit: "cover" }} sizes="160px" />
                            )}
                        </div>
                        <div className="flex-grow mt-4 sm:mt-0 text-center sm:text-left">
                            <h1 className="text-3xl md:text-4xl font-bold text-white">{groupData.name}</h1>
                            <p className="text-gray-400 mt-2 max-w-lg">{groupData.description}</p>
                            <div className="flex flex-wrap gap-4 mt-4 justify-center sm:justify-start">
                                <div className="flex items-center gap-1 text-sm text-gray-400"><UserIcon /> {groupData.members?.length || 0} Miembros</div>
                                <div className="flex items-center gap-1 text-sm text-gray-400"><BookOpenIcon /> {extraData.projects.length} Proyectos</div>
                                {isLoggedIn && (
                                    <button
                                        onClick={() => toggleFollowGroup(groupId, groupData.name)}
                                        className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${
                                            isFollowing ? "bg-[#ffbade] text-black" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                        }`}
                                    >
                                        {isFollowing ? "Siguiendo" : "Seguir"}
                                    </button>
                                )}
                                {extraData.socials.patreon && (
                                    <a href={extraData.socials.patreon} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-[#FF424D] text-white hover:opacity-90 transition-opacity">
                                        <DollarSignIcon /> Apoyar en Patreon
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-8">
                        <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
                            <button onClick={() => setActiveTab("projects")} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === "projects" ? "text-white border-[#ffbade]" : "text-gray-400 border-transparent hover:text-white"}`}>Proyectos</button>
                            {isMember && (
                                <button onClick={() => setActiveTab("management")} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 ${activeTab === "management" ? "text-white border-[#ffbade]" : "text-gray-400 border-transparent hover:text-white"}`}><ClipboardIcon /> Gestión</button>
                            )}
                            <button onClick={() => setActiveTab("announcements")} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === "announcements" ? "text-white border-[#ffbade]" : "text-gray-400 border-transparent hover:text-white"}`}>Anuncios</button>
                            <button onClick={() => setActiveTab("recruitment")} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 ${activeTab === "recruitment" ? "text-white border-[#ffbade]" : "text-gray-400 border-transparent hover:text-white"}`}><BriefcaseIcon /> Reclutamiento</button>
                            <button onClick={() => setActiveTab("community")} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === "community" ? "text-white border-[#ffbade]" : "text-gray-400 border-transparent hover:text-white"}`}>Comunidad</button>
                            <button onClick={() => setActiveTab("members")} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === "members" ? "text-white border-[#ffbade]" : "text-gray-400 border-transparent hover:text-white"}`}>Miembros</button>
                            {isMember && (
                                <button onClick={() => setActiveTab("analytics")} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 ${activeTab === "analytics" ? "text-white border-[#ffbade]" : "text-gray-400 border-transparent hover:text-white"}`}><BarChartIcon /> Analíticas</button>
                            )}
                        </div>

                        <div>
                            {activeTab === "projects" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {extraData.projects.map((project) => (
                                        <ProjectCard key={project.id} project={project} />
                                    ))}
                                </div>
                            )}
                            {activeTab === "management" && isMember && <ProjectKanban />}
                            {activeTab === "announcements" && (
                                <div className="max-w-screen-md mx-auto space-y-4 py-8">
                                    {extraData.announcements.map((ann) => (
                                        <div key={ann.id} className="bg-[#201f31] rounded-lg p-4">
                                            <h4 className="font-bold text-white">{ann.title}</h4>
                                            <p className="text-xs text-gray-500 mb-2">{ann.date}</p>
                                            <p className="text-sm text-gray-300">{ann.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {activeTab === "recruitment" && <RecruitmentTab />}
                            {activeTab === "community" && (
                                <div className="max-w-screen-md mx-auto py-8">
                                    <CommentsSection initialComments={[]} mediaId={0} />
                                </div>
                            )}
                            {activeTab === "members" && (
                                <div className="max-w-screen-md mx-auto space-y-4 py-8">
                                    {groupData.members?.map((member) => (
                                        <div key={member.id} className="bg-[#201f31] rounded-lg p-4 flex items-center gap-4">
                                            <div className="relative w-12 h-12 rounded-full overflow-hidden">
                                                {member.avatar_url && (
                                                    <Image src={member.avatar_url} alt={member.username} fill style={{ objectFit: "cover" }} />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">{member.username}</h3>
                                                <p className="text-sm text-[#ffbade]">{member.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {activeTab === "analytics" && isMember && <AnalyticsTab />}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default GroupPage;
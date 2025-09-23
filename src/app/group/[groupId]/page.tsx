// src/app/group/[groupId]/page.tsx
"use client";

import { useState, useEffect, use, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ProjectCard from "@/components/ui/cards/ProjectCard";
import { Media, ScanGroup, Announcement, ScanHistoryItem } from "@/types/AniListResponse";
import { useAuth } from "@/context/AuthContext";
import CommentsSection from "@/components/media/CommentsSection";
import { createClient } from '@/lib/supabaseClient';
import { fetchGroupAnnouncements, fetchScanHistory, createProjectProposal, createAnnouncement, addProjectToGroup, fetchGroupProjects } from '@/services/fetchAniList';

const supabase = createClient();

import ProjectKanban from '@/components/management/ProjectKanban';
import AnalyticsTab from '@/components/group/AnalyticsTab';
import ProposeProjectModal from '@/components/group/ProposeProjectModal';
import ScanHistoryTab from '@/components/group/ScanHistoryTab';
import GroupSettingsTab from '@/components/group/GroupSettingsTab';
import AdvancedRecruitmentTab from '@/components/group/AdvancedRecruitmentTab';

const PlusIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const UserIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const BookOpenIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const ClipboardIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>;
const BriefcaseIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const BarChartIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>;
const DollarSignIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const HistoryIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path><path d="M12 7v5l2 2"></path></svg>;
const SettingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83l-2.6 2.6a2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.07 1.07c-.16.33-.48.57-.88.57s-.72-.24-.88-.57a1.65 1.65 0 0 0-1.07-1.07 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0l-2.6-2.6a2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.07-1.07c-.16-.33-.48-.57-.88-.57s-.72-.24-.88-.57a1.65 1.65 0 0 0 .33-1.82l-.06-.06a2 2 0 0 1 0-2.83l2.6-2.6a2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1.07-1.07c.16-.33.48-.57.88-.57s.72.24.88-.57a1.65 1.65 0 0 0-1.82-.33l-.06-.06a2 2 0 0 1 0 2.83l2.6 2.6a2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82z"></path></svg>;
const DashboardIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>;

const GroupPage = ({ params }: { params: { groupId: string } }) => {
    const { groupId } = use(params);
    const [groupData, setGroupData] = useState<ScanGroup | null>(null);
    const [projects, setProjects] = useState<Media[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("projects");
    // --- NUEVO ESTADO PARA LA SUB-PESTAÑA ---
    const [adminSubTab, setAdminSubTab] = useState("management");
    const { profile, followedScanGroups, toggleFollowGroup, isLoggedIn, addToast } = useAuth();
    const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [history, setHistory] = useState<ScanHistoryItem[]>([]);

    const fetchGroupData = async () => {
        setIsLoading(true);
        const { data: group, error } = await supabase.from('scan_groups').select(`*, members:user_groups!inner(role, can_manage_applications, can_view_applications, profile:profiles(id, username, avatar_url))`).eq('id', groupId).single();
        if (error || !group) { console.error("Error fetching group:", error); return notFound(); }
        setGroupData(group as any);
        setProjects(await fetchGroupProjects(groupId));
        setAnnouncements(await fetchGroupAnnouncements(groupId));
        setHistory(await fetchScanHistory(groupId));
        setIsLoading(false);
    };

    useEffect(() => { fetchGroupData(); }, [groupId]);

    const currentUserMembership = useMemo(() => {
        if (!profile || !groupData || !groupData.members) return null;
        return groupData.members.find(member => member.profile.id === profile.id);
    }, [profile, groupData]);

    const isAdmin = currentUserMembership?.role === 'admin';
    const canManageRecruitment = currentUserMembership?.can_manage_applications || false;
    const canViewRecruitment = currentUserMembership?.can_view_applications || false;

    const isFollowing = followedScanGroups.includes(groupId);
    const isMember = !!currentUserMembership;
    const canViewKanban = isMember || (groupData && groupData.kanban_is_public);

    const handleProposeProject = async ({ media, note, notify }: { media: Media, note: string, notify: boolean }) => {
        if (!profile || !groupData) return;
        try {
            if (isAdmin) {
                await addProjectToGroup(groupId, media.id);
                const announcementContent = `El administrador ${profile.username} ha añadido un nuevo proyecto: "${media.title.romaji}".`;
                await createAnnouncement(groupId, profile.id, announcementContent, notify);
                await supabase.from('scan_history').insert({ group_id: groupId, user_id: profile.id, action_type: 'create_project', action_data: { title: media.title.romaji } });
                addToast('Proyecto creado con éxito.', 'success');
            } else {
                await createProjectProposal(groupId, profile.id, media, note);
                if (notify) {
                    const announcementContent = `Se ha sugerido un nuevo proyecto: "${media.title.romaji}". Nota: ${note}`;
                    await createAnnouncement(groupId, profile.id, announcementContent, notify);
                    addToast('Propuesta enviada y notificada a los miembros.', 'success');
                } else {
                    addToast('Propuesta enviada. El administrador la revisará pronto.', 'success');
                }
                await supabase.from('scan_history').insert({ group_id: groupId, user_id: profile.id, action_type: 'propose_project', action_data: { title: media.title.romaji, note } });
            }
        } catch (error) { addToast('Hubo un error al procesar la solicitud.', 'error'); console.error(error); }
        setIsProposeModalOpen(false);
        fetchGroupData();
    };

    if (isLoading || !groupData) {
        return ( <> <Navbar /> <div className="text-center py-20 text-white">Cargando grupo...</div> </> );
    }
    
    const formattedMembers = groupData.members?.map(m => ({
        id: m.profile.id,
        username: m.profile.username,
        avatar_url: m.profile.avatar_url
    })) || [];

    return (
        <>
            <Navbar />
            <main>
                <div className="relative h-48 md:h-64 w-full">
                    {groupData.banner_url && ( <Image src={groupData.banner_url} alt={`${groupData.name} Banner`} fill style={{ objectFit: "cover" }} sizes="100vw" /> )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a24] to-transparent"></div>
                </div>
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-32 relative">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-4">
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-md overflow-hidden border-4 border-[#1a1a24] shadow-lg flex-shrink-0">
                            {groupData.logo_url && ( <Image src={groupData.logo_url} alt={groupData.name} fill style={{ objectFit: "cover" }} sizes="160px" /> )}
                        </div>
                        <div className="flex-grow mt-4 sm:mt-0 text-center sm:text-left">
                            <h1 className="text-3xl md:text-4xl font-bold text-white">{groupData.name}</h1>
                            <p className="text-gray-400 mt-2 max-w-lg">{groupData.description}</p>
                            <div className="flex flex-wrap gap-4 mt-4 justify-center sm:justify-start">
                                <div className="flex items-center gap-1 text-sm text-gray-400"><UserIcon /> {groupData.members?.length || 0} Miembros</div>
                                <div className="flex items-center gap-1 text-sm text-gray-400"><BookOpenIcon /> {projects.length} Proyectos</div>
                                {isLoggedIn && !isMember && ( <button onClick={() => toggleFollowGroup(groupId, groupData.name)} className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${ isFollowing ? "bg-[#ffbade] text-black" : "bg-indigo-600 hover:bg-indigo-700 text-white" }`}> {isFollowing ? "Siguiendo" : "Seguir"} </button> )}
                                {groupData.social_links?.patreon && ( <a href={groupData.social_links.patreon} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-[#FF424D] text-white hover:opacity-90 transition-opacity"> <DollarSignIcon /> Apoyar en Patreon </a> )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-8">
                        {/* --- INICIO DE LA ESTRUCTURA DE PESTAÑAS MODIFICADA --- */}
                        <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
                            <button onClick={() => setActiveTab("projects")} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === "projects" ? "text-white border-[#ffbade]" : "text-gray-400 border-transparent hover:text-white"}`}>Proyectos</button>
                            <button onClick={() => setActiveTab("announcements")} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === "announcements" ? "text-white border-[#ffbade]" : "text-gray-400 border-transparent hover:text-white"}`}>Anuncios</button>
                            <button onClick={() => setActiveTab("community")} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === "community" ? "text-white border-[#ffbade]" : "text-gray-400 border-transparent hover:text-white"}`}>Comunidad</button>
                            <button onClick={() => setActiveTab("recruitment")} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 ${activeTab === "recruitment" ? "text-white border-[#ffbade]" : "text-gray-400 border-transparent hover:text-white"}`}><BriefcaseIcon /> Reclutamiento</button>
                            
                            {/* Pestaña unificada de Administración */}
                            {isMember && (
                                <button onClick={() => setActiveTab("admin_panel")} className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 ${activeTab === "admin_panel" ? "text-white border-[#ffbade]" : "text-gray-400 border-transparent hover:text-white"}`}>
                                    <DashboardIcon /> Panel de Administración
                                </button>
                            )}
                        </div>

                        <div>
                            {activeTab === "projects" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2 flex justify-end mb-4">
                                        {isMember && ( <button onClick={() => setIsProposeModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"> <PlusIcon /> {isAdmin ? 'Crear Proyecto' : 'Sugerir Proyecto'} </button> )}
                                    </div>
                                    {projects.length > 0 ? ( projects.map((project) => ( <ProjectCard key={project.id} project={project} /> )) ) : ( <div className="md:col-span-2 text-center py-8 text-gray-400"> Este grupo aún no tiene proyectos publicados. </div> )}
                                </div>
                            )}
                            
                            {activeTab === "announcements" && (
                                <div className="max-w-screen-md mx-auto space-y-4 py-8">
                                    {announcements.length > 0 ? ( announcements.map((ann) => ( <div key={ann.id} className="bg-[#201f31] rounded-lg p-4"> <h4 className="font-bold text-white">{ann.title || 'Anuncio'}</h4> <p className="text-xs text-gray-500 mb-2">{new Date(ann.created_at).toLocaleDateString()}</p> <p className="text-sm text-gray-300">{ann.content}</p> <div className="mt-2 text-xs text-gray-500"> Por: <span className="text-gray-300">{ann.user.username}</span> </div> </div> )) ) : ( <div className="text-center py-8 text-gray-400">No hay anuncios en este momento.</div> )}
                                </div>
                            )}

                            {activeTab === "community" && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
                                    <div className="lg:col-span-2">
                                        <CommentsSection initialComments={[]} mediaId={0} />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <h3 className="text-xl font-bold text-white mb-4">Miembros</h3>
                                        <div className="space-y-4">
                                            {groupData.members?.map((member) => ( <div key={member.profile.id} className="bg-[#201f31] rounded-lg p-4 flex items-center gap-4"> <div className="relative w-12 h-12 rounded-full overflow-hidden"> {member.profile.avatar_url && ( <Image src={member.profile.avatar_url} alt={member.profile.username} fill style={{ objectFit: "cover" }} /> )} </div> <div> <h3 className="font-bold text-white">{member.profile.username}</h3> <p className="text-sm text-[#ffbade]">{member.role}</p> </div> </div> ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "recruitment" && (
                                <AdvancedRecruitmentTab
                                    groupId={groupId}
                                    canManage={canManageRecruitment}
                                    canView={canViewRecruitment}
                                />
                            )}
                            
                            {/* --- CONTENIDO DEL PANEL DE ADMINISTRACIÓN --- */}
                            {activeTab === "admin_panel" && isMember && (
                                <div>
                                    <div className="flex border-b border-gray-700 mb-6">
                                        {canViewKanban && <button onClick={() => setAdminSubTab('management')} className={`px-4 py-2 text-sm font-semibold ${adminSubTab === 'management' ? 'text-white border-b-2 border-[#ffbade]' : 'text-gray-400 hover:text-white'}`}>Gestión</button>}
                                        {isAdmin && <button onClick={() => setAdminSubTab('analytics')} className={`px-4 py-2 text-sm font-semibold ${adminSubTab === 'analytics' ? 'text-white border-b-2 border-[#ffbade]' : 'text-gray-400 hover:text-white'}`}>Analíticas</button>}
                                        <button onClick={() => setAdminSubTab('history')} className={`px-4 py-2 text-sm font-semibold ${adminSubTab === 'history' ? 'text-white border-b-2 border-[#ffbade]' : 'text-gray-400 hover:text-white'}`}>Historial</button>
                                        {isAdmin && <button onClick={() => setAdminSubTab('settings')} className={`px-4 py-2 text-sm font-semibold ${adminSubTab === 'settings' ? 'text-white border-b-2 border-[#ffbade]' : 'text-gray-400 hover:text-white'}`}>Configuración</button>}
                                    </div>

                                    <div>
                                        {adminSubTab === 'management' && canViewKanban && <ProjectKanban isAdmin={isAdmin} members={formattedMembers} groupId={groupId} />}
                                        {adminSubTab === 'analytics' && isAdmin && <AnalyticsTab groupId={groupId} />}
                                        {adminSubTab === 'history' && <ScanHistoryTab history={history} />}
                                        {adminSubTab === 'settings' && isAdmin && <GroupSettingsTab groupData={groupData as ScanGroup} isAdmin={isAdmin} onSettingsSaved={fetchGroupData} />}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <ProposeProjectModal isOpen={isProposeModalOpen} onClose={() => setIsProposeModalOpen(false)} onSubmit={handleProposeProject} isMember={isMember}/>
        </>
    );
};

export default GroupPage;
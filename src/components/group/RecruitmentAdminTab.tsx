// src/components/group/RecruitmentAdminTab.tsx
"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabaseClient';
import Image from 'next/image';
import Link from 'next/link';

interface Application {
    id: string;
    user_id: string;
    posting_id: string;
    portfolio_link: string | null;
    message: string | null;
    status: 'pending' | 'accepted' | 'rejected';
    submitted_at: string;
    profile: {
        username: string;
        avatar_url: string;
    };
    recruitment_posting: {
        role_name: string;
    };
    group: { // Necesitamos el nombre del grupo para la notificación
        name: string;
    }
}

const RecruitmentAdminTab = ({ groupId }: { groupId: string }) => {
    const { addToast } = useAuth();
    const supabase = createClient();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'accepted' | 'rejected' | 'all'>('pending');

    const fetchApplications = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('recruitment_applications')
            .select(`
                id,
                user_id,
                posting_id,
                portfolio_link,
                message,
                status,
                submitted_at,
                profile:profiles (username, avatar_url),
                recruitment_posting:recruitment_postings (role_name),
                group:scan_groups (name)
            `)
            .eq('group_id', groupId)
            .order('submitted_at', { ascending: false });

        if (error) {
            console.error("Error fetching applications:", error);
            addToast('No se pudieron cargar las aplicaciones.', 'error');
        } else {
            setApplications(data as any);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchApplications();
    }, [groupId]);

    const createNotification = async (userId: string, groupName: string, roleName: string, status: 'accepted' | 'rejected') => {
        let content;
        if (status === 'accepted') {
            content = {
                message: `¡Felicidades! Fuiste aceptado para el rol de ${roleName} en el grupo ${groupName}.`,
                cta: `/group/${groupId}` // Link para ir a la página del grupo
            };
        } else {
            content = {
                message: `Tu aplicación para el rol de ${roleName} en ${groupName} ha sido revisada.`,
                cta: null
            };
        }

        await supabase.from('notifications').insert({
            user_id: userId,
            type: 'application_update',
            content: content
        });
    };

    const handleUpdateStatus = async (application: Application, newStatus: 'accepted' | 'rejected') => {
        const { error: updateAppError } = await supabase
            .from('recruitment_applications')
            .update({ status: newStatus })
            .eq('id', application.id);

        if (updateAppError) {
            addToast('Error al actualizar el estado de la aplicación.', 'error');
            return;
        }
        
        // --- INICIO DE LA LÓGICA DE NOTIFICACIÓN ---
        try {
            await createNotification(application.user_id, application.group.name, application.recruitment_posting.role_name, newStatus);
        } catch (e) {
            console.error("Error creating notification:", e);
            addToast('Estado de aplicación actualizado, pero no se pudo enviar la notificación.', 'error');
        }
        // --- FIN DE LA LÓGICA DE NOTIFICACIÓN ---

        if (newStatus === 'accepted') {
            const { error: updatePostingError } = await supabase
                .from('recruitment_postings')
                .update({ status: 'closed' })
                .eq('id', application.posting_id);
            
            if (updatePostingError) {
                addToast('Error al cerrar la vacante, pero la aplicación fue aceptada.', 'error');
            }

            const { error: addMemberError } = await supabase
                .from('user_groups')
                .insert({
                    user_id: application.user_id,
                    group_id: groupId,
                    role: 'member'
                });

            if (addMemberError) {
                 addToast('Error al añadir al usuario al grupo, pero la aplicación fue aceptada.', 'error');
            } else {
                 addToast(`${application.profile.username} ha sido añadido al grupo.`, 'success');
            }
        }
        
        addToast(`Aplicación ${newStatus === 'accepted' ? 'aceptada' : 'rechazada'}.`, 'info');
        fetchApplications();
    };

    const filteredApplications = applications.filter(app => filter === 'all' || app.status === filter);

    return (
        <div className="py-8">
            <div className="flex border-b border-gray-700 mb-6">
                {(['pending', 'accepted', 'rejected', 'all'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 capitalize transition-colors ${filter === tab ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}
                    >
                        {tab === 'pending' ? 'Pendientes' : tab === 'accepted' ? 'Aceptadas' : tab === 'rejected' ? 'Rechazadas' : 'Todas'} ({applications.filter(app => tab === 'all' || app.status === tab).length})
                    </button>
                ))}
            </div>

            {isLoading ? (
                <p className="text-center text-gray-400">Cargando aplicaciones...</p>
            ) : filteredApplications.length === 0 ? (
                <div className="text-center py-16 bg-[#201f31] rounded-lg">
                    <p className="text-gray-400">No hay aplicaciones en esta categoría.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredApplications.map(app => (
                        <div key={app.id} className="bg-[#201f31] p-4 rounded-lg">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="flex items-center gap-4">
                                    <Image src={app.profile.avatar_url} alt={app.profile.username} width={48} height={48} className="rounded-full" />
                                    <div>
                                        <Link href={`/user/${app.profile.username}`} className="font-bold text-white hover:text-[#ffbade]">{app.profile.username}</Link>
                                        <p className="text-sm text-gray-400">Aplica para: <span className="font-semibold text-gray-300">{app.recruitment_posting.role_name}</span></p>
                                        <p className="text-xs text-gray-500">{new Date(app.submitted_at).toLocaleString()}</p>
                                    </div>
                                </div>
                                {app.status === 'pending' && (
                                    <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                                        <button onClick={() => handleUpdateStatus(app, 'rejected')} className="w-1/2 sm:w-auto px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors">Rechazar</button>
                                        <button onClick={() => handleUpdateStatus(app, 'accepted')} className="w-1/2 sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold transition-colors">Aceptar</button>
                                    </div>
                                )}
                            </div>
                            {(app.portfolio_link || app.message) && (
                                <div className="mt-4 pt-4 border-t border-gray-700 space-y-2 text-sm">
                                    {app.portfolio_link && <p><span className="font-semibold text-gray-400">Portafolio:</span> <a href={app.portfolio_link} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{app.portfolio_link}</a></p>}
                                    {app.message && <p className="text-gray-300 whitespace-pre-wrap"><span className="font-semibold text-gray-400">Mensaje:</span> {app.message}</p>}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecruitmentAdminTab;
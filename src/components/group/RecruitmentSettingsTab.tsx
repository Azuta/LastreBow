// src/components/group/RecruitmentSettingsTab.tsx
"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabaseClient';

const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

interface RecruitmentPosting {
    id: string;
    role_name: string;
    description: string;
    status: 'open' | 'closed';
}

const RecruitmentSettingsTab = ({ groupId }: { groupId: string }) => {
    const { addToast } = useAuth();
    const supabase = createClient();
    const [postings, setPostings] = useState<RecruitmentPosting[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Estados para el formulario de nueva posición
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDescription, setNewRoleDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const fetchPostings = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('recruitment_postings')
            .select('*')
            .eq('group_id', groupId)
            .order('created_at', { ascending: false });

        if (error) {
            addToast('Error al cargar las posiciones de reclutamiento.', 'error');
        } else {
            setPostings(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPostings();
    }, [groupId]);

    const handleCreatePosting = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoleName.trim()) {
            addToast('El nombre del rol no puede estar vacío.', 'error');
            return;
        }
        setIsCreating(true);
        const { error } = await supabase
            .from('recruitment_postings')
            .insert({
                group_id: groupId,
                role_name: newRoleName,
                description: newRoleDescription,
                status: 'open'
            });

        if (error) {
            addToast('Error al crear la nueva posición.', 'error');
        } else {
            addToast('Nueva posición de reclutamiento creada.', 'success');
            setNewRoleName('');
            setNewRoleDescription('');
            await fetchPostings();
        }
        setIsCreating(false);
    };

    const handleToggleStatus = async (posting: RecruitmentPosting) => {
        const newStatus = posting.status === 'open' ? 'closed' : 'open';
        const { error } = await supabase
            .from('recruitment_postings')
            .update({ status: newStatus })
            .eq('id', posting.id);

        if (error) {
            addToast('Error al cambiar el estado.', 'error');
        } else {
            addToast(`El rol "${posting.role_name}" ahora está ${newStatus === 'open' ? 'abierto' : 'cerrado'}.`, 'info');
            await fetchPostings();
        }
    };

    const handleDelete = async (postingId: string) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar esta posición? Esta acción no se puede deshacer.")) {
            return;
        }
        const { error } = await supabase.from('recruitment_postings').delete().eq('id', postingId);
        if (error) {
            addToast('Error al eliminar la posición.', 'error');
        } else {
            addToast('Posición eliminada correctamente.', 'success');
            await fetchPostings();
        }
    };


    return (
        <div className="space-y-8">
            <div className="bg-[#201f31] p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-4">Crear Nueva Posición</h3>
                <form onSubmit={handleCreatePosting} className="space-y-4">
                     <div>
                        <label htmlFor="role_name" className="block text-sm font-medium text-gray-300 mb-2">Nombre del Rol</label>
                        <input id="role_name" type="text" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="Ej: Traductor (JP-ES)" className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#ffbade] focus:outline-none" required />
                    </div>
                     <div>
                        <label htmlFor="role_description" className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                        <textarea id="role_description" value={newRoleDescription} onChange={(e) => setNewRoleDescription(e.target.value)} rows={3} placeholder="Describe los requisitos y responsabilidades..." className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#ffbade] focus:outline-none"></textarea>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={isCreating} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50">
                            <PlusIcon /> {isCreating ? 'Creando...' : 'Crear Posición'}
                        </button>
                    </div>
                </form>
            </div>
            <div>
                 <h3 className="text-xl font-bold text-white mb-4">Posiciones Actuales</h3>
                 {isLoading ? <p className="text-gray-400">Cargando...</p> : (
                    <div className="space-y-4">
                        {postings.map(p => (
                            <div key={p.id} className="bg-[#201f31] p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                         <h4 className="font-semibold text-white">{p.role_name}</h4>
                                         <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.status === 'open' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                            {p.status === 'open' ? 'Abierto' : 'Cerrado'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-300 mt-1">{p.description}</p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button onClick={() => handleToggleStatus(p)} className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/80 text-white rounded-lg text-sm font-semibold transition-colors">
                                        {p.status === 'open' ? 'Cerrar' : 'Abrir'}
                                    </button>
                                     <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-800 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors">
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                 )}
            </div>
        </div>
    );
};

export default RecruitmentSettingsTab;
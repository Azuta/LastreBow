// src/components/group/RecruitmentTab.tsx
"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabaseClient';
import CreatePostingModal from './CreatePostingModal'; // <-- Importa el nuevo modal

// --- Iconos ---
const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

interface RecruitmentPosting {
    id: string;
    role_name: string;
    description: string;
    status: 'open' | 'closed';
}

// El componente ahora necesita saber si el usuario es admin
const RecruitmentTab = ({ groupId, isAdmin }: { groupId: string, isAdmin: boolean }) => {
    const { user, profile, addToast } = useAuth();
    const supabase = createClient();

    const [postingId, setPostingId] = useState('');
    const [portfolio, setPortfolio] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roleError, setRoleError] = useState(false);
    const [postings, setPostings] = useState<RecruitmentPosting[]>([]);
    const [isLoadingPostings, setIsLoadingPostings] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // <-- Estado para el nuevo modal

    const fetchPostings = async () => {
        setIsLoadingPostings(true);
        const { data, error } = await supabase
            .from('recruitment_postings')
            .select('*')
            .eq('group_id', groupId);

        if (error) {
            console.error("Error fetching recruitment postings:", error);
        } else {
            setPostings(data as RecruitmentPosting[]);
        }
        setIsLoadingPostings(false);
    };

    useEffect(() => {
        if (groupId) {
            fetchPostings();
        }
    }, [groupId]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setRoleError(false);
        if (!user || !profile) {
            addToast('Debes iniciar sesión para aplicar.', 'error');
            return;
        }
        if (!postingId) {
            setRoleError(true);
            return;
        }

        setIsSubmitting(true);
        const { error } = await supabase.from('recruitment_applications').insert({
            group_id: groupId, user_id: user.id, posting_id: postingId,
            portfolio_link: portfolio, message: message,
        });

        if (error) {
            addToast('Hubo un error al enviar tu aplicación. Inténtalo de nuevo.', 'error');
        } else {
            addToast('¡Tu aplicación ha sido enviada con éxito!', 'success');
            setPostingId(''); setPortfolio(''); setMessage('');
        }
        setIsSubmitting(false);
    };

    const openPostings = postings.filter(p => p.status === 'open');

    return (
        <>
            <CreatePostingModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                groupId={groupId}
                onPostingCreated={fetchPostings}
            />
            <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">Únete al Equipo</h2>
                        {isAdmin && (
                            <button onClick={() => setIsCreateModalOpen(true)} className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors" title="Crear nueva posición">
                                <PlusIcon />
                            </button>
                        )}
                    </div>
                    <p className="text-gray-400">Buscamos gente apasionada para ayudarnos a traer más proyectos a la comunidad.</p>
                    {isLoadingPostings ? <p className="text-gray-400">Cargando posiciones...</p> : postings.length > 0 ? postings.map(p => (
                        <div key={p.id} className={`p-3 rounded-lg ${p.status === 'open' ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-white">{p.role_name}</h4>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.status === 'open' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                    {p.status === 'open' ? 'Abierto' : 'Cerrado'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-300 mt-1">{p.description}</p>
                        </div>
                    )) : <p className="text-gray-400">Actualmente no hay posiciones abiertas.</p>}
                </div>
                <div className="md:col-span-2 bg-[#201f31] p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-white mb-4">Formulario de Aplicación</h3>
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Tu Nombre o Nickname</label>
                            <input type="text" id="name" value={profile?.username || ''} className="w-full bg-gray-800/60 text-gray-400 rounded-lg px-4 py-2 cursor-not-allowed" disabled readOnly />
                        </div>
                         <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">Rol al que aplicas</label>
                            <select id="role" value={postingId} onChange={(e) => { setPostingId(e.target.value); if (roleError) setRoleError(false);}} className={`w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${roleError ? 'ring-red-500' : 'focus:ring-[#ffbade]'}`} required>
                                <option value="">Selecciona un rol...</option>
                                {openPostings.map(p => (<option key={p.id} value={p.id}>{p.role_name}</option>))}
                            </select>
                            {roleError && <p className="mt-2 text-sm text-red-400">Este campo es requerido. Por favor, selecciona un rol.</p>}
                        </div>
                        <div>
                            <label htmlFor="portfolio" className="block text-sm font-medium text-gray-300 mb-2">Enlace a tu portafolio o prueba (Opcional)</label>
                            <input type="url" id="portfolio" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://..." className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#ffbade] focus:outline-none" />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Mensaje (Opcional)</label>
                            <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Cuéntanos un poco sobre ti y tu experiencia..." className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#ffbade] focus:outline-none"></textarea>
                        </div>
                        <button type="submit" disabled={isSubmitting || openPostings.length === 0} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Enviando...' : 'Enviar Aplicación'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default RecruitmentTab;
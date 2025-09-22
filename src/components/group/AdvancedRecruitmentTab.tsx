// src/components/group/AdvancedRecruitmentTab.tsx
"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabaseClient';
import RecruitmentAdminTab from './RecruitmentAdminTab';
import RecruitmentSettingsTab from './RecruitmentSettingsTab';

interface AdvancedRecruitmentTabProps {
  groupId: string;
  canManage: boolean;
  canView: boolean;
}

interface RecruitmentPosting {
    id: string;
    role_name: string;
    description: string;
    status: 'open' | 'closed';
}

const AdvancedRecruitmentTab = ({ groupId, canManage, canView }: AdvancedRecruitmentTabProps) => {
    const { user, profile, addToast } = useAuth();
    const supabase = createClient();
    
    const [postings, setPostings] = useState<RecruitmentPosting[]>([]);
    const [isLoadingPostings, setIsLoadingPostings] = useState(true);

    const [postingId, setPostingId] = useState('');
    const [portfolio, setPortfolio] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roleError, setRoleError] = useState(false);

    const [adminMode, setAdminMode] = useState(false);
    const [adminView, setAdminView] = useState('applications');

    const hasRecruitmentPermissions = canManage || canView;

    const fetchPostings = async () => {
        setIsLoadingPostings(true);
        const { data, error } = await supabase.from('recruitment_postings').select('*').eq('group_id', groupId).order('created_at');
        if (error) {
            console.error("Error fetching postings:", error);
        } else {
            setPostings(data as RecruitmentPosting[]);
        }
        setIsLoadingPostings(false);
    };

    useEffect(() => {
        fetchPostings();
    }, [groupId]);

    const handleSubmitApplication = async (e: React.FormEvent) => {
        e.preventDefault();
        setRoleError(false);
        if (!postingId) {
            setRoleError(true);
            return;
        }
        if (!user) {
            addToast('Debes iniciar sesión para aplicar.', 'error');
            return;
        }

        setIsSubmitting(true);
        const { error } = await supabase.from('recruitment_applications').insert({
            group_id: groupId,
            user_id: user.id,
            posting_id: postingId,
            portfolio_link: portfolio,
            message: message,
        });
        if (error) {
            addToast('Hubo un error al enviar tu aplicación.', 'error');
        } else {
            addToast('¡Tu aplicación ha sido enviada con éxito!', 'success');
            setPostingId('');
            setPortfolio('');
            setMessage('');
        }
        setIsSubmitting(false);
    };

    const openPostings = postings.filter(p => p.status === 'open');

    return (
        <div className="py-8">
            {hasRecruitmentPermissions && (
                <div className="flex justify-end items-center mb-6 p-3 bg-[#201f31] rounded-lg">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <span className="font-semibold text-white">Modo Administrador</span>
                        <div className="theme-switch">
                           <input type="checkbox" checked={adminMode} onChange={() => setAdminMode(!adminMode)} />
                           <span className="slider"></span>
                        </div>
                    </label>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                    <h2 className="text-2xl font-bold text-white">Únete al Equipo</h2>
                    <p className="text-gray-400">Buscamos gente apasionada para ayudarnos.</p>
                    {isLoadingPostings ? <p className="text-gray-400">Cargando...</p> : postings.map(p => (
                        <div key={p.id} className={`p-3 rounded-lg ${p.status === 'open' ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-white">{p.role_name}</h4>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.status === 'open' ? 'bg-green-500' : 'bg-red-500'}`}>
                                    {p.status === 'open' ? 'Abierto' : 'Cerrado'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-300 mt-1">{p.description}</p>
                        </div>
                    ))}
                </div>

                <div className="md:col-span-2">
                    {!adminMode || !hasRecruitmentPermissions ? (
                        <div className="bg-[#201f31] p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-white mb-4">Formulario de Aplicación</h3>
                            <form onSubmit={handleSubmitApplication} className="space-y-4" noValidate>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Nickname</label>
                                    <input type="text" id="name" value={profile?.username || ''} className="w-full bg-gray-800/60 text-gray-400 rounded-lg px-4 py-2 cursor-not-allowed" disabled readOnly />
                                </div>
                                 <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">Rol al que aplicas</label>
                                    <select id="role" value={postingId} onChange={(e) => { setPostingId(e.target.value); if(roleError) setRoleError(false); }} className={`w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${roleError ? 'ring-red-500' : 'focus:ring-[#ffbade]'}`} required>
                                        <option value="">Selecciona un rol...</option>
                                        {openPostings.map(p => (<option key={p.id} value={p.id}>{p.role_name}</option>))}
                                    </select>
                                    {roleError && <p className="mt-2 text-sm text-red-400">Por favor, selecciona un rol.</p>}
                                </div>
                                <div>
                                    <label htmlFor="portfolio" className="block text-sm font-medium text-gray-300 mb-2">Portafolio (Opcional)</label>
                                    <input type="url" id="portfolio" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://..." className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#ffbade] focus:outline-none" />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Mensaje (Opcional)</label>
                                    <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Cuéntanos sobre ti..." className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#ffbade] focus:outline-none"></textarea>
                                </div>
                                <button type="submit" disabled={isSubmitting || openPostings.length === 0} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                                    {isSubmitting ? 'Enviando...' : 'Enviar Aplicación'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div>
                            <div className="flex border-b border-gray-700 mb-6">
                                <button onClick={() => setAdminView('applications')} className={`px-4 py-2 text-sm font-semibold border-b-2 ${adminView === 'applications' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Gestionar Aplicaciones</button>
                                {canManage && (
                                    <button onClick={() => setAdminView('postings')} className={`px-4 py-2 text-sm font-semibold border-b-2 ${adminView === 'postings' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Gestionar Posiciones</button>
                                )}
                            </div>
                            
                            {adminView === 'applications' && <RecruitmentAdminTab groupId={groupId} />}
                            {adminView === 'postings' && canManage && <RecruitmentSettingsTab groupId={groupId} />}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdvancedRecruitmentTab;
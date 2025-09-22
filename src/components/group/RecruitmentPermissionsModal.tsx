// src/components/group/RecruitmentPermissionsModal.tsx
"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabaseClient';
import Image from 'next/image';

const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6L18 18"/></svg>;

interface MemberPermission {
    user_id: string;
    profile: {
        username: string;
        avatar_url: string;
    };
    can_manage_applications: boolean;
    can_view_applications: boolean;
}

interface RecruitmentPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

const RecruitmentPermissionsModal = ({ isOpen, onClose, groupId }: RecruitmentPermissionsModalProps) => {
    const { addToast } = useAuth();
    const supabase = createClient();
    const [members, setMembers] = useState<MemberPermission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;
        const fetchMembers = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('user_groups')
                .select(`
                    user_id,
                    can_manage_applications,
                    can_view_applications,
                    profile:profiles (username, avatar_url)
                `)
                .eq('group_id', groupId);
            
            if (error) {
                addToast('Error al cargar los miembros del grupo.', 'error');
            } else {
                setMembers(data as any);
            }
            setIsLoading(false);
        };
        fetchMembers();
    }, [isOpen, groupId]);

    const handlePermissionChange = (userId: string, permission: 'can_manage_applications' | 'can_view_applications', value: boolean) => {
        setMembers(prevMembers =>
            prevMembers.map(member =>
                member.user_id === userId ? { ...member, [permission]: value } : member
            )
        );
    };

    const handleSavePermissions = async () => {
        const updates = members.map(member => ({
            user_id: member.user_id,
            group_id: groupId,
            can_manage_applications: member.can_manage_applications,
            can_view_applications: member.can_view_applications
        }));

        const { error } = await supabase
            .from('user_groups')
            .upsert(updates, { onConflict: 'user_id, group_id' });

        if (error) {
            addToast('Error al guardar los permisos.', 'error');
        } else {
            addToast('Permisos actualizados correctamente.', 'success');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#201f31] rounded-lg shadow-lg w-full max-w-lg p-6 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Permisos de Reclutamiento</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
                </div>
                
                <div className="flex-grow space-y-2 max-h-96 overflow-y-auto pr-2">
                    {isLoading ? <p className="text-center text-gray-400">Cargando miembros...</p> : (
                        members.map(member => (
                            <div key={member.user_id} className="bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Image src={member.profile.avatar_url} alt={member.profile.username} width={40} height={40} className="rounded-full" />
                                    <span className="text-white font-semibold">{member.profile.username}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                        <input type="checkbox" checked={member.can_view_applications} onChange={(e) => handlePermissionChange(member.user_id, 'can_view_applications', e.target.checked)} className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500" />
                                        Ver
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                        <input type="checkbox" checked={member.can_manage_applications} onChange={(e) => handlePermissionChange(member.user_id, 'can_manage_applications', e.target.checked)} className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500" />
                                        Gestionar
                                    </label>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex justify-end gap-4 pt-6 mt-auto border-t border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg font-semibold hover:bg-gray-600/80">Cancelar</button>
                    <button type="button" onClick={handleSavePermissions} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Guardar Permisos</button>
                </div>
            </div>
        </div>
    );
};

export default RecruitmentPermissionsModal;
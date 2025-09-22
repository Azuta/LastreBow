// src/components/group/CreatePostingModal.tsx
"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabaseClient';

const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6L18 18"/></svg>;

interface CreatePostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onPostingCreated: () => void; // Callback para refrescar la lista
}

const CreatePostingModal = ({ isOpen, onClose, groupId, onPostingCreated }: CreatePostingModalProps) => {
    const { addToast } = useAuth();
    const supabase = createClient();
    const [roleName, setRoleName] = useState('');
    const [roleDescription, setRoleDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleName.trim()) {
            addToast('El nombre del rol no puede estar vacío.', 'error');
            return;
        }
        setIsCreating(true);
        const { error } = await supabase
            .from('recruitment_postings')
            .insert({
                group_id: groupId,
                role_name: roleName,
                description: roleDescription,
                status: 'open'
            });

        if (error) {
            addToast('Error al crear la nueva posición.', 'error');
        } else {
            addToast('Nueva posición de reclutamiento creada.', 'success');
            setRoleName('');
            setRoleDescription('');
            onPostingCreated(); // Llama al callback para refrescar la lista
            onClose(); // Cierra el modal
        }
        setIsCreating(false);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#201f31] rounded-lg shadow-lg w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Crear Nueva Posición</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="role_name_modal" className="block text-sm font-medium text-gray-300 mb-2">Nombre del Rol</label>
                        <input id="role_name_modal" type="text" value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="Ej: Editor de Calidad" className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#ffbade] focus:outline-none" required />
                    </div>
                     <div>
                        <label htmlFor="role_description_modal" className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                        <textarea id="role_description_modal" value={roleDescription} onChange={(e) => setRoleDescription(e.target.value)} rows={3} placeholder="Describe los requisitos y responsabilidades..." className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#ffbade] focus:outline-none"></textarea>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                         <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg font-semibold hover:bg-gray-600/80">Cancelar</button>
                        <button type="submit" disabled={isCreating} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50">
                            <PlusIcon /> {isCreating ? 'Creando...' : 'Crear Posición'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostingModal;
// src/components/management/CreateSubtaskModal.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { Subtask } from '@/types/AniListResponse';

const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6L18 18"/></svg>;

interface AssignedMember {
    id: string;
    username: string;
    avatar_url: string;
}

interface CreateSubtaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subtask: Partial<Subtask>) => void;
  members: AssignedMember[];
  existingSubtask?: Subtask | null;
}

const CreateSubtaskModal = ({ isOpen, onClose, onSave, members, existingSubtask }: CreateSubtaskModalProps) => {
    const { profile } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignees, setAssignees] = useState<AssignedMember[]>([]);

    useEffect(() => {
        if (isOpen) {
            if (existingSubtask) {
                setTitle(existingSubtask.title);
                setDescription(existingSubtask.description || '');
                const existingAssignees = existingSubtask.assignees.map(a => a.profile);
                setAssignees(existingAssignees);
            } else {
                setTitle('');
                setDescription('');
                // Por defecto, se asigna al usuario actual si no hay nadie asignado
                if (profile) {
                    setAssignees([{ id: profile.id, username: profile.username, avatar_url: profile.avatar_url }]);
                } else {
                    setAssignees([]);
                }
            }
        }
    }, [isOpen, existingSubtask, profile]);

    if (!isOpen) return null;

    const handleToggleAssignee = (member: AssignedMember) => {
        setAssignees(prev => {
            const isAssigned = prev.some(u => u.id === member.id);
            if (isAssigned) {
                return prev.filter(u => u.id !== member.id);
            } else {
                return [...prev, member];
            }
        });
    };

    const handleSave = () => {
        const subtaskData = {
            id: existingSubtask?.id, // Mantiene el ID si se está editando
            title,
            description,
            assignees: assignees.map(a => ({ profile: a })), // Envuelve en la estructura esperada
        };
        onSave(subtaskData as Partial<Subtask>);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#2b2d42] rounded-lg shadow-lg w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">{existingSubtask ? 'Editar Subtarea' : 'Crear Subtarea'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="subtaskTitle" className="block text-sm font-medium text-gray-300 mb-2">Título</label>
                        <input id="subtaskTitle" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffbade]" />
                    </div>
                    <div>
                        <label htmlFor="subtaskDescription" className="block text-sm font-medium text-gray-300 mb-2">Descripción (Opcional)</label>
                        <textarea id="subtaskDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffbade]"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Asignar a</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                            {members.map(member => (
                                <div key={member.id} onClick={() => handleToggleAssignee(member)} className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-colors ${assignees.some(u => u.id === member.id) ? 'bg-[#ffbade] text-black' : 'hover:bg-gray-700/50'}`}>
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                        <Image src={member.avatar_url} alt={member.username} fill sizes="32px" />
                                    </div>
                                    <span className={`font-semibold ${assignees.some(u => u.id === member.id) ? 'text-black' : 'text-white'}`}>{member.username}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg font-semibold hover:bg-gray-600/80">Cancelar</button>
                    <button type="button" onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">{existingSubtask ? 'Guardar Cambios' : 'Crear'}</button>
                </div>
            </div>
        </div>
    );
};

export default CreateSubtaskModal;
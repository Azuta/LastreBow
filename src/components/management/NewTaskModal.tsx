// src/components/management/NewTaskModal.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

interface NewTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddTask: (task: { title: string, assignedTo: { username: string, avatarUrl: string }[], color: string }) => void;
    members: { id: string, username: string, avatar_url: string }[];
}

const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6L18 18"/></svg>;

const NewTaskModal = ({ isOpen, onClose, onAddTask, members }: NewTaskModalProps) => {
    const [taskTitle, setTaskTitle] = useState('');
    const [assignedTo, setAssignedTo] = useState<{ username: string, avatarUrl: string }[]>([]);
    const [color, setColor] = useState('#ffbade');
    const { addToast } = useAuth();

    if (!isOpen) return null;

    const handleSave = () => {
        if (taskTitle.trim() === '') {
            addToast('El título de la tarea no puede estar vacío.', 'error');
            return;
        }
        onAddTask({ title: taskTitle, assignedTo, color });
        setTaskTitle('');
        setAssignedTo([]);
        setColor('#ffbade');
    };

    const handleToggleAssignee = (member) => {
        setAssignedTo(prev => {
            const isAssigned = prev.some(u => u.username === member.username);
            if (isAssigned) {
                return prev.filter(u => u.username !== member.username);
            } else {
                return [...prev, { username: member.username, avatarUrl: member.avatar_url }];
            }
        });
    };

    const colors = ['#ffbade', '#6ee7b7', '#fcd34d', '#f87171', '#a78bfa'];

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#201f31] rounded-lg shadow-lg w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Nueva Tarea</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-300 mb-2">Título de la Tarea</label>
                        <input
                            id="taskTitle"
                            type="text"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffbade]"
                            placeholder="Ej: Traducir capítulo 150"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Asignar a</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                            {members.map(member => (
                                <div
                                    key={member.id}
                                    onClick={() => handleToggleAssignee(member)}
                                    className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-colors ${assignedTo.some(u => u.username === member.username) ? 'bg-[#ffbade] text-black' : 'hover:bg-gray-700/50'}`}
                                >
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                        <Image src={member.avatar_url} alt={member.username} fill sizes="40px" />
                                    </div>
                                    <span className={`font-semibold ${assignedTo.some(u => u.username === member.username) ? 'text-black' : 'text-white'}`}>{member.username}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Color de la Tarjeta</label>
                        <div className="flex gap-2">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-white' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                ></button>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg font-semibold hover:bg-gray-600/80">Cancelar</button>
                        <button type="button" onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Crear Tarea</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewTaskModal;
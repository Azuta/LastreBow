// src/components/management/TaskEditModal.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Task, Subtask } from '@/types/AniListResponse';
import Image from 'next/image';
import CreateSubtaskModal from './CreateSubtaskModal';

interface AssignedMember { id: string; username: string; avatar_url: string; }
interface TaskEditModalProps { isOpen: boolean; onClose: () => void; onSave: (updatedTask: Task, newSubtasks: Subtask[], deletedSubtaskIds: string[]) => void; task: Task | null; members: { id: string, username: string, avatar_url: string }[]; }

const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6L18 18"/></svg>;
const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

// Componente para la Fila de Subtarea con Detalles Desplegables
const SubtaskItem = ({ subtask, onToggleExpand, isExpanded }: { subtask: Subtask, onToggleExpand: () => void, isExpanded: boolean }) => (
    <div className="bg-gray-800/50 rounded-lg cursor-pointer">
        <div className="flex items-center gap-3 p-3" onClick={onToggleExpand}>
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${subtask.completed ? 'bg-green-500' : 'bg-gray-500'}`} title={subtask.completed ? 'Completada' : 'Pendiente'}></div>
            <span className={`flex-grow text-white ${subtask.completed ? 'line-through text-gray-500' : ''}`}>{subtask.title}</span>
            <div className="flex -space-x-2">
                {subtask.assignees.map(a => (<div key={a.profile.id}><Image src={a.profile.avatar_url} alt={a.profile.username} width={24} height={24} className="w-6 h-6 rounded-full border-2 border-[#201f31]" title={a.profile.username} /></div>))}
            </div>
        </div>
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-40 py-3' : 'max-h-0'} px-3 border-t ${isExpanded ? 'border-gray-700/50' : 'border-transparent'}`}>
            <p className="text-sm text-gray-400">{subtask.description || 'No hay descripción.'}</p>
        </div>
    </div>
);

const TaskEditModal = ({ isOpen, onClose, onSave, task, members }: TaskEditModalProps) => {
    const [taskTitle, setTaskTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [deletedSubtaskIds, setDeletedSubtaskIds] = useState<string[]>([]);
    const [assignedTo, setAssignedTo] = useState<AssignedMember[]>([]);
    const [color, setColor] = useState('#ffbade');
    const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
    const [subtaskToEdit, setSubtaskToEdit] = useState<Subtask | null>(null);
    const [groupBy, setGroupBy] = useState('none');
    const [expandedSubtaskId, setExpandedSubtaskId] = useState<string | null>(null);

    useEffect(() => {
        if (task) {
            setTaskTitle(task.title || '');
            setDescription(task.description || '');
            setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
            setSubtasks(task.subtasks || []);
            setAssignedTo(task.assignedTo?.map(a => ({ id: a.id, username: a.username, avatar_url: a.avatarUrl })) || []);
            setColor(task.color || '#ffbade');
            setDeletedSubtaskIds([]);
        }
    }, [task]);

    // CORRECCIÓN DEL BUG DE HOOKS: El useMemo se llama SIEMPRE.
    const groupedSubtasks = useMemo(() => {
        if (groupBy === 'none') return { 'Todas las subtareas': subtasks };
        if (groupBy === 'status') return { 'Pendientes': subtasks.filter(s => !s.completed), 'Completadas': subtasks.filter(s => s.completed) };
        if (groupBy === 'assignee') {
            return subtasks.reduce((acc, subtask) => {
                if (subtask.assignees.length === 0) {
                    if (!acc['Sin asignar']) acc['Sin asignar'] = [];
                    acc['Sin asignar'].push(subtask);
                } else {
                    subtask.assignees.forEach(assignee => {
                        const name = assignee.profile.username;
                        if (!acc[name]) acc[name] = [];
                        acc[name].push(subtask);
                    });
                }
                return acc;
            }, {} as Record<string, Subtask[]>);
        }
        return {};
    }, [subtasks, groupBy]);

    // CORRECCIÓN DEL BUG DE HOOKS: El return temprano se mueve aquí, DESPUÉS de todos los hooks.
    if (!isOpen || !task) return null;

    const handleSave = () => {
        const updatedTask = { ...task, title: taskTitle, description, due_date: dueDate, color, subtasks, assignedTo: assignedTo.map(a => ({ id: a.id, username: a.username, avatarUrl: a.avatar_url })) };
        onSave(updatedTask, subtasks, deletedSubtaskIds);
    };

    const handleToggleAssignee = (member: AssignedMember) => { setAssignedTo(prev => { const isAssigned = prev.some(u => u.id === member.id); if (isAssigned) { return prev.filter(u => u.id !== member.id); } else { return [...prev, member]; } }); };
    
    const handleSaveSubtask = (subtaskData: Partial<Subtask>) => {
        if (subtaskData.id && !subtaskData.id.startsWith('new-')) {
            setSubtasks(subtasks.map(st => st.id === subtaskData.id ? { ...st, ...subtaskData } as Subtask : st));
        } else {
            const newSubtask: Subtask = { id: `new-${Date.now()}`, created_at: new Date().toISOString(), completed: false, title: subtaskData.title || 'Nueva Subtarea', description: subtaskData.description || null, assignees: subtaskData.assignees || [], };
            setSubtasks([...subtasks, newSubtask]);
        }
    };
    
    const handleDeleteSubtask = (subtaskId: string) => { setSubtasks(subtasks.filter(st => st.id !== subtaskId)); if (!subtaskId.startsWith('new-')) { setDeletedSubtaskIds([...deletedSubtaskIds, subtaskId]); } };
    const openSubtaskModal = (subtask: Subtask | null) => { setSubtaskToEdit(subtask); setIsSubtaskModalOpen(true); };

    const colors = ['#ffbade', '#6ee7b7', '#fcd34d', '#f87171', '#a78bfa'];

    return (
        <>
            <CreateSubtaskModal isOpen={isSubtaskModalOpen} onClose={() => setIsSubtaskModalOpen(false)} onSave={handleSaveSubtask} members={members} existingSubtask={subtaskToEdit} />
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
                <div className="bg-[#201f31] rounded-lg shadow-lg w-full max-w-2xl p-6 flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6"> <h3 className="text-xl font-bold text-white">Editar Tarea</h3> <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button> </div>
                    <div className="flex-grow space-y-4 max-h-[75vh] overflow-y-auto pr-4">
                        <div> <label className="block text-sm font-medium text-gray-300 mb-2">Título</label> <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffbade]"/> </div>
                        <div> <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label> <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffbade]"></textarea> </div>
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-medium text-gray-300">Subtareas</label>
                                <div className="flex items-center gap-2 text-sm"> <span className="text-gray-400">Agrupar por:</span> <select value={groupBy} onChange={e => setGroupBy(e.target.value)} className="bg-gray-700/50 text-white rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#ffbade]"> <option value="none">Sin agrupar</option> <option value="status">Estado</option> <option value="assignee">Asignado</option> </select> </div>
                            </div>
                            <div className="space-y-3">
                                {Object.entries(groupedSubtasks).map(([groupName, groupSubtasks]) => (
                                    groupSubtasks.length > 0 && (
                                        <div key={groupName}>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase pt-2 pb-1">{groupName}</h4>
                                            {groupSubtasks.map(st => <SubtaskItem key={st.id} subtask={st} isExpanded={expandedSubtaskId === st.id} onToggleExpand={() => setExpandedSubtaskId(prev => prev === st.id ? null : st.id)} />)}
                                        </div>
                                    )
                                ))}
                            </div>
                            <button onClick={() => openSubtaskModal(null)} className="mt-3 flex items-center gap-2 text-sm text-indigo-400 font-semibold hover:text-indigo-300"><PlusIcon /> Añadir Subtarea</button>
                        </div>
                        <div> <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Entrega</label> <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffbade]"/> </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Asignados a la Tarea Principal</label>
                            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                                {members.map(member => ( <div key={member.id} onClick={() => handleToggleAssignee(member)} className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-colors ${assignedTo.some(u => u.id === member.id) ? 'bg-[#ffbade] text-black' : 'hover:bg-gray-700/50'}`}> <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0"><Image src={member.avatar_url} alt={member.username} fill sizes="40px" /></div> <span className={`font-semibold ${assignedTo.some(u => u.id === member.id) ? 'text-black' : 'text-white'}`}>{member.username}</span> </div> ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                            <div className="flex gap-2"> {colors.map(c => (<button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }}></button>))} </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-6 mt-auto border-t border-gray-700"> <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg font-semibold hover:bg-gray-600/80">Cancelar</button> <button type="button" onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Guardar Cambios</button> </div>
                </div>
            </div>
        </>
    );
};

export default TaskEditModal;
// src/components/management/TaskCard.tsx
"use client";
import { Task } from '@/types/AniListResponse';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';

const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const DescriptionIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const ChecklistIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;
const CalendarIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;


interface TaskCardProps {
    task: Task;
    onEdit: () => void;
    isAdmin: boolean;
    isEditMode: boolean;
    activeId?: string | null;
    isOverlay?: boolean;
}

export const TaskCard = ({ task, onEdit, isAdmin, isEditMode, activeId, isOverlay = false }: TaskCardProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: task.id, disabled: isOverlay });

    const style = isOverlay ? { backgroundColor: task.color || '#2b2d42' } : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: activeId === task.id ? 0 : 1,
        backgroundColor: task.color || '#2b2d42',
    };

    const subtaskProgress = {
        total: task.subtasks?.length || 0,
        completed: task.subtasks?.filter(item => item.completed).length || 0,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-3 rounded-lg shadow-md cursor-grab active:cursor-grabbing text-white relative space-y-2">
            <p className="font-semibold text-sm">{task.title}</p>
            
            <div className="flex items-center gap-3 text-xs text-gray-400">
                {task.description && <div title="Esta tarea tiene descripción"><DescriptionIcon /></div>}
                {task.due_date && <div className="flex items-center gap-1" title={`Fecha de entrega: new Date(task.due_date).toLocaleDateString()`}><CalendarIcon /></div>}
                {subtaskProgress.total > 0 && (
                    <div className="flex items-center gap-1" title="Progreso de subtareas">
                        <ChecklistIcon />
                        <span>{subtaskProgress.completed}/{subtaskProgress.total}</span>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center pt-1">
                <div className="flex -space-x-2">
                    {task.assignedTo?.map(user => (
                        <Image key={user.id} src={user.avatarUrl} alt={user.username} width={24} height={24} className="w-6 h-6 rounded-full border-2 border-gray-700" title={user.username} />
                    ))}
                </div>
                {isAdmin && isEditMode && (
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 rounded-full text-white bg-black/30 hover:bg-black/50">
                        <EditIcon />
                    </button>
                )}
            </div>
        </div>
    );
};
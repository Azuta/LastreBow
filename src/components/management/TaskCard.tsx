// src/components/management/TaskCard.tsx
import { Task } from '@/types/AniListResponse';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';

const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;

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

    const style = isOverlay
        ? {
            backgroundColor: task.color || '#2b2d42',
        }
        : {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: activeId === task.id ? 0 : 1,
            backgroundColor: task.color || '#2b2d42',
        };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="p-3 rounded-lg shadow-md cursor-grab active:cursor-grabbing text-white relative"
        >
            <p className="font-semibold text-sm">{task.title} - Ch. {task.chapterNumber}</p>
            <div className="flex justify-between items-center mt-2">
                <div className="flex -space-x-2">
                    {task.assignedTo?.map(user => (
                        <Image key={user.username} src={user.avatarUrl} alt={user.username} width={24} height={24} className="w-6 h-6 rounded-full border-2 border-gray-700" />
                    ))}
                </div>
                {isAdmin && isEditMode && (
                    <button onClick={onEdit} className="p-1 rounded-full text-white bg-black/30 hover:bg-black/50">
                        <EditIcon />
                    </button>
                )}
            </div>
        </div>
    );
};
// src/components/management/TaskCard.tsx
import { Task } from '@/types/AniListResponse';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const TaskCard = ({ task }: { task: Task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-[#2b2d42] p-3 rounded-lg shadow-md cursor-grab active:cursor-grabbing"
    >
      <p className="font-semibold text-white text-sm">{task.title} - Ch. {task.chapterNumber}</p>
      <div className="flex -space-x-2 mt-2">
        {task.assignedTo?.map(user => (
          <img key={user.username} src={user.avatarUrl} alt={user.username} className="w-6 h-6 rounded-full border-2 border-[#2b2d42]" />
        ))}
      </div>
    </div>
  );
};
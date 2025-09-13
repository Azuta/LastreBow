// src/components/management/KanbanColumn.tsx
import { Task } from '@/types/AniListResponse';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { TaskCard } from './TaskCard';
import { useState } from 'react';

const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  isAdmin: boolean;
  isEditMode: boolean;
  onRenameColumn: (columnId: string, newTitle: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onEditTask: (task: Task) => void;
}

export const KanbanColumn = ({ id, title, tasks, isAdmin, isEditMode, onRenameColumn, onDeleteColumn, onEditTask }: KanbanColumnProps) => {
  const { setNodeRef } = useDroppable({ id });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const handleTitleChange = (e) => {
    setNewTitle(e.target.value);
  };

  const handleTitleSave = () => {
    if (newTitle && newTitle !== title) {
        onRenameColumn(id, newTitle);
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="w-64 bg-[#201f31] rounded-lg p-3 flex-shrink-0">
      <div className="flex items-center justify-between mb-4 px-2">
        {isEditingTitle && isAdmin ? (
          <input
            type="text"
            value={newTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
            className="w-full bg-gray-700/50 text-white rounded-md px-2 py-1 text-sm font-bold"
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-sm" onClick={() => isAdmin && isEditMode && setIsEditingTitle(true)}>
              {title} ({tasks.length})
            </h3>
            {isAdmin && isEditMode && (
                <button onClick={() => onDeleteColumn(id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <TrashIcon />
                </button>
            )}
          </div>
        )}
      </div>
      <SortableContext
        id={id}
        items={tasks.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="space-y-3 min-h-[100px]">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={() => onEditTask(task)} isAdmin={isAdmin} isEditMode={isEditMode} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};
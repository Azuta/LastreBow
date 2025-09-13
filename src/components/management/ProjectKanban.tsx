// src/components/management/ProjectKanban.tsx
"use client";
import { useState, useMemo, useRef, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { Task, TaskStatus, StatusColumns } from '@/types/AniListResponse';
import { TaskCard } from './TaskCard';
import TaskEditModal from './TaskEditModal';
import NewColumnModal from './NewColumnModal';
import NewTaskModal from './NewTaskModal';
import { arrayMove } from '@dnd-kit/sortable';
import { useAuth } from '@/context/AuthContext';

const initialTasks: Task[] = [
    { id: '30002-378', mangaId: 30002, chapterNumber: '378', title: 'Berserk', coverImage: '', status: 'raw', assignedTo: [{ username: 'Kaiser', avatarUrl: 'https://i.pravatar.cc/150?u=user004' }], color: '#ffbade' },
    { id: '105778-150', mangaId: 105778, chapterNumber: '150', title: 'Chainsaw Man', coverImage: '', status: 'translating', assignedTo: [], color: '#6ee7b7' },
    { id: '30013-1100', mangaId: 30013, chapterNumber: '1100', title: 'One Piece', coverImage: '', status: 'cleaning', assignedTo: [], color: '#fcd34d' },
    { id: '105398-205', mangaId: 105398, chapterNumber: '205', title: 'Solo Leveling', coverImage: '', status: 'typesetting', assignedTo: [{ username: 'Zephyr', avatarUrl: 'https://i.pravatar.cc/150?u=user005' }], color: '#f87171' },
    { id: '120980-95', mangaId: 120980, chapterNumber: '95', title: 'Nano Machine', coverImage: '', status: 'quality-check', assignedTo: [], color: '#a78bfa' },
];

const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>;

export default function ProjectKanban({ isAdmin, members }) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isNewColumnModalOpen, setIsNewColumnModalOpen] = useState(false);
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    
    const { addToast } = useAuth();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const defaultColumns = useMemo(() => {
        const columns = {};
        Object.entries(StatusColumns).forEach(([key, value]) => {
            columns[key] = { title: value, items: [] };
        });
        return columns;
    }, []);

    const [columns, setColumns] = useState(defaultColumns);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const handleDragStart = (event) => {
        const task = tasks.find(t => t.id === event.active.id);
        if (task) setActiveTask(task);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);
        const { active, over } = event;

        if (!over) return;
        if (active.id === over.id) return;
        
        const sourceColumn = tasks.find(t => t.id === active.id)?.status;
        const destinationColumn = over.id as TaskStatus;

        if (sourceColumn !== destinationColumn) {
            setTasks(prevTasks => prevTasks.map(t => t.id === active.id ? { ...t, status: destinationColumn } : t));
        }
    };
    
    const handleRenameColumn = (columnId: string, newTitle: string) => {
        setColumns(prev => ({
            ...prev,
            [columnId]: { ...prev[columnId], title: newTitle }
        }));
    };
    
    const handleAddColumn = (columnName: string) => {
        const newColumnId = `col-${Date.now()}`;
        setColumns(prev => ({
            ...prev,
            [newColumnId]: { title: columnName, items: [] }
        }));
        setIsNewColumnModalOpen(false);
        addToast(`Columna "${columnName}" agregada con éxito.`, 'success');

        // Scroll hasta el final
        setTimeout(() => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
            }
        }, 100);
    };
    
    const handleDeleteColumn = (columnId: string) => {
        setColumns(prev => {
            const newColumns = { ...prev };
            delete newColumns[columnId];
            return newColumns;
        });
    };

    const handleEditTask = (task) => {
        setTaskToEdit(task);
        setIsEditModalOpen(true);
    };

    const handleSaveTask = (updatedTask) => {
        setTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t));
        setIsEditModalOpen(false);
    };

    const handleAddTask = (newTaskData: { title: string, assignedTo: { username: string, avatarUrl: string }[], color: string }) => {
        const newTask = {
            id: `task-${Date.now()}`,
            mangaId: 0, // Por ahora un ID de prueba
            chapterNumber: '', // Por ahora un capítulo de prueba
            status: 'raw', // Por defecto a la primera columna
            ...newTaskData,
        };
        setTasks(prevTasks => [newTask, ...prevTasks]);
        setIsNewTaskModalOpen(false);
        addToast('Nueva tarea agregada con éxito.', 'success');
    };

    const groupedTasks = useMemo(() => {
        const groups = {};
        for (const colId of Object.keys(columns)) {
            groups[colId] = [];
        }
        for (const task of tasks) {
            if (groups[task.status]) {
                groups[task.status].push(task);
            }
        }
        return groups;
    }, [tasks, columns]);

    return (
        <div className="p-4">
            <div className="flex justify-end gap-2 mb-4">
                {isAdmin && (
                    <>
                        {isEditMode && (
                            <>
                                <button
                                    onClick={() => setIsNewTaskModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <PlusIcon /> Asignar Tarea
                                </button>
                                <button
                                    onClick={() => setIsNewColumnModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <PlusIcon /> Nueva Columna
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => setIsEditMode(prev => !prev)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                isEditMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-700/50 hover:bg-gray-600/80 text-white'
                            }`}
                        >
                            {isEditMode ? <CheckIcon /> : <PlusIcon />} {isEditMode ? 'Salir de Edición' : 'Editar Tareas'}
                        </button>
                    </>
                )}
            </div>
            <div ref={scrollContainerRef} className="overflow-x-auto">
                <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="flex gap-4">
                        {Object.entries(columns).map(([id, column]) => (
                            <KanbanColumn
                                key={id}
                                id={id}
                                title={column.title}
                                tasks={groupedTasks[id]}
                                isAdmin={isAdmin}
                                isEditMode={isEditMode}
                                onRenameColumn={handleRenameColumn}
                                onDeleteColumn={handleDeleteColumn}
                                onEditTask={handleEditTask}
                            />
                        ))}
                    </div>
                     <DragOverlay>
                        {activeTask ? <TaskCard task={activeTask} onEdit={() => {}} isAdmin={isAdmin} isEditMode={isEditMode} /> : null}
                    </DragOverlay>
                </DndContext>
            </div>
             <TaskEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveTask}
                task={taskToEdit}
                members={members}
            />
            <NewColumnModal
                isOpen={isNewColumnModalOpen}
                onClose={() => setIsNewColumnModalOpen(false)}
                onAddColumn={handleAddColumn}
            />
            <NewTaskModal
                isOpen={isNewTaskModalOpen}
                onClose={() => setIsNewTaskModalOpen(false)}
                onAddTask={handleAddTask}
                members={members}
            />
        </div>
    );
}
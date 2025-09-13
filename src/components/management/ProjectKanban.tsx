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
import { fetchKanbanTasks } from '@/services/fetchAniList';

const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>;

interface ProjectKanbanProps {
    isAdmin: boolean;
    members: { id: string, username: string, avatar_url: string }[];
    groupId: string;
}

export default function ProjectKanban({ isAdmin, members, groupId }: ProjectKanbanProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isNewColumnModalOpen, setIsNewColumnModalOpen] = useState(false);
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeId, setActiveId] = useState(null);
    
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

    const loadKanbanTasks = async () => {
        setIsLoading(true);
        const fetchedTasks = await fetchKanbanTasks(groupId);
        setTasks(fetchedTasks);
        setIsLoading(false);
    };

    useEffect(() => {
        if (groupId) {
            loadKanbanTasks();
        }
    }, [groupId]);

    const handleDragStart = (event) => {
        const task = tasks.find(t => t.id === event.active.id);
        if (task) setActiveTask(task);
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);
        setActiveId(null);
        const { active, over } = event;

        if (!over) return;
        
        const sourceColumn = tasks.find(t => t.id === active.id)?.status;
        const destinationId = over.id.toString();
        const destinationColumn = Object.keys(columns).find(colId => 
            colId === destinationId || groupedTasks[colId].some(t => t.id === destinationId)
        );

        if (!destinationColumn) return;

        if (sourceColumn !== destinationColumn) {
            setTasks(prevTasks => prevTasks.map(t => t.id === active.id ? { ...t, status: destinationColumn } : t));
        } else {
            const currentTasks = groupedTasks[sourceColumn];
            const oldIndex = currentTasks.findIndex(t => t.id === active.id);
            const newIndex = currentTasks.findIndex(t => t.id === over.id);
            
            if (oldIndex !== newIndex) {
                const newOrder = arrayMove(currentTasks, oldIndex, newIndex);
                setTasks(prevTasks => {
                    const otherTasks = prevTasks.filter(t => t.status !== sourceColumn);
                    return [...otherTasks, ...newOrder];
                });
            }
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
            mangaId: 0,
            chapterNumber: '',
            status: 'raw',
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
            {isLoading ? (
                <p className="text-center text-white">Cargando tablero...</p>
            ) : (
                <div ref={scrollContainerRef} className="overflow-x-auto">
                    {Object.keys(columns).length > 0 ? (
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
                                        activeId={activeId}
                                    />
                                ))}
                            </div>
                            <DragOverlay>
                                {activeTask ? <TaskCard task={activeTask} onEdit={() => {}} isAdmin={isAdmin} isEditMode={isEditMode} isOverlay={true} /> : null}
                            </DragOverlay>
                        </DndContext>
                    ) : (
                        <div className="text-center py-20 bg-[#201f31] rounded-lg">
                            <p className="text-gray-400">No hay columnas para mostrar. Agrega una para empezar.</p>
                        </div>
                    )}
                </div>
            )}
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
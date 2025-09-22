// src/components/management/ProjectKanban.tsx
"use client";
import { useState, useMemo, useRef, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { Task, TaskStatus, StatusColumns, Media, Subtask } from '@/types/AniListResponse';
import { TaskCard } from './TaskCard';
import TaskEditModal from './TaskEditModal';
import NewColumnModal from './NewColumnModal';
import NewTaskModal from './NewTaskModal';
import { arrayMove } from '@dnd-kit/sortable';
import { useAuth } from '@/context/AuthContext';
import { fetchKanbanTasks, fetchGroupProjects } from '@/services/fetchAniList';
import { createClient } from '@/lib/supabaseClient';
import Image from 'next/image';

const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>;
const KanbanIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>;
const ListIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;

interface ProjectKanbanProps {
    isAdmin: boolean;
    members: { id: string, username: string, avatar_url: string }[];
    groupId: string;
}

export default function ProjectKanban({ isAdmin, members, groupId }: ProjectKanbanProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Media[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isNewColumnModalOpen, setIsNewColumnModalOpen] = useState(false);
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeId, setActiveId] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    
    const { addToast } = useAuth();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    const defaultColumns = useMemo(() => {
        const columns: { [key: string]: { title: string, items: Task[] } } = {};
        Object.entries(StatusColumns).forEach(([key, value]) => { columns[key] = { title: value, items: [] }; });
        return columns;
    }, []);

    const [columns, setColumns] = useState(defaultColumns);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const loadKanbanData = async () => {
        if (groupId) {
            setIsLoading(true);
            const [fetchedTasks, fetchedProjects] = await Promise.all([ fetchKanbanTasks(groupId), fetchGroupProjects(groupId) ]);
            setTasks(fetchedTasks);
            setProjects(fetchedProjects);
            setIsLoading(false);
        }
    };

    useEffect(() => { loadKanbanData(); }, [groupId]);

    const handleDragStart = (event: DragStartEvent) => { const task = tasks.find(t => t.id === event.active.id); if (task) setActiveTask(task); setActiveId(event.active.id as any); };
    const handleDragEnd = async (event: DragEndEvent) => { const { active, over } = event; setActiveTask(null); setActiveId(null); if (!over) return; const sourceTask = tasks.find(t => t.id === active.id); if (!sourceTask) return; const destinationId = over.id.toString(); const destinationColumn = Object.keys(columns).find(colId => colId === destinationId || (groupedTasks[colId] && groupedTasks[colId].some(t => t.id === destinationId))); if (!destinationColumn) return; if (sourceTask.status !== destinationColumn) { setTasks(prevTasks => prevTasks.map(t => t.id === active.id ? { ...t, status: destinationColumn } : t)); const { error } = await supabase.from('kanban_tasks').update({ status: destinationColumn }).eq('id', active.id); if (error) { addToast('Error al mover la tarea.', 'error'); await loadKanbanData(); } } };
    const handleRenameColumn = (columnId: string, newTitle: string) => { setColumns(prev => ({ ...prev, [columnId]: { ...prev[columnId], title: newTitle } })); };
    const handleAddColumn = (columnName: string) => { const newColumnId = `col-${Date.now()}`; setColumns(prev => ({ ...prev, [newColumnId]: { title: columnName, items: [] } })); setIsNewColumnModalOpen(false); addToast(`Columna "${columnName}" agregada.`, 'success'); };
    const handleDeleteColumn = (columnId: string) => { setColumns(prev => { const newColumns = { ...prev }; delete newColumns[columnId]; return newColumns; }); };

    const handleEditTask = (task: Task) => { setTaskToEdit(task); setIsEditModalOpen(true); };

    const handleSaveTask = async (updatedTask: Task, subtasks: Subtask[], deletedSubtaskIds: string[]) => {
        const { error: taskUpdateError } = await supabase.from('kanban_tasks').update({ title: updatedTask.title, color: updatedTask.color, description: updatedTask.description, due_date: updatedTask.due_date || null }).eq('id', updatedTask.id);
        if (taskUpdateError) { addToast('Error al guardar la tarea principal.', 'error'); return; }

        if (deletedSubtaskIds.length > 0) {
            const { error: deleteError } = await supabase.from('kanban_subtasks').delete().in('id', deletedSubtaskIds);
            if (deleteError) { addToast('Error al eliminar subtareas.', 'error'); return; }
        }

        for (const subtask of subtasks) {
            if (subtask.id && subtask.id.startsWith('new-')) {
                const { data: newSubtaskData, error: createError } = await supabase.from('kanban_subtasks').insert({ parent_task_id: updatedTask.id, title: subtask.title, description: subtask.description }).select('id').single();
                if (createError) { addToast(`Error al crear la subtarea "${subtask.title}".`, 'error'); continue; }
                const assignees = subtask.assignees.map(a => ({ subtask_id: newSubtaskData.id, user_id: a.profile.id }));
                if (assignees.length > 0) { await supabase.from('kanban_subtask_assignees').insert(assignees); }
            } else {
                await supabase.from('kanban_subtasks').update({ title: subtask.title, description: subtask.description, completed: subtask.completed }).eq('id', subtask.id);
                await supabase.from('kanban_subtask_assignees').delete().eq('subtask_id', subtask.id);
                const assignees = subtask.assignees.map(a => ({ subtask_id: subtask.id, user_id: a.profile.id }));
                if (assignees.length > 0) { await supabase.from('kanban_subtask_assignees').insert(assignees); }
            }
        }
        
        const { error: deleteAssigneesError } = await supabase.from('assigned_users').delete().eq('task_id', updatedTask.id);
        if (deleteAssigneesError) { addToast('Error al actualizar asignados (borrado).', 'error'); return; }

        if (updatedTask.assignedTo && updatedTask.assignedTo.length > 0) {
            const newAssignments = updatedTask.assignedTo.map(user => ({ task_id: updatedTask.id, user_id: user.id }));
            const { error: insertAssigneesError } = await supabase.from('assigned_users').insert(newAssignments);
            if (insertAssigneesError) { addToast('Error al actualizar asignados (inserción).', 'error'); return; }
        }

        addToast('Tarea actualizada correctamente.', 'success');
        setIsEditModalOpen(false);
        await loadKanbanData();
    };

    const handleAddTask = async (newTaskData: { title: string, projectId: number | null, assignedTo: { id: string }[], color: string }) => {
        const { data: newTask, error: taskError } = await supabase.from('kanban_tasks').insert({ group_id: groupId, project_id: newTaskData.projectId, title: newTaskData.title, color: newTaskData.color, status: 'raw' }).select().single();
        if (taskError) { addToast('No se pudo crear la tarea.', 'error'); return; }
        if (newTaskData.assignedTo && newTaskData.assignedTo.length > 0) {
            const assignments = newTaskData.assignedTo.map(user => ({ task_id: newTask.id, user_id: user.id }));
            const { error: assignmentError } = await supabase.from('assigned_users').insert(assignments);
            if (assignmentError) { addToast('Tarea creada, pero hubo un error al asignar usuarios.', 'error'); }
        }
        addToast('Nueva tarea creada con éxito.', 'success');
        setIsNewTaskModalOpen(false);
        await loadKanbanData();
    };

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        const { error } = await supabase.from('kanban_tasks').update({ status: newStatus }).eq('id', taskId);
        if (error) { addToast('Error al cambiar el estado de la tarea.', 'error'); await loadKanbanData(); }
    };

    const groupedTasks = useMemo(() => {
        const groups: { [key: string]: Task[] } = {};
        for (const colId of Object.keys(columns)) { groups[colId] = []; }
        for (const task of tasks) { if (groups[task.status]) { groups[task.status].push(task); } }
        return groups;
    }, [tasks, columns]);

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center bg-gray-700/50 rounded-full p-1">
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-full ${viewMode === 'list' ? 'bg-[#ffbade] text-black' : 'text-gray-400'}`} title="Vista de Lista"><ListIcon /></button>
                    <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-full ${viewMode === 'kanban' ? 'bg-[#ffbade] text-black' : 'text-gray-400'}`} title="Vista Kanban"><KanbanIcon /></button>
                </div>
                {isAdmin && (<button onClick={() => setIsNewTaskModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-indigo-600 hover:bg-indigo-700 text-white"><PlusIcon /> Nueva Tarea</button>)}
            </div>
            {isLoading ? ( <p className="text-center text-white">Cargando tablero...</p> ) : viewMode === 'list' ? (
                <div className="bg-[#201f31] rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase border-b border-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 w-2/5">Tarea</th>
                                <th scope="col" className="px-6 py-3">Asignados</th>
                                <th scope="col" className="px-6 py-3">Fecha</th>
                                <th scope="col" className="px-6 py-3">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {tasks.map(task => (
                                <tr key={task.id} className="hover:bg-gray-700/20">
                                    <td className="px-6 py-4"><div onClick={() => handleEditTask(task)} className="font-semibold text-white cursor-pointer hover:text-[#ffbade]">{task.title}</div><div className="text-xs text-gray-400">{projects.find(p => p.id === task.project_id)?.title.romaji || 'General'}</div></td>
                                    <td className="px-6 py-4"><div className="flex -space-x-2">{task.assignedTo?.map(user => <Image key={user.id} src={user.avatarUrl} title={user.username} className="w-8 h-8 rounded-full border-2 border-[#201f31]" width={32} height={32} />)}</div></td>
                                    <td className={`px-6 py-4 font-semibold ${task.due_date && new Date(task.due_date) < new Date() ? 'text-red-400' : 'text-gray-300'}`}>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-6 py-4"><select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)} className="bg-gray-700 text-white text-xs font-semibold rounded-full px-3 py-1 border border-transparent focus:outline-none focus:ring-2 focus:ring-[#ffbade]">{Object.entries(StatusColumns).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div ref={scrollContainerRef} className="overflow-x-auto">
                    {Object.keys(columns).length > 0 ? (
                        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                            <div className="flex gap-4">
                                {Object.entries(columns).map(([id, column]) => ( <KanbanColumn key={id} id={id} title={column.title} tasks={groupedTasks[id] || []} isAdmin={isAdmin} isEditMode={false} onRenameColumn={handleRenameColumn} onDeleteColumn={handleDeleteColumn} onEditTask={handleEditTask} activeId={activeId} /> ))}
                            </div>
                            <DragOverlay>
                                {activeTask ? <TaskCard task={activeTask} onEdit={() => {}} isAdmin={isAdmin} isEditMode={false} isOverlay={true} /> : null}
                            </DragOverlay>
                        </DndContext>
                    ) : ( <div className="text-center py-20 bg-[#201f31] rounded-lg"><p className="text-gray-400">No hay columnas para mostrar.</p></div> )}
                </div>
            )}
            <TaskEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveTask} task={taskToEdit} members={members} />
            <NewColumnModal isOpen={isNewColumnModalOpen} onClose={() => setIsNewColumnModalOpen(false)} onAddColumn={handleAddColumn} />
            <NewTaskModal isOpen={isNewTaskModalOpen} onClose={() => setIsNewTaskModalOpen(false)} onAddTask={handleAddTask} members={members} projects={projects} />
        </div>
    );
}
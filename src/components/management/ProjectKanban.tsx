// src/components/management/ProjectKanban.tsx
"use client";
import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { Task, TaskStatus, StatusColumns } from '@/types/AniListResponse';
import { TaskCard } from './TaskCard';

const initialTasks: Task[] = [
    { id: '30002-378', mangaId: 30002, chapterNumber: '378', title: 'Berserk', coverImage: '', status: 'raw', assignedTo: [{ username: 'Kaiser', avatarUrl: 'https://i.pravatar.cc/150?u=user004' }] },
    { id: '105778-150', mangaId: 105778, chapterNumber: '150', title: 'Chainsaw Man', coverImage: '', status: 'translating' },
    { id: '30013-1100', mangaId: 30013, chapterNumber: '1100', title: 'One Piece', coverImage: '', status: 'cleaning' },
    { id: '105398-205', mangaId: 105398, chapterNumber: '205', title: 'Solo Leveling', coverImage: '', status: 'typesetting', assignedTo: [{ username: 'Zephyr', avatarUrl: 'https://i.pravatar.cc/150?u=user005' }] },
    { id: '120980-95', mangaId: 120980, chapterNumber: '95', title: 'Nano Machine', coverImage: '', status: 'quality-check' },
];


export default function ProjectKanban() {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }));

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find(t => t.id === event.active.id);
        if (task) setActiveTask(task);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setTasks(items => {
                const activeIndex = items.findIndex(item => item.id === active.id);
                const overStatus = over.id as TaskStatus;

                const updatedTasks = [...items];
                updatedTasks[activeIndex].status = overStatus;
                return updatedTasks;
            });
        }
    };
    
    return (
        <div className="overflow-x-auto p-4">
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex gap-4">
                    {Object.entries(StatusColumns).map(([status, title]) => (
                        <KanbanColumn
                            key={status}
                            id={status}
                            title={title}
                            tasks={tasks.filter(t => t.status === status)}
                        />
                    ))}
                </div>
                 <DragOverlay>
                    {activeTask ? <TaskCard task={activeTask} /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
// src/components/group/AnalyticsTab.tsx
"use client";
import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend, CartesianGrid } from 'recharts';
import { createClient } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

const supabase = createClient();

interface AnalyticsData {
    projectPerformance: { name: string; tasksCompleted: number }[];
    activityOverTime: { month: string; tasksCompleted: number }[];
    memberContributions: { username: string; avatar_url: string; tasksCompleted: number }[];
}

const AnalyticsTab = ({ groupId }: { groupId: string }) => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useAuth();

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            setIsLoading(true);
            try {
                const { data: tasks, error: tasksError } = await supabase
                    .from('kanban_tasks')
                    .select(`
                        id,
                        created_at,
                        project:scan_projects!kanban_tasks_project_id_fkey (
                            media ( title_romaji )
                        ),
                        assigned_users (
                            profiles (id, username, avatar_url)
                        )
                    `)
                    .eq('group_id', groupId)
                    .eq('status', 'published');

                if (tasksError) throw tasksError;

                const projectPerformanceMap = new Map<string, number>();
                tasks.forEach(task => {
                    const projectName = task.project?.media?.title_romaji || 'Tareas Generales';
                    projectPerformanceMap.set(projectName, (projectPerformanceMap.get(projectName) || 0) + 1);
                });
                const projectPerformance = Array.from(projectPerformanceMap.entries()).map(([name, tasksCompleted]) => ({ name, tasksCompleted }));

                const activityMap = new Map<string, number>();
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
                
                for (let i = 0; i < 6; i++) {
                    const date = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
                    const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
                    activityMap.set(monthKey, 0);
                }

                tasks.forEach(task => {
                    const taskDate = new Date(task.created_at);
                    if (taskDate >= sixMonthsAgo) {
                         const monthKey = taskDate.toLocaleString('default', { month: 'short', 'year': '2-digit' });
                         if(activityMap.has(monthKey)) {
                            activityMap.set(monthKey, (activityMap.get(monthKey) || 0) + 1);
                         }
                    }
                });
                const activityOverTime = Array.from(activityMap.entries()).map(([month, tasksCompleted]) => ({ month, tasksCompleted }));

                const memberContributionsMap = new Map<string, { avatar_url: string; tasksCompleted: number }>();
                 tasks.forEach(task => {
                    task.assigned_users.forEach(assignment => {
                        const user = assignment.profiles;
                        if (user) {
                            const existing = memberContributionsMap.get(user.username) || { avatar_url: user.avatar_url, tasksCompleted: 0 };
                            memberContributionsMap.set(user.username, { ...existing, tasksCompleted: existing.tasksCompleted + 1 });
                        }
                    });
                });
                const memberContributions = Array.from(memberContributionsMap.entries()).map(([username, data]) => ({ username, ...data }));

                setAnalyticsData({ projectPerformance, activityOverTime, memberContributions });

            } catch (error) {
                console.error("Error fetching analytics:", error);
                addToast('No se pudieron cargar las analíticas.', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalyticsData();
    }, [groupId]);

    if (isLoading) {
        return <p className="text-center text-gray-400 py-16">Cargando analíticas...</p>;
    }

    if (!analyticsData || analyticsData.projectPerformance.length === 0) {
        return <p className="text-center text-gray-400 py-16">No hay suficientes datos para mostrar las analíticas.</p>;
    }

    return (
        <div className="py-8 space-y-12">
            <section className="bg-[#201f31] p-6 rounded-lg">
                <h3 className="text-xl font-bold text-white mb-4 text-center">Rendimiento de Proyectos (Tareas Completadas)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.projectPerformance} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                        <XAxis type="number" stroke="#888888" allowDecimals={false} />
                        <YAxis type="category" dataKey="name" stroke="#888888" width={120} tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#2b2d42', border: '1px solid #4a5568' }} cursor={{fill: '#ffffff10'}}/>
                        <Bar dataKey="tasksCompleted" name="Tareas" fill="#ffbade" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </section>
            
            <section className="bg-[#201f31] p-6 rounded-lg">
                <h3 className="text-xl font-bold text-white mb-4 text-center">Actividad del Grupo (Últimos 6 Meses)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.activityOverTime}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4a556850" />
                        <XAxis dataKey="month" stroke="#888888" />
                        <YAxis stroke="#888888" allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#2b2d42', border: '1px solid #4a5568' }} />
                        <Legend />
                        <Line type="monotone" dataKey="tasksCompleted" name="Tareas Completadas" stroke="#ffbade" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </section>

            <section className="bg-[#201f31] p-6 rounded-lg">
                <h3 className="text-xl font-bold text-white mb-4">Contribuciones de Miembros (Tareas Completadas)</h3>
                 <div className="space-y-3">
                    {analyticsData.memberContributions.sort((a, b) => b.tasksCompleted - a.tasksCompleted).map(member => (
                        <div key={member.username} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-md">
                            <div className="flex items-center gap-3">
                                <Image src={member.avatar_url} alt={member.username} width={40} height={40} className="rounded-full" />
                                <span className="font-semibold text-white">{member.username}</span>
                            </div>
                            <span className="font-bold text-lg text-[#ffbade]">{member.tasksCompleted}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AnalyticsTab;
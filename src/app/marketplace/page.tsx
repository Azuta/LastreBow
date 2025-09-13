// src/app/marketplace/page.tsx
"use client";

import { useState, useMemo, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import MarketplacePluginCard from '@/components/marketplace/MarketplacePluginCard';
import { Plugin } from '@/types/AniListResponse';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/context/AuthContext';

const MOCK_PLUGINS: Plugin[] = [
    {
        id: 'user-list-stats',
        type: 'user',
        name: 'Estadísticas de la Lista',
        description: 'Visualiza estadísticas detalladas de tus listas, como la distribución de géneros, puntuación promedio y estado de publicación de los mangas. Una herramienta esencial para los coleccionistas.',
        isInstalled: false,
        icon: '📊',
    },
    {
        id: 'user-profile-themes',
        type: 'user',
        name: 'Temas Personalizados',
        description: 'Accede a una variedad de temas de color predefinidos para personalizar la apariencia de tu perfil. Expresa tu estilo único en la comunidad.',
        isInstalled: false,
        icon: '🎨',
    },
    {
        id: 'reader-waterfall-mode',
        type: 'reader',
        name: 'Modo de Lectura Cascada',
        description: 'Mejora tu experiencia de lectura con una animación de desplazamiento suave y un precargado automático del siguiente capítulo, ideal para tiras largas.',
        isInstalled: false,
        icon: '📜',
    },
    {
        id: 'scan-kanban-board',
        type: 'scan',
        name: 'Tablero Kanban Avanzado',
        description: 'Herramienta de gestión de proyectos para scangroups con asignación de roles, seguimiento de tareas en tiempo real y notificaciones de progreso. (Requiere rol de líder o miembro).',
        isInstalled: false,
        icon: '📋',
    },
    {
        id: 'scan-analytics-pro',
        type: 'scan',
        name: 'Analíticas Pro de Grupo',
        description: 'Obtén métricas avanzadas sobre la audiencia y popularidad de tus proyectos. Impulsa el crecimiento de tu scanlation con datos precisos. (Requiere rol de líder).',
        isInstalled: false,
        icon: '📈',
    },
        {
        id: 'scan-analytics-asdaspro',
        type: 'scan',
        name: 'Nombre del scan detalles extra como colores, iconos, bordes al perfil',
        description: 'Agregar detalles extra al nombre, perfil, banner del scan',
        isInstalled: false,
        icon: '📈',
    },
];

const supabase = createClientComponentClient();

const MarketplacePage = () => {
    const { profile } = useAuth();
    const [plugins, setPlugins] = useState<Plugin[]>(MOCK_PLUGINS);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        const fetchInstalledPlugins = async () => {
            if (!profile) return;
            const { data, error } = await supabase.from('user_plugins').select('plugin_id').eq('user_id', profile.id);
            if (error) {
                console.error('Error fetching plugins:', error);
                return;
            }
            
            const installedPluginIds = new Set(data.map(p => p.plugin_id));
            
            const updatedPlugins = MOCK_PLUGINS.map(p => ({
                ...p,
                isInstalled: installedPluginIds.has(p.id)
            }));
            
            setPlugins(updatedPlugins);
        };
        
        fetchInstalledPlugins();
    }, [profile]);

    const handleAction = async (pluginId: string, action: 'install' | 'uninstall', pluginType: string) => {
        const res = await fetch('/api/plugins', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pluginId, action, pluginType }),
        });
        
        if (res.ok) {
            setPlugins(prev => prev.map(p =>
                p.id === pluginId ? { ...p, isInstalled: action === 'install' } : p
            ));
        } else {
            console.error('Failed to update plugin status');
        }
    };

    const filteredPlugins = useMemo(() => {
        if (activeTab === 'all') {
            return plugins;
        }
        return plugins.filter(p => p.type === activeTab);
    }, [activeTab, plugins]);

    const tabs = [
        { id: 'all', name: 'Todos' },
        { id: 'user', name: 'Usuario' },
        { id: 'reader', name: 'Lector' },
        { id: 'scan', name: 'Scan' },
    ];

    return (
        <>
            <Navbar />
            <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-white">Marketplace</h1>
                    <p className="text-gray-400 mt-2">Personaliza tu experiencia con módulos adicionales.</p>
                </div>
                
                <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                                activeTab === tab.id 
                                ? 'text-white border-[#ffbade]' 
                                : 'text-gray-400 border-transparent hover:text-white'
                            }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPlugins.map(plugin => (
                        <MarketplacePluginCard key={plugin.id} plugin={plugin} onAction={handleAction} isInstalled={plugin.isInstalled} />
                    ))}
                </div>
            </main>
        </>
    );
};

export default MarketplacePage;
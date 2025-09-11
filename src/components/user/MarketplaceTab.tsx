// src/components/user/MarketplaceTab.tsx
"use client";

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plugin } from '@/types/AniListResponse';
import MarketplacePluginCard from '@/components/marketplace/MarketplacePluginCard';

// Lista simulada de plugins instalados por el usuario
const MOCK_INSTALLED_PLUGINS: Plugin[] = [
    {
        id: 'user-list-stats',
        type: 'user',
        name: 'Estadísticas de la Lista',
        description: 'Visualiza estadísticas detalladas de tus listas, como la distribución de géneros, puntuación promedio y estado de publicación de los mangas. Una herramienta esencial para los coleccionistas.',
        isInstalled: true,
        icon: '📊',
    },
    {
        id: 'scan-kanban-board',
        type: 'scan',
        name: 'Tablero Kanban Avanzado',
        description: 'Herramienta de gestión de proyectos para scangroups con asignación de roles, seguimiento de tareas en tiempo real y notificaciones de progreso. (Requiere rol de líder o miembro).',
        isInstalled: true,
        icon: '📋',
    },
    // Podrías añadir más plugins instalados aquí
];

const MarketplaceTab = () => {
    const { profile } = useAuth();
    const [plugins, setPlugins] = useState<Plugin[]>(MOCK_INSTALLED_PLUGINS);

    const handleAction = (pluginId: string) => {
        setPlugins(prev => prev.map(p =>
            p.id === pluginId ? { ...p, isInstalled: !p.isInstalled } : p
        ));
    };

    if (!profile) {
        return <div className="text-center py-16 text-gray-400">Cargando...</div>;
    }

    return (
        <div className="py-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Mis Plugins Instalados</h2>
            
            {plugins.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plugins.map(plugin => (
                        <MarketplacePluginCard 
                            key={plugin.id} 
                            plugin={plugin} 
                            onAction={handleAction} 
                            isInstalled={plugin.isInstalled}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-[#201f31] rounded-lg">
                    <p className="text-gray-400">Aún no tienes ningún plugin instalado.</p>
                </div>
            )}
        </div>
    );
};

export default MarketplaceTab;
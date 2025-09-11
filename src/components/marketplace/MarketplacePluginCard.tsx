// src/components/marketplace/MarketplacePluginCard.tsx
"use client";
import { Plugin } from '@/types/AniListResponse';
import React from 'react';

interface MarketplacePluginCardProps {
    plugin: Plugin;
    onAction: (pluginId: string) => void;
}

const MarketplacePluginCard = ({ plugin, onAction }: MarketplacePluginCardProps) => {
    const isInstalled = plugin.isInstalled;
    
    const getBadgeColor = (type: string) => {
        switch(type) {
            case 'user': return 'bg-blue-600';
            case 'reader': return 'bg-purple-600';
            case 'scan': return 'bg-orange-600';
            default: return 'bg-gray-600';
        }
    };
    
    return (
        <div className="bg-[#201f31] rounded-lg p-6 h-full flex flex-col justify-between">
            <div>
                <div className="text-4xl mb-4">{plugin.icon}</div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{plugin.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getBadgeColor(plugin.type)} text-white capitalize`}>
                        {plugin.type}
                    </span>
                </div>
                <p className="text-gray-400 text-sm">{plugin.description}</p>
            </div>
            <div className="mt-6">
                {isInstalled ? (
                    <button
                        onClick={() => onAction(plugin.id)}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                        Desinstalar
                    </button>
                ) : (
                    <button
                        onClick={() => onAction(plugin.id)}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                    >
                        Instalar
                    </button>
                )}
            </div>
        </div>
    );
};

export default MarketplacePluginCard;
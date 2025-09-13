// src/components/group/ScanHistoryTab.tsx
import React from 'react';
import Image from 'next/image';
import { ScanHistoryItem } from '@/types/AniListResponse';

interface ScanHistoryTabProps {
    history: ScanHistoryItem[];
}

const actionMessages = {
    'create_project': (username: string, data: any) => `${username} creó el proyecto "${data.title}".`,
    'propose_project': (username: string, data: any) => `${username} sugirió un nuevo proyecto: "${data.title}".`,
    'approve_proposal': (username: string, data: any) => `${username} aprobó la propuesta de "${data.title}".`,
    'add_member': (username: string, data: any) => `${username} añadió a ${data.memberUsername} al grupo.`,
    'new_announcement': (username: string) => `${username} publicó un nuevo anuncio.`,
};

const ScanHistoryTab = ({ history }: ScanHistoryTabProps) => {
    if (history.length === 0) {
        return (
            <div className="text-center py-20 bg-[#201f31] rounded-lg">
                <p className="text-gray-400">No hay actividad reciente en este scan.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-4 py-8">
            {history.map(item => {
                const message = actionMessages[item.action_type]?.(item.user.username, item.action_data) || `${item.user.username} realizó una acción desconocida.`;
                return (
                    <div key={item.id} className="bg-[#201f31] p-4 rounded-lg flex items-center gap-4">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            <Image src={item.user.avatar_url} alt={item.user.username} layout="fill" objectFit="cover" />
                        </div>
                        <p className="text-sm text-white">
                            {message}
                        </p>
                        <span className="ml-auto text-xs text-gray-500">
                            {new Date(item.created_at).toLocaleDateString()}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default ScanHistoryTab;
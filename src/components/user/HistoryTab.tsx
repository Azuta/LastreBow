// src/components/user/HistoryTab.tsx
"use client";

import React from 'react';
import Link from 'next/link';

interface HistoryItem {
    id: number;
    user_id: string;
    action_type: string;
    media_id: number;
    action_data: { title: string, listId?: number, listName?: string };
    created_at: string;
    is_private: boolean;
}

interface HistoryTabProps {
    activity: HistoryItem[];
    isOwnProfile: boolean;
    hideAdultContentOnProfile: boolean;
}

const actionMessages = {
    add_favorite: (data) => `añadió ${data.title} a sus favoritos.`,
    remove_favorite: (data) => `eliminó ${data.title} de sus favoritos.`,
    create_list: (data) => `creó la lista "${data.listName}".`,
    new_review: (data) => `escribió una reseña para ${data.title}.`,
    new_comment: (data) => `dejó un comentario en la página de ${data.title}.`,
};

const HistoryTab = ({ activity, isOwnProfile, hideAdultContentOnProfile }: HistoryTabProps) => {
    
    // Filtra las actividades privadas si no es el perfil del usuario o si ha activado la opción
    const visibleActivity = activity.filter(item => {
        if (!isOwnProfile && item.is_private) {
            return false;
        }
        return true;
    });

    if (visibleActivity.length === 0) {
        return (
            <div className="text-center py-20 bg-[#201f31] rounded-lg">
                <p className="text-gray-400">No hay actividad para mostrar en este momento.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-4 py-8">
            {visibleActivity.map(item => (
                <div key={item.id} className="bg-[#201f31] p-4 rounded-lg flex items-center gap-4">
                    <div className="flex-shrink-0 text-[#ffbade]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 12 11 15"></polyline></svg>
                    </div>
                    <p className="text-sm text-white">
                        <span className="font-semibold text-[#ffbade]">{isOwnProfile ? 'Tú' : 'El usuario'}</span>{' '}
                        {actionMessages[item.action_type](item.action_data)}
                    </p>
                    <span className="ml-auto text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    {item.is_private && <span className="text-xs text-red-500">(Privado)</span>}
                </div>
            ))}
        </div>
    );
};

export default HistoryTab;
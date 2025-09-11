// src/components/user/CustomListsTab.tsx
"use client";

import { useState } from 'react';
import { UserList } from '@/types/AniListResponse';
import MangaListCard from '@/components/ui/cards/MangaListCard';
import ListEditModal from './ListEditModal';
import { useAuth } from '@/context/AuthContext';

// Se eliminan las props y se usa el contexto
const CustomListsTab = () => {
    // Obtenemos los datos y funciones del contexto, incluyendo userLists
    const { profile, createList, userLists } = useAuth(); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Obtenemos el username del perfil del contexto
    const username = profile?.username;
    const isOwnProfile = profile?.username === username;

    const handleSaveList = async (listData: { name: string; description: string; is_public: boolean }) => {
        const success = await createList(listData);
        if (success) {
            setIsModalOpen(false);
        }
    };

    if (!username) {
        return <div className="text-center py-16 text-gray-400">Cargando...</div>;
    }

    return (
        <>
            <div className="flex justify-between items-center py-8">
                <h2 className="text-2xl font-semibold text-white">Listas de {username}</h2>
                {isOwnProfile && (
                     <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                    >
                        <PlusIcon />
                        Crear Lista
                    </button>
                )}
            </div>

            {userLists.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <p>{username} no ha creado ninguna lista pública todavía.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userLists.map(list => (
                        <MangaListCard key={list.id} list={list} />
                    ))}
                </div>
            )}

            <ListEditModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveList}
            />
        </>
    );
};

export default CustomListsTab;

const PlusIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
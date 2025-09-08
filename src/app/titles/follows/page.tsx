// src/app/titles/follows/page.tsx
"use client";

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';
import Link from 'next/link';

// --- Datos de prueba para los usuarios seguidos ---
const MOCK_FOLLOWED_USERS = [
    {
        id: 'user001',
        username: 'MangaReaderX',
        avatarUrl: 'https://i.pravatar.cc/150?u=user001',
        listsCount: 5,
        favoritesCount: 25,
    },
    {
        id: 'user002',
        username: 'SakuraFan',
        avatarUrl: 'https://i.pravatar.cc/150?u=user002',
        listsCount: 3,
        favoritesCount: 18,
    },
    {
        id: 'user003',
        username: 'SeinenEnjoyer',
        avatarUrl: 'https://i.pravatar.cc/150?u=user003',
        listsCount: 8,
        favoritesCount: 50,
    }
];

// --- Componente para la tarjeta de un usuario seguido ---
const FollowedUserCard = ({ user, onUnfollow }: { user: typeof MOCK_FOLLOWED_USERS[0], onUnfollow: (userId: string) => void }) => {
    return (
        <div className="bg-[#201f31] rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <Link href={`/user/${user.username}`} className="flex items-center gap-4 group w-full">
                <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    <Image src={user.avatarUrl} alt={user.username} layout="fill" objectFit="cover" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-[#ffbade] transition-colors">{user.username}</h3>
                    <p className="text-sm text-gray-400">{user.listsCount} listas · {user.favoritesCount} favoritos</p>
                </div>
            </Link>
            <button
                onClick={() => onUnfollow(user.id)}
                className="w-full sm:w-auto px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg text-sm font-semibold hover:bg-red-900/60 hover:text-red-300 transition-colors flex-shrink-0"
            >
                Dejar de seguir
            </button>
        </div>
    );
};


const FollowsPage = () => {
    const [followedUsers, setFollowedUsers] = useState(MOCK_FOLLOWED_USERS);
    const [searchTerm, setSearchTerm] = useState("");

    const handleUnfollow = (userId: string) => {
        // Simula la acción de dejar de seguir
        setFollowedUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    };

    const filteredUsers = followedUsers.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Navbar />
            <main className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h1 className="text-4xl font-bold text-white">Siguiendo</h1>
                     <input
                        type="text"
                        placeholder="Buscar en tus seguidos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-auto bg-gray-700/50 text-gray-300 rounded-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#ffbade]"
                    />
                </div>

                {filteredUsers.length > 0 ? (
                    <div className="space-y-4">
                        {filteredUsers.map(user => (
                            <FollowedUserCard key={user.id} user={user} onUnfollow={handleUnfollow} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-[#201f31] rounded-lg">
                        <p className="text-gray-400">
                            {searchTerm ? `No se encontraron usuarios con el nombre "${searchTerm}".` : "No sigues a ningún usuario todavía."}
                        </p>
                    </div>
                )}
            </main>
        </>
    );
};

export default FollowsPage;
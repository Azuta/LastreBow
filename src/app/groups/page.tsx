// src/app/groups/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient';
import CreateGroupModal from '@/components/group/CreateGroupModal';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

const supabase = createClient();

const PlusIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

// --- Componente de la tarjeta para cada grupo (¡CON EL ENLACE!) ---
const GroupExplorerCard = ({ group }: { group: { id: string; name: string; logoUrl: string; membersCount: number; projectsCount: number; description: string; } }) => (
    <Link href={`/group/${group.id}`}>
        <div className="bg-[#201f31] rounded-lg p-4 flex flex-col items-center text-center h-full group transition-all hover:scale-105 hover:bg-[#2b2d42]">
            <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4">
                <Image src={group.logoUrl} alt={`${group.name} logo`} layout="fill" objectFit="cover" />
            </div>
            <h3 className="font-bold text-lg text-white group-hover:text-[#ffbade]">{group.name}</h3>
            <p className="text-sm text-gray-400 mt-2 flex-grow">{group.description}</p>
            <div className="mt-4 text-xs text-gray-500">
                <span>{group.membersCount} Miembros</span> · <span>{group.projectsCount} Proyectos</span>
            </div>
        </div>
    </Link>
);


const ExploreGroupsPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // El estado del modal ahora se maneja con los parámetros de búsqueda del URL
    const isModalOpen = searchParams.get('modal') === 'create_group';

    const fetchGroups = async () => {
        const { data, error } = await supabase.from('scan_groups').select('*');
        if (error) {
            console.error('Error fetching groups:', error);
        } else {
            const fetchedGroups = data.map(g => ({
                id: g.id,
                name: g.name,
                logoUrl: g.logo_url || 'https://i.pravatar.cc/150',
                membersCount: 0,
                projectsCount: 0,
                description: g.description || '',
            }));
            setGroups(fetchedGroups);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Funciones para manejar la apertura y cierre del modal a través del URL
    const openModal = () => {
        const params = new URLSearchParams(searchParams);
        params.set('modal', 'create_group');
        router.push(`?${params.toString()}`);
    };

    const closeModal = () => {
        const params = new URLSearchParams(searchParams);
        params.delete('modal');
        router.push(`?${params.toString()}`);
    };

    return (
        <>
            <Navbar />
            <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-bold text-white">Explorar Grupos</h1>
                    {isLoggedIn && (
                        <button 
                            onClick={openModal}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            <PlusIcon />
                            Crear Grupo
                        </button>
                    )}
                </div>
                
                <p className="text-gray-400 text-center -mt-6 mb-12">Encuentra y únete a los mejores equipos de scanlation.</p>
                <div className="mt-6 max-w-md mx-auto">
                    <input
                        type="text"
                        placeholder="Buscar un grupo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-700/50 text-gray-300 rounded-full px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#ffbade]"
                    />
                </div>

                {isLoading ? (
                    <div className="text-center py-16">
                        <p className="text-gray-400">Cargando grupos...</p>
                    </div>
                ) : (
                    filteredGroups.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-12">
                            {filteredGroups.map(group => (
                                <GroupExplorerCard key={group.id} group={group} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-gray-400">No se encontraron grupos con el nombre "{searchTerm}".</p>
                        </div>
                    )
                )}
            </main>

            {isModalOpen && <CreateGroupModal isOpen={isModalOpen} onClose={closeModal} />}
        </>
    );
};

export default ExploreGroupsPage;
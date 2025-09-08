// src/app/groups/page.tsx
"use client";

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';
import Link from 'next/link';

// --- Datos de prueba para los grupos ---
const MOCK_ALL_GROUPS = [
    { id: 'group001', name: 'No Sleep Scans', logoUrl: 'https://i.pravatar.cc/150?u=group001', membersCount: 12, projectsCount: 5, description: 'Dedicados a traer los mejores mangas de acción y seinen.' },
    { id: 'group002', name: 'Shadow Garden Scans', logoUrl: 'https://i.pravatar.cc/150?u=group002', membersCount: 8, projectsCount: 3, description: 'Traducciones de alta calidad para obras de misterio y fantasía.' },
    { id: 'group003', name: 'Isekai Fanatics', logoUrl: 'https://i.pravatar.cc/150?u=group003', membersCount: 25, projectsCount: 15, description: '¡Tu fuente número uno para todo lo relacionado con el Isekai!' },
    { id: 'group004', name: 'Romance Lovers', logoUrl: 'https://i.pravatar.cc/150?u=group004', membersCount: 18, projectsCount: 9, description: 'Especialistas en Shojo y Josei. Historias que te tocarán el corazón.' }
];

// --- Componente de la tarjeta para cada grupo (¡CON EL ENLACE!) ---
const GroupExplorerCard = ({ group }: { group: typeof MOCK_ALL_GROUPS[0] }) => (
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

    const filteredGroups = MOCK_ALL_GROUPS.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Navbar />
            <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-white">Explorar Grupos</h1>
                    <p className="text-gray-400 mt-2">Encuentra y únete a los mejores equipos de scanlation.</p>
                    <div className="mt-6 max-w-md mx-auto">
                        <input
                            type="text"
                            placeholder="Buscar un grupo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-700/50 text-gray-300 rounded-full px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#ffbade]"
                        />
                    </div>
                </div>

                {filteredGroups.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredGroups.map(group => (
                            <GroupExplorerCard key={group.id} group={group} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-gray-400">No se encontraron grupos con el nombre "{searchTerm}".</p>
                    </div>
                )}
            </main>
        </>
    );
};

export default ExploreGroupsPage;
// src/components/user/ScansTab.tsx
"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// Icono de perfil de usuario para los miembros del grupo
const UserIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

const ScansTab = () => {
    const { profile, followedScanGroups } = useAuth();
    
    // Aquí usamos los datos del mock para simular los grupos seguidos.
    // En una aplicación real, harías una consulta a la base de datos para obtener los detalles de los grupos.
    const mockFollowedGroupsDetails = [
        { id: 'group001', name: 'No Sleep Scans' },
        { id: 'group002', name: 'Shadow Garden Scans' }
    ];

    const memberOfGroup = profile?.scan_groups;
    const followedGroups = mockFollowedGroupsDetails.filter(group => followedScanGroups.includes(group.id));

    return (
        <div className="py-8 space-y-8">
            {/* Sección para el grupo al que el usuario pertenece */}
            <section>
                <h3 className="text-xl font-bold text-white mb-4">Grupo al que perteneces</h3>
                {memberOfGroup ? (
                    <Link href={`/group/${memberOfGroup.id}`}>
                        <div className="bg-[#201f31] p-4 rounded-lg flex items-center gap-4 transition-colors hover:bg-gray-700/50">
                            <div className="flex-shrink-0 text-white">
                                <UserIcon />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{memberOfGroup.name}</h4>
                                <p className="text-sm text-[#ffbade]">Miembro del Staff</p>
                            </div>
                        </div>
                    </Link>
                ) : (
                    <div className="text-gray-400 p-4 bg-[#201f31] rounded-lg">
                        <p>No perteneces a ningún grupo de escaneo.</p>
                    </div>
                )}
            </section>

            {/* Sección para los grupos que el usuario sigue */}
            <section>
                <h3 className="text-xl font-bold text-white mb-4">Scans que sigues</h3>
                {followedGroups.length > 0 ? (
                    <div className="space-y-4">
                        {followedGroups.map(group => (
                            <Link href={`/group/${group.id}`} key={group.id}>
                                <div className="bg-[#201f31] p-4 rounded-lg flex items-center gap-4 transition-colors hover:bg-gray-700/50">
                                    <div className="flex-shrink-0 text-white">
                                         {/* Aquí podrías poner el logo del grupo si lo tuvieras */}
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                    </div>
                                    <h4 className="font-bold text-white">{group.name}</h4>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-400 p-4 bg-[#201f31] rounded-lg">
                        <p>No sigues a ningún grupo de escaneo.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default ScansTab;
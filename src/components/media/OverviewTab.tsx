"use client";
import { useState } from 'react';
import { Media } from "@/types/AniListResponse";
import Link from 'next/link';

// --- Componente reutilizable para las grillas con "Mostrar más" ---
const ExpandableGrid = ({ 
    title, 
    items, 
    renderItem, 
    initialCount = 5, 
    gridClass = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" 
}: { 
    title: string;
    items: any[];
    renderItem: (item: any) => JSX.Element;
    initialCount?: number;
    gridClass?: string;
}) => {
    if (!items || items.length === 0) return null;

    const [showAll, setShowAll] = useState(false);
    
    const visibleItems = showAll ? items : items.slice(0, initialCount);

    return (
        <div>
            <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
            <div className={`grid ${gridClass} gap-4`}>
                {visibleItems.map(item => renderItem(item))}
            </div>
            {items.length > initialCount && !showAll && (
                <div className="text-center mt-4">
                    <button onClick={() => setShowAll(true)} className="text-2xl text-gray-400 hover:text-white tracking-widest leading-none">...</button>
                </div>
            )}
        </div>
    );
};

// --- Componente principal de la Pestaña Overview ---
const OverviewTab = ({ media }: { media: Media }) => {
    return (
        <div className="space-y-12 content-section">
            {/* Sección de Staff */}
            <ExpandableGrid
                title="Staff"
                items={media.staff || []}
                initialCount={5}
                renderItem={(staff) => (
                    // --- CORRECCIÓN AQUÍ ---
                    <div key={staff.id} className="flex items-center gap-3 bg-[#201f31] p-2 rounded-lg">
                        <img src={staff.image?.large} alt={staff.name?.full} className="w-12 h-12 rounded-full object-cover flex-shrink-0"/>
                        <div>
                            <p className="font-semibold text-sm text-white">{staff.name?.full}</p>
                            <p className="text-xs text-gray-400">{staff.role}</p>
                        </div>
                    </div>
                )}
            />

            {/* Sección de Personajes */}
            <ExpandableGrid
                title="Personajes"
                items={media.characters || []}
                initialCount={5}
                renderItem={(char) => (
                    // --- CORRECIÓN AQUÍ ---
                    <div key={char.id} className="flex items-center gap-3 bg-[#201f31] p-2 rounded-lg">
                        <img src={char.image?.large} alt={char.name?.full} className="w-12 h-12 rounded-full object-cover flex-shrink-0"/>
                        <div>
                            <p className="font-semibold text-sm text-white">{char.name?.full}</p>
                            <p className="text-xs text-gray-400">{char.role}</p>
                        </div>
                    </div>
                )}
            />

            {/* Sección de Relacionados */}
            <ExpandableGrid
                title="Relacionados"
                items={media.relations || []}
                initialCount={4}
                gridClass="grid-cols-1 md:grid-cols-2"
                renderItem={(relation) => (
                     <Link href={`/media/${relation.id}`} key={relation.id} className="flex items-center gap-4 bg-[#201f31] p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                        <img src={relation.coverImage?.large} alt={relation.title?.romaji} className="w-16 h-24 object-cover rounded"/>
                        <div>
                            <p className="text-xs text-gray-400">{relation.relationType?.replace('_', ' ')}</p>
                            <p className="font-semibold text-white">{relation.title?.english || relation.title?.romaji}</p>
                            <p className="text-xs text-gray-400">{relation.format} - {relation.status}</p>
                        </div>
                    </Link>
                )}
            />
            
            {/* Sección de Trailer */}
            {media.trailer && media.trailer.site === 'youtube' && (
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Trailer</h3>
                    <div className="relative aspect-w-16 aspect-h-9">
                        <iframe className="absolute top-0 left-0 w-full h-full rounded-lg" src={`https://www.youtube.com/embed/${media.trailer.id}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OverviewTab;
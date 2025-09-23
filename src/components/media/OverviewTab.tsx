"use client";
import React, { useState, useMemo } from 'react';
import { Media, Relation, Staff, Character, Tag, Video } from '@/types/AniListResponse';
import Image from 'next/image';
import Link from 'next/link';

// --- Sub-componente para las estadísticas principales en la barra lateral ---
const SidebarStat = ({ label, value }: { label: string, value: string | number | undefined | null }) => {
    if (!value && value !== 0) return null;
    return (
        <div className="bg-[#201f31] p-3 rounded-lg">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</h4>
            <p className="text-sm text-white font-semibold mt-1">{value}</p>
        </div>
    );
};

// --- Sub-componente para las líneas de detalle en la barra lateral ---
const StatLine = ({ label, value }: { label: string, value: string | number | undefined | null }) => {
    if (!value) return null;
    return (
        <div className="flex justify-between items-baseline text-sm py-1">
            <span className="text-gray-400">{label}</span>
            <span className="font-semibold text-white text-right">{value}</span>
        </div>
    );
};

// --- Sub-componente para las cuadrículas expandibles (CORREGIDO) ---
const ExpandableGrid = ({ items, title, renderItem, initialCount = 8 }: { items: any[] | undefined | null, title: string, renderItem: (item: any) => React.ReactElement, initialCount?: number }) => {
    const [showAll, setShowAll] = useState(false);
    const validItems = useMemo(() => Array.isArray(items) ? items : [], [items]);
    const visibleItems = useMemo(() => showAll ? validItems : validItems.slice(0, initialCount), [showAll, validItems, initialCount]);

    if (validItems.length === 0) return null;

    return (
        <div>
            <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-6">
                {/* --- CAMBIO AQUÍ: Usamos React.cloneElement para inyectar la key --- */}
                {visibleItems.map(item => 
                    React.cloneElement(renderItem(item), { key: item.id })
                )}
            </div>
            {validItems.length > initialCount && (
                <div className="mt-6 text-center">
                    <button onClick={() => setShowAll(!showAll)} className="px-6 py-2 text-sm font-semibold text-gray-300 bg-[#201f31] rounded-full hover:bg-gray-700/50 transition-colors">
                        {showAll ? 'Mostrar Menos' : 'Mostrar Más'}
                    </button>
                </div>
            )}
        </div>
    );
};


// --- Componente Principal ---
const OverviewTab = ({ media }: { media: Media }) => {
    const [currentVideo, setCurrentVideo] = useState<Video | null>(
        media.videos && media.videos.length > 0 ? media.videos[0] : null
    );

    const formatDate = (date: { year?: number, month?: number, day?: number } | undefined) => {
        if (!date || !date.year) return 'Desconocida';
        return new Date(date.year, (date.month || 1) - 1, date.day || 1).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* COLUMNA IZQUIERDA (BARRA LATERAL) */}
            <aside className="lg:col-span-1 space-y-6">
                <div className="space-y-3">
                    <SidebarStat label="Formato" value={media.format} />
                    <SidebarStat label="Capítulos" value={media.chapters} />
                    <SidebarStat label="Estado" value={media.status} />
                    <SidebarStat label="Puntuación" value={media.averageScore ? `${media.averageScore} / 100` : 'N/A'} />
                </div>

                <div>
                    <h3 className="text-lg font-bold text-white mb-3">Detalles</h3>
                    <div className="bg-[#201f31] p-3 rounded-lg space-y-1 divide-y divide-gray-700/50">
                        <StatLine label="País" value={media.countryOfOrigin} />
                        <StatLine label="Fuente" value={media.source} />
                        <StatLine label="Inicio" value={formatDate(media.startDate)} />
                        <StatLine label="Fin" value={formatDate(media.endDate)} />
                    </div>
                </div>

                {media.genres && media.genres.length > 0 && (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-3">Géneros</h3>
                        <div className="flex flex-wrap gap-2">
                            {media.genres.map(genre => <span key={genre} className="bg-indigo-600/50 text-indigo-200 text-sm font-semibold px-3 py-1 rounded-full">{genre}</span>)}
                        </div>
                    </div>
                )}
                
                {media.tags && media.tags.length > 0 && (
                     <div>
                        <h3 className="text-lg font-bold text-white mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {media.tags.map((tag: Tag) => <span key={tag.id} className="bg-[#201f31] text-xs text-gray-300 px-3 py-1 rounded-full">{tag.name}</span>)}
                        </div>
                    </div>
                )}

                <div>
                    <h3 className="text-lg font-bold text-white mb-3">Enlaces</h3>
                    <div className="space-y-3">
                         {media.anilist_url && <a href={media.anilist_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#201f31] p-3 rounded-lg hover:bg-gray-700/50"><img src="https://anilist.co/img/icons/icon.svg" alt="AniList Icon" className="w-6 h-6 rounded-md" /><span className="font-semibold text-white">AniList</span></a>}
                         {media.mal_id && <a href={`https://myanimelist.net/manga/${media.mal_id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#201f31] p-3 rounded-lg hover:bg-gray-700/50"><img src="https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png" alt="MyAnimeList Icon" className="w-6 h-6 rounded-md" /><span className="font-semibold text-white">MyAnimeList</span></a>}
                    </div>
                </div>
            </aside>

            {/* COLUMNA DERECHA (CONTENIDO PRINCIPAL) */}
            <div className="lg:col-span-3 space-y-10">
                <ExpandableGrid
                    title="Relaciones"
                    items={media.relations}
                    renderItem={(relation: Relation) => (
                        <Link href={`/media/${relation.media?.id}`} className="group text-center">
                            <div className="relative aspect-[2/3] w-full rounded-md overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
                                <Image src={relation.media?.coverImage?.large || '/images/temp.jpg'} alt={relation.media?.title?.romaji || 'Relación'} fill style={{ objectFit: 'cover' }} sizes="(max-width: 640px) 33vw, 128px" />
                            </div>
                            <p className="text-xs text-white font-semibold mt-2 truncate group-hover:text-[#ffbade]">{relation.media?.title?.romaji}</p>
                            <p className="text-[10px] text-gray-400 capitalize">{relation.relationType?.replace(/_/g, ' ').toLowerCase()}</p>
                        </Link>
                    )}
                />

                <ExpandableGrid
                    title="Personajes"
                    items={media.characters}
                    renderItem={(character: Character) => (
                        <div className="group text-center">
                            <div className="relative aspect-[2/3] w-full rounded-md overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
                                <Image src={character.image?.large || '/images/temp.jpg'} alt={character.name?.full || 'Personaje'} fill style={{ objectFit: 'cover' }} sizes="(max-width: 640px) 33vw, 128px" />
                            </div>
                            <p className="text-xs text-white font-semibold mt-2 truncate group-hover:text-[#ffbade]">{character.name?.full}</p>
                        </div>
                    )}
                />

                <ExpandableGrid
                    title="Staff"
                    items={media.staff}
                    renderItem={(staff: Staff) => (
                        <div className="group text-center">
                            <div className="relative aspect-[2/3] w-full rounded-md overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
                                <Image src={staff.image?.large || '/images/temp.jpg'} alt={staff.name?.full || 'Staff'} fill style={{ objectFit: 'cover' }} sizes="(max-width: 640px) 33vw, 128px" />
                            </div>
                            <p className="text-xs text-white font-semibold mt-2 truncate group-hover:text-[#ffbade]">{staff.name?.full}</p>
                            <p className="text-[10px] text-gray-400 truncate">{staff.primaryOccupations?.join(', ')}</p>
                        </div>
                    )}
                />
                
                {currentVideo && (
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Videos Relacionados</h3>
                        <div className="aspect-video w-full rounded-lg overflow-hidden">
                            <iframe id="video-player" className="w-full h-full" src={`https://www.youtube.com/embed/${currentVideo.id}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                        </div>
                        <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
                            {media.videos?.slice(0, 5).map((video) => (
                                <button key={video.id} onClick={() => setCurrentVideo(video)} className={`flex-shrink-0 relative w-32 h-20 rounded-md overflow-hidden transition-all duration-200 ${currentVideo.id === video.id ? 'ring-2 ring-[#ffbade]' : 'opacity-70 hover:opacity-100'}`}>
                                    <Image src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`} alt={video.type} fill style={{ objectFit: 'cover' }} sizes="128px" />
                                    <div className="absolute inset-0 bg-black/30"></div>
                                    <p className="absolute bottom-1 left-2 text-xs font-semibold text-white">{video.type}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OverviewTab;


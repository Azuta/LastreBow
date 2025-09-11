// src/components/ui/cards/MangaListCard.tsx
import { UserList } from '@/types/AniListResponse';
import Image from 'next/image';
import Link from 'next/link';

const BookIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;

const MangaListCard = ({ list }: { list: UserList }) => {
    const username = list.user?.username || 'unknown';
    // Crea un slug a partir del nombre de la lista
    const listSlug = list.name.toLowerCase().replace(/\s/g, '-').replace(/[^\w-]+/g, '');

    return (
        // El Link ahora usa el ID y el slug
        <Link href={`/user/${username}/list/${list.id}-${listSlug}`}>
            <div className="bg-[#201f31] rounded-lg h-full group transition-all hover:bg-[#2b2d42] hover:-translate-y-1">
                <div className="relative h-40">
                    {/* Lógica para mostrar imágenes de portada (si las tuvieras) */}
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-lg text-white group-hover:text-[#ffbade] truncate">{list.name}</h3>
                    <p className="text-sm text-gray-400 mt-1 h-10 overflow-hidden">{list.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                        <BookIcon />
                        {/* Aquí podrías mostrar la cantidad de items si la tuvieras */}
                        <span>{list.itemCount || 0} títulos</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default MangaListCard;
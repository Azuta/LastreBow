// src/components/ui/cards/MangaListCard.tsx
import { UserList } from '@/types/AniListResponse';
import Image from 'next/image';
import Link from 'next/link';

const BookIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;

const MangaListCard = ({ list }: { list: UserList }) => {
    return (
        <Link href={`/user/${list.user.username}/list/${list.id}`}>
            <div className="bg-[#201f31] rounded-lg h-full group transition-all hover:bg-[#2b2d42] hover:-translate-y-1">
                <div className="relative h-40">
                    {list.coverImages.slice(0, 3).map((src, index) => (
                        <div key={index} className={`absolute w-1/2 h-full rounded-md overflow-hidden border-2 border-[#201f31] transition-transform group-hover:scale-105 ${
                            index === 0 ? 'top-0 left-0 z-10 -rotate-6' :
                            index === 1 ? 'top-0 right-0 z-20 rotate-6' :
                            'bottom-0 left-1/4 z-0'
                        }`}>
                            <Image src={src} alt={`Cover ${index + 1}`} layout="fill" objectFit="cover" />
                        </div>
                    ))}
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-lg text-white group-hover:text-[#ffbade] truncate">{list.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{list.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                        <BookIcon />
                        <span>{list.itemCount} títulos</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default MangaListCard;
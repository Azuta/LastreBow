// src/components/user/CustomListsTab.tsx
import { UserList } from '@/types/AniListResponse';
import MangaListCard from '@/components/ui/cards/MangaListCard';

interface CustomListsTabProps {
    lists: UserList[];
    username: string;
}

const CustomListsTab = ({ lists, username }: CustomListsTabProps) => {
    if (!lists || lists.length === 0) {
        return (
            <div className="text-center py-16 text-gray-400">
                <p>{username} no ha creado ninguna lista pública todavía.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
            {lists.map(list => (
                <MangaListCard key={list.id} list={list} />
            ))}
        </div>
    );
};

export default CustomListsTab;
// src/components/user/AchievementBadge.tsx
import { Achievement } from '@/types/AniListResponse';

const BookOpenIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const FlameIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1-2-4-2-4-2 .5 2.5 2 2.5 2 5A2.5 2.5 0 0 0 8.5 14.5z"></path><path d="M14.5 14.5A2.5 2.5 0 0 0 17 12c0-1.38-.5-2-1-3-1-2-4-2-4-2 .5 2.5 2 2.5 2 5A2.5 2.5 0 0 0 14.5 14.5z"></path></svg>;
const CrownIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>;

const achievementIcons: { [key: string]: JSX.Element } = {
    BookOpenIcon: <BookOpenIcon />,
    FlameIcon: <FlameIcon />,
    CrownIcon: <CrownIcon />,
};

const AchievementBadge = ({ achievement }: { achievement: Achievement }) => {
    const isUnlocked = achievement.progress >= achievement.goal;

    return (
        <div className="flex flex-col items-center text-center group">
            <div className={`relative w-20 h-20 flex items-center justify-center rounded-full border-4 ${isUnlocked ? 'bg-[#ffbade] border-pink-400 text-black' : 'bg-gray-700 border-gray-600 text-gray-500'}`}>
                {achievementIcons[achievement.icon]}
            </div>
            <h5 className={`mt-2 font-semibold text-sm ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>{achievement.name}</h5>
            <div className="absolute bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {achievement.description} ({achievement.progress}/{achievement.goal})
            </div>
        </div>
    );
};

export default AchievementBadge;
// src/components/user/AchievementsTab.tsx

import { Achievement } from '@/types/AniListResponse';

// Iconos para diferentes tipos de logros
const BookOpenIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const FlameIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1-2-4-2-4-2 .5 2.5 2 2.5 2 5A2.5 2.5 0 0 0 8.5 14.5z"></path><path d="M14.5 14.5A2.5 2.5 0 0 0 17 12c0-1.38-.5-2-1-3-1-2-4-2-4-2 .5 2.5 2 2.5 2 5A2.5 2.5 0 0 0 14.5 14.5z"></path></svg>;
const CrownIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>;

const achievementIcons: { [key: string]: JSX.Element } = {
    reading: <BookOpenIcon />,
    genre: <FlameIcon />,
    default: <CrownIcon />,
};

const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const progressPercentage = (achievement.progress / achievement.goal) * 100;

    return (
        <div className="bg-[#201f31] rounded-lg p-4 flex items-center gap-4 border-l-4 border-[#ffbade]">
            <div className="text-[#ffbade] flex-shrink-0">
                {achievementIcons[achievement.type] || achievementIcons.default}
            </div>
            <div className="flex-grow">
                <h4 className="font-bold text-white">{achievement.name}</h4>
                <p className="text-sm text-gray-400">{achievement.description}</p>
                <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div
                            className="bg-[#ffbade] h-2.5 rounded-full"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-right text-gray-500 mt-1">{achievement.progress} / {achievement.goal}</p>
                </div>
            </div>
        </div>
    );
};


interface AchievementsTabProps {
    achievements: Achievement[];
}

const AchievementsTab = ({ achievements }: AchievementsTabProps) => {
    return (
        <div className="max-w-screen-md mx-auto space-y-4 py-8">
            {achievements.map(ach => (
                <AchievementCard key={ach.id} achievement={ach} />
            ))}
        </div>
    );
};

export default AchievementsTab;
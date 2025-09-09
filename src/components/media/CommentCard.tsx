// src/components/media/CommentCard.tsx
import { Comment } from '@/types/AniListResponse';
import Link from 'next/link';

const UpvoteIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>;

const CommentCard = ({ comment }: { comment: Comment }) => {
    return (
        <div className="flex items-start gap-4">
            <Link href={`/user/${comment.user.username}`}>
                <img src={comment.user.avatarUrl} alt={comment.user.username} className="w-12 h-12 rounded-full object-cover" />
            </Link>
            <div className="flex-grow bg-[#201f31] p-4 rounded-lg">
                <div className="flex items-center justify-between">
                    <Link href={`/user/${comment.user.username}`} className="font-bold text-white hover:text-[#ffbade]">{comment.user.username}</Link>
                    <span className="text-xs text-gray-500">{comment.createdAt}</span>
                </div>
                <p className="text-gray-300 mt-2 text-sm">{comment.text}</p>
                <div className="flex items-center gap-2 mt-4">
                    <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-gray-700/50 px-3 py-1 rounded-full">
                        <UpvoteIcon />
                        <span>{comment.likes}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommentCard;
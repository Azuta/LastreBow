"use client";
import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import CommentInput from './CommentInput';
import { timeAgo } from '@/lib/utils'; 

export type CommentType = {
    id: number;
    content: string;
    image_url: string | null;
    created_at: string;
    likes_count: number;
    parent_id: number | null;
    profile: {
        id: string;
        username: string;
        avatar_url: string | null;
    };
    user_has_liked: boolean;
    replies: CommentType[];
};

interface CommentCardProps {
    comment: CommentType;
    onLike: (commentId: number, hasLiked: boolean) => void;
    onReply: (parentId: number, content: string, imageUrl?: string) => Promise<void>;
    onReport: (comment: CommentType) => void;
    nestingLevel?: number;
}

const HeartIcon = ({ filled }: { filled: boolean }) => ( <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className={filled ? "fill-red-500 text-red-500" : "fill-transparent text-gray-400"}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg> );
const FlagIcon = () => ( <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg> );


const CommentCard = ({ comment, onLike, onReply, onReport, nestingLevel = 0 }: CommentCardProps) => {
    const { profile: currentUser, isLoggedIn } = useAuth();
    const [isReplying, setIsReplying] = useState(false);

    const handleReplySubmit = async (content: string, imageUrl?: string) => {
        await onReply(comment.id, content, imageUrl);
        setIsReplying(false);
    };

    return (
        <div className="flex items-start gap-4">
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image src={comment.profile.avatar_url || '/images/temp.jpg'} alt={comment.profile.username} fill style={{objectFit: 'cover'}} sizes="40px" />
            </div>
            <div className="w-full">
                <div className="bg-[#201f31] p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-white">{comment.profile.username}</p>
                        <p className="text-xs text-gray-500">{timeAgo(comment.created_at)}</p>
                    </div>
                    <p className="text-sm text-gray-300 mt-2 whitespace-pre-wrap break-words">{comment.content}</p>
                    {comment.image_url && <img src={comment.image_url} alt="Comentario" className="mt-2 max-h-60 rounded-lg" />}
                </div>
                <div className="flex items-center gap-4 mt-2 px-2">
                    <button onClick={() => onLike(comment.id, comment.user_has_liked)} disabled={!isLoggedIn} className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold hover:text-white disabled:cursor-not-allowed">
                        <HeartIcon filled={comment.user_has_liked} />
                        {comment.likes_count}
                    </button>
                    <button onClick={() => setIsReplying(!isReplying)} disabled={!isLoggedIn} className="text-xs text-gray-400 font-semibold hover:text-white disabled:cursor-not-allowed">
                        Responder
                    </button>
                    
                    {/* --- LÓGICA CORREGIDA Y EXPLICADA --- */}
                    {/* El botón de reportar solo aparece si: */}
                    {/* 1. El usuario ha iniciado sesión (isLoggedIn) */}
                    {/* 2. El ID del usuario actual NO es el mismo que el ID del autor del comentario */}
                    {isLoggedIn && currentUser?.id !== comment.profile.id && (
                        <button onClick={() => onReport(comment)} className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold hover:text-red-400">
                           <FlagIcon /> Reportar
                        </button>
                    )}
                </div>

                {isReplying && (
                    <div className="mt-4">
                        <CommentInput onSubmit={handleReplySubmit} placeholder={`Respondiendo a ${comment.profile.username}...`} buttonText="Responder" />
                    </div>
                )}
                
                {comment.replies && comment.replies.length > 0 && (
                     <div className={`mt-4 space-y-4 ${nestingLevel < 3 ? 'pl-6 border-l-2 border-gray-700/50' : 'pl-2'}`}>
                        {comment.replies.map(reply => (
                            <CommentCard key={reply.id} comment={reply} onLike={onLike} onReply={onReply} onReport={onReport} nestingLevel={nestingLevel + 1} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentCard;
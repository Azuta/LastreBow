// src/components/media/CommentsSection.tsx
"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Comment } from '@/types/AniListResponse';
import CommentCard from './CommentCard';

interface CommentsSectionProps {
  comments: Comment[];
  mediaId: number;
}

const CommentsSection = ({ comments: initialComments, mediaId }: CommentsSectionProps) => {
    const { user, isLoggedIn, login } = useAuth();
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        setIsSubmitting(true);

        // Simulación de llamada a la API
        await new Promise(res => setTimeout(res, 500));

        const newCommentData: Comment = {
            id: Date.now(),
            user: {
                username: user.username,
                avatarUrl: user.avatarUrl,
            },
            text: newComment,
            createdAt: 'justo ahora',
            likes: 0,
        };

        setComments([newCommentData, ...comments]);
        setNewComment('');
        setIsSubmitting(false);
    };

    return (
        <div className="content-section mt-12">
            <h3 className="text-xl font-bold text-white mb-6">Comentarios ({comments.length})</h3>
            <div className="bg-[#201f31] p-6 rounded-lg">
                {isLoggedIn && user ? (
                    <form onSubmit={handleSubmit} className="flex items-start gap-4">
                        <img src={user.avatarUrl} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
                        <div className="flex-grow">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Escribe un comentario..."
                                className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffbade] transition-colors"
                                rows={3}
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newComment.trim()}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmitting ? 'Publicando...' : 'Publicar'}
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="text-center text-gray-400">
                        <p>Necesitas iniciar sesión para poder comentar.</p>
                        <button onClick={()=> login(user!)} className="mt-2 text-[#ffbade] font-semibold hover:underline">
                            Iniciar Sesión
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-8 space-y-6">
                {comments.map(comment => (
                    <CommentCard key={comment.id} comment={comment} />
                ))}
            </div>
        </div>
    );
};

export default CommentsSection;
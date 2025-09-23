"use client";
import { useState, useEffect, useCallback } from 'react';
import CommentInput from './CommentInput';
import CommentCard, { CommentType } from './CommentCard';
import ReportModal from './ReportModal'; // Importar el nuevo modal
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabaseClient';

type SortFilter = 'newest' | 'oldest' | 'popular';

const supabase = createClient();

const CommentsSection = ({ mediaId }: { mediaId: number }) => {
    const { user, addToast } = useAuth();
    const [comments, setComments] = useState<CommentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<SortFilter>('popular');
    // --- ESTADOS PARA EL MODAL DE REPORTE ---
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [commentToReport, setCommentToReport] = useState<CommentType | null>(null);

    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        let query = supabase.from('comments').select(`id, content, image_url, created_at, likes_count, parent_id, profile:profiles!user_id(id, username, avatar_url), comment_likes(user_id)`).eq('media_id', mediaId);
        
        if (filter === 'newest') query = query.order('created_at', { ascending: false });
        else if (filter === 'oldest') query = query.order('created_at', { ascending: true });
        else query = query.order('likes_count', { ascending: false }).order('created_at', { ascending: false });

        const { data, error } = await query;
        if (error) {
            console.error("Error fetching comments:", error);
            addToast('No se pudieron cargar los comentarios.', 'error');
            setIsLoading(false);
            return;
        }

        const formattedComments = data.map(comment => ({ ...comment, user_has_liked: user ? comment.comment_likes.some(like => like.user_id === user.id) : false, replies: [] }));
        const commentMap = new Map(formattedComments.map(c => [c.id, c]));
        const rootComments: CommentType[] = [];
        for (const comment of formattedComments) {
            if (comment.parent_id && commentMap.has(comment.parent_id)) {
                commentMap.get(comment.parent_id)!.replies.push(comment);
            } else {
                rootComments.push(comment);
            }
        }
        setComments(rootComments);
        setIsLoading(false);
    }, [mediaId, user, filter, addToast]); // Dependencias correctas para evitar bucle

    useEffect(() => { fetchComments(); }, [fetchComments]);

    const handlePostComment = async (content: string, imageUrl?: string, parentId?: number) => {
        if (!user) return;
        const { error } = await supabase.from('comments').insert({ content, image_url: imageUrl || null, media_id: mediaId, user_id: user.id, parent_id: parentId || null });
        if (error) addToast('Error al publicar el comentario.', 'error');
        else {
            addToast('Comentario publicado.', 'success');
            fetchComments();
        }
    };

    const handleLike = async (commentId: number, hasLiked: boolean) => {
        if (!user) return;
        if (hasLiked) await supabase.from('comment_likes').delete().match({ user_id: user.id, comment_id: commentId });
        else await supabase.from('comment_likes').insert({ user_id: user.id, comment_id: commentId });
        fetchComments();
    };
    
    const handleOpenReportModal = (comment: CommentType) => {
        setCommentToReport(comment);
        setIsReportModalOpen(true);
    };

    return (
        <>
            <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} commentToReport={commentToReport} />
            {/* --- LAYOUT ANCHO APLICADO AQUÍ --- */}
            <div className="w-full max-w-5xl mx-auto space-y-8">
                <h2 className="text-2xl font-bold text-white">Comentarios ({comments.length})</h2>
                <CommentInput onSubmit={(content, imageUrl) => handlePostComment(content, imageUrl)} />
                <div className="flex items-center gap-4 border-b border-t border-gray-700/50 py-2">
                    <span className="text-sm font-semibold text-gray-400">Ordenar por:</span>
                    <div className="flex gap-2">
                        <button onClick={() => setFilter('popular')} className={`px-3 py-1 text-xs rounded-full ${filter === 'popular' ? 'bg-indigo-600 text-white' : 'bg-[#201f31] text-gray-300'}`}>Populares</button>
                        <button onClick={() => setFilter('newest')} className={`px-3 py-1 text-xs rounded-full ${filter === 'newest' ? 'bg-indigo-600 text-white' : 'bg-[#201f31] text-gray-300'}`}>Nuevos</button>
                        <button onClick={() => setFilter('oldest')} className={`px-3 py-1 text-xs rounded-full ${filter === 'oldest' ? 'bg-indigo-600 text-white' : 'bg-[#201f31] text-gray-300'}`}>Viejos</button>
                    </div>
                </div>
                {isLoading ? <p className="text-gray-400 text-center">Cargando comentarios...</p> : comments.length > 0 ? (
                    <div className="space-y-6">
                        {comments.map(comment => <CommentCard key={comment.id} comment={comment} onLike={handleLike} onReply={(parentId, content, imageUrl) => handlePostComment(content, imageUrl, parentId)} onReport={handleOpenReportModal} />)}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center bg-[#201f31] p-6 rounded-lg">Sé el primero en comentar.</p>
                )}
            </div>
        </>
    );
};

export default CommentsSection;
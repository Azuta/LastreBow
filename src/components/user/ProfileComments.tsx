// src/components/user/ProfileComments.tsx
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';

interface ProfileCommentsProps {
    profileId: string;
    profileUsername: string;
    initialComments: any[];
}

const ProfileComments = ({ profileId, profileUsername, initialComments }: ProfileCommentsProps) => {
    const { user, profile, isLoggedIn, addToast } = useAuth();
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user || !profile) return;

        setIsSubmitting(true);

        const { data, error } = await supabase
            .from('profile_comments')
            .insert({
                profile_id: profileId,
                author_id: user.id,
                content: newComment,
            })
            .select('*, author:profiles!author_id(*)')
            .single();

        if (error) {
            addToast('No se pudo publicar el comentario.', 'error');
            console.error(error);
        } else {
            setComments([data, ...comments]);
            setNewComment('');
            addToast('Comentario publicado.', 'success');
        }
        setIsSubmitting(false);
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-white mb-6">Muro de {profileUsername} ({comments.length})</h3>
            
            {isLoggedIn && (
                <form onSubmit={handleSubmit} className="flex items-start gap-4 mb-8">
                    <img src={profile?.avatar_url} alt={profile?.username} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-grow">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={`Escribe un comentario en el muro de ${profileUsername}...`}
                            className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffbade] transition-colors"
                            rows={3}
                        />
                        <div className="flex justify-end mt-2">
                            <button type="submit" disabled={isSubmitting || !newComment.trim()} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                {isSubmitting ? 'Publicando...' : 'Publicar'}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            <div className="space-y-6">
                {comments.map(comment => (
                     <div key={comment.id} className="flex items-start gap-4">
                        <Link href={`/user/${comment.author.username}`}>
                            <img src={comment.author.avatar_url} alt={comment.author.username} className="w-12 h-12 rounded-full object-cover" />
                        </Link>
                        <div className="flex-grow bg-[#201f31] p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <Link href={`/user/${comment.author.username}`} className="font-bold text-white hover:text-[#ffbade]">{comment.author.username}</Link>
                                <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-gray-300 mt-2 text-sm whitespace-pre-wrap">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfileComments;
// src/components/user/ReviewsTab.tsx
import React, { useState } from 'react';
import { Media } from '@/types/AniListResponse';
import ReviewCard from './ReviewCard';
import ReviewEditModal from './ReviewEditModal'; // Importar el modal
import Link from 'next/link'; // Importar Link

interface ReviewWithMedia {
    id: number;
    score: number;
    content: string;
    created_at: string;
    media: Media;
}

interface ReviewsTabProps {
    reviews: ReviewWithMedia[];
    username: string;
    isOwnProfile: boolean; // Prop para saber si es el perfil del usuario logueado
    onReviewAdded: () => void; // Callback para refrescar
}

const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

const ReviewsTab = ({ reviews, username, isOwnProfile, onReviewAdded }: ReviewsTabProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="py-8">
                {isOwnProfile && (
                    <div className="flex justify-end mb-6">
                        <Link href="/review/new"
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            <PlusIcon />
                            Escribir Reseña
                        </Link>
                    </div>
                )}
                
                {reviews.length > 0 ? (
                    <div className="space-y-6">
                        {reviews.map(review => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-[#201f31] rounded-lg">
                        <p className="text-gray-400">{username} todavía no ha escrito ninguna reseña.</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default ReviewsTab;
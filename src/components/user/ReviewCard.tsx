// src/components/user/ReviewCard.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { Media } from '@/types/AniListResponse';
import Image from 'next/image';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import SpoilerWarningModal from './SpoilerWarningModal'; // Asegúrate de que este componente exista

// --- Interfaz y Componente de Icono ---
interface ReviewWithMedia {
    id: number;
    score: number;
    content: string;
    created_at: string;
    media: Media;
}

const StarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>;


// --- Componente Principal de la Tarjeta de Reseña ---
const ReviewCard = ({ review }: { review: ReviewWithMedia }) => {
    const [spoilersRevealed, setSpoilersRevealed] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // 1. Sanitizar el HTML del contenido de la reseña para prevenir ataques XSS.
    // Se ejecuta solo en el cliente para evitar errores en el servidor.
    const sanitizedContent = typeof window !== 'undefined' 
        ? DOMPurify.sanitize(review.content) 
        : review.content;

    // 2. Efecto para añadir un listener de clics al contenedor de la reseña.
    // Si se hace clic en un spoiler y aún no han sido revelados, abre el modal.
    useEffect(() => {
        const contentEl = contentRef.current;
        if (!contentEl || spoilersRevealed) return;

        const handleClick = (e: MouseEvent) => {
            // Comprueba si el elemento clickeado o uno de sus padres tiene el atributo 'data-spoiler'
            if ((e.target as HTMLElement).closest('[data-spoiler]')) {
                e.preventDefault();
                setIsModalOpen(true);
            }
        };

        contentEl.addEventListener('click', handleClick);
        // Limpia el listener cuando el componente se desmonta
        return () => {
            if (contentEl) {
                contentEl.removeEventListener('click', handleClick);
            }
        };
    }, [sanitizedContent, spoilersRevealed]);


    // 3. Función para confirmar y revelar los spoilers
    const handleConfirmReveal = () => {
        setSpoilersRevealed(true);
        setIsModalOpen(false);
    };

    return (
        <>
            {/* El modal que se mostrará al hacer clic en un spoiler */}
            <SpoilerWarningModal 
                isOpen={isModalOpen}
                onConfirm={handleConfirmReveal}
                onCancel={() => setIsModalOpen(false)}
            />

            {/* La tarjeta de la reseña */}
            <div className="bg-[#201f31] rounded-lg p-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0">
                    <Link href={`/media/${review.media.id}`}>
                        <div className="relative w-24 h-36 rounded-md overflow-hidden mx-auto">
                            <Image src={review.media.coverImage?.large || ''} alt={review.media.title.romaji} layout="fill" objectFit="cover" />
                        </div>
                    </Link>
                </div>

                <div className="flex flex-col flex-grow min-w-0"> {/* min-w-0 es importante para el correcto ajuste del texto */}
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <Link href={`/media/${review.media.id}`}>
                                <h3 className="font-bold text-lg text-white hover:text-[#ffbade]">{review.media.title.romaji}</h3>
                            </Link>
                            <p className="text-sm text-gray-400">
                                Reseña del {new Date(review.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex-shrink-0 bg-gray-700/50 px-3 py-1 rounded-full text-sm font-semibold text-white flex items-center gap-1">
                            <StarIcon />
                            {review.score}/100
                        </div>
                    </div>
                    
                    {/* 4. Contenedor del contenido de la reseña */}
                    <div 
                        ref={contentRef} 
                        className={`prose prose-invert max-w-none text-gray-300 mt-2 text-sm flex-grow ${spoilersRevealed ? 'spoilers-revealed' : ''}`}
                        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                    />
                </div>
            </div>
        </>
    );
};

export default ReviewCard;
"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

interface CommentInputProps {
    onSubmit: (content: string, imageUrl?: string) => Promise<void>;
    placeholder?: string;
    buttonText?: string;
}

const ImagePlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14m-7-7h14" /><path d="M21.28 15.28a3 3 0 1 0-4.24-4.24 3 3 0 0 0 4.24 4.24z" /><path d="M12 21a9 9 0 1 0-9-9" /></svg>;

const CommentInput = ({ onSubmit, placeholder = "Escribe un comentario...", buttonText = "Publicar" }: CommentInputProps) => {
    const { user, profile, isLoggedIn } = useAuth();
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [showImageInput, setShowImageInput] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !isLoggedIn) return;
        
        setIsSubmitting(true);
        await onSubmit(content, imageUrl);
        setContent('');
        setImageUrl('');
        setShowImageInput(false);
        setIsSubmitting(false);
    };

    if (!isLoggedIn) {
        return <p className="text-gray-400 text-center bg-[#201f31] p-4 rounded-lg">Necesitas iniciar sesión para poder comentar.</p>
    }

    return (
        <div className="flex items-start gap-4">
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image src={profile?.avatar_url || '/images/temp.jpg'} alt={profile?.username || 'Avatar'} fill style={{objectFit: 'cover'}} sizes="40px" />
            </div>
            <form onSubmit={handleSubmit} className="w-full">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-gray-700/50 text-white rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffbade] resize-none"
                    rows={2}
                />
                {showImageInput && (
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Pega la URL de una imagen..."
                        className="w-full bg-gray-700/50 text-white rounded-lg p-2 text-sm mt-2 focus:outline-none focus:ring-1 focus:ring-[#ffbade]"
                    />
                )}
                {imageUrl && <img src={imageUrl} alt="Previsualización" className="mt-2 max-h-40 rounded-lg" />}
                <div className="flex justify-between items-center mt-2">
                    <button type="button" onClick={() => setShowImageInput(!showImageInput)} className="p-2 text-gray-400 hover:text-white transition-colors">
                        <ImagePlusIcon />
                    </button>
                    <button type="submit" disabled={isSubmitting || !content.trim()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50">
                        {isSubmitting ? 'Publicando...' : buttonText}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CommentInput;

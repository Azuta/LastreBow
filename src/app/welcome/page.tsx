// azuta/mangauserpage/MangaUserPage-main/src/app/welcome/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Media } from '@/types/AniListResponse';
import { fetchAllMedia } from '@/services/fetchAniList';
import MangaCard from '@/components/ui/cards/MangaCard';

const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>;

const WelcomePage = () => {
    const { user, profile, updateUserProfile, addToast } = useAuth();
    const router = useRouter();
    
    const [step, setStep] = useState(1);
    const [popularManga, setPopularManga] = useState<Media[]>([]);
    const [favoriteMangaIds, setFavoriteMangaIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Si no hay un usuario, lo mandamos al login.
        if (!user) {
            router.push('/login');
            return;
        }

        const loadManga = async () => {
            const allMedia = await fetchAllMedia();
            // Mostramos 14 mangas aleatorios para la selección.
            setPopularManga(allMedia.sort(() => 0.5 - Math.random()).slice(0, 14));
        };
        loadManga();
    }, [user, router]);
    
    const handleToggleFavorite = (mediaId: number) => {
        setFavoriteMangaIds(prev => 
            prev.includes(mediaId) 
                ? prev.filter(id => id !== mediaId)
                : [...prev, mediaId]
        );
    };

    const handleFinishSetup = async () => {
        setIsLoading(true);
        if (profile) {
            // --- LÓGICA CLAVE ---
            // Marcamos el onboarding como completado en la base de datos.
            const success = await updateUserProfile({ has_completed_onboarding: true });
            
            if (success) {
                addToast('¡Configuración guardada! Bienvenido a la comunidad.', 'success');
                router.push('/');
            } else {
                 addToast('Hubo un error al guardar. Intenta de nuevo.', 'error');
            }
        }
        setIsLoading(false);
    };
    
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">¡Bienvenido, {profile?.username}!</h2>
                        <p className="text-gray-400 mb-6">Selecciona al menos 3 mangas que te gusten para personalizar tu experiencia.</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 max-h-96 overflow-y-auto p-2">
                            {popularManga.map(manga => (
                                <div key={manga.id} className="relative cursor-pointer" onClick={() => handleToggleFavorite(manga.id)}>
                                    <MangaCard media={manga} />
                                    {favoriteMangaIds.includes(manga.id) && (
                                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-md border-2 border-green-500">
                                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center"><CheckIcon /></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                         <button onClick={() => setStep(2)} disabled={favoriteMangaIds.length < 3} className="mt-8 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                            Siguiente ({favoriteMangaIds.length}/3)
                        </button>
                    </div>
                );
            case 2:
                return (
                     <div>
                        <h2 className="text-2xl font-bold text-white mb-6">Últimos detalles...</h2>
                         <p className="text-gray-400 mb-6">En el futuro, aquí podrás configurar tu foto de perfil, unirte a un scan y más.</p>
                        <button onClick={handleFinishSetup} disabled={isLoading} className="mt-8 w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
                             {isLoading ? 'Guardando...' : 'Finalizar y Entrar'}
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#1a1a24] p-4">
            <div className="w-full max-w-4xl bg-[#201f31] p-8 rounded-lg shadow-lg">
                {renderStepContent()}
            </div>
        </div>
    );
};

export default WelcomePage;
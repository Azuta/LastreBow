// azuta/mangauserpage/MangaUserPage-main/src/app/welcome/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Media } from '@/types/AniListResponse';
import { fetchAllMedia } from '@/services/fetchAniList';
import MangaCard from '@/components/ui/cards/MangaCard';
import { MangaCardSkeleton } from '@/components/ui/skeletons/MangaCardSkeleton';
import { mockMediaRows } from '@/mock/mediaData';

const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>;
const GenderIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 5V19"></path><path d="M17.9 10.1C16.4 11.6 14.1 12 12 12C9.9 12 7.6 11.6 6.1 10.1"></path></svg>;

// --- URLs de imágenes por defecto ---
const DEFAULT_AVATARS = {
    Hombre: "https://pub-429d871e8d3c43d486ddf826e3b19f8e.r2.dev/b2cc0ddf-339e-4bfc-ae06-f7b6473c6f9c/male_default_img.jpg",
    Mujer: "https://pub-429d871e8d3c43d486ddf826e3b19f8e.r2.dev/b2cc0ddf-339e-4bfc-ae06-f7b6473c6f9c/female_default_img.jpg",
    Otro: "https://pub-429d871e8d3c43d486ddf826e3b19f8e.r2.dev/b2cc0ddf-339e-4bfc-ae06-f7b6473c6f9c/default_img.jpg",
};

const WelcomePage = () => {
    // --- LÍNEA CORREGIDA: Agregamos `addToast` ---
    const { user, profile, updateUserProfile, addToast } = useAuth();
    const router = useRouter();
    
    const [step, setStep] = useState(1);
    const [allMedia, setAllMedia] = useState<Media[]>([]);
    const [favoriteMangaIds, setFavoriteMangaIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const [gender, setGender] = useState<string | null>(null);
    const [customGender, setCustomGender] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredManga = useMemo(() => {
        if (!searchTerm) {
            return allMedia.slice(0, 5);
        }
        return allMedia.filter(manga =>
            manga.title.romaji.toLowerCase().includes(searchTerm.toLowerCase()) ||
            manga.title.english?.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 14);
    }, [searchTerm, allMedia]);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        const loadInitialData = async () => {
            const mediaData = await fetchAllMedia();
            setAllMedia(mediaData);
            setIsInitialLoading(false);
        };
        loadInitialData();
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
            const updates: any = { has_completed_onboarding: true };

            const finalGender = gender === 'Otro' ? customGender : gender;
            if (finalGender) {
                updates.gender = finalGender;
            }
            
            // --- NUEVA LÓGICA: Asigna la URL de la imagen por defecto ---
            let defaultAvatarUrl = DEFAULT_AVATARS['Otro']; // Avatar por defecto genérico
            if (gender === 'Hombre') {
                defaultAvatarUrl = DEFAULT_AVATARS['Hombre'];
            } else if (gender === 'Mujer') {
                defaultAvatarUrl = DEFAULT_AVATARS['Mujer'];
            } else if (gender === 'Otro') {
                defaultAvatarUrl = DEFAULT_AVATARS['Otro'];
            }
            updates.avatar_url = defaultAvatarUrl;

            const success = await updateUserProfile(updates);
            
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
                        
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Buscar un manga..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-700/50 text-white rounded-full px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#ffbade]"
                            />
                        </div>

                        {isInitialLoading ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <MangaCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 max-h-96 overflow-y-auto p-2">
                                {filteredManga.map(manga => (
                                    <div key={manga.id} className="relative cursor-pointer" onClick={() => handleToggleFavorite(manga.id)}>
                                        <MangaCard media={manga} isSelectable={true} />
                                        {favoriteMangaIds.includes(manga.id) && (
                                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-md border-2 border-green-500">
                                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center"><CheckIcon /></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        
                         <button onClick={() => setStep(2)} disabled={favoriteMangaIds.length < 3} className="mt-8 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                            Siguiente ({favoriteMangaIds.length}/3)
                        </button>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <GenderIcon />
                            <h2 className="text-2xl font-bold text-white">¿Cuál es tu género?</h2>
                        </div>
                        <p className="text-gray-400 mb-6">Seleccionar un género nos ayuda a personalizar mejor las recomendaciones.</p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            {['Hombre', 'Mujer', 'Otro'].map(option => (
                                <button 
                                    key={option}
                                    onClick={() => setGender(option)}
                                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${gender === option ? 'bg-[#ffbade] text-black' : 'bg-gray-700/50 text-white hover:bg-gray-600/50'}`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        
                        {gender === 'Otro' && (
                            <input
                                type="text"
                                placeholder="Escribe tu género..."
                                value={customGender}
                                onChange={(e) => setCustomGender(e.target.value)}
                                className="w-full mt-4 bg-gray-700/50 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ffbade]"
                            />
                        )}

                        <div className="flex justify-between items-center mt-8">
                            <button onClick={() => setStep(1)} className="text-sm font-semibold text-gray-400 hover:text-white">&larr; Volver</button>
                            <button onClick={() => setStep(3)} disabled={!gender || (gender === 'Otro' && !customGender)} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                                Siguiente
                            </button>
                        </div>
                    </div>
                );
            case 3:
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
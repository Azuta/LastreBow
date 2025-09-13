// src/app/page.tsx
"use client";
import { useEffect, useState, useMemo } from "react";
import { fetchMediaRows, fetchNewChaptersForUser, fetchContinueReadingList , fetchRecommendationsByAuthor, fetchSocialRecommendations } from "@/services/fetchAniList";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import MangaSection from "@/components/shared/MangaSection";
import { Media } from "@/types/AniListResponse";
import RankingList from '@/components/sidebar/RankingList';
import ChatBox from '@/components/sidebar/ChatBox';
import { MangaCardSkeleton } from "@/components/ui/skeletons/MangaCardSkeleton";
import { mockContinueReading } from "@/mock/mediaData";

const Home = () => {
  const [mediaRows, setMediaRows] = useState<{ title: string; data: Media[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('General');
  const [newChapters, setNewChapters] = useState<Media[]>([]);
  const [recommendations, setRecommendations] = useState<Media[]>([]);
  const [continueReading, setContinueReading] = useState<Media[]>([]); // <-- Nuevo estado

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const fetchedMediaRows = await fetchMediaRows();
        setMediaRows(fetchedMediaRows);
      } catch (error) {
        console.error("❌ Error fetching media rows:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
      const loadNewChapters = async () => {
        if (isLoggedIn && user) {
            const fetchedChapters = await fetchNewChaptersForUser(user.id);
            setNewChapters(fetchedChapters);
        } else {
            setNewChapters([]);
        }
      };
      loadNewChapters();
  }, [isLoggedIn, user]);

    // <-- NUEVO useEffect para cargar la lista "Continuar Leyendo"
  useEffect(() => {
    const loadContinueReading = async () => {
      if (isLoggedIn && user) {
        const list = await fetchContinueReadingList(user.id);
        setContinueReading(list);
      } else {
        setContinueReading([]);
      }
    };
    loadContinueReading();
  }, [isLoggedIn, user]);

    // <-- NUEVO useEffect para cargar las recomendaciones
  useEffect(() => {
      const loadRecommendations = async () => {
          if (!isLoggedIn || !user) {
              setRecommendations([]);
              return;
          }
          try {
              const [byAuthor, bySocial] = await Promise.all([
                  fetchRecommendationsByAuthor(user.id),
                  fetchSocialRecommendations(user.id),
              ]);
              const combinedRecs = [...byAuthor, ...bySocial];
              
              // Eliminar duplicados y mezclar para aleatoriedad
              const uniqueRecs = Array.from(new Map(combinedRecs.map(item => [item.id, item])).values());
              setRecommendations(uniqueRecs.sort(() => 0.5 - Math.random()));

          } catch (error) {
              console.error("Error fetching recommendations:", error);
              setRecommendations([]);
          }
      };
      loadRecommendations();
  }, [isLoggedIn, user]);

  const forYouMedia = useMemo(() => {
    if (!isLoggedIn || !user?.favorites) return [];
    const favoriteGenres = new Set(user.favorites.flatMap(fav => fav.genres));
    const recommended = mediaRows.flatMap(row => row.data).filter(media =>
      media.genres.some(genre => favoriteGenres.has(genre)) && !user.favorites.some(fav => fav.id === media.id)
    );
    return Array.from(new Map(recommended.map(item => [item.id, item])).values());
  }, [isLoggedIn, user, mediaRows]);

  const renderLoadingSkeleton = () => (
    <div className="space-y-12">
        {['Trending', 'Popular'].map(title => (
             <section key={title}>
                <div className="flex justify-between items-center mb-4">
                    <div className="h-8 w-48 bg-gray-700/50 rounded-full"></div>
                    <div className="h-5 w-24 bg-gray-700/50 rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-x-4 gap-y-6">
                    {Array.from({ length: 7 }).map((_, index) => <MangaCardSkeleton key={index} />)}
                </div>
            </section>
        ))}
    </div>
  );

  const renderContent = () => {
if (activeTab === 'Para Ti') {
      if (!isLoggedIn) {
        return <p className="text-gray-400 text-center">Inicia sesión para ver tu contenido personalizado.</p>
      }
      return (
        <>
            {/* <-- Usa el estado real en lugar del mock */}
            {continueReading.length > 0 && <MangaSection key="continue-reading" title="Continuar Leyendo" media={continueReading} />}

            {newChapters.length > 0 ? (
                 <MangaSection key="new-chapters" title="Nuevos Capítulos" media={newChapters} />
            ) : (
                <p className="text-gray-400 text-center">No hay capítulos nuevos de tus mangas favoritos.</p>
            )}

            {recommendations.length > 0 ? (
                <MangaSection key="recommendations" title="Recomendado para Ti" media={recommendations} />
            ) : (
                <MangaSection key="fallback" title="Recomendaciones Populares" media={mediaRows.find(row => row.title === 'Popular')?.data || []} />
            )}
        </>
      );
    }
    
    return mediaRows.map((row) => (
      <MangaSection
        key={row.title}
        title={row.title}
        media={row.data}
      />
    ));
  };

  return (
    <>
      <Navbar />
      <div className="max-w-screen-3xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="w-full lg:w-4/4 space-y-12">
            <div className="flex border-b border-gray-700 mb-6">
                <button onClick={() => setActiveTab('General')} className={`px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'General' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>General</button>
                <button onClick={() => setActiveTab('Para Ti')} className={`px-6 py-3 text-sm font-semibold border-b-2 ${activeTab === 'Para Ti' ? 'text-white border-[#ffbade]' : 'text-gray-400 border-transparent hover:text-white'}`}>Para Ti</button>
            </div>

            {isLoading ? renderLoadingSkeleton() : renderContent()}
          </main>
          <aside className="w-full lg:w-1/4 lg:sticky top-20 self-start space-y-8">
            <RankingList />
            <ChatBox />
          </aside>
        </div>
      </div>
    </>
  );
};

export default Home;
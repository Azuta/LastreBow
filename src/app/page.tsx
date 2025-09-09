// src/app/page.tsx
"use client";
import { useEffect, useState, useMemo } from "react";
import { fetchMediaRows } from "@/services/fetchAniList";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import MangaSection from "@/components/shared/MangaSection";
import { Media } from "@/types/AniListResponse";
import RankingList from '@/components/sidebar/RankingList';
import ChatBox from '@/components/sidebar/ChatBox';
import { MangaCardSkeleton } from "@/components/ui/skeletons/MangaCardSkeleton"; // <-- AÑADIDO

const Home = () => {
  const [mediaRows, setMediaRows] = useState<{ title: string; data: Media[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('General');

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Simular un poco más de tiempo de carga para ver los esqueletos
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
        return <p className="text-gray-400 text-center">Inicia sesión para ver tus recomendaciones personalizadas.</p>
      }
      if (forYouMedia.length === 0) {
        return <p className="text-gray-400 text-center">No tenemos recomendaciones para ti. ¡Añade más mangas a tus favoritos!</p>
      }
      return <MangaSection key="for-you" title="Recomendado para Ti" media={forYouMedia} />;
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
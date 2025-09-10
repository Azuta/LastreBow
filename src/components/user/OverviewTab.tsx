// src/components/user/OverviewTab.tsx
"use client";

import MangaCard from '@/components/ui/cards/MangaCard';
import { Media } from '@/types/AniListResponse';
import ProfileComments from './ProfileComments';
import StatsCard from './StatsCard'; // Importamos el nuevo componente

// --- Iconos para las estadísticas ---
const HeartIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const ListIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const StarIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;


interface OverviewTabProps {
  userId: string;
  username: string;
  recentFavorites: Media[];
  totalFavorites: number;
  totalLists: number;
  totalReviews: number;
  initialComments: any[];
}

const OverviewTab = ({
    userId,
    username,
    recentFavorites,
    totalFavorites,
    totalLists,
    totalReviews,
    initialComments
}: OverviewTabProps) => {
  return (
    <div className="py-8 space-y-12">
      {/* Sección de Estadísticas */}
      <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <StatsCard icon={<HeartIcon />} label="Favoritos" value={totalFavorites} />
              <StatsCard icon={<ListIcon />} label="Listas Creadas" value={totalLists} />
              <StatsCard icon={<StarIcon />} label="Reseñas Escritas" value={totalReviews} />
          </div>
      </section>

      {/* Sección de Favoritos Recientes */}
      <section>
        <h3 className="text-xl font-bold text-white mb-4">Favoritos Recientes</h3>
        {recentFavorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-4 gap-y-6">
            {recentFavorites.map(manga => <MangaCard key={manga.id} media={manga} />)}
          </div>
        ) : (
          <p className="text-gray-400">Este usuario no tiene favoritos todavía.</p>
        )}
      </section>

      {/* Sección de Comentarios del Perfil */}
      <section>
         <ProfileComments
            profileId={userId}
            profileUsername={username}
            initialComments={initialComments}
        />
      </section>
    </div>
  );
};

export default OverviewTab;
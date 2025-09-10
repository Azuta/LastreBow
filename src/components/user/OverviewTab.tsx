// src/components/user/OverviewTab.tsx
"use client";

import MangaCard from '@/components/ui/cards/MangaCard';
import { Media } from '@/types/AniListResponse';
import ProfileComments from './ProfileComments'; // Crearemos este componente a continuación

interface OverviewTabProps {
  userId: string;
  username: string;
  recentFavorites: Media[];
  initialComments: any[]; // Usamos 'any' por ahora para los comentarios
}

const OverviewTab = ({ userId, username, recentFavorites, initialComments }: OverviewTabProps) => {
  return (
    <div className="py-8 space-y-12">
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
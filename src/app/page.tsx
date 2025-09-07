"use client";
import { useEffect, useState } from "react";
import { fetchMediaRows, fetchMediaById } from "@/services/fetchAniList";
import Navbar from "@/components/layout/Navbar";
// Importamos el nuevo componente para las secciones de cuadrícula
import MangaSection from "@/components/shared/MangaSection";
import { Media } from "@/types/AniListResponse";
import RankingList from '@/components/sidebar/RankingList'; // <-- 1. Importa el Ranking
import ChatBox from '@/components/sidebar/ChatBox';       // <-- 2. Importa el Chat

const Home = () => {
  const [mediaRows, setMediaRows] = useState<
    { title: string; data: Media[] }[]
  >([]);
  // Añadimos un estado de carga para una mejor experiencia de usuario
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const testApi = async () => {
      console.log("🚀 Probando la API...");
      setIsLoading(true); // Inicia la carga
      try {
        console.log("Fetching media rows...");
        const fetchedMediaRows = await fetchMediaRows();
        console.log("✅ Resultado de fetchMediaRows:", fetchedMediaRows);
        setMediaRows(fetchedMediaRows);

        console.log("Fetching media by ID (1535)...");
        const mediaById = await fetchMediaById(1535);
        console.log("✅ Resultado de fetchMediaById:", mediaById);
      } catch (error) {
        console.error("❌ Error probando la API:", error);
      } finally {
        setIsLoading(false); // Termina la carga
      }
    };

    testApi();
  }, []);

  return (
    <>
      <Navbar />
      {/* Contenedor principal que coincide con el layout del HTML */}
      <div className="max-w-screen-3xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ÁREA PRINCIPAL DE CONTENIDO */}
          <main className="w-full lg:w-4/4 space-y-12">
            {isLoading ? (
              <p className="text-white text-center">Cargando...</p>
            ) : (
              // Mapeamos los datos de la API para crear una sección por cada categoría
              mediaRows.map((row) => (
                <MangaSection
                  key={row.title}
                  title={row.title}
                  media={row.data}
                />
              ))
            )}
          </main>

          {/* BARRA LATERAL (para completar después) */}
          <aside className="w-full lg:w-1/4 lg:sticky top-20 self-start space-y-8">
            {/* Aquí irán los componentes de Ranking y Chat */}
            <RankingList />
            <ChatBox />
          </aside>
        </div>
      </div>
    </>
  );
};

export default Home;

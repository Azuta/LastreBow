"use client";
import { useEffect, useState } from "react"; // <-- 1. Importa useState
import { fetchMediaRows, fetchMediaById } from "@/services/fetchAniList";
import Navbar from "@/components/layout/Navbar";
import SliderMediaContainer from "@/components/shared/SliderMediaContainer";
import { Media } from "@/types/AniListResponse"; // Importamos el tipo para el estado

const Home = () => {
  // 2. Creamos un estado para guardar los datos de la API
  const [mediaRows, setMediaRows] = useState<{ title: string; data: Media[] }[]>([]);

  useEffect(() => {
    const testApi = async () => {
      console.log("🚀 Probando la API...");
      try {
        console.log("Fetching media rows...");
        const fetchedMediaRows = await fetchMediaRows(); // La llamamos 'fetchedMediaRows' para no confundir
        console.log("✅ Resultado de fetchMediaRows:", fetchedMediaRows);

        // 3. Guardamos los datos en el estado para que el return los pueda usar
        setMediaRows(fetchedMediaRows);

        // --- La prueba para fetchMediaById puede seguir igual ---
        console.log("Fetching media by ID (1535)...");
        const mediaById = await fetchMediaById(1535);
        console.log("✅ Resultado de fetchMediaById:", mediaById);
      } catch (error) {
        console.error("❌ Error probando la API:", error);
      }
    };

    testApi();
  }, []);

  return (
    <>
      <Navbar />
      <div className="pt-[10px]">
        {/* 4. Ahora esto funciona, pero solo si 'mediaRows' no está vacío */}
        {mediaRows.length > 0 ? (
          <SliderMediaContainer title="Trending" media={mediaRows[0].data} />
        ) : (
          <p>Loading media...</p> // Mostramos un mensaje de carga
        )}
        <h1>Revisa la consola del navegador para ver los resultados de la API</h1>
      </div>
    </>
  );
};

export default Home;
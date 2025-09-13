// src/components/ui/cards/MangaCard.tsx
"use client";
import React, { useState } from "react";
import { Media } from "@/types/AniListResponse";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface MangaCardProps {
  media: Media;
  isPrivate?: boolean;
  isSelectable?: boolean;
}

// Iconos
const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-yellow-400"
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);
const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-white"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const HeartIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const PlusIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const MangaCard = ({
  media,
  isPrivate = false,
  isSelectable = false,
}: MangaCardProps) => {
  const {
    isLoggedIn,
    profile,
    favorites,
    userLists,
    toggleFavorite,
    toggleListItem,
    addToast,
  } = useAuth();
  const [isListMenuOpen, setIsListMenuOpen] = useState(false);
  const router = useRouter();

  if (!media || (!media.title && !media.title_romaji && !media.title_english)) {
    return null;
  }

  // Se obtiene la lista de IDs de favoritos para una comprobación más sencilla
  const favoriteIds = favorites.map((fav) => fav.id);
  const isFavorite = favoriteIds.includes(media.id);

  const title =
    media.title?.english ||
    media.title_english ||
    media.title?.romaji ||
    media.title_romaji;
  const score = media.averageScore
    ? (media.averageScore / 10).toFixed(2)
    : "N/A";
  const genre = media.genres?.[0] || "Unknown";

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      addToast("Necesitas iniciar sesión para añadir a favoritos", "error");
      return;
    }
    await toggleFavorite(media);
    if (isFavorite) {
      addToast(`${title} eliminado de tus favoritos.`, "favorite-remove");
    } else {
      addToast(`${title} añadido a tus favoritos.`, "favorite-add");
    }
  };

  const handleAddToList = async (e: React.MouseEvent, listId: number) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleListItem(listId, media);
    setIsListMenuOpen(false);
  };

  const getGenreColor = (genre: string) => {
    switch (genre.toLowerCase()) {
      case "seinen":
        return "bg-red-600";
      case "shounen":
        return "bg-yellow-600";
      case "action":
        return "bg-red-700";
      case "comedy":
        return "bg-pink-500";
      case "fantasy":
        return "bg-purple-600";
      default:
        return "bg-gray-700";
    }
  };

  // <-- LÓGICA DEL INDICADOR DE PROGRESO -->
  const lastChapterRead = media.lastChapterRead
    ? parseFloat(media.lastChapterRead)
    : null;
  const totalChapters = media.chapters ? media.chapters : null;
  const progressPercentage =
    lastChapterRead && totalChapters
      ? (lastChapterRead / totalChapters) * 100
      : 0;
  const showProgress =
    lastChapterRead !== null &&
    totalChapters !== null &&
    lastChapterRead < totalChapters;

  const cardContent = (
    <>
      <img
        src={media.coverImage?.extraLarge || media.cover_image_extra_large}
        alt={title}
        className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

      {isPrivate && (
        <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full backdrop-blur-sm z-10">
          <LockIcon />
        </div>
      )}

      {/* --- DIV DE PROGRESO AÑADIDO --- */}
      {showProgress && (
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-700/80 z-20">
          <div
            className="h-full bg-manga-pink"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      )}

      <div className="relative h-full flex flex-col justify-between p-2">
        <div className="flex justify-between items-start">
          <span className="bg-black/50 text-white px-2 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm">
            {media.format}
          </span>
          <div className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-full text-xs font-bold backdrop-blur-sm">
            <StarIcon />
            <span>{score}</span>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-sm leading-tight mb-1">{title}</h3>
          <div
            className={`text-center py-1 rounded-sm text-xs font-semibold ${getGenreColor(
              genre
            )}`}
          >
            {genre}
          </div>
        </div>
      </div>
      {isLoggedIn && !isSelectable && (
        <div className="absolute top-2 left-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <button
            onClick={handleFavoriteClick}
            className={`p-2 rounded-full bg-black/50 backdrop-blur-sm transition-colors ${
              isFavorite
                ? "text-pink-500 bg-pink-900/50"
                : "text-[#ffbade] hover:bg-[#ffbade] hover:text-black"
            }`}
            aria-label="Añadir a favoritos"
          >
            <HeartIcon />
          </button>

          <div
            className="relative"
            onMouseLeave={() => setIsListMenuOpen(false)}
          >
            <button
              onMouseEnter={() => setIsListMenuOpen(true)}
              className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-white hover:text-black transition-colors"
              aria-label="Añadir a lista"
            >
              <PlusIcon />
            </button>
            {isListMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-[#2b2d42] rounded-lg shadow-lg py-1 z-30">
                {userLists.length > 0 ? (
                  userLists.map((list) => (
                    <div
                      key={list.id}
                      onClick={(e) =>
                        handleAddToList(e, list.id as unknown as number)
                      }
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer"
                    >
                      {list.name}
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-2 text-sm text-gray-400">
                    No tienes listas.
                  </p>
                )}
                <div className="border-t border-gray-600 my-1"></div>
                <div
                  onClick={() =>
                    router.push(`/user/${profile?.username}?tab=lists`)
                  }
                  className="block px-4 py-2 text-sm text-[#ffbade] hover:bg-gray-700 cursor-pointer"
                >
                  Crear nueva lista...
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="relative aspect-[2/3] w-full rounded-md overflow-hidden group text-white">
      {isSelectable ? (
        <div className="block w-full h-full">{cardContent}</div>
      ) : (
        <Link href={`/media/${media.id}`} className="block w-full h-full">
          {cardContent}
        </Link>
      )}
    </div>
  );
};
export default MangaCard;

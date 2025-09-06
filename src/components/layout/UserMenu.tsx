// src/components/layout/UserMenu.tsx

import Link from "next/link";
import ProfileCard from "@/components/ui/cards/ProfileCard";

// Definimos los datos del usuario aquí temporalmente.
// En el futuro, esto vendrá de un contexto de autenticación.
const userData = {
  avatarUrl: "https://mangadex.org/covers/8754fb67-d7f1-45f8-ad40-e4c218ba5836/605caded-f8d6-483b-a5e7-bd0ead4244b7.png.512.jpg",
  username: "Dymedis",
  role: "Member",
};

const UserMenu = () => {
  return (
    <div
      style={{ backgroundColor: "#2b2d42" }} // Usando el color de tu graynav
      className="absolute top-full right-0 mt-2 w-[250px] bg-white rounded-lg shadow-lg p-4 flex flex-col gap-1 z-50 max-h-[80vh] overflow-y-auto border border-gray-700"
    >
      {/* Perfil */}
      <ProfileCard
        avatarUrl={userData.avatarUrl}
        username={userData.username}
        role={userData.role}
      />
      <hr className="border-gray-600 my-2" />

      {/* Opciones - LISTA COMPLETA */}
      <Link href="/user/me" className="flex items-center gap-2 px-2 py-2 hover:bg-gray-700 rounded text-txnav">
        <span>👤</span> My Profile
      </Link>
      <Link href="/titles/follows" className="flex items-center gap-2 px-2 py-2 hover:bg-gray-700 rounded text-txnav">
        <span>📚</span> My Follows
      </Link>
      <Link href="/my/lists" className="flex items-center gap-2 px-2 py-2 hover:bg-gray-700 rounded text-txnav">
        <span>📂</span> My Lists
      </Link>
      <Link href="/my/groups" className="flex items-center gap-2 px-2 py-2 hover:bg-gray-700 rounded text-txnav">
        <span>👥</span> My Groups
      </Link>
      <Link href="/my/reports" className="flex items-center gap-2 px-2 py-2 hover:bg-gray-700 rounded text-txnav">
        <span>📑</span> My Reports
      </Link>
      <Link href="/announcements" className="flex items-center gap-2 px-2 py-2 hover:bg-gray-700 rounded text-txnav">
        <span>ℹ️</span> Announcements
      </Link>
      {/* Este enlace estaba duplicado en el original, lo puedes ajustar si es necesario */}
      <Link href="/likes" className="flex items-center gap-2 px-2 py-2 hover:bg-gray-700 rounded text-txnav">
        <span>❤️</span> Me gusta
      </Link>

      <hr className="border-gray-600 my-2" />

      {/* Configuración */}
      <div className="grid grid-cols-2 gap-2">
        <Link href="/settings" className="flex items-center gap-2 px-2 py-2 hover:bg-gray-700 rounded text-txnav">
          <span>⚙️</span> Settings
        </Link>
      </div>

      <Link href="/settings?tab=cat_blocks" className="flex items-center gap-2 px-2 py-2 hover:bg-gray-700 rounded text-txnav">
        <span>🚫</span> Content Filter
      </Link>

      <hr className="border-gray-600 my-2" />

      {/* Cerrar sesión */}
      <button className="flex items-center gap-2 px-2 py-2 hover:bg-red-800 text-red-400 rounded w-full">
        <span>🚪</span> Sign Out
      </button>
    </div>
  );
};

export default UserMenu;
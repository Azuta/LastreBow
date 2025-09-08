// src/components/layout/UserMenu.tsx

import Link from "next/link";
import ProfileCard from "@/components/ui/cards/ProfileCard";
import { useAuth } from "@/context/AuthContext"; // <-- Importar el hook

const UserMenu = () => {
  const { user, logout } = useAuth(); // <-- Obtener el usuario y la función de logout

  // Si no hay usuario (aunque este componente solo se renderiza si lo hay), no mostrar nada.
  if (!user) return null;

  return (
    <div
      style={{ backgroundColor: "#2b2d42" }}
      className="absolute top-full right-0 mt-2 w-[250px] rounded-lg shadow-lg p-4 flex flex-col gap-1 z-50 max-h-[80vh] overflow-y-auto border border-gray-700"
    >
      <ProfileCard
        avatarUrl={user.avatarUrl}
        username={user.username}
        role={user.role}
      />
      <hr className="border-gray-600 my-2" />

      <Link href={`/user/${user.username}`} className="flex items-center gap-2 px-2 py-2 hover:bg-gray-700 rounded text-txnav">
        <span>👤</span> My Profile
      </Link>
      <Link href="/titles/follows" className="flex items-center gap-2 px-2 py-2 hover:bg-gray-700 rounded text-txnav">
        <span>👀</span> My Follows
      </Link>
      <Link href={`/user/${user.username}`} className="flex items-center gap-2 px-2 py-2 hover:bg-gray-700 rounded text-txnav">
        <span>👥</span> My Groups
      </Link>
      
      <hr className="border-gray-600 my-2" />

      <Link href={`/user/${user.username}`} className="flex items-center gap-2 px-2 py-2 hover:bg-gray-700 rounded text-txnav">
          <span>⚙️</span> Settings
      </Link>
      <button onClick={logout} className="flex items-center gap-2 px-2 py-2 hover:bg-red-800 text-red-400 rounded w-full">
        <span>🚪</span> Sign Out
      </button>
    </div>
  );
};

export default UserMenu;
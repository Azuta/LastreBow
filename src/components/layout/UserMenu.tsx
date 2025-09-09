// src/components/layout/UserMenu.tsx
import Link from "next/link";
import ProfileCard from "@/components/ui/cards/ProfileCard";
import { useAuth } from "@/context/AuthContext";

const UserMenu = () => {
  const { profile, logout } = useAuth();

  if (!profile) return null;

  return (
    <div
      style={{ backgroundColor: "#2b2d42" }}
      className="absolute top-full right-0 mt-2 w-[250px] rounded-lg shadow-lg p-4 flex flex-col gap-1 z-50 max-h-[80vh] overflow-y-auto border border-gray-700"
    >
      <ProfileCard
        avatarUrl={profile.avatar_url}
        username={profile.username}
        role={profile.role}
      />
      <hr className="border-gray-600 my-2" />

      <Link href={`/user/${profile.username}`} className="flex items-center gap-2 px-2 py-2 hover:bg-gray-700 rounded text-txnav">
        <span>👤</span> Mi Perfil
      </Link>
      <Link href="/titles/follows" className="flex items-center gap-2 px-2 py-2 hover:bg-gray-700 rounded text-txnav">
        <span>👀</span> Mis Seguidos
      </Link>
      <Link href={`/user/${profile.username}?tab=community`} className="flex items-center gap-2 px-2 py-2 hover:bg-gray-700 rounded text-txnav">
        <span>👥</span> Mis Grupos
      </Link>
      
      <hr className="border-gray-600 my-2" />

      <Link href="/settings" className="flex items-center gap-2 px-2 py-2 hover:bg-gray-700 rounded text-txnav">
          <span>⚙️</span> Configuración
      </Link>
      <button onClick={logout} className="flex items-center gap-2 px-2 py-2 hover:bg-red-800 text-red-400 rounded w-full text-left">
        <span>🚪</span> Cerrar Sesión
      </button>
    </div>
  );
};

export default UserMenu;
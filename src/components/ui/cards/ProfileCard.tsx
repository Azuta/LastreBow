// src/components/ui/cards/ProfileCard.tsx

import Image from "next/image";

interface ProfileCardProps {
  avatarUrl: string;
  username: string;
  role: string;
}

const ProfileCard = ({ avatarUrl, username, role }: ProfileCardProps) => {
  return (
    <div className="flex flex-col items-center mb-4">
      {/* Usamos el componente Image de Next.js para optimización */}
      <Image
        src={avatarUrl}
        alt="Avatar"
        width={64}
        height={64}
        className="w-16 h-16 rounded-full"
      />
      <div className="text-center font-bold text-xl mt-2 text-white">{username}</div>
      <div className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded mt-1">
        {role}
      </div>
    </div>
  );
};

export default ProfileCard;
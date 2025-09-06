// src/components/ui/cards/SmallCard.tsx

import Link from "next/link";
import Image from "next/image";
import { Media } from "@/types/AniListResponse";

// 2. Define y usa la interfaz para las props
interface SmallCardProps {
  media: Media;
}

const SmallCard = ({ media }: SmallCardProps) => {
  const title = media.title.english || media.title.romaji;
  const href = `/media/${media.id}?source=anilist`; // Asumiendo esta estructura de URL

  return (
    <div className="text-white w-[150px] sm:w-[180px]">
      <Link href={href}>
        <div className="relative w-full h-[225px] sm:h-[265px] rounded-md overflow-hidden">
          <Image
            src={media.coverImage.extraLarge}
            alt={title}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 640px) 150px, 180px"
          />
        </div>
      </Link>
      <h3 className="text-sm font-semibold mt-2 truncate text-txtcard hover:text-white">
        <Link href={href}>{title}</Link>
      </h3>
    </div>
  );
};

export default SmallCard;
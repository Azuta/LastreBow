// src/components/ui/cards/BigCard.tsx

import Image from "next/image";
import Link from "next/link";
import styles from "./BigCard.module.css";
import { Media } from "@/types/AniListResponse";

interface BigCardProps {
  media: Media;
  id: number;
}

const BigCard = ({ media, id }: BigCardProps) => {
  const title = media.title.english || media.title.romaji;

  return (
    <div className={styles.item}>
      <div className={styles.number}>
        <span className={styles.number_span}>0{id + 1}</span>
        <div className={styles.film_title}>{title}</div>
      </div>
      <Link href={`/media/${media.id}`} className={styles.film_poster}>
        <Image
          src={media.coverImage.large}
          alt={title}
          fill
          sizes="200px"
          className={styles.film_poster_img}
        />
      </Link>
    </div>
  );
};

export default BigCard;
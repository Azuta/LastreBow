// src/components/shared/SliderMediaContainer.tsx

"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import styles from "./SliderMediaContainer.module.css";
import { Media } from "@/types/AniListResponse";
import BigCard from "@/components/ui/cards/BigCard";

interface SliderMediaContainerProps {
  title: string;
  media: Media[];
}

const SliderMediaContainer = ({ title, media }: SliderMediaContainerProps) => {
  return (
    <div id="anime-trending" className={styles.wrapper}>
      <div className={styles.container}>
        <section className={`${styles.block_area} block_area_trending`}>
          <div className={styles.block_area_header}>
            <div className="bah-heading">
              <h2 className={styles.cat_heading}>{title}</h2>
            </div>
          </div>
          <div className="block_area-content">
            <div className={styles.trending_list} id="trending-home">
              <Swiper
                spaceBetween={9}
                slidesPerView={6}
                grabCursor={true}
                loop={true}
                className="h-full" // Esta clase de Tailwind es crucial
              >
                {(media || []).slice(0, 9).map((item, idx) => (
                  <SwiperSlide key={item.id}>
                    <BigCard media={item} id={idx} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SliderMediaContainer;
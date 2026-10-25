"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

/* eslint-disable @next/next/no-img-element */

/** 마이비 reward-banner(327×72) 자동 롤링 배너 — benefit-hub와 같은 Swiper 사용. 우측 하단 "n / N" 카운터 */
export function Banners({ images, className }: { images: string[]; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl ${className ?? ""}`} style={{ aspectRatio: "327 / 72" }}>
      <Swiper modules={[Autoplay]} loop autoplay={{ delay: 3000, disableOnInteraction: false }} speed={400} className="h-full">
        {images.map((src, i) => (
          <SwiperSlide key={src}>
            <img src={src} alt={`배너 ${i + 1}`} className="h-full w-full object-cover" draggable={false} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

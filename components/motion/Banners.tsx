"use client";

import { IconTile, type DuoName, type Tone } from "@/components/icons/duo";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

/* eslint-disable @next/next/no-img-element */

export type BannerSlide = { title: string; sub: string; img?: string; icon?: DuoName; tone?: Tone; href: string; bg: string; dark?: boolean };

/** 자동 롤링 배너(327×72 비율) — 텍스트+브랜드 일러스트를 CSS 로 그린다 */
export function Banners({ slides, className }: { slides: BannerSlide[]; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl ${className ?? ""}`} style={{ aspectRatio: "327 / 72" }}>
      <Swiper modules={[Autoplay]} loop autoplay={{ delay: 3000, disableOnInteraction: false }} speed={400} className="h-full">
        {slides.map((b) => (
          <SwiperSlide key={b.title}>
            <Link href={b.href} className={`flex h-full items-center justify-between pl-4 pr-3 ${b.dark ? "text-white" : "text-ink"}`} style={{ background: b.bg }}>
              <span>
                <p className="text-[14px] font-extrabold leading-[18px]">{b.title}</p>
                <p className={`mt-0.5 text-[11px] leading-[14px] ${b.dark ? "text-white/80" : "text-ink-2"}`}>{b.sub}</p>
              </span>
              {b.icon ? <IconTile name={b.icon} tone={b.tone ?? "blue"} size={48} round /> : <img src={b.img} alt="" className="h-[56px] w-[56px] object-contain" draggable={false} />}
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

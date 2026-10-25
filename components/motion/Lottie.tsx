"use client";

import dynamic from "next/dynamic";

// lottie-react v3: named export `Lottie`, src 는 URL 또는 JSON 객체. SSR 비활성(브라우저 전용 엔진)
const LottieSvg = dynamic(() => import("lottie-react").then((m) => m.LottieSvg), { ssr: false });

/**
 * 마이비 원본 Lottie 재생기. public/myb/lottie_confetti_pop.json(614×614, 36f@30fps) / lottie_explode.json(940×752, 141f@60fps)
 * JSON 은 URL 로 넘겨 클라이언트에서 로드(번들 크기 영향 없음).
 */
export function Lottie({ src, loop = false, className }: { src: string; loop?: boolean; className?: string }) {
  return <LottieSvg src={src} loop={loop} autoplay className={className} />;
}

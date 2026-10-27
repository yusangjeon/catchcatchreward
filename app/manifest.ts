import type { MetadataRoute } from "next";

/** PWA — 폰 홈 화면에 추가하면 앱처럼 전체화면으로 열린다 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "캐치캐치리워드",
    short_name: "캐치캐치",
    description: "취향 퀴즈 풀고 포인트 받는 타겟형 리워드 앱",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#427dff",
    lang: "ko",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

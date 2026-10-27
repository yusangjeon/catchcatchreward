/** 듀오톤 SVG 아이콘 세트(토스·네이버페이식). 뒤 면은 currentColor 22%, 앞 선은 currentColor. 타일과 함께 쓴다. */
import type { CSSProperties } from "react";

export type DuoName =
  | "calendar" | "gamepad" | "gift" | "flame" | "trophy" | "pin" | "ticket" | "people" | "coin" | "bell" | "lock" | "search"
  | "quiz" | "store" | "drop" | "bag" | "star" | "megaphone" | "doc" | "chat" | "clock" | "badge" | "wheel" | "bolt" | "stamp" | "sparkle" | "chart"
  | "home" | "cart" | "dumbbell" | "plane" | "paw" | "lipstick" | "dress" | "trend" | "fork" | "car" | "leaf" | "pepper" | "coffee" | "moon";

export type Tone = "blue" | "green" | "violet" | "pink" | "teal" | "amber" | "orange" | "gray" | "navy";

/** 타일 배경(soft)·아이콘(deep) 색. 주황은 CTA 전용이라 타일에는 드물게 쓴다 */
export const TONE: Record<Tone, { soft: string; deep: string }> = {
  blue: { soft: "#e8f1ff", deep: "#2f6fed" },
  green: { soft: "#e4f7ee", deep: "#1aa362" },
  violet: { soft: "#eeeaff", deep: "#6b55e6" },
  pink: { soft: "#ffe9f1", deep: "#e23d7b" },
  teal: { soft: "#e2f6f8", deep: "#0f9bb0" },
  amber: { soft: "#fff3d6", deep: "#d98a00" },
  orange: { soft: "#fff0ea", deep: "#e0441a" },
  gray: { soft: "#f1f2f5", deep: "#6b7180" },
  navy: { soft: "#e9ecf5", deep: "#2b3a67" },
};

const P: Record<DuoName, { back?: string; front: string; fill?: string }> = {
  calendar: { back: "M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3H4z", front: "M4 10h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM8 3v4M16 3v4M9 15l2 2 4-4" },
  gamepad: { back: "M7 7h10a5 5 0 0 1 5 5v2a4 4 0 0 1-7 2.6L14 15h-4l-1 1.6A4 4 0 0 1 2 14v-2a5 5 0 0 1 5-5z", front: "M8 11v3M6.5 12.5h3M16 11.5h.01M18 13.5h.01" },
  gift: { back: "M3 10h18v3H3zM5 13h14v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z", front: "M12 10v11M12 10c-1.5-3-5-4-5-1.5S10 10 12 10c2 0 5-.5 5-2.5S13.5 7 12 10M3 10h18v3H3z" },
  flame: { back: "M12 3c2 3 6 5.5 6 10.5A6 6 0 0 1 6 13.5c0-2 1-3.5 2-4.5.5 1.5 1.5 2 2.5 2C11 8 10 5.5 12 3z", front: "M12 21a6 6 0 0 1-6-6.5M14.5 18a3 3 0 0 1-5 0c0-2 2-2.5 2.5-4 .8 1 2.5 1.8 2.5 4z" },
  trophy: { back: "M7 4h10v5a5 5 0 0 1-10 0z", front: "M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v3M8 20h8M9 17h6" },
  pin: { back: "M12 2a7 7 0 0 1 7 7c0 5-7 12-7 12S5 14 5 9a7 7 0 0 1 7-7z", front: "M12 12.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" },
  ticket: { back: "M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z", front: "M9 6v12M9 9h.01M9 12h.01M9 15h.01" },
  people: { back: "M4 20c0-3.5 3-6 7-6h2c4 0 7 2.5 7 6z", front: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM16 11a3 3 0 1 0 0-6" },
  coin: { back: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", front: "M9.8 16.5V7.5h3a2.6 2.6 0 0 1 0 5.2h-3" },
  bell: { back: "M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z", front: "M10 20a2 2 0 0 0 4 0M12 3v2" },
  lock: { back: "M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z", front: "M8 11V8a4 4 0 0 1 8 0v3M12 15v2.5" },
  search: { back: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z", front: "M15.5 15.5 21 21M10.5 7.5a3 3 0 0 0-3 3" },
  quiz: { back: "M4 5h16v11H11l-4 4v-4H4z", front: "M10 9.5a2 2 0 1 1 2.8 1.8c-.6.3-.8.6-.8 1.2M12 14.3h.01" },
  store: { back: "M4 10h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z", front: "M3 7l1.5-4h15L21 7a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0zM9 21v-6h6v6" },
  drop: { back: "M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z", front: "M9 14a3 3 0 0 0 3 3" },
  bag: { back: "M5 8h14l-1 12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z", front: "M9 8V6a3 3 0 0 1 6 0v2M9 12v1a3 3 0 0 0 6 0v-1" },
  star: { back: "M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.8 1.1-6.1L3.2 9.4l6.1-.8z", front: "M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.8 1.1-6.1L3.2 9.4l6.1-.8z" },
  megaphone: { back: "M4 10v4a1 1 0 0 0 1 1h3l8 4V5L8 9H5a1 1 0 0 0-1 1z", front: "M19 9.5a3 3 0 0 1 0 5M8 15l1 5h2.5" },
  doc: { back: "M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z", front: "M14 3v4h4M9 12h6M9 16h4" },
  chat: { back: "M12 4c-4.4 0-8 3-8 6.8 0 2.2 1.2 4.1 3 5.4L6 20l4.2-2c.6.1 1.2.2 1.8.2 4.4 0 8-3 8-6.8S16.4 4 12 4z", front: "M9 11h.01M12 11h.01M15 11h.01" },
  clock: { back: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", front: "M12 7v5l3 2" },
  badge: { back: "M12 2l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5z", front: "M9 12l2 2 4-4" },
  wheel: { back: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", front: "M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" },
  bolt: { back: "M13 2 4 14h7l-1 8 9-12h-7z", front: "M13 2 4 14h7l-1 8 9-12h-7z" },
  stamp: { back: "M12 2l1.8 2.4 2.9-.6.6 2.9L19.7 8.5l-1.7 2.4 1.7 2.4-2.4 1.8-.6 2.9-2.9-.6L12 20l-1.8-2.6-2.9.6-.6-2.9L4.3 13.3 6 10.9 4.3 8.5l2.4-1.8.6-2.9 2.9.6z", front: "M9 11l2 2 4-4" },
  sparkle: { back: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z", front: "M19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8zM5 3l.6 1.6L7.2 5l-1.6.6L5 7.2l-.6-1.6L2.8 5l1.6-.4z" },
  chart: { back: "M4 20h16v1H4z", front: "M5 19V11M10 19V6M15 19v-8M20 19V4" },
  home: { back: "M4 11l8-7 8 7v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z", front: "M10 21v-6h4v6M3 11.5 12 4l9 7.5" },
  cart: { back: "M6 7h15l-1.6 7H8z", front: "M3 4h2.4l2.6 10h10M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" },
  dumbbell: { back: "M7 8h10v8H7z", front: "M3 10v4M21 10v4M5 8v8M19 8v8M7 12h10M7 7h2v10H7zM15 7h2v10h-2z" },
  plane: { back: "M21 12l-7-2V4.5a2 2 0 0 0-4 0V10l-7 2v2l7-1v4l-2 1.5V20l4-1 4 1v-1.5L14 17v-4l7 1z", front: "M21 12l-7-2V4.5a2 2 0 0 0-4 0V10l-7 2v2l7-1v4l-2 1.5V20l4-1 4 1v-1.5L14 17v-4l7 1z" },
  paw: { back: "M12 20c-3 0-5-1.6-5-3.6 0-1.8 2.2-4.4 5-4.4s5 2.6 5 4.4c0 2-2 3.6-5 3.6z", front: "M7.5 9.5a1.6 2 0 1 0 0-4 1.6 2 0 0 0 0 4zM16.5 9.5a1.6 2 0 1 0 0-4 1.6 2 0 0 0 0 4zM4.5 13.5a1.5 2 0 1 0 0-4 1.5 2 0 0 0 0 4zM19.5 13.5a1.5 2 0 1 0 0-4 1.5 2 0 0 0 0 4z" },
  lipstick: { back: "M9 10h6v10a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z", front: "M10 10V5l4-2v7M8 13h8M12 13v8" },
  dress: { back: "M7 21l1.5-9L7 8h10l-1.5 4L17 21z", front: "M9 3c0 3 1.5 5 3 5s3-2 3-5M7 8h10M8.5 12h7" },
  trend: { back: "M4 20h16v1H4z", front: "M4 17l5-5 4 3 7-7M15 8h5v5" },
  fork: { back: "M15 3c-2 0-3 2-3 5s1 5 3 5z", front: "M6 3v5a2.5 2.5 0 0 0 5 0V3M8.5 3v18M15 13v8M15 3c2 0 3 2 3 5s-1 5-3 5" },
  car: { back: "M4 12h16v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z", front: "M5 12l2-5.5A1.5 1.5 0 0 1 8.4 5.5h7.2a1.5 1.5 0 0 1 1.4 1L19 12M7 19v2M17 19v2M7.5 15.5h.01M16.5 15.5h.01" },
  leaf: { back: "M19 4c-9 0-14 4-14 11a5 5 0 0 0 5 5c7 0 9-7 9-16z", front: "M5 20c3-6 7-9 12-12M19 4c-9 0-14 4-14 11a5 5 0 0 0 5 5c7 0 9-7 9-16z" },
  pepper: { back: "M16 7c-5 0-10 4-10 9a4 4 0 0 0 4 4c6 0 9-6 9-11z", front: "M16 7c0-2 1.5-3.5 3.5-3.5M16 7c-5 0-10 4-10 9a4 4 0 0 0 4 4c6 0 9-6 9-11zM9 17c1.5-3 4-5.5 7-7" },
  coffee: { back: "M4 9h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z", front: "M16 10h2a2.5 2.5 0 0 1 0 5h-2M7 4.5c0 1 1 1 1 2M11 4.5c0 1 1 1 1 2" },
  moon: { back: "M14 3a9 9 0 1 0 7 14.5A8 8 0 0 1 14 3z", front: "M14 3a9 9 0 1 0 7 14.5A8 8 0 0 1 14 3zM18 4l.5 1.5L20 6l-1.5.5L18 8l-.5-1.5L16 6l1.5-.5z" },
};

/** SVG 안에 직접 그릴 때(룰렛 조각 등) 경로 데이터 */
export function duoPath(name: DuoName) { return P[name]; }

export function DuoIcon({ name, size = 22, className, style }: { name: DuoName; size?: number; className?: string; style?: CSSProperties }) {
  const d = P[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden>
      {d.back && <path d={d.back} fill="currentColor" opacity=".22" />}
      <path d={d.front} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={d.fill ?? "none"} />
    </svg>
  );
}

/** 연한 배경 둥근 타일 안의 듀오톤 아이콘 — 리스트·퀵메뉴·카드 공통 */
/** 플랫 컬러 아이콘(`/brand/qm/*.webp`, 자체 제작)이 있는 이름 → 파일명. 없는 이름은 듀오톤 타일로 폴백 */
export const FLAT: Partial<Record<DuoName, string>> = {
  calendar: "attend", gamepad: "games", gift: "gift", drop: "honey", people: "invite", wheel: "roulette", bag: "shop", pin: "store", store: "store", bolt: "walk",
  quiz: "quiz", search: "search", trophy: "trophy", flame: "flame", doc: "doc", coin: "coin", ticket: "ticket", stamp: "stamp", bell: "bell", megaphone: "megaphone", chat: "chat", clock: "clock", home: "home",
};

/** 플랫 아이콘 이미지 단독 */
export function FlatIcon({ file, size = 40, className, style }: { file: string; size?: number; className?: string; style?: CSSProperties }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/brand/qm/${file}.webp`} alt="" width={size} height={size} className={`shrink-0 object-contain ${className ?? ""}`} style={{ width: size, height: size, ...style }} draggable={false} />;
}

export function IconTile({ name, tone = "blue", size = 44, icon, radius, className, round = false, flat = true }: { name: DuoName; tone?: Tone; size?: number; icon?: number; radius?: number; className?: string; round?: boolean; flat?: boolean }) {
  const t = TONE[tone];
  const file = flat ? FLAT[name] : undefined;
  if (file) {
    return (
      <span className={`inline-flex shrink-0 items-center justify-center ${className ?? ""}`} style={{ width: size, height: size }}>
        <FlatIcon file={file} size={Math.round(size * 0.92)} />
      </span>
    );
  }
  return (
    <span className={`inline-flex shrink-0 items-center justify-center ${className ?? ""}`} style={{ width: size, height: size, borderRadius: round ? 9999 : (radius ?? Math.round(size * 0.32)), background: t.soft, color: t.deep }}>
      <DuoIcon name={name} size={icon ?? Math.round(size * 0.52)} />
    </span>
  );
}

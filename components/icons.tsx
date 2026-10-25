/** 마이비 UI 아이콘(SVG, 1차 복제). 24px 기준 stroke 아이콘 */
type P = { className?: string; size?: number };

export function HomeIcon({ className, size = 26 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 3.2 3 10.4V20a1 1 0 0 0 1 1h5.5v-6h5v6H20a1 1 0 0 0 1-1v-9.6L12 3.2Z" />
    </svg>
  );
}
export function QuizIcon({ className, size = 26 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M5 3h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-6.5L8 21.5V18H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm7 3.3c-1.9 0-3.3 1.2-3.4 3h1.9c.1-.8.6-1.3 1.5-1.3.8 0 1.3.5 1.3 1.1 0 .6-.3.9-1 1.4-.9.6-1.3 1.2-1.3 2.3v.3h1.9v-.2c0-.7.3-1 1-1.5.9-.6 1.4-1.3 1.4-2.3 0-1.7-1.3-2.8-3.3-2.8Zm-.1 8.2a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z" />
    </svg>
  );
}
export function BenefitIcon({ className, size = 26 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 9.5c0 1.7 3.6 3 8 3s8-1.3 8-3v3c0 1.7-3.6 3-8 3s-8-1.3-8-3v-3Z" />
      <path d="M4 15c0 1.7 3.6 3 8 3s8-1.3 8-3v3c0 1.7-3.6 3-8 3s-8-1.3-8-3v-3Z" />
    </svg>
  );
}
export function WalletIcon({ className, size = 26 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M4 5h13a2 2 0 0 1 2 2v1H6a1 1 0 0 0 0 2h14a1 1 0 0 1 1 1v8a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V7a2 2 0 0 1 2-2Zm12 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
    </svg>
  );
}
export function WalkIcon({ className, size = 26 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M3 16.5 11 7l3.2 2.4c.8.6 1.8.8 2.8.6l3-.6a1 1 0 0 1 1.2.8l.3 1.9c.2 1-.4 2-1.4 2.3L13 16.3c-.8.3-1.3 1-1.3 1.8V19H4a1 1 0 0 1-1-1v-1.5Z" />
    </svg>
  );
}
export function BellIcon({ className, size = 26 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2a6 6 0 0 0-6 6v4.2L4.3 15a1 1 0 0 0 .8 1.6h13.8a1 1 0 0 0 .8-1.6L18 12.2V8a6 6 0 0 0-6-6Zm0 20a3 3 0 0 0 2.8-2H9.2A3 3 0 0 0 12 22Z" />
    </svg>
  );
}
export function GiftIcon({ className, size = 22 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 6.5 10.6 4.4A2.2 2.2 0 1 0 8 7h-4a1 1 0 0 0-1 1v3h8V7h2v4h8V8a1 1 0 0 0-1-1h-4a2.2 2.2 0 1 0-2.6-2.6L12 6.5ZM3 13h8v8H4a1 1 0 0 1-1-1v-7Zm10 0h8v7a1 1 0 0 1-1 1h-7v-8Z" />
    </svg>
  );
}
export function HeartIcon({ className, size = 24 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <path d="M12 20.5s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7.5 2.5c0 5.4-7.5 10-7.5 10Z" strokeLinejoin="round" />
    </svg>
  );
}
export function ChevronRight({ className, size = 18 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={className} aria-hidden>
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function ChevronLeft({ className, size = 26 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={className} aria-hidden>
      <path d="m15 5-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function CheckIcon({ className, size = 18 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={className} aria-hidden>
      <path d="m5 12 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function InfoIcon({ className, size = 16 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 5h2v2h-2V7Zm0 4h2v6h-2v-6Z" />
    </svg>
  );
}
export function ClockIcon({ className, size = 14 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5h-2v6l5 3 1-1.7-4-2.3V7Z" />
    </svg>
  );
}

/* eslint-disable @next/next/no-img-element */
/** B포인트 코인 — 마이비 benefit-hub 원본 ic_bpoint_01.webp(48px) */
export function PCoin({ size = 24, className }: P) {
  return <img src="/myb/bh/ic_bpoint_01.webp" width={size} height={size} alt="B포인트" draggable={false} className={`inline-block shrink-0 select-none ${className ?? ""}`} />;
}
/** 핑크 P 코인 — 쇼핑적립 예정 포인트(ic_bpoint_02.webp) */
export function PCoinPink({ size = 24, className }: P) {
  return <img src="/myb/bh/ic_bpoint_02.webp" width={size} height={size} alt="쇼핑적립 포인트" draggable={false} className={`inline-block shrink-0 select-none ${className ?? ""}`} />;
}
/** CONX 코인 — 원본 ic_conx.webp(54px) */
export function CXCoin({ size = 24, className }: P) {
  return <img src="/myb/bh/ic_conx.webp" width={size} height={size} alt="CONX" draggable={false} className={`inline-block shrink-0 select-none ${className ?? ""}`} />;
}
/** XPLA 코인 — 원본 ic_xpla.webp */
export function XplaCoin({ size = 24, className }: P) {
  return <img src="/myb/bh/ic_xpla.webp" width={size} height={size} alt="XPLA" draggable={false} className={`inline-block shrink-0 select-none ${className ?? ""}`} />;
}
/**
 * P + CX 겹친 코인 (벤핏허브 헤더 DOM 그대로): P(18) → 흰 원(18, margin -16) → CX(18, margin -10).
 * 흰 원이 P와 CX 사이의 링 역할. 18px 기준 총 폭 28px.
 */
export function PXCoin({ size = 18, className }: P) {
  const k = size / 18;
  const circle = "relative flex items-center justify-center rounded-full bg-white";
  return (
    <span className={`flex shrink-0 items-center ${className ?? ""}`} style={{ height: size }} aria-label="B포인트·CONX">
      <span className={`${circle} z-[2]`} style={{ width: size, height: size }}><PCoin size={size} /></span>
      <span className={`${circle} z-[1]`} style={{ width: size, height: size, marginLeft: -16 * k }} aria-hidden />
      <span className={`${circle} z-0`} style={{ width: size, height: size, marginLeft: -10 * k }}><CXCoin size={size} /></span>
    </span>
  );
}
/** 벤핏허브 버튼·칩 안의 흰색 P 아이콘(원본 SVG path) */
export function PSvg({ size = 16, className, fill = "#FFFFFF" }: P & { fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`shrink-0 ${className ?? ""}`} aria-hidden>
      <path d="M8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0ZM8.33594 4.57422C7.5882 4.57422 6.48358 4.64579 5.02344 4.79004V11.8242H7.90723V10.5488L8.69336 10.5664C9.15259 10.5664 9.584 10.49 9.9873 10.3369C10.3906 10.1838 10.7427 9.97006 11.043 9.69629C11.3431 9.42258 11.5803 9.09446 11.7539 8.71191C11.9276 8.32922 12.0137 7.90748 12.0137 7.44824C12.0136 6.42695 11.7399 5.69252 11.1924 5.24512C10.9098 5.01559 10.5489 4.8462 10.1104 4.7373C9.67476 4.62847 9.08329 4.57423 8.33594 4.57422ZM9.00293 6.40625C9.08222 6.40631 9.15315 6.42179 9.21484 6.45117C9.40584 6.54252 9.50098 6.72937 9.50098 7.01172C9.50092 7.29411 9.37491 7.57795 9.12207 7.86328C8.98666 8.01635 8.74769 8.17694 8.40625 8.34473L7.88965 8.59668V6.93164C8.37824 6.5814 8.74979 6.40625 9.00293 6.40625Z" fill={fill} />
    </svg>
  );
}
/** 프로필 아바타 — ic_profile_01~04.webp. 페르소나 코드로 결정적 선택 */
export function Avatar({ seed, size = 50, className }: P & { seed: string }) {
  const n = ([...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % 4) + 1;
  return <img src={`/myb/bh/ic_profile_0${n}.webp`} width={size} height={size} alt="" draggable={false} className={`inline-block shrink-0 rounded-full select-none ${className ?? ""}`} />;
}

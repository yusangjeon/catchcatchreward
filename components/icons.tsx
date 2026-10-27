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
export function GameIcon({ className, size = 26 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M7.5 6h9A5.5 5.5 0 0 1 22 11.5v1.8a4.2 4.2 0 0 1-7.3 2.8l-.6-.7H9.9l-.6.7A4.2 4.2 0 0 1 2 13.3v-1.8A5.5 5.5 0 0 1 7.5 6Zm.5 3.2a.9.9 0 0 0-.9.9v1h-1a.9.9 0 1 0 0 1.8h1v1a.9.9 0 1 0 1.8 0v-1h1a.9.9 0 1 0 0-1.8h-1v-1a.9.9 0 0 0-.9-.9Zm8 .4a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Zm-2.3 2.3a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z" />
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

 
/** 캐치 코인 — 코랄 오렌지 링 + 골드 면 + 흰 "C". 전 화면 포인트 아이콘(이미지 파일 없음) */
export function PCoin({ size = 24, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`inline-block shrink-0 select-none ${className ?? ""}`} aria-label="캐치포인트" role="img">
      <defs>
        <linearGradient id="ccr-coin-ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff7a4d" /><stop offset="1" stopColor="#d93f16" /></linearGradient>
        <radialGradient id="ccr-coin-face" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#ffe08a" /><stop offset="1" stopColor="#f2a81d" /></radialGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#ccr-coin-ring)" />
      <circle cx="12" cy="12" r="9" fill="url(#ccr-coin-face)" />
      <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(0,0,0,.08)" strokeWidth="1" />
      <path d="M15.4 9.3a3.6 3.6 0 1 0 0 5.4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
/** 쇼핑적립 예정 포인트 — 핑크 톤 코인 */
export function PCoinPink({ size = 24, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`inline-block shrink-0 select-none ${className ?? ""}`} aria-label="쇼핑적립 포인트" role="img">
      <circle cx="12" cy="12" r="12" fill="#ff5c9a" /><circle cx="12" cy="12" r="9" fill="#ffd1e3" />
      <path d="M15.4 9.3a3.6 3.6 0 1 0 0 5.4" fill="none" stroke="#e0317a" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
/** 스탬프 — 룰렛 스탬프(10개 = 1회). 옛 CONX 자리 */
export function CXCoin({ size = 24, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`inline-block shrink-0 select-none ${className ?? ""}`} aria-label="스탬프" role="img">
      <path d="M12 1.5l2.1 2.3 3-.8.8 3 2.3 2.1-1.6 2.7 1.6 2.7-2.3 2.1-.8 3-3-.8L12 22.5l-2.1-2.3-3 .8-.8-3-2.3-2.1 1.6-2.7-1.6-2.7 2.3-2.1.8-3 3 .8z" fill="#ff5a2d" />
      <circle cx="12" cy="12" r="6.2" fill="#fff0ea" />
      <path d="M9.2 12.2l2 2 3.8-4" fill="none" stroke="#e0441a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
/** (미사용 호환) */
export function XplaCoin({ size = 24, className }: P) { return <CXCoin size={size} className={className} />; }
/** 코인 + 스탬프 겹침(지갑·혜택 헤더) */
export function PXCoin({ size = 18, className }: P) {
  const k = size / 18;
  const circle = "relative flex items-center justify-center rounded-full bg-white";
  return (
    <span className={`flex shrink-0 items-center ${className ?? ""}`} style={{ height: size }} aria-label="캐치포인트·스탬프">
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
      <circle cx="8" cy="8" r="8" fill={fill} fillOpacity=".18" /><path d="M10.6 5.9a3 3 0 1 0 0 4.2" fill="none" stroke={fill} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
/** 프로필 아바타 — 캐치 마스코트 4포즈(시드로 결정적 선택) */
export function Avatar({ seed, size = 50, className }: P & { seed: string }) {
  const hues = [215, 150, 260, 330, 190, 35];
  let h = 0; for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) % 6;
  return <span className={`inline-flex items-center justify-center rounded-full font-black text-white ${className ?? ""}`} style={{ width: size, height: size, fontSize: size * 0.4, background: `hsl(${hues[h]} 70% 55%)` }}>{seed.slice(0, 1)}</span>;
}

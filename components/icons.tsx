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

/** B포인트 코인 (파란 원 + 흰 P) */
export function PCoin({ size = 24, className }: P) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-myb font-extrabold text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.18)] ${className ?? ""}`}
      style={{ width: size, height: size, fontSize: size * 0.62, lineHeight: 1 }}
      aria-label="B포인트"
    >
      P
    </span>
  );
}
/** CONX 코인 (검정 원 + CX) */
export function CXCoin({ size = 24, className }: P) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white font-extrabold text-ink ${className ?? ""}`}
      style={{ width: size, height: size, fontSize: size * 0.4, lineHeight: 1 }}
      aria-label="CONX"
    >
      CX
    </span>
  );
}
/** P + CX 겹친 코인 (지갑 총액·만보기 헤더) */
export function PXCoin({ size = 28 }: P) {
  return (
    <span className="relative inline-block shrink-0" style={{ width: size * 1.85, height: size }}>
      <CXCoin size={size} className="absolute left-[55%] top-0" />
      <PCoin size={size} className="absolute left-0 top-0 ring-2 ring-white" />
    </span>
  );
}

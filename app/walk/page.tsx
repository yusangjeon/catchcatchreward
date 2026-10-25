"use client";

import { useHome, fmt } from "@/hooks/useHome";
import { PXCoin } from "@/components/icons";

const MILESTONES = [
  { steps: 400, icon: "🎁", done: true },
  { steps: 800, icon: "🎁", fire: true },
  { steps: 1200, icon: "🎁", fire: true, up: true },
  { steps: 1600, icon: "🎁", gold: true },
];

/** 만보기 — 웹에서는 걸음 수 연동이 불가해 정적 화면(앱 출시 대비 레이아웃만 복제) */
export default function WalkPage() {
  const { data } = useHome();
  return (
    <div className="relative min-h-[calc(100dvh-84px)] overflow-hidden bg-gradient-to-b from-[#bcd6ff] via-[#dbe8ff] to-[#f1f5ff]">
      <div className="pointer-events-none absolute -left-16 top-24 h-40 w-64 rounded-full bg-white/80 blur-2xl" />
      <div className="pointer-events-none absolute -right-20 top-56 h-44 w-72 rounded-full bg-white/80 blur-2xl" />

      <header className="relative flex h-14 items-center justify-between px-5">
        <p className="flex items-center gap-2"><PXCoin size={30} /><span className="text-[19px] font-bold tabular-nums">{data ? fmt(data.wallet.balance) : "—"}</span></p>
        <div className="flex -space-x-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff7a59] ring-2 ring-white" aria-hidden>👩‍🦰</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c9d6ea] ring-2 ring-white" aria-hidden>🧑</span>
        </div>
      </header>

      <div className="relative px-5 pt-6">
        <p className="text-[15px] font-semibold text-ink-2">총 걸음 수 👟</p>
        <p className="text-[46px] font-black leading-none tabular-nums">1,834</p>
      </div>

      {/* 무지개 길 + 캐릭터 */}
      <div className="relative mt-4 h-[300px]">
        <div
          className="absolute bottom-0 left-1/2 h-[240px] w-[420px] -translate-x-1/2 bg-[linear-gradient(90deg,#ff8a8a,#ffc46b,#fff08a,#8fe3a0,#8ccbff,#b39cff)] opacity-85"
          style={{ clipPath: "polygon(42% 0, 58% 0, 92% 100%, 8% 100%)" }}
          aria-hidden
        />
        <span className="absolute left-1/2 top-[60px] -translate-x-1/2 text-[120px] leading-none drop-shadow-lg" aria-hidden>🏃‍♀️</span>
        <div className="absolute right-6 top-6 flex flex-col items-center">
          <span className="text-[56px] leading-none" aria-hidden>🎁</span>
          <span className="mt-1 rounded-full bg-myb px-3 py-1.5 text-[13px] font-bold text-white">한 번에 받기</span>
        </div>
      </div>

      {/* 마일스톤 */}
      <div className="relative px-5 pb-8">
        <ul className="grid grid-cols-4">
          {MILESTONES.map((m) => (
            <li key={m.steps} className="relative flex flex-col items-center">
              {m.up && <span className="absolute -top-6 rounded-full bg-[#ff8a3d] px-2.5 py-1 text-[11px] font-bold text-white">보상 UP!</span>}
              <span className={`text-[46px] leading-none ${m.done ? "grayscale" : ""}`} aria-hidden>{m.icon}</span>
              {m.done && <span className="absolute right-3 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-myb text-[11px] text-white">✓</span>}
              {m.fire && <span className="absolute left-3 top-6 text-[18px]" aria-hidden>🔥</span>}
            </li>
          ))}
        </ul>
        <div className="relative mt-4 h-2 rounded-full bg-white">
          <div className="absolute inset-y-0 left-0 w-1/4 rounded-full bg-myb" />
          {[12.5, 37.5, 62.5, 87.5].map((p, i) => (
            <span key={p} className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${i === 0 ? "bg-myb" : "bg-white ring-2 ring-[#dbe4f5]"}`} style={{ left: `${p}%` }} />
          ))}
        </div>
        <ul className="mt-2 grid grid-cols-4 text-center text-[13px] text-muted">
          {MILESTONES.map((m) => <li key={m.steps}>{fmt(m.steps)}걸음</li>)}
        </ul>
        <p className="mt-6 rounded-xl bg-white/70 px-4 py-3 text-center text-[12px] text-ink-2">웹에서는 걸음 수 연동이 되지 않아요. 앱 출시 때 열려요.</p>
      </div>
    </div>
  );
}

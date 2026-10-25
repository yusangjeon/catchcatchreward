"use client";

import { useHome, fmt } from "@/hooks/useHome";
/* eslint-disable @next/next/no-img-element */

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
      {/* 원본 히어로(헤더·총 걸음 수·캐릭터·무지개·성·한 번에 받기 포함) — 앱스토어 스크린샷 픽셀. 웹은 걸음 수 연동이 없어 정적 */}
      <img src="/myb/native/walk_hero.png" alt="만보기" className="block w-full" draggable={false} />
      <img src="/myb/native/walk_gifts.png" alt="걸음 보상 선물" className="mx-auto -mt-2 block w-[90%]" draggable={false} />
      <span className="sr-only">보유 포인트 {data ? fmt(data.wallet.balance) : ""}</span>

      {/* 마일스톤 */}
      <div className="relative px-5 pb-8">
        <div className="relative mt-1 h-2 rounded-full bg-white">
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

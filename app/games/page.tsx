"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GameHeader } from "@/components/games/GameHeader";
import { PCoin } from "@/components/icons";
import { NumberFlow } from "@/components/motion/NumberFlow";
import { fmt } from "@/hooks/useHome";
import type { GamesPayload } from "@/lib/games/service";

const TILE: Record<string, { bg: string; art: React.ReactNode }> = {
  spot: { bg: "linear-gradient(135deg,#bfe3ff,#8fd37a)", art: <svg viewBox="0 0 48 48" className="h-10 w-10"><circle cx="19" cy="19" r="12" fill="none" stroke="#191f28" strokeWidth="4" /><line x1="28" y1="28" x2="40" y2="40" stroke="#191f28" strokeWidth="5" strokeLinecap="round" /><circle cx="19" cy="19" r="5" fill="#ff5c8a" /></svg> },
  slide: { bg: "linear-gradient(135deg,#ffe08a,#ff8a3d)", art: <svg viewBox="0 0 48 48" className="h-10 w-10"><rect x="4" y="4" width="18" height="18" rx="4" fill="#fff" /><rect x="26" y="4" width="18" height="18" rx="4" fill="#fff" opacity=".7" /><rect x="4" y="26" width="18" height="18" rx="4" fill="#fff" opacity=".7" /><rect x="26" y="26" width="18" height="18" rx="4" fill="#427cff" /><text x="35" y="40" fontSize="11" fontWeight="800" fill="#fff" textAnchor="middle">2048</text></svg> },
  scratch: { bg: "linear-gradient(135deg,#ffb86b,#ff6b6b)", art: <svg viewBox="0 0 48 48" className="h-10 w-10"><rect x="6" y="12" width="36" height="24" rx="4" fill="#fff" /><circle cx="16" cy="24" r="4" fill="#ff8a3d" /><circle cx="24" cy="24" r="4" fill="#ff8a3d" /><circle cx="32" cy="24" r="4" fill="#ff8a3d" /></svg> },
  rsp: { bg: "linear-gradient(135deg,#1e293b,#427cff)", art: <span className="text-[34px] leading-none">✌️</span> },
  memory: { bg: "linear-gradient(135deg,#c084fc,#427cff)", art: <svg viewBox="0 0 48 48" className="h-10 w-10"><rect x="6" y="8" width="16" height="22" rx="3" fill="#fff" /><rect x="26" y="8" width="16" height="22" rx="3" fill="#fff" opacity=".8" /><rect x="6" y="34" width="36" height="6" rx="3" fill="#fff" opacity=".5" /></svg> },
};

/** 미니게임 허브 — 매일 리셋되는 5가지. 결과·보상은 서버가 결정 */
export default function GamesPage() {
  const [data, setData] = useState<GamesPayload | null>(null);
  useEffect(() => {
    fetch("/api/games", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => {});
  }, []);
  const todayPoints = data?.games.reduce((a, g) => a + g.todayPoints, 0) ?? 0;
  const leftTotal = data?.games.reduce((a, g) => a + g.left, 0) ?? 0;
  return (
    <div className="min-h-dvh bg-[#f8f9fc] pb-10 text-[#191f28]">
      <GameHeader title="미니게임" right={<Link href="/wallet" className="flex items-center gap-1 text-[16px]"><PCoin size={16} />{data ? <NumberFlow value={data.wallet.balance} /> : "—"}</Link>} />
      <div className="flex flex-col gap-4 px-5 pt-[64px]">
        <section className="relative overflow-hidden rounded-[20px] bg-[#191f28] p-5 text-white">
          <p className="text-[12px] font-semibold text-[#9fb6ff]">매일 0시 리셋 · 오늘 남은 플레이 {leftTotal}회</p>
          <p className="mt-1 text-[20px] font-extrabold leading-[26px]">오늘 게임으로 <span className="text-[#fde047]">{fmt(todayPoints)}P</span> 모았어요</p>
          <p className="mt-2 text-[12px] text-white/60">이번 주 {data?.weekPlays ?? 0}회 플레이 · 3회마다 러쉬 스탬프 미션 달성</p>
          <span className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[#427cff]/30 blur-2xl" />
        </section>
        <ul className="grid grid-cols-2 gap-3">
          {(data?.games ?? []).map((g) => (
            <li key={g.key}>
              <Link href={g.href} className="block overflow-hidden rounded-[20px] bg-white" style={{ boxShadow: "0 5px 16px 0 rgba(0, 43, 141, 0.1)" }}>
                <div className="flex h-[96px] items-center justify-center" style={{ background: TILE[g.key]?.bg }}>{TILE[g.key]?.art}</div>
                <div className="p-3">
                  <p className="text-[15px] font-bold">{g.title}</p>
                  <p className="mt-0.5 line-clamp-2 min-h-[32px] text-[11px] leading-[16px] text-[#8b94a0]">{g.desc}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${g.left > 0 ? "bg-[#e8f1ff] text-[#427cff]" : "bg-[#f2f3f5] text-[#8b94a0]"}`}>{g.left > 0 ? `${g.left}회 남음` : "내일 다시"}</span>
                    {g.todayPoints > 0 && <span className="text-[12px] font-bold text-[#ff8a3d]">+{fmt(g.todayPoints)}P</span>}
                  </div>
                </div>
              </Link>
            </li>
          ))}
          {!data && [0, 1, 2, 3].map((i) => <li key={i} className="h-[190px] animate-pulse rounded-[20px] bg-white" />)}
        </ul>
        {data && data.recent.length > 0 && (
          <section className="rounded-[16px] bg-white p-4" style={{ boxShadow: "0 2px 10px 0 rgba(0, 43, 141, 0.06)" }}>
            <p className="text-[14px] font-semibold">최근 기록</p>
            <ul className="mt-2 flex flex-col gap-1.5 text-[12px] text-[#5c6573]">
              {data.recent.map((r, i) => <li key={i} className="flex justify-between"><span>{r.game} · {r.result}</span><span className={r.points > 0 ? "font-bold text-[#427cff]" : ""}>{r.points > 0 ? `+${r.points}P` : "0P"}</span></li>)}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

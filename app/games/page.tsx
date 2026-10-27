"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GameHeader } from "@/components/games/GameHeader";
import { PCoin } from "@/components/icons";
import { NumberFlow } from "@/components/motion/NumberFlow";
import { fmt } from "@/hooks/useHome";
import type { GamesPayload } from "@/lib/games/service";

const TILE_IMG: Record<string, string> = { spot: "/games/spot/park/a.webp", slide: "/games/art/tile_slide.webp", scratch: "/games/art/tile_scratch.webp", rsp: "/games/art/tile_rsp.webp", memory: "/games/art/tile_memory.webp" };

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
                <div className="relative h-[104px] bg-cover bg-center" style={{ backgroundImage: `url(${TILE_IMG[g.key] ?? "/games/spot/park/a.webp"})` }}>
                  {g.key === "spot" && <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white">NEW</span>}
                </div>
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

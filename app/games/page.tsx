"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PCoin } from "@/components/icons";
import { NumberFlow } from "@/components/motion/NumberFlow";
import { fmt } from "@/hooks/useHome";
import type { GamesPayload } from "@/lib/games/service";

/* eslint-disable @next/next/no-img-element */

/** 미니게임 허브 — 매일 리셋되는 3가지 게임(리텐션). 결과·보상은 서버가 결정 */
export default function GamesPage() {
  const router = useRouter();
  const [data, setData] = useState<GamesPayload | null>(null);
  useEffect(() => {
    fetch("/api/games", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => {});
  }, []);
  return (
    <div className="min-h-dvh bg-[#f8f9fc] pb-10 text-[#191f28]">
      <header className="fixed left-1/2 top-0 z-20 flex h-12 w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-[#f8f9fc] px-6">
        <button type="button" onClick={() => router.back()} aria-label="뒤로" className="flex h-7 w-7 items-center justify-center"><img src="/myb/shop/ic_left.png" width={28} height={28} alt="" className="h-7 w-7" /></button>
        <h1 className="text-[18px] font-semibold">미니게임</h1>
        <Link href="/wallet" className="flex items-center gap-[6px]"><PCoin size={18} /><span className="text-[18px] font-semibold leading-[18px] text-[#33363f]">{data ? <NumberFlow value={data.wallet.balance} /> : "—"}</span></Link>
      </header>
      <div className="flex flex-col gap-4 px-6 pt-[64px]">
        <section className="rounded-[20px] bg-gradient-to-br from-[#191f28] to-[#2b3550] p-5 text-white">
          <p className="text-[12px] font-semibold text-[#9fb6ff]">매일 0시 리셋</p>
          <p className="mt-1 text-[18px] font-extrabold leading-[24px]">오늘의 게임 3가지<br />다 하면 러쉬 스탬프도 채워져요</p>
          <p className="mt-2 text-[12px] text-white/70">이번 주 플레이 <b className="text-white">{data?.weekPlays ?? 0}</b>회 · 오늘 획득 <b className="text-white">{fmt(data?.games.reduce((a, g) => a + g.todayPoints, 0) ?? 0)}P</b></p>
        </section>
        <ul className="flex flex-col gap-3">
          {(data?.games ?? []).map((g) => (
            <li key={g.key}>
              <Link href={g.href} className="flex items-center gap-4 rounded-[20px] bg-white p-4" style={{ boxShadow: "0 5px 16px 0 rgba(0, 43, 141, 0.1)" }}>
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f0f4ff] text-[30px]">{g.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-bold">{g.title}</p>
                  <p className="mt-0.5 text-[12px] text-[#8b94a0]">{g.desc}</p>
                  <p className="mt-1 text-[12px]">{g.left > 0 ? <span className="font-semibold text-[#427cff]">오늘 {g.left}회 남음</span> : <span className="text-[#b0b8c1]">오늘 완료 · 내일 다시</span>}{g.todayPoints > 0 && <span className="ml-2 text-[#ff8a3d]">+{fmt(g.todayPoints)}P</span>}</p>
                </div>
                <span className={`shrink-0 rounded-lg px-3 py-2 text-[13px] font-bold ${g.left > 0 ? "bg-[#427cff] text-white" : "bg-[#f2f3f5] text-[#8b94a0]"}`}>{g.left > 0 ? "하기" : "완료"}</span>
              </Link>
            </li>
          ))}
          {!data && [0, 1, 2].map((i) => <li key={i} className="h-[88px] animate-pulse rounded-[20px] bg-white" />)}
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

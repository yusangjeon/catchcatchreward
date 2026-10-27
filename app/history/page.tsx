"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PCoin } from "@/components/icons";
import { NumberFlow } from "@/components/motion/NumberFlow";
import { fmt } from "@/hooks/useHome";
import type { LedgerEntry, Wallet } from "@/lib/types";

/* eslint-disable @next/next/no-img-element */

const REASON: Record<LedgerEntry["reason"], string> = {
  signup: "가입 보너스", newbie: "3일 혜택", monthly: "월간 도전 과제",
  game: "미니게임",
  quiz_answer: "퀴즈 보상",
  quiz_bonus: "랜덤 보너스",
  mission: "미션",
  rush: "캐치 러쉬",
  store_mission: "플레이스 방문",
  roulette: "룰렛 당첨",
  redeem: "포인트 교환",
  admin_adjust: "운영 조정",
  referral: "친구 초대",
};

/** 포인트 내역 — 원장(point_ledger) 그대로. 잔액은 원장 합 */
export default function HistoryPage() {
  const router = useRouter();
  const [data, setData] = useState<{ wallet: Wallet; entries: LedgerEntry[] } | null>(null);
  useEffect(() => {
    fetch("/api/ledger", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-10 text-[#191f28]">
      <header className="fixed left-1/2 top-0 z-20 flex h-12 w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-[var(--color-bg)] px-6">
        <button type="button" onClick={() => router.back()} aria-label="뒤로" className="flex h-7 w-7 items-center justify-center">
          <img src="/brand/ic_left.svg" width={28} height={28} alt="" className="h-7 w-7" />
        </button>
        <h1 className="text-[18px] font-semibold">포인트 내역</h1>
        <span className="flex items-center gap-[6px]"><PCoin size={18} /><span className="text-[18px] font-semibold leading-[18px] text-[#33363f]">{data ? <NumberFlow value={data.wallet.balance} /> : "—"}</span></span>
      </header>
      <div className="px-6 pt-[64px]">
        <section className="rounded-[20px] bg-white p-5">
          {data && data.entries.length === 0 && <p className="text-[14px] text-[#8b94a0]">아직 내역이 없어요. 퀴즈를 풀면 쌓여요.</p>}
          <ul className="flex flex-col divide-y divide-[var(--color-bg-2)]">
            {(data?.entries ?? []).map((e) => (
              <li key={e.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium">{e.memo ?? REASON[e.reason]}</p>
                  <p className="text-[12px] text-[#b0b8c1]">{REASON[e.reason]} · {new Date(e.createdAt).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <span className={`shrink-0 text-[15px] font-bold tabular-nums ${e.delta < 0 ? "text-[#ff3939]" : "text-[var(--color-myb)]"}`}>{e.delta > 0 ? "+" : ""}{fmt(e.delta)}P</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

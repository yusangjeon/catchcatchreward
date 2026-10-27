"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GameHeader } from "@/components/games/GameHeader";
import { fmt } from "@/hooks/useHome";
import type { RoulettePayload } from "@/lib/roulette/types";

interface Red { id: string; kind: string; name?: string; amountPoints: number; status: string; requestedAt: string; processedAt?: string; memo?: string }

const STATUS: Record<string, { label: string; cls: string }> = { requested: { label: "신청 접수", cls: "bg-[#fff6e5] text-[#ff8a3d]" }, processing: { label: "처리 중", cls: "bg-[#e8f1ff] text-[#427cff]" }, done: { label: "발송 완료", cls: "bg-[#e9f7ef] text-[#1aa260]" }, rejected: { label: "반려·환불", cls: "bg-[#f2f3f5] text-[#8b94a0]" } };

/** 선물함 — 교환 신청한 기프티콘 상태 + 룰렛 기프티콘 당첨 */
export default function GiftsPage() {
  const [reds, setReds] = useState<Red[] | null>(null);
  const [spins, setSpins] = useState<RoulettePayload["history"]>([]);
  useEffect(() => {
    fetch("/api/exchange", { cache: "no-store" }).then((r) => r.json()).then((d) => setReds(d.redemptions ?? d.items ?? [])).catch(() => setReds([]));
    fetch("/api/roulette", { cache: "no-store" }).then((r) => r.json()).then((d: RoulettePayload) => setSpins(d.history.filter((h) => h.kind === "gifticon"))).catch(() => {});
  }, []);
  return (
    <div className="min-h-dvh bg-[#f8f9fc] pb-10 text-[#191f28]">
      <GameHeader title="선물함" />
      <div className="flex flex-col gap-4 px-5 pt-[64px]">
        <section className="rounded-[20px] bg-white p-5" style={{ boxShadow: "0 5px 16px 0 rgba(0, 43, 141, 0.1)" }}>
          <h2 className="text-[15px] font-bold">교환 신청한 상품</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {(reds ?? []).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 border-b border-[#f1f3f8] pb-3 last:border-0 last:pb-0">
                <div className="min-w-0"><p className="truncate text-[14px] font-semibold">{r.name ?? r.kind}</p><p className="mt-0.5 text-[12px] text-[#8b94a0]">{fmt(r.amountPoints)}P · {new Date(r.requestedAt).toLocaleDateString("ko-KR")}{r.memo ? ` · ${r.memo}` : ""}</p></div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS[r.status]?.cls ?? ""}`}>{STATUS[r.status]?.label ?? r.status}</span>
              </li>
            ))}
            {reds && reds.length === 0 && <li className="py-6 text-center text-[13px] text-[#8b94a0]">아직 교환한 상품이 없어요. <Link href="/exchange" className="text-[#427cff]">포인트 교환하기 →</Link></li>}
          </ul>
        </section>
        <section className="rounded-[20px] bg-white p-5" style={{ boxShadow: "0 5px 16px 0 rgba(0, 43, 141, 0.1)" }}>
          <h2 className="text-[15px] font-bold">룰렛 당첨 기프티콘</h2>
          <ul className="mt-3 flex flex-col gap-2 text-[13px]">
            {spins.map((s) => <li key={s.id} className="flex justify-between"><span>{s.prizeName}</span><span className="text-[#8b94a0]">{new Date(s.spunAt).toLocaleDateString("ko-KR")} · 발송 준비</span></li>)}
            {spins.length === 0 && <li className="py-4 text-center text-[13px] text-[#8b94a0]">룰렛에서 기프티콘에 당첨되면 여기에 쌓여요</li>}
          </ul>
        </section>
        <p className="text-[12px] text-[#8b94a0]">기프티콘은 영업일 기준 1~3일 안에 등록하신 연락처로 발송돼요. 문의는 고객센터로.</p>
      </div>
    </div>
  );
}

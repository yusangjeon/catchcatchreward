"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { GameHeader } from "@/components/games/GameHeader";
import { PCoin } from "@/components/icons";
import { NumberFlow } from "@/components/motion/NumberFlow";
import { useToast } from "@/components/motion/Toast";
import { burstAtPointer, confetti, flyToBalance } from "@/lib/fxEngine";
import { showReward } from "@/lib/reward";
import { fmt } from "@/hooks/useHome";
import type { MonthlyPayload } from "@/lib/monthly/service";

/** 월간 도전 과제 — 달성할 때마다 보상(최대 3,300P). 매달 1일 리셋 */
export default function MonthlyPage() {
  const { show } = useToast();
  const [data, setData] = useState<MonthlyPayload | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback(() => fetch("/api/monthly", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => {}), []);
  useEffect(() => { void load(); }, [load]);

  async function claim(key: string) {
    if (busy) return;
    setBusy(key);
    try {
      const res = await fetch("/api/monthly", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message ?? "보상을 받을 수 없어요");
      burstAtPointer("stars"); await showReward({ variant: "big", points: j.points, to: j.wallet.balance, title: "월간 도전 보상 지급!" }); flyToBalance(8); setTimeout(() => confetti(100), 100);
      show(`${fmt(j.points)}P를 받았어요!`);
      await load();
    } catch (e) {
      show(e instanceof Error ? e.message : "보상을 받을 수 없어요", "info");
    } finally {
      setBusy(null);
    }
  }
  const daysLeft = data ? Math.max(0, Math.ceil((new Date(data.endsAt).getTime() - Date.now()) / 86400_000)) : 0;

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-10 text-[#191f28]">
      <GameHeader title="월간 도전 과제" right={<Link href="/wallet" className="flex items-center gap-1 text-[16px]"><PCoin size={16} /><span id="hdr-balance">{data ? <NumberFlow value={data.wallet.balance} /> : "—"}</span></Link>} />
      <div className="px-4 pt-[60px]">
        <section className="relative overflow-hidden rounded-[24px] px-6 pb-6 pt-6 text-white" style={{ background: "linear-gradient(135deg,#ff8a3d 0%,var(--color-myb) 50%,#ff8a5c 100%)" }}>
          <span className="inline-flex h-6 items-center rounded-full bg-white/20 px-2.5 text-[12px] font-bold">{data ? `${data.monthLabel} · D-${daysLeft}` : "—"}</span>
          <h2 className="mt-2 text-[22px] font-extrabold leading-[30px]">🏆 달성할 때마다<br />엄청난 혜택이 👀</h2>
          <p className="mt-2 text-[13px] text-white/85">이번 달 받은 보상 <b className="text-[var(--color-gold)]">{fmt(data?.earned ?? 0)}P</b> / 최대 {fmt(data?.totalMax ?? 3300)}P</p>
          {data && data.claimable > 0 && <span className="absolute right-5 top-5 rounded-full bg-white px-3 py-1 text-[12px] font-bold text-[var(--color-myb)]">받을 보상 {data.claimable}</span>}
        </section>

        <ul className="mt-4 flex flex-col gap-3">
          {(data?.missions ?? []).map((m) => {
            const pct = Math.round((m.current / m.value) * 100);
            return (
              <li key={m.key} className="rounded-[20px] bg-white p-5" style={{ boxShadow: "0 2px 10px 0 rgba(40, 24, 14, 0.06)" }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-gold-soft)] text-[26px]">{m.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-bold">{m.title}</p>
                    <p className="mt-0.5 truncate text-[12px] text-[#8b94a0]">{m.desc}</p>
                  </div>
                  <p className="flex shrink-0 items-center gap-1 text-[17px] font-extrabold text-[var(--color-myb)]"><PCoin size={16} />{fmt(m.reward)}</p>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#eef0f4]"><div className="myb-progress h-full rounded-full" style={{ width: `${m.claimed ? 100 : pct}%`, background: m.completed ? "linear-gradient(90deg,var(--color-myb),#ff8a5c)" : "var(--color-myb)" }} /></div>
                  <span className="w-14 text-right text-[13px] font-bold tabular-nums text-[#ffc53d]">{m.current}/{m.value}</span>
                </div>
                <div className="mt-3">
                  {m.claimed ? (
                    <span className="flex h-11 items-center justify-center rounded-xl bg-[var(--color-bg-3)] text-[14px] font-bold text-[#8b94a0]">받기 완료</span>
                  ) : m.completed ? (
                    <button type="button" disabled={busy !== null} onClick={() => void claim(m.key)} className="myb-press h-11 w-full rounded-xl bg-[var(--color-myb)] text-[14px] font-bold text-white disabled:opacity-50">{fmt(m.reward)}P 받기</button>
                  ) : (
                    <Link href={m.href} className="myb-press flex h-11 items-center justify-center rounded-xl bg-[var(--color-myb-soft)] text-[14px] font-bold text-[var(--color-myb)]">이동하기</Link>
                  )}
                </div>
              </li>
            );
          })}
          {!data && [0, 1, 2].map((i) => <li key={i} className="h-[150px] animate-pulse rounded-[20px] bg-white" />)}
        </ul>
        <p className="mt-4 px-1 text-[11px] leading-[16px] text-[#b0b8c1]">· 집계는 KST 기준 이번 달 활동만. 매달 1일 0시에 새 과제가 시작되고 받지 않은 보상은 사라져요.</p>
      </div>
    </div>
  );
}

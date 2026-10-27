"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { GameHeader } from "@/components/games/GameHeader";
import { PCoin } from "@/components/icons";
import { useToast } from "@/components/motion/Toast";
import { burstAtPointer, confetti } from "@/lib/fxEngine";
import { showReward } from "@/lib/reward";
import { fmt } from "@/hooks/useHome";
import type { NewbiePayload } from "@/lib/quiz/newbie";


/** 3일 혜택 — 가입 후 3일, 매일 퀴즈 3개 완료 → 300/500/700P(최대 1,500P). 마이비 "3일 혜택 · 최대 1,500P" 복제 */
export default function NewbiePage() {
  const { show } = useToast();
  const [data, setData] = useState<NewbiePayload | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const load = useCallback(() => fetch("/api/newbie", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => {}), []);
  useEffect(() => { void load(); }, [load]);

  async function claim(day: number) {
    if (busy) return;
    setBusy(day);
    try {
      const res = await fetch("/api/newbie", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ day }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message ?? "보상을 받을 수 없어요");
      burstAtPointer("stars"); await showReward({ variant: "small", points: j.points, title: `${day}일차 미션 보상 지급!`, subtitle: "3일 혜택" }); setTimeout(() => confetti(120), 100);
      show(`${day}일차 보상 ${fmt(j.points)}P를 받았어요!`);
      await load();
    } catch (e) {
      show(e instanceof Error ? e.message : "보상을 받을 수 없어요", "info");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-10 text-[#191f28]">
      <GameHeader title="3일 혜택" />
      <div className="px-5 pt-[60px]">
        <section className="relative overflow-hidden rounded-[20px] px-5 pb-6 pt-7 text-white" style={{ background: "linear-gradient(135deg,var(--color-myb) 0%,#ff8a5c 100%)" }}>
          <p className="text-[13px] font-semibold text-white/80">신규 유저 전용 · 가입 후 3일</p>
          <p className="mt-1 text-[24px] font-extrabold leading-[32px]">매일 퀴즈 3개 풀고<br />최대 <span className="text-[var(--color-gold)]">{fmt(data?.totalMax ?? 1500)}P</span> 받아요</p>
          <p className="mt-3 text-[12px] text-white/70">{data ? (data.active ? `지금 ${data.dayNo}일차 · 받은 보상 ${fmt(data.claimedTotal)}P` : "3일 혜택 기간이 끝났어요") : "…"}</p>
          <span className="absolute -right-2 -top-2 text-[96px] font-black italic leading-none text-white/15">3일</span>
        </section>

        <ul className="mt-5 flex flex-col gap-3">
          {(data?.days ?? []).map((d) => (
            <li key={d.day} className={`rounded-[18px] bg-white p-5 ${d.today ? "ring-2 ring-[var(--color-myb)]" : ""}`} style={{ boxShadow: "0 4px 16px rgba(40,24,14,.06)" }}>
              <div className="flex items-center justify-between">
                <p className="text-[17px] font-bold">{d.day}일차 {d.today && <span className="ml-1 rounded-full bg-[var(--color-myb-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--color-myb)]">오늘</span>}</p>
                <p className="flex items-center gap-1 text-[18px] font-extrabold"><PCoin size={18} />{fmt(d.reward)}</p>
              </div>
              <p className="mt-1 text-[13px] text-[#5c6573]">퀴즈 {d.goal}개 완료하기 <span className="font-bold text-[var(--color-myb)]">{d.done}/{d.goal}</span></p>
              <div className="mt-3 flex gap-1.5">{[0, 1, 2].map((i) => <i key={i} className={`h-2 flex-1 rounded-full ${d.done > i ? "bg-[var(--color-myb)]" : "bg-[var(--color-myb-soft)]"}`} />)}</div>
              <div className="mt-4">
                {d.claimed ? (
                  <span className="flex h-11 items-center justify-center rounded-xl bg-[var(--color-bg-3)] text-[14px] font-bold text-[#8b94a0]">받기 완료</span>
                ) : d.claimable ? (
                  <button type="button" disabled={busy === d.day} onClick={() => void claim(d.day)} className="myb-press h-11 w-full rounded-xl bg-[var(--color-myb)] text-[14px] font-bold text-white disabled:opacity-50">{fmt(d.reward)}P 받기</button>
                ) : d.today ? (
                  <Link href="/quiz" className="myb-press flex h-11 items-center justify-center rounded-xl bg-[#191f28] text-[14px] font-bold text-white">퀴즈 풀러 가기</Link>
                ) : d.past ? (
                  <span className="flex h-11 items-center justify-center rounded-xl bg-[var(--color-bg-3)] text-[14px] font-bold text-[#8b94a0]">기간 종료</span>
                ) : (
                  <span className="flex h-11 items-center justify-center rounded-xl bg-[var(--color-bg-3)] text-[14px] font-bold text-[#8b94a0]"><img src="/brand/lock.webp" alt="" className="mr-1 h-5 w-5 object-contain opacity-70 grayscale" />{d.day}일차에 열려요</span>
                )}
              </div>
            </li>
          ))}
          {!data && [0, 1, 2].map((i) => <li key={i} className="h-[150px] animate-pulse rounded-[18px] bg-white" />)}
        </ul>
        <p className="mt-5 text-[11px] leading-[16px] text-[#b0b8c1]">· 일차는 가입일 기준 KST 0시에 바뀌어요. 당일 완료한 보상은 기간이 지나도 받을 수 있어요.<br />· 3일 동안 퀴즈 보상 2배(스타터팩)도 함께 적용돼요.</p>
      </div>
    </div>
  );
}

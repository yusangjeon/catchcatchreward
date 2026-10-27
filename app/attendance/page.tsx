"use client";

import { useCallback, useEffect, useState } from "react";
import { GameHeader } from "@/components/games/GameHeader";
import { useToast } from "@/components/motion/Toast";
import { fmt } from "@/hooks/useHome";

interface Cal { today: string; days: string[]; total: number; streak: number; attendedToday: boolean }

/** 출석 달력 — 이번 달 출석 도장, 연속 출석, 7일마다 보너스. 오늘 출석 버튼 */
export default function AttendancePage() {
  const { show } = useToast();
  const [cal, setCal] = useState<Cal | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => fetch("/api/attendance/calendar", { cache: "no-store" }).then((r) => r.json()).then(setCal).catch(() => {}), []);
  useEffect(() => { void load(); }, [load]);

  async function attend() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/attendance", { method: "POST" });
      const j = await res.json();
      show(j.already ? "오늘은 이미 출석했어요" : `출석 완료! ${fmt(j.points)}P + 스탬프 1개${j.bonus ? ` · ${j.streak}일 연속 보너스 +${j.bonus}P` : ""}`, j.already ? "info" : undefined);
      await load();
    } finally {
      setBusy(false);
    }
  }

  const today = cal?.today ?? new Date().toISOString().slice(0, 10);
  const [y, m] = [Number(today.slice(0, 4)), Number(today.slice(5, 7))];
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const offset = first.getUTCDay();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const key = (d: number) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const set = new Set(cal?.days ?? []);
  const streak = cal?.streak ?? 0;
  const toBonus = 7 - (streak % 7);

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-10 text-[#191f28]">
      <GameHeader title="출석 달력" />
      <div className="flex flex-col gap-4 px-5 pt-[64px]">
        <section className="rounded-[20px] bg-gradient-to-r from-[var(--color-myb)] to-[var(--color-myb-line)] p-5 text-white">
          <p className="text-[12px] font-semibold text-white/80">연속 출석</p>
          <p className="mt-1 text-[32px] font-bold leading-none">{streak}<span className="ml-1 text-[16px] font-bold">일</span></p>
          <p className="mt-2 text-[12px] text-white/85">{streak > 0 && streak % 7 === 0 ? "오늘 7일 보너스를 받았어요! 내일부터 새 주기" : `${toBonus}일 더 출석하면 보너스 +50P`}</p>
          <div className="mt-3 flex gap-1">{Array.from({ length: 7 }).map((_, i) => <span key={i} className={`h-2 flex-1 rounded-full ${i < streak % 7 || (streak > 0 && streak % 7 === 0) ? "bg-[var(--color-gold)]" : "bg-white/30"}`} />)}</div>
        </section>
        <section className="rounded-[20px] bg-white p-5" style={{ boxShadow: "0 5px 16px 0 rgba(40, 24, 14, 0.09)" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold">{y}년 {m}월</h2>
            <span className="text-[12px] text-[#8b94a0]">이번 달 {(cal?.days ?? []).filter((d) => d.startsWith(`${y}-${String(m).padStart(2, "0")}`)).length}일 · 누적 {cal?.total ?? 0}일</span>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-y-2 text-center text-[11px] text-[#8b94a0]">{["일", "월", "화", "수", "목", "금", "토"].map((d) => <span key={d}>{d}</span>)}</div>
          <div className="mt-1 grid grid-cols-7 gap-y-2">
            {cells.map((d, i) => d === null ? <span key={`e${i}`} /> : (
              <div key={d} className="flex flex-col items-center">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold ${set.has(key(d)) ? "bg-[var(--color-myb)] text-white" : key(d) === today ? "ring-2 ring-[var(--color-myb)] text-[var(--color-myb)]" : "text-[#5c6573]"}`}>{set.has(key(d)) ? "✓" : d}</span>
              </div>
            ))}
          </div>
        </section>
        <button type="button" disabled={busy || cal?.attendedToday} onClick={() => void attend()} className="myb-press h-[52px] rounded-xl bg-[var(--color-myb)] text-[16px] font-bold text-white disabled:opacity-40">{cal?.attendedToday ? "오늘 출석 완료" : "오늘 출석하고 10P + 스탬프 받기"}</button>
        <p className="text-[12px] text-[#8b94a0]">매일 0시(KST)에 출석이 열려요. 하루라도 빠지면 연속 일수가 0으로 돌아가요.</p>
      </div>
    </div>
  );
}

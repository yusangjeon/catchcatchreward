"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GameHeader } from "@/components/games/GameHeader";
import { PCoin } from "@/components/icons";
import { DuoIcon, FlatIcon } from "@/components/icons/duo";
import { NumberFlow } from "@/components/motion/NumberFlow";
import { useToast } from "@/components/motion/Toast";
import { fmt } from "@/hooks/useHome";
import { haptic, sfx } from "@/lib/fx";
import { confetti, flyToBalance } from "@/lib/fxEngine";
import { showReward } from "@/lib/reward";
import type { LottoPayload } from "@/lib/games/lotto";

/* eslint-disable @next/next/no-img-element */

const PICK = 6;
const BALL_COLOR = (n: number) => (n <= 10 ? "#f5b400" : n <= 20 ? "#2f6fed" : n <= 30 ? "#ff5a2d" : n <= 40 ? "#8b94a0" : "#1aa260");

/** 캐치 로또 — 번호 6개 응모(무료 1장 + 추가 2장), 매일 21:00 추첨, 공 떨어지는 연출 → 당첨금 수령 */
export default function LottoPage() {
  const { show } = useToast();
  const [data, setData] = useState<LottoPayload | null>(null);
  const [sel, setSel] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [reveal, setReveal] = useState<string | null>(null); // 공 떨어지는 연출을 보여준 dayKey

  const load = useCallback(() => fetch("/api/games/lotto", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => {}), []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);

  const toggle = (n: number) => {
    haptic("tap");
    setSel((s) => (s.includes(n) ? s.filter((x) => x !== n) : s.length >= PICK ? s : [...s, n].sort((a, b) => a - b)));
  };
  const auto = () => {
    const pool = Array.from({ length: 45 }, (_, i) => i + 1); const out: number[] = [];
    while (out.length < PICK) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    setSel(out.sort((a, b) => a - b)); haptic("tap"); sfx("pop");
  };
  async function submit() {
    if (busy || sel.length !== PICK || !data) return;
    setBusy(true);
    try {
      const r = await fetch("/api/games/lotto", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "pick", numbers: sel }) });
      const j = await r.json();
      if (!r.ok) { haptic("warn"); show(j.message ?? "응모에 실패했어요", "info"); return; }
      setData(j); setSel([]); haptic("success"); sfx("coin"); show("응모 완료! 오늘 21시에 추첨해요");
    } finally { setBusy(false); }
  }
  async function claim(dayKey: string) {
    if (busy) return; setBusy(true);
    try {
      const r = await fetch("/api/games/lotto", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "claim", dayKey }) });
      const j = await r.json();
      if (!r.ok) { haptic("warn"); show(j.message ?? "받을 수 없어요", "info"); return; }
      haptic("jackpot"); sfx("win"); confetti(j.points >= 3000 ? 220 : 120);
      await showReward({ variant: "big", points: j.points, title: `${j.matchesBest}개 일치!`, subtitle: "캐치 로또 당첨금" });
      flyToBalance(8); setData(j.payload);
    } finally { setBusy(false); }
  }

  const today = data?.today;
  const drawn = !!today?.drawn;
  const msLeft = today ? new Date(today.drawAt).getTime() - now : 0;
  const hh = Math.max(0, Math.floor(msLeft / 3600_000)), mm = Math.max(0, Math.floor((msLeft % 3600_000) / 60_000)), ss = Math.max(0, Math.floor((msLeft % 60_000) / 1000));
  const showDay = useMemo(() => data?.pending ?? (today && today.drawn ? today : null), [data, today]);
  const showKey = showDay?.drawn ? showDay.dayKey : null;
  useEffect(() => { if (showKey) setReveal(showKey); }, [showKey]);

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-12 text-ink">
      <GameHeader title="캐치 로또" right={<Link href="/wallet" className="flex items-center gap-1 text-[16px]"><PCoin size={16} /><span id="hdr-balance">{data ? <NumberFlow value={data.wallet.balance} /> : "—"}</span></Link>} />
      <div className="flex flex-col gap-4 px-5 pt-[64px]">
        {/* 히어로: 추첨 카운트다운 */}
        <section className="relative overflow-hidden rounded-[22px] p-5 text-white" style={{ background: "linear-gradient(135deg,#2b3a67 0%,#4257a3 60%,#5b6fd1 100%)", boxShadow: "0 12px 30px rgba(43,58,103,.3)" }}>
          <DuoIcon name="ticket" size={120} className="pointer-events-none absolute -right-4 -top-5 text-white/10" />
          <p className="text-[12px] font-semibold text-white/75">{drawn ? "오늘 추첨 완료" : "오늘 추첨까지"}</p>
          <p className="mt-1 text-[32px] font-bold tabular-nums leading-none">{drawn ? "결과 확인" : `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`}</p>
          <p className="mt-2 text-[12px] text-white/70">매일 21:00 추첨 · 6개 일치 <b className="text-[#ffd45c]">50,000P</b> · 3개만 맞춰도 30P</p>
          <div className="mt-4 flex gap-2">
            {[3, 4, 5, 6].map((m) => <span key={m} className="flex flex-1 flex-col items-center rounded-[12px] bg-white/12 py-2"><span className="text-[11px] text-white/70">{m}개 일치</span><span className="text-[14px] font-bold">{fmt(data?.prizes[m] ?? 0)}P</span></span>)}
          </div>
        </section>

        {/* 당첨 결과(추첨 완료된 가장 최근 날) */}
        {showDay && showDay.drawn && (
          <section className="rounded-[20px] bg-white p-5" style={{ boxShadow: "0 5px 16px rgba(40,24,14,.07)" }}>
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-bold">{showDay.dayKey === today?.dayKey ? "오늘" : showDay.dayKey.slice(5).replace("-", "/")} 당첨 번호</p>
              {showDay.claimed && <span className="rounded-full bg-bg-2 px-2 py-0.5 text-[11px] font-bold text-muted">받았어요</span>}
            </div>
            <div className="mt-3 flex justify-between">
              {showDay.drawn.map((n, i) => (
                <span key={n} className={`lotto-ball flex h-11 w-11 items-center justify-center rounded-full text-[16px] font-bold text-white shadow-[inset_-4px_-6px_10px_rgba(0,0,0,.18),0_6px_12px_rgba(0,0,0,.18)] ${reveal === showDay.dayKey ? "lotto-drop" : ""}`} style={{ background: BALL_COLOR(n), animationDelay: `${i * 0.22}s` }}>{n}</span>
              ))}
            </div>
            <ul className="mt-4 flex flex-col gap-2">
              {showDay.tickets.map((t, i) => (
                <li key={i} className="flex items-center justify-between rounded-[12px] bg-bg px-3 py-2">
                  <span className="flex gap-1.5">{t.numbers.map((n) => <i key={n} className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold not-italic ${showDay.drawn!.includes(n) ? "text-white" : "bg-white text-muted ring-1 ring-[#e6e9ef]"}`} style={showDay.drawn!.includes(n) ? { background: BALL_COLOR(n) } : undefined}>{n}</i>)}</span>
                  <span className={`text-[13px] font-bold ${t.prize > 0 ? "text-myb" : "text-muted"}`}>{t.matches}개 {t.prize > 0 ? `+${fmt(t.prize)}P` : ""}</span>
                </li>
              ))}
            </ul>
            {showDay.claimable && (
              <button type="button" onClick={() => void claim(showDay.dayKey)} disabled={busy} className="myb-press walk-bounce mt-4 flex h-[52px] w-full items-center justify-center gap-1.5 rounded-[14px] bg-myb text-[16px] font-bold text-white shadow-[0_6px_18px_rgba(255,90,45,.35)]"><PCoin size={18} />{fmt(showDay.totalPrize)}P 당첨금 받기</button>
            )}
            {!showDay.claimable && !showDay.claimed && showDay.totalPrize === 0 && <p className="mt-3 text-center text-[12px] text-muted">아쉽지만 다음 기회에! 내일 또 응모해 보세요</p>}
          </section>
        )}

        {/* 응모 */}
        <section className="rounded-[20px] bg-white p-5" style={{ boxShadow: "0 5px 16px rgba(40,24,14,.07)" }}>
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-bold">번호 고르기 <span className="ml-1 text-[12px] font-medium text-muted">{sel.length}/{PICK}</span></p>
            <span className="text-[12px] font-semibold text-ink-2">{data ? (data.freeLeft > 0 ? "무료 1장 남음" : data.extraLeft > 0 ? `추가 응모 ${data.ticketCost}P · ${data.extraLeft}장` : "오늘 응모 끝") : ""}</span>
          </div>
          <div className="mt-3 grid grid-cols-9 gap-1.5">
            {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => {
              const on = sel.includes(n);
              return <button key={n} type="button" onClick={() => toggle(n)} disabled={drawn || (data?.ticketsLeft ?? 0) === 0} className={`myb-press flex h-[34px] items-center justify-center rounded-full text-[13px] font-bold transition-transform disabled:opacity-40 ${on ? "scale-110 text-white shadow-[0_4px_10px_rgba(0,0,0,.18)]" : "bg-bg text-ink-2"}`} style={on ? { background: BALL_COLOR(n) } : undefined}>{n}</button>;
            })}
          </div>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={auto} disabled={drawn || (data?.ticketsLeft ?? 0) === 0} className="myb-press flex h-12 flex-1 items-center justify-center gap-1 rounded-[12px] bg-bg-2 text-[14px] font-bold text-ink disabled:opacity-40"><DuoIcon name="sparkle" size={15} />자동 선택</button>
            <button type="button" onClick={() => void submit()} disabled={busy || drawn || sel.length !== PICK || (data?.ticketsLeft ?? 0) === 0} className="myb-press flex h-12 flex-[1.4] items-center justify-center gap-1 rounded-[12px] bg-myb text-[14px] font-bold text-white disabled:opacity-40">
              {drawn ? "내일 응모 가능" : data && data.freeLeft === 0 ? <><PCoin size={14} />{data.ticketCost}P로 응모</> : "무료 응모하기"}
            </button>
          </div>
          {today && today.tickets.length > 0 && !drawn && (
            <ul className="mt-4 flex flex-col gap-2">
              {today.tickets.map((t, i) => <li key={i} className="flex items-center gap-2 rounded-[12px] bg-bg px-3 py-2"><span className="w-10 text-[11px] font-bold text-muted">{i + 1}장</span><span className="flex gap-1.5">{t.numbers.map((n) => <i key={n} className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold not-italic text-white" style={{ background: BALL_COLOR(n) }}>{n}</i>)}</span></li>)}
            </ul>
          )}
        </section>

        {/* 지난 결과 */}
        {data && data.history.length > 0 && (
          <section className="rounded-[20px] bg-white p-5" style={{ boxShadow: "0 5px 16px rgba(40,24,14,.07)" }}>
            <p className="text-[15px] font-bold">지난 응모</p>
            <ul className="mt-2 flex flex-col divide-y divide-bg-2">
              {data.history.map((d) => (
                <li key={d.dayKey} className="flex items-center justify-between py-2.5 text-[13px]">
                  <span className="text-ink-2">{d.dayKey.slice(5).replace("-", "/")} · {d.tickets.length}장</span>
                  <span className="flex items-center gap-2">{d.totalPrize > 0 ? <b className="text-myb">+{fmt(d.totalPrize)}P</b> : <span className="text-muted">낙첨</span>}{d.claimable && <button type="button" onClick={() => void claim(d.dayKey)} className="rounded-full bg-myb px-2.5 py-1 text-[11px] font-bold text-white">받기</button>}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="flex items-start gap-3 rounded-[16px] bg-[#f1f2f5] p-4">
          <FlatIcon file="ticket" size={34} />
          <div className="text-[12px] leading-[18px] text-ink-2">
            <p className="font-bold text-ink">이렇게 진행돼요</p>
            <p className="mt-0.5">매일 무료 1장, 추가 2장은 장당 {data?.ticketCost ?? 50}P예요. 21:00에 서버가 번호를 뽑고, 당첨금은 7일 안에 받아가면 돼요. 번호는 추첨 전엔 누구도 알 수 없어요.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { DuoIcon, IconTile } from "@/components/icons/duo";
import { PCoin } from "@/components/icons";
import { NumberFlow } from "@/components/motion/NumberFlow";
import { useToast } from "@/components/motion/Toast";
import { fmt } from "@/hooks/useHome";
import { haptic, sfx } from "@/lib/fx";
import { burst, confetti, flyToBalance } from "@/lib/fxEngine";
import { showReward } from "@/lib/reward";
import { Pedometer, type PedometerState } from "@/lib/walk/pedometer";
import type { WalkPayload } from "@/lib/walk/service";

/* eslint-disable @next/next/no-img-element */

const DAY_GOAL = 10000;
const R = 118; // 링 반지름(px)
const CIRC = 2 * Math.PI * R;

/**
 * 만보기 — 큰 링 게이지 + 걷는 고양이 + 목표 칩 5개(도달하면 받기 버튼이 통통 튐) + 7일 그래프.
 * 걸음은 폰 모션 센서로 화면이 켜진 동안 세고(localStorage 에 날짜별 누적), 20걸음/10초마다 서버에 동기화한다.
 */
export default function WalkPage() {
  const { show } = useToast();
  const [data, setData] = useState<WalkPayload | null>(null);
  const [local, setLocal] = useState(0); // 오늘 기기에서 센 걸음(서버값과 max)
  const [pedo, setPedo] = useState<PedometerState>("idle");
  const [claiming, setClaiming] = useState<number | null>(null);
  const [stepPop, setStepPop] = useState(0);
  const ped = useRef<Pedometer | null>(null);
  const pending = useRef(0);
  const dayKey = useRef("");

  const load = useCallback(() => fetch("/api/walk", { cache: "no-store" }).then((r) => r.json()).then((j: WalkPayload) => { setData(j); dayKey.current = j.dayKey; try { const saved = Number(localStorage.getItem(`ccr_walk_${j.dayKey}`) ?? 0); setLocal(Math.max(saved, j.steps)); } catch { setLocal(j.steps); } }).catch(() => {}), []);
  useEffect(() => { void load(); }, [load]);

  const steps = Math.max(local, data?.steps ?? 0);

  const sync = useCallback(async (n: number) => {
    try {
      const r = await fetch("/api/walk", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ steps: n }) });
      if (r.ok) setData(await r.json());
    } catch {}
  }, []);

  // 걸음 누적 → 저장 + 주기 동기화
  useEffect(() => {
    if (pedo !== "running") return;
    const id = setInterval(() => { if (pending.current > 0) { pending.current = 0; void sync(ped.current?.steps ?? 0); } }, 10_000);
    return () => clearInterval(id);
  }, [pedo, sync]);

  const start = async () => {
    if (!ped.current) {
      const p = new Pedometer();
      p.steps = steps;
      p.onStep = (n) => {
        setLocal(n); pending.current += 1; setStepPop((x) => x + 1);
        try { localStorage.setItem(`ccr_walk_${dayKey.current}`, String(n)); } catch {}
        if (n % 20 === 0) { pending.current = 0; void sync(n); }
        if (n % 100 === 0) haptic("tap");
      };
      ped.current = p;
    }
    const st = await ped.current.start();
    setPedo(st);
    if (st === "running") { haptic("tap"); sfx("pop"); show("걸음을 세고 있어요. 폰을 들고 걸어보세요!", "info"); }
    else if (st === "denied") show("모션 권한이 꺼져 있어요. 설정 > Safari > 동작 및 방향 접근을 켜 주세요", "info");
    else if (st === "unsupported") show("이 기기에서는 걸음 감지를 지원하지 않아요", "info");
  };
  const stop = () => { ped.current?.stop(); setPedo("idle"); void sync(ped.current?.steps ?? steps); };
  useEffect(() => () => ped.current?.stop(), []);

  const claim = async (goal: number, el: HTMLElement | null) => {
    if (claiming) return; setClaiming(goal);
    try {
      const r = await fetch("/api/walk/claim", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ goal }) });
      const j = await r.json();
      if (!r.ok) { haptic("warn"); show(j.message ?? "받을 수 없어요", "info"); return; }
      const rect = el?.getBoundingClientRect();
      haptic("success"); sfx("coin");
      if (rect) burst("coins", rect.left + rect.width / 2, rect.top + rect.height / 2);
      if (goal >= DAY_GOAL) { confetti(180); sfx("win"); }
      await showReward({ variant: "small", points: j.points, title: `${fmt(goal)}걸음 달성!`, subtitle: "걷기만 했는데 포인트가 쌓였어요" });
      flyToBalance(6);
      setData(j.payload);
    } finally { setClaiming(null); }
  };

  const pct = Math.min(1, steps / DAY_GOAL);
  const next = data?.goals.find((g) => steps < g.steps) ?? null;
  const km = (steps * 0.00072).toFixed(2);
  const kcal = Math.round(steps * 0.04);
  const maxHist = Math.max(DAY_GOAL, ...(data?.history.map((h) => h.steps) ?? [0]));

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-12">
      {/* 탭 화면 헤더(뒤로 없음): 제목 + 잔액 */}
      <header className="fixed left-1/2 top-0 z-20 flex h-12 w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-[var(--color-bg)] px-6">
        <h1 className="text-[26px] font-semibold leading-[31px] text-ink">만보기</h1>
        <Link href="/wallet" className="flex items-center gap-1 text-[14px] font-bold"><PCoin size={16} /><span id="hdr-balance">{data ? <NumberFlow value={data.balance} /> : "—"}</span></Link>
      </header>
      <div className="h-12" />

      {/* 링 게이지 */}
      <section className="relative mx-5 mt-2 overflow-hidden rounded-[26px] px-5 pb-6 pt-6 text-white" style={{ background: "linear-gradient(160deg,#2f6fed 0%,#1f4fc8 60%,#173c9c 100%)", boxShadow: "0 14px 34px rgba(47,111,237,.3)" }}>
        <DuoIcon name="bolt" size={140} className="pointer-events-none absolute -right-6 -top-6 text-white/10" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-white/75">오늘 걸음</p>
            <p className="mt-0.5 text-[12px] text-white/60">{next ? `${fmt(next.steps - steps)}걸음 더 걸으면 +${next.points}P` : "오늘 목표를 모두 달성했어요"}</p>
          </div>
          <span className={`flex h-[30px] items-center gap-1.5 rounded-full px-3 text-[12px] font-bold ${pedo === "running" ? "bg-[#4ade80]/20 text-[#bbf7d0]" : "bg-white/15 text-white"}`}>
            <i className={`h-2 w-2 rounded-full ${pedo === "running" ? "walk-live bg-[#4ade80]" : "bg-white/50"}`} />{pedo === "running" ? "측정 중" : "일시정지"}
          </span>
        </div>

        <div className="relative mx-auto mt-4" style={{ width: 280, height: 280 }}>
          <svg width={280} height={280} viewBox="0 0 280 280" className="absolute inset-0 -rotate-90">
            <circle cx="140" cy="140" r={R} stroke="rgba(255,255,255,.15)" strokeWidth="18" fill="none" />
            <circle cx="140" cy="140" r={R} stroke="url(#walk-g)" strokeWidth="18" strokeLinecap="round" fill="none" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pct)} style={{ transition: "stroke-dashoffset .8s cubic-bezier(.22,1,.36,1)" }} />
            <defs><linearGradient id="walk-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd45c" /><stop offset="1" stopColor="#ff8a5c" /></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <img src="/brand/mascot_body.webp" alt="" width={74} height={74} className={`h-[74px] w-[74px] object-contain ${pedo === "running" ? "walk-cat" : "mascot-idle"}`} draggable={false} />
            <p key={stepPop} className="walk-count mt-1 text-[44px] font-bold leading-none tabular-nums">{fmt(steps)}</p>
            <p className="mt-1 text-[12px] font-semibold text-white/70">/ {fmt(DAY_GOAL)} 걸음</p>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-[14px] bg-white/12 py-2.5"><p className="text-[16px] font-bold">{km}<span className="ml-0.5 text-[11px] font-semibold text-white/70">km</span></p><p className="text-[11px] text-white/60">거리</p></div>
          <div className="rounded-[14px] bg-white/12 py-2.5"><p className="text-[16px] font-bold">{kcal}<span className="ml-0.5 text-[11px] font-semibold text-white/70">kcal</span></p><p className="text-[11px] text-white/60">소모</p></div>
          <div className="rounded-[14px] bg-white/12 py-2.5"><p className="text-[16px] font-bold">{data?.todayPoints ?? 0}<span className="ml-0.5 text-[11px] font-semibold text-white/70">P</span></p><p className="text-[11px] text-white/60">오늘 적립</p></div>
        </div>

        <button type="button" onClick={pedo === "running" ? stop : start} className={`myb-press mt-4 flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] text-[15px] font-bold ${pedo === "running" ? "bg-white/15 text-white" : "bg-white text-[#1f4fc8]"}`}>
          <DuoIcon name={pedo === "running" ? "clock" : "bolt"} size={18} />{pedo === "running" ? "측정 멈추기" : steps > 0 ? "이어서 걷기" : "걸음 세기 시작"}
        </button>
      </section>

      {/* 목표 보상 */}
      <section className="mx-5 mt-5 rounded-[20px] bg-white p-4" style={{ boxShadow: "0 5px 16px rgba(40,24,14,.07)" }}>
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-bold text-ink">걸음 보상 <span className="ml-1 text-[12px] font-medium text-muted">하루 최대 210P</span></p>
          {data && data.claimable > 0 && <span className="rounded-full bg-myb-soft px-2.5 py-1 text-[11px] font-bold text-myb-dark">받을 보상 {data.claimable}P</span>}
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {(data?.goals ?? []).map((g) => {
            const ready = steps >= g.steps && !g.claimed;
            return (
              <li key={g.steps} className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 ${g.claimed ? "bg-[#f3f4f7]" : ready ? "bg-myb-soft" : "bg-[#f8f9fc]"}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${g.claimed ? "bg-[#dfe3ea] text-white" : ready ? "bg-myb text-white" : "bg-white text-[#b0b8c1]"}`}>
                  {g.claimed ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="m5 12 5 5L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg> : <DuoIcon name="bolt" size={16} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-[14px] font-bold ${g.claimed ? "text-muted line-through" : "text-ink"}`}>{fmt(g.steps)}걸음</span>
                  <span className="block text-[11px] text-muted">{g.claimed ? "받았어요" : steps >= g.steps ? "달성! 보상을 받아가세요" : `${fmt(g.steps - steps)}걸음 남음`}</span>
                </span>
                {ready ? (
                  <button type="button" onClick={(e) => void claim(g.steps, e.currentTarget)} disabled={claiming !== null} className="myb-press walk-bounce flex h-9 items-center gap-1 rounded-full bg-myb px-3.5 text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(255,90,45,.35)]"><PCoin size={14} />+{g.points} 받기</button>
                ) : (
                  <span className={`flex items-center gap-1 text-[14px] font-bold ${g.claimed ? "text-muted" : "text-ink"}`}><PCoin size={14} />{g.points}</span>
                )}
              </li>
            );
          })}
          {!data && [0, 1, 2].map((i) => <li key={i} className="h-[58px] animate-pulse rounded-[14px] bg-bg-2" />)}
        </ul>
      </section>

      {/* 7일 그래프 */}
      <section className="mx-5 mt-5 rounded-[20px] bg-white p-4" style={{ boxShadow: "0 5px 16px rgba(40,24,14,.07)" }}>
        <p className="text-[15px] font-bold text-ink">최근 7일</p>
        <div className="mt-3 flex items-end gap-2">
          {(data?.history ?? []).map((h, i) => {
            const hgt = Math.max(4, Math.round((h.steps / maxHist) * 100));
            const today = i === 6;
            return (
              <div key={h.dayKey} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-semibold tabular-nums text-muted">{h.steps >= 1000 ? `${(h.steps / 1000).toFixed(1)}k` : h.steps || ""}</span>
                <div className="flex h-[84px] w-full items-end rounded-full bg-[#f1f2f5]">
                  <div className={`walk-bar w-full rounded-full ${today ? "bg-myb" : h.steps >= DAY_GOAL ? "bg-[#2f6fed]" : "bg-[#b9c8f5]"}`} style={{ height: `${hgt}%` }} />
                </div>
                <span className={`text-[11px] ${today ? "font-bold text-ink" : "text-muted"}`}>{today ? "오늘" : ["일", "월", "화", "수", "목", "금", "토"][new Date(`${h.dayKey}T00:00:00+09:00`).getDay()]}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-5 mt-5 flex items-start gap-3 rounded-[16px] bg-[#f1f2f5] p-4">
        <IconTile name="search" tone="gray" size={36} icon={18} />
        <div className="text-[12px] leading-[18px] text-ink-2">
          <p className="font-bold text-ink">걸음이 안 올라가요?</p>
          <p className="mt-0.5">걸음은 이 화면을 켜 둔 동안 폰의 움직임으로 세요. 아이폰은 처음 한 번 &quot;동작 및 방향 접근&quot;을 허용해야 하고, 화면을 끄거나 다른 앱으로 가면 잠시 멈춰요. 주머니나 손에 들고 걸으면 가장 정확해요.</p>
        </div>
      </section>
    </div>
  );
}

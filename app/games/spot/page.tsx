"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameHeader } from "@/components/games/GameHeader";
import { useToast } from "@/components/motion/Toast";
import { fmt } from "@/hooks/useHome";
import { PCoin } from "@/components/icons";
import { haptic, sfx } from "@/lib/fx";
import { burst, confetti, flyCoins } from "@/lib/fxEngine";
import { showReward } from "@/lib/reward";
import type { SpotPayload } from "@/lib/games/service";

/* eslint-disable @next/next/no-img-element */

interface Circle { id: string; x: number; y: number; r: number }
interface Token { id: string; token: string }
interface Result { found: number; total: number; points: number; all: boolean; missed: Circle[]; left: number; speedBonus: number; seconds: number; wallet?: { balance: number; stamps: number } }
interface Float { k: number; x: number; y: number; text: string; ok: boolean }
type Mark = Circle & { kind: "found" | "missed" | "hint" };

const MISS_PENALTY = 5;

/**
 * 틀린그림 찾기 — 일러스트 2장(위 원본 / 아래 다른 그림). 둘 중 아무 데나 탭.
 * 판정은 서버(좌표 비노출): 맞으면 원 위치 + HMAC 토큰, 제출 시 토큰으로 적립. 틀리면 −5초. 힌트 1회/레벨.
 */
export default function SpotPage() {
  const router = useRouter();
  const { show } = useToast();
  const [data, setData] = useState<SpotPayload | null>(null);
  const [phase, setPhase] = useState<"idle" | "count" | "play" | "done" | "review">("idle");
  const [count, setCount] = useState(3);
  const [floats, setFloats] = useState<Float[]>([]);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);
  const warned = useRef(false);
  const area = useRef<HTMLDivElement | null>(null);
  const dots = useRef<(HTMLSpanElement | null)[]>([]);
  const [dim, setDim] = useState<{ w: number; h: number } | null>(null);
  // 두 그림이 남는 세로 공간에 딱 맞도록(스크롤 없이 한 화면) 크기 계산
  useEffect(() => {
    const el = area.current; if (!el) return;
    const calc = () => {
      const W = el.clientWidth, H = el.clientHeight, gap = 8;
      const h = Math.max(120, Math.min((W * 688) / 1024, (H - gap) / 2));
      setDim({ w: Math.round((h * 1024) / 688), h: Math.round(h) });
    };
    calc();
    const ro = new ResizeObserver(calc); ro.observe(el);
    window.addEventListener("resize", calc);
    return () => { ro.disconnect(); window.removeEventListener("resize", calc); };
  }, [data, phase]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [misses, setMisses] = useState<{ x: number; y: number; k: number }[]>([]);
  const [left, setLeft] = useState(60);
  const [hintUsed, setHintUsed] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [imgReady, setImgReady] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const tokensRef = useRef<Token[]>([]);
  const startedAt = useRef(0);
  const submitting = useRef(false);
  const tapLock = useRef(false);

  const load = useCallback(async () => {
    const d: SpotPayload = await fetch("/api/games/spot", { cache: "no-store" }).then((r) => r.json());
    setData(d);
    setLeft(d.limitSec);
    setImgReady(0);
  }, []);
  useEffect(() => {
    void load().catch(() => {});
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [load]);

  const stopTimer = () => { if (timer.current) { clearInterval(timer.current); timer.current = null; } };

  const submit = useCallback(async () => {
    if (submitting.current || !data) return;
    submitting.current = true;
    stopTimer();
    setBusy(true);
    try {
      const seconds = (Date.now() - startedAt.current) / 1000;
      const res = await fetch("/api/games/spot", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "submit", level: data.level.id, tokens: tokensRef.current, seconds }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message ?? "제출 실패");
      const r = j as Result;
      if (r.points > 0) await showReward({ variant: "big", points: r.points, to: r.wallet?.balance ?? r.points, title: r.all ? "완주 보상 지급!" : "보상 지급!", subtitle: r.all ? `차이 ${r.total}개를 모두 찾았어요 🎉` : `${r.found}/${r.total} 찾았어요`, holdMs: 2200 });
      setResult(r);
      setMarks((m) => [...m.filter((x) => x.kind !== "hint"), ...r.missed.map((c) => ({ ...c, kind: "missed" as const }))]);
      setPhase("done");
      if (r.all) { haptic("jackpot"); sfx("win"); } else if (r.points > 0) { haptic("success"); sfx("coin"); burst("coins", window.innerWidth / 2, window.innerHeight / 2); } else { haptic("warn"); sfx("lose"); }
      show(r.points > 0 ? `${r.found}/${r.total} 찾았어요 · +${fmt(r.points)}P` : "아쉽게도 못 찾았어요", r.points > 0 ? undefined : "info");
    } catch (e) {
      show(e instanceof Error ? e.message : "제출 실패", "info");
      submitting.current = false;
    } finally {
      setBusy(false);
    }
  }, [data, show]);

  function start() {
    if (!data || data.left <= 0) return;
    setPhase("count");
    setCount(3);
    haptic("tap"); sfx("tick");
    let n = 3;
    const id = setInterval(() => {
      n -= 1;
      if (n > 0) { setCount(n); sfx("tick"); haptic("tap"); return; }
      clearInterval(id);
      setPhase("play");
      sfx("pop");
      startedAt.current = Date.now();
      warned.current = false;
      timer.current = setInterval(() => setLeft((s) => {
        if (s <= 1) { stopTimer(); setTimeout(() => void submit(), 0); return 0; }
        if (s - 1 === 10 && !warned.current) { warned.current = true; haptic("warn"); sfx("tick"); }
        return s - 1;
      }), 1000);
    }, 700);
  }
  function addFloat(x: number, y: number, text: string, ok: boolean) {
    const k = Date.now() + Math.random();
    setFloats((f) => [...f.slice(-4), { k, x, y, text, ok }]);
    setTimeout(() => setFloats((f) => f.filter((z) => z.k !== k)), 900);
  }

  async function tap(e: React.MouseEvent<HTMLDivElement>) {
    if (phase !== "play" || !data || tapLock.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const cx = e.clientX, cy = e.clientY;
    tapLock.current = true;
    try {
      const res = await fetch("/api/games/spot", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "tap", level: data.level.id, x, y, tokens: tokensRef.current }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message ?? "판정 실패");
      if (j.hit) {
        const next = [...tokensRef.current, { id: j.diff.id, token: j.token }];
        tokensRef.current = next;
        setTokens(next);
        setMarks((m) => [...m.filter((k) => !(k.kind === "hint" && k.id === j.diff.id)), { ...j.diff, kind: "found" }]);
        haptic("success"); sfx(j.found >= j.total ? "win" : "hit");
        addFloat(j.diff.x, j.diff.y, `+${data.pointPerDiff}P`, true);
        burst("sparkle", cx, cy);
        const dot = dots.current[j.found - 1];
        setTimeout(() => flyCoins({ x: cx, y: cy }, dot, 3, (i) => { if (i === 0 && dot) { dot.classList.add("spot-dot-pop"); burst("ring", dot.getBoundingClientRect().left + 9, dot.getBoundingClientRect().top + 9); } }), 120);
        if (j.found >= j.total) { setTimeout(() => confetti(160), 500); void submit(); }
      } else {
        const k = Date.now();
        setMisses((m) => [...m.slice(-3), { x, y, k }]);
        setTimeout(() => setMisses((m) => m.filter((z) => z.k !== k)), 700);
        setLeft((s) => Math.max(1, s - MISS_PENALTY));
        haptic("error"); sfx("miss");
        addFloat(x, y, `틀렸어요 −${MISS_PENALTY}초`, false);
        burst("miss", cx, cy);
        setShake(true); setFlash(true);
        setTimeout(() => setShake(false), 450); setTimeout(() => setFlash(false), 500);
      }
    } catch (err) {
      show(err instanceof Error ? err.message : "판정 실패", "info");
      if (err instanceof Error && err.message.includes("레벨")) { stopTimer(); setPhase("idle"); setTokens([]); tokensRef.current = []; setMarks([]); void load(); }
    } finally {
      tapLock.current = false;
    }
  }

  async function hint() {
    if (hintUsed || phase !== "play" || !data) return;
    setHintUsed(true);
    const res = await fetch("/api/games/spot", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "hint", level: data.level.id, tokens: tokensRef.current }) });
    const j = await res.json();
    if (!j.diff) return;
    setMarks((m) => [...m, { ...j.diff, kind: "hint" }]);
    setLeft((s) => Math.max(1, s - MISS_PENALTY));
    haptic("tap"); sfx("pop");
  }

  function nextLevel() {
    setResult(null); setMarks([]); setMisses([]); setTokens([]); tokensRef.current = []; setHintUsed(false); submitting.current = false; setPhase("idle");
    void load();
  }

  const total = data?.total ?? 5;
  const found = tokens.length;
  const pct = data ? (left / data.limitSec) * 100 : 100;
  const stars = result ? (result.all ? (result.speedBonus ? 3 : 2) : result.found >= 3 ? 1 : 0) : 0;
  const renderImage = (src: string, label: string, blur: boolean, top: boolean) => (
    <div className={`relative mx-auto overflow-hidden rounded-[14px] bg-[#e5e8ee] ${shake ? "spot-shake" : ""}`} style={dim ? { width: dim.w, height: dim.h, boxShadow: "0 5px 16px 0 rgba(40, 24, 14, 0.09)" } : { aspectRatio: "1024 / 688", boxShadow: "0 5px 16px 0 rgba(40, 24, 14, 0.09)" }} onClick={tap}>
      <img src={src} alt={label} draggable={false} onLoad={() => setImgReady((n) => n + 1)} className={`block h-full w-full select-none transition-[filter] duration-300 ${blur ? "blur-[6px]" : ""}`} />
      {marks.map((m) => (
        <svg key={m.kind + m.id} viewBox="0 0 100 100" className="pointer-events-none absolute overflow-visible" style={{ left: `${(m.x - m.r) * 100}%`, top: `${(m.y - m.r * 1024 / 688) * 100}%`, width: `${m.r * 2 * 100}%`, aspectRatio: "1" }}>
          {m.kind === "found" ? (
            <>
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,.95)" strokeWidth="10" pathLength={1} className="spot-ring spot-ring-halo" />
              <circle cx="50" cy="50" r="46" fill="none" stroke="#22c55e" strokeWidth="5.5" strokeLinecap="round" pathLength={1} className="spot-ring" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" pathLength={1} className="spot-ring spot-ring-2" opacity=".8" />
              <circle cx="50" cy="50" r="46" fill="none" stroke="#22c55e" strokeWidth="3" className="spot-ring-pulse" />
            </>
          ) : m.kind === "missed" ? (
            <circle cx="50" cy="50" r="45" fill="rgba(255,59,107,.12)" stroke="#ff3b6b" strokeWidth="4" strokeDasharray="7 6" pathLength={1} className="spot-ring" />
          ) : (
            <circle cx="50" cy="50" r="45" fill="rgba(255,180,0,.15)" stroke="#ffb400" strokeWidth="4" strokeDasharray="6 5" className="spot-hint-ring" />
          )}
        </svg>
      ))}
      {misses.map((m) => (
        <span key={m.k} className="spot-miss pointer-events-none absolute text-[34px] font-black leading-none text-[#ff3b6b] drop-shadow-[0_2px_0_rgba(255,255,255,.9)]" style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%`, transform: "translate(-50%,-50%)" }}>✕</span>
      ))}
      {floats.map((f) => (
        <span key={f.k} className={`spot-float pointer-events-none absolute whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-extrabold text-white shadow-md ${f.ok ? "bg-[#22c55e]" : "bg-[#ff3b6b]"}`} style={{ left: `${f.x * 100}%`, top: `${f.y * 100}%` }}>{f.text}</span>
      ))}
      {flash && <span className="spot-flash pointer-events-none absolute inset-0 bg-[#ff3b6b]" />}
      <span className={`absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[11px] font-bold text-white ${top ? "bg-black/45" : "bg-[var(--color-myb)]"}`}>{label}</span>
    </div>
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[var(--color-bg)] text-[#191f28]">
      <GameHeader title="틀린그림 찾기" right={phase === "play" ? <span className={`text-[22px] font-extrabold tabular-nums ${left <= 10 ? "text-[#ff3939]" : "text-[var(--color-myb)]"}`}>{left}</span> : null} />
      <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 pb-3 pt-[52px]">
        {/* 상태 줄: 레벨 칩 · 찾은 개수 5개 · 타이머 바 */}
        <div className="flex shrink-0 items-center justify-between px-0.5">
          <span className="rounded-full bg-[var(--color-myb-soft)] px-2.5 py-1 text-[12px] font-bold text-[var(--color-myb)]">LV {data ? data.level.index + 1 : "-"}<span className="font-medium text-[var(--color-myb-line)]">/3</span></span>
          <div className="flex items-center gap-2">{Array.from({ length: total }).map((_, i) => <span key={i} ref={(el) => { dots.current[i] = el; }} className={`flex h-[20px] w-[20px] items-center justify-center rounded-full border-2 text-[11px] font-black text-white transition-all duration-300 ${i < found ? "border-[#22c55e] bg-[#22c55e] shadow-[0_0_10px_rgba(34,197,94,.6)]" : "border-[#dee2e9] bg-white"}`}>{i < found ? "✓" : ""}</span>)}</div>
          <span className="w-[52px] text-right text-[12px] font-semibold text-[#8b94a0]">{data ? data.level.name : ""}</span>
        </div>
        <div className="h-1 w-full shrink-0 overflow-hidden rounded-full bg-[#e5e8ee]"><div className="h-full rounded-full transition-[width] duration-1000 ease-linear" style={{ width: `${pct}%`, background: left <= 10 ? "#ff3939" : "linear-gradient(90deg,var(--color-myb),var(--color-gold))" }} /></div>

        {data ? (
          <div ref={area} className="relative flex min-h-0 flex-1 flex-col justify-center gap-2">
            {renderImage(data.level.a, "원본", false, true)}
            {renderImage(data.level.b, "여기서 찾기", phase === "idle" || phase === "count", false)}
            {phase === "count" && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span key={count} className="spot-count flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[var(--color-myb)] text-[64px] font-black text-white shadow-[0_12px_40px_rgba(255,90,45,.5)]">{count}</span>
              </div>
            )}
            {phase === "idle" && (
              <div className="absolute inset-0 flex items-center justify-center">
                {data.left > 0 ? (
                  <button type="button" onClick={start} disabled={imgReady < 2} className="myb-press flex h-14 items-center gap-2 rounded-full bg-[var(--color-myb)] px-8 text-[17px] font-extrabold text-white shadow-[0_8px_30px_rgba(255,90,45,.45)] disabled:opacity-60">
                    {imgReady < 2 ? "준비 중…" : "▶ 시작"}
                  </button>
                ) : (
                  <div className="rounded-2xl bg-white/95 px-5 py-4 text-center text-[14px] font-semibold shadow-lg">오늘 3레벨을 모두 풀었어요<br /><span className="text-[12px] font-normal text-[#8b94a0]">내일 0시에 새 그림 3장</span></div>
                )}
              </div>
            )}
            {result?.all && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"></div>}
          </div>
        ) : (
          <div ref={area} className="flex min-h-0 flex-1 flex-col gap-2"><div className="animate-pulse rounded-[14px] bg-[#e5e8ee]" style={{ aspectRatio: "1024 / 688" }} /><div className="animate-pulse rounded-[14px] bg-[#e5e8ee]" style={{ aspectRatio: "1024 / 688" }} /></div>
        )}

        {/* 하단: 둥근 버튼 2개(힌트 · 그만) — 플레이 중에만 */}
        <div className="flex h-[64px] shrink-0 items-center justify-center gap-8">
          {phase === "play" && (
            <>
              <button type="button" disabled={hintUsed} onClick={() => void hint()} className="myb-press flex flex-col items-center gap-0.5 disabled:opacity-40">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[22px] shadow-[0_4px_14px_rgba(0,43,141,.12)]">💡</span>
                <span className="text-[11px] font-semibold text-[#5c6573]">힌트 {hintUsed ? "0" : "1"}</span>
              </button>
              <button type="button" disabled={busy} onClick={() => void submit()} className="myb-press flex flex-col items-center gap-0.5 disabled:opacity-40">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#191f28] text-[18px] text-white shadow-[0_4px_14px_rgba(0,43,141,.2)]">■</span>
                <span className="text-[11px] font-semibold text-[#5c6573]">그만</span>
              </button>
            </>
          )}
          {phase === "idle" && data && (
            <div className="flex items-center gap-2">
              {data.today.map((t) => (
                <span key={t.index} className={`flex h-8 items-center gap-1 rounded-full px-3 text-[12px] font-bold ${t.status === "done" ? "bg-[#e9f7ef] text-[#1aa260]" : t.status === "current" ? "bg-[var(--color-myb)] text-white" : "bg-[#eef0f4] text-[#b0b8c1]"}`}>
                  {t.status === "done" ? (t.found === data.total ? "🏆" : "✓") : t.status === "current" ? "▶" : "🔒"} {t.index + 1}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 결과 팝업 */}
      {phase === "done" && result && (
        <>
          <div className="myb-fade-in fixed inset-0 z-[999] bg-black/55" />
          <div className="myb-modal-in fixed left-1/2 top-1/2 z-[1000] w-[calc(100%-56px)] max-w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[24px] bg-white px-6 pb-6 pt-7 text-center">
            <p className="flex items-center justify-center gap-2 text-[38px] leading-none">{[0, 1, 2].map((i) => <span key={i} className={i < stars ? "spot-star text-[#ffb400] drop-shadow-[0_2px_6px_rgba(255,180,0,.5)]" : "text-[#e5e8ee]"} style={{ animationDelay: `${0.25 + i * 0.18}s` }}>★</span>)}</p>
            <p className="mt-2 text-[24px] font-extrabold">{result.all ? "완벽해요!" : `${result.found}/${result.total} 찾았어요`}</p>
            <p className="mt-2 flex items-center justify-center gap-1 text-[20px] font-extrabold text-[var(--color-myb)]"><PCoin size={20} />+{fmt(result.points)}</p>
            <p className="mt-1 text-[12px] text-[#8b94a0]">{result.seconds}초{result.speedBonus ? ` · ⚡ 스피드 +${result.speedBonus}P` : ""}{!result.all ? " · 놓친 곳은 분홍 점선" : ""}</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => router.push("/games")} className="myb-press h-12 rounded-xl border border-[#dee2e9] text-[14px] font-bold">나가기</button>
              {result.left > 0 ? (
                <button type="button" onClick={nextLevel} className="myb-press h-12 rounded-xl bg-[var(--color-myb)] text-[14px] font-bold text-white">다음 레벨</button>
              ) : (
                <button type="button" onClick={() => router.push("/wallet")} className="myb-press h-12 rounded-xl bg-[#191f28] text-[14px] font-bold text-white">지갑 보기</button>
              )}
            </div>
            {!result.all && <button type="button" onClick={() => setPhase("review")} className="mt-3 text-[12px] text-[#8b94a0] underline">놓친 곳 보기</button>}
          </div>
        </>
      )}
      {phase === "review" && result && (
        <div className="fixed bottom-5 left-1/2 z-[1000] flex -translate-x-1/2 gap-2">
          <button type="button" onClick={() => setPhase("done")} className="myb-press h-11 rounded-full bg-[#191f28] px-5 text-[14px] font-bold text-white shadow-lg">결과로 돌아가기</button>
        </div>
      )}
    </div>
  );
}

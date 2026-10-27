"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameHeader } from "@/components/games/GameHeader";
import { Lottie } from "@/components/motion/Lottie";
import { useToast } from "@/components/motion/Toast";
import { fmt } from "@/hooks/useHome";
import { haptic, sfx } from "@/lib/fx";
import type { SpotPayload } from "@/lib/games/service";

/* eslint-disable @next/next/no-img-element */

interface Circle { id: string; x: number; y: number; r: number }
interface Token { id: string; token: string }
interface Result { found: number; total: number; points: number; all: boolean; missed: Circle[]; left: number; speedBonus: number; seconds: number }
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
  const [phase, setPhase] = useState<"idle" | "count" | "play" | "done">("idle");
  const [count, setCount] = useState(3);
  const [floats, setFloats] = useState<Float[]>([]);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);
  const warned = useRef(false);
  const area = useRef<HTMLDivElement | null>(null);
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
      setResult(r);
      setMarks((m) => [...m.filter((x) => x.kind !== "hint"), ...r.missed.map((c) => ({ ...c, kind: "missed" as const }))]);
      setPhase("done");
      if (r.all) { haptic("jackpot"); sfx("win"); } else if (r.points > 0) { haptic("success"); sfx("coin"); } else { haptic("warn"); sfx("lose"); }
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
        if (j.found >= j.total) void submit();
      } else {
        const k = Date.now();
        setMisses((m) => [...m.slice(-3), { x, y, k }]);
        setTimeout(() => setMisses((m) => m.filter((z) => z.k !== k)), 700);
        setLeft((s) => Math.max(1, s - MISS_PENALTY));
        haptic("error"); sfx("miss");
        addFloat(x, y, `틀렸어요 −${MISS_PENALTY}초`, false);
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
  const renderImage = (src: string, label: string, blur: boolean, top: boolean) => (
    <div className={`relative mx-auto overflow-hidden rounded-[14px] bg-[#e5e8ee] ${shake ? "spot-shake" : ""}`} style={dim ? { width: dim.w, height: dim.h, boxShadow: "0 5px 16px 0 rgba(0, 43, 141, 0.1)" } : { aspectRatio: "1024 / 688", boxShadow: "0 5px 16px 0 rgba(0, 43, 141, 0.1)" }} onClick={tap}>
      <img src={src} alt={label} draggable={false} onLoad={() => setImgReady((n) => n + 1)} className={`block h-full w-full select-none transition-[filter] duration-300 ${blur ? "blur-[6px]" : ""}`} />
      {marks.map((m) => (
        <span key={m.kind + m.id} className={`spot-mark pointer-events-none absolute rounded-full border-[3px] ${m.kind === "found" ? "border-[#22c55e] shadow-[0_0_0_2px_rgba(255,255,255,.9)]" : m.kind === "missed" ? "border-dashed border-[#ff3b6b]" : "border-dashed border-[#ffb400] spot-hint"}`} style={{ left: `${(m.x - m.r) * 100}%`, top: `${(m.y - m.r * 1024 / 688) * 100}%`, width: `${m.r * 2 * 100}%`, aspectRatio: "1" }} />
      ))}
      {misses.map((m) => (
        <span key={m.k} className="spot-miss pointer-events-none absolute text-[26px] font-black leading-none text-[#ff3b6b]" style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%`, transform: "translate(-50%,-50%)" }}>✕</span>
      ))}
      {floats.map((f) => (
        <span key={f.k} className={`spot-float pointer-events-none absolute whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-extrabold text-white shadow-md ${f.ok ? "bg-[#22c55e]" : "bg-[#ff3b6b]"}`} style={{ left: `${f.x * 100}%`, top: `${f.y * 100}%` }}>{f.text}</span>
      ))}
      {flash && <span className="spot-flash pointer-events-none absolute inset-0 bg-[#ff3b6b]" />}
      <span className={`absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[11px] font-bold text-white ${top ? "bg-black/45" : "bg-[#427cff]"}`}>{label}</span>
    </div>
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8f9fc] pb-2 text-[#191f28]">
      <GameHeader title="틀린그림 찾기" right={phase === "play" ? <span className={`text-[20px] font-extrabold tabular-nums ${left <= 10 ? "text-[#ff3939]" : "text-[#427cff]"}`}>{left}s</span> : data ? <span className="text-[13px] text-[#8b94a0]">{data.left}회 남음</span> : null} />
      <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 pt-[54px]">
        <div className="flex shrink-0 items-center justify-between px-1">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold">{data ? `${data.level.name}` : "불러오는 중…"} <span className="text-[12px] font-semibold text-[#8b94a0]">LEVEL {data ? data.level.index + 1 : "-"}/3</span></p>
            <p className="text-[11px] text-[#8b94a0]">다른 곳 {total}개 · 차이당 {data?.pointPerDiff ?? 3}P · 전부 찾으면 +{data?.completeBonus ?? 10}P</p>
          </div>
          <div className="flex items-center gap-1.5">{Array.from({ length: total }).map((_, i) => <span key={i} className={`h-3 w-3 rounded-full transition-colors ${i < found ? "bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,.5)]" : "bg-[#dee2e9]"}`} />)}</div>
        </div>
        <div className="h-1 w-full shrink-0 overflow-hidden rounded-full bg-[#e5e8ee]"><div className="h-full rounded-full transition-[width] duration-1000 ease-linear" style={{ width: `${pct}%`, background: left <= 10 ? "#ff3939" : "linear-gradient(90deg,#427cff,#22d3ee)" }} /></div>
        {data ? (
          <div ref={area} className="relative flex min-h-0 flex-1 flex-col justify-center gap-2">
            {renderImage(data.level.a, "원본", false, true)}
            {renderImage(data.level.b, "여기서 찾기", phase === "idle" || phase === "count", false)}
            {phase === "count" && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span key={count} className="spot-count flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#427cff] text-[64px] font-black text-white shadow-[0_12px_40px_rgba(66,124,255,.5)]">{count}</span>
              </div>
            )}
            {phase === "idle" && (
              <div className="absolute inset-0 flex items-center justify-center rounded-[14px]">
                {data.left > 0 ? (
                  <button type="button" onClick={start} disabled={imgReady < 2} className="myb-press flex h-14 items-center gap-2 rounded-full bg-[#427cff] px-7 text-[16px] font-extrabold text-white shadow-[0_8px_30px_rgba(66,124,255,.45)] disabled:opacity-60">
                    {imgReady < 2 ? "그림 준비 중…" : `▶ 시작하기 · ${data.limitSec}초`}
                  </button>
                ) : (
                  <div className="rounded-2xl bg-white/95 px-5 py-4 text-center text-[14px] font-semibold shadow-lg">오늘 3레벨을 모두 풀었어요<br /><span className="text-[12px] font-normal text-[#8b94a0]">내일 0시에 새 그림 3장이 열려요</span></div>
                )}
              </div>
            )}
            {result?.all && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><Lottie src="/myb/lottie_confetti_pop.json" className="h-[300px] w-[300px]" /></div>}
          </div>
        ) : (
          <div ref={area} className="flex min-h-0 flex-1 flex-col gap-2"><div className="animate-pulse rounded-[14px] bg-[#e5e8ee]" style={{ aspectRatio: "1024 / 688" }} /><div className="animate-pulse rounded-[14px] bg-[#e5e8ee]" style={{ aspectRatio: "1024 / 688" }} /></div>
        )}
        {phase === "play" && (
          <div className="grid shrink-0 grid-cols-2 gap-2">
            <button type="button" disabled={hintUsed} onClick={() => void hint()} className="myb-press h-12 rounded-xl border border-[#dee2e9] bg-white text-[14px] font-bold disabled:opacity-40">💡 힌트 {hintUsed ? "사용함" : `(−${MISS_PENALTY}초)`}</button>
            <button type="button" disabled={busy} onClick={() => void submit()} className="myb-press h-12 rounded-xl bg-[#191f28] text-[14px] font-bold text-white disabled:opacity-40">그만 찾기 ({found}/{total})</button>
          </div>
        )}
        {phase === "done" && result && (
          <div className="shrink-0 rounded-[20px] bg-white px-5 py-3 text-center text-[#191f28]" style={{ boxShadow: "0 5px 16px 0 rgba(0, 43, 141, 0.1)" }}>
            <p className="text-[26px] tracking-[4px]">{"★".repeat(result.all ? (result.speedBonus ? 3 : 2) : result.found >= 3 ? 1 : 0)}<span className="text-[#dee2e9]">{"★".repeat(3 - (result.all ? (result.speedBonus ? 3 : 2) : result.found >= 3 ? 1 : 0))}</span></p>
            <p className="mt-1 text-[22px] font-extrabold">{result.all ? "완벽해요! 🎉" : `${result.found}/${result.total} 찾았어요`}</p>
            <p className="mt-1 text-[16px] font-bold text-[#427cff]">+{fmt(result.points)}P 적립{result.speedBonus ? <span className="ml-1 rounded-full bg-[#fff0b3] px-2 py-0.5 text-[11px] text-[#9a5b00]">⚡ 스피드 +{result.speedBonus}P</span> : null}</p>
            <p className="mt-1 text-[12px] text-[#8b94a0]">{result.seconds}초 소요{result.all && !result.speedBonus ? ` · 30초 안에 끝내면 ⚡ +${data?.speedBonus ?? 5}P` : ""}</p>
            {!result.all && <p className="mt-1 text-[12px] text-[#8b94a0]">분홍 점선이 놓친 곳이에요</p>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => router.push("/games")} className="myb-press h-12 rounded-xl border border-[#dee2e9] text-[14px] font-bold">다른 게임</button>
              {result.left > 0 ? (
                <button type="button" onClick={nextLevel} className="myb-press h-12 rounded-xl bg-[#427cff] text-[14px] font-bold text-white">다음 레벨 ({result.left}회 남음)</button>
              ) : (
                <button type="button" onClick={() => router.push("/wallet")} className="myb-press h-12 rounded-xl bg-[#191f28] text-[14px] font-bold text-white">지갑 보기</button>
              )}
            </div>
          </div>
        )}
        {data && phase !== "play" && phase !== "count" && (
          <section className="shrink-0 rounded-[16px] bg-white px-3 py-2.5" style={{ boxShadow: "0 2px 10px 0 rgba(0, 43, 141, 0.06)" }}>
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-bold">오늘의 3레벨</p>
              <p className="text-[12px] text-[#8b94a0]">오늘 <b className="text-[#427cff]">+{fmt(data.todayPoints)}P</b>{data.best ? ` · 최단 ${data.best.seconds}초(${data.best.level})` : ""}</p>
            </div>
            <ul className="mt-2 grid grid-cols-3 gap-2">
              {data.today.map((t) => (
                <li key={t.index} className={`flex items-center gap-2 overflow-hidden rounded-xl border p-1 ${t.status === "current" ? "border-[#427cff]" : "border-[#eef0f4]"}`}>
                  <div className="relative h-[40px] w-[56px] shrink-0 overflow-hidden rounded-lg bg-[#e5e8ee]">
                    <img src={t.thumb} alt="" className={`h-full w-full object-cover ${t.status === "locked" ? "blur-[3px] opacity-70" : ""}`} loading="lazy" />
                    {t.status === "done" && <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-[16px]">{t.found === data.total ? "🏆" : "✓"}</span>}
                    {t.status === "locked" && <span className="absolute inset-0 flex items-center justify-center text-[14px]">🔒</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold">{t.index + 1}. {t.name}</p>
                    <p className="truncate text-[10px] text-[#8b94a0]">{t.status === "done" ? `${t.found}/${data.total} · +${t.points}P` : t.status === "current" ? "진행 중" : "다음"}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
        <p className="shrink-0 truncate px-1 text-[10px] text-[#b0b8c1]">아무 데나 탭 · 틀리면 진동과 −{MISS_PENALTY}초 · 30초 안에 전부 찾으면 ⚡ 보너스 · 매일 0시 새 그림 3장</p>
      </div>
    </div>
  );
}

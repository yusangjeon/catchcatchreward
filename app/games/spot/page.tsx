"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GameHeader } from "@/components/games/GameHeader";
import { SceneSvg } from "@/components/games/SceneSvg";
import { Lottie } from "@/components/motion/Lottie";
import { useToast } from "@/components/motion/Toast";
import { fmt } from "@/hooks/useHome";
import { HIT_R, SCENES } from "@/lib/games/spotScenes";

interface Puzzle { dayKey: string; sceneId: string; sceneName: string; diffIds: string[]; total: number; played: boolean; lastResult?: string; limitSec: number }
interface Result { found: number; total: number; diffIds: string[]; points: number }

/**
 * 틀린그림 찾기 — 벡터 일러스트 두 장. 아래 그림에서 다른 곳을 탭. 맞추면 초록 원, 틀리면 X(−3초). 힌트 1회.
 * 판정은 클라이언트(즉시 피드백), 보상은 서버가 찾은 id 로 재검증.
 */
export default function SpotPage() {
  const router = useRouter();
  const { show } = useToast();
  const [p, setP] = useState<Puzzle | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [marks, setMarks] = useState<{ x: number; y: number; ok?: boolean }[]>([]);
  const [misses, setMisses] = useState<{ x: number; y: number }[]>([]);
  const [left, setLeft] = useState(75);
  const [started, setStarted] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const foundRef = useRef<string[]>([]);
  const submitting = useRef(false);

  useEffect(() => {
    fetch("/api/games/spot", { cache: "no-store" }).then((r) => r.json()).then((d: Puzzle) => { setP(d); setLeft(d.limitSec); }).catch(() => {});
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  const scene = p ? SCENES.find((s) => s.id === p.sceneId) : undefined;
  const diffs = scene && p ? scene.diffs.filter((d) => p.diffIds.includes(d.id)) : [];

  async function submit(ids: string[]) {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    if (timer.current) clearInterval(timer.current);
    try {
      const res = await fetch("/api/games/spot", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ picks: ids }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message ?? "제출 실패");
      setResult(j as Result);
      // 못 찾은 것 표시
      setMarks((m) => [...m, ...diffs.filter((d) => !ids.includes(d.id)).map((d) => ({ x: d.cx, y: d.cy, ok: false }))]);
      show(j.points > 0 ? `${j.found}/${j.total} 찾았어요 · +${fmt(j.points)}P` : "아쉽게도 못 찾았어요", j.points > 0 ? undefined : "info");
    } catch (e) {
      show(e instanceof Error ? e.message : "제출 실패", "info");
    } finally {
      setBusy(false);
    }
  }

  function start() {
    setStarted(true);
    timer.current = setInterval(() => setLeft((s) => {
      if (s <= 1) { if (timer.current) clearInterval(timer.current); setTimeout(() => void submit(foundRef.current), 0); return 0; }
      return s - 1;
    }), 1000);
  }

  function tap(x: number, y: number) {
    if (!started || result || busy) return;
    const hit = diffs.find((d) => !foundRef.current.includes(d.id) && Math.hypot(d.cx - x, d.cy - y) <= HIT_R);
    if (hit) {
      const next = [...foundRef.current, hit.id];
      foundRef.current = next;
      setFound(next);
      setMarks((m) => [...m, { x: hit.cx, y: hit.cy }]);
      if (next.length === diffs.length) void submit(next);
    } else {
      setMisses((m) => [...m.slice(-4), { x, y }]);
      setLeft((s) => Math.max(1, s - 3));
    }
  }

  function hint() {
    if (hintUsed || !started || result) return;
    const rest = diffs.filter((d) => !foundRef.current.includes(d.id));
    if (!rest.length) return;
    setHintUsed(true);
    const d = rest[0];
    setMarks((m) => [...m, { x: d.cx, y: d.cy, ok: false }]);
    setTimeout(() => setMarks((m) => m.filter((x) => !(x.x === d.cx && x.y === d.cy && x.ok === false))), 1500);
  }

  return (
    <div className="min-h-dvh bg-[#f8f9fc] pb-10 text-[#191f28]">
      <GameHeader title="틀린그림 찾기" right={started ? <span className={left <= 10 ? "text-[#ff3939] text-[18px]" : "text-[#427cff] text-[18px]"}>{left}s</span> : null} />
      <div className="flex flex-col gap-3 px-5 pt-[60px]">
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-[#5c6573]"><b>{p?.sceneName ?? "…"}</b> · 다른 곳 <b>{p?.total ?? 5}개</b>를 아래 그림에서 탭</p>
          <div className="flex items-center gap-1">{Array.from({ length: p?.total ?? 5 }).map((_, i) => <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < found.length ? "bg-[#22c55e]" : "bg-[#dee2e9]"}`} />)}</div>
        </div>
        {p?.played && !result && <p className="rounded-xl bg-[#fff6e5] px-4 py-3 text-[13px] text-[#9a5b00]">오늘은 이미 도전했어요 ({p.lastResult}). 내일 새 그림이 나와요.</p>}
        <div className="relative rounded-2xl bg-white p-2" style={{ boxShadow: "0 5px 16px 0 rgba(0, 43, 141, 0.1)" }}>
          {scene ? <SceneSvg scene={scene} diffIds={[]} marks={[]} /> : <div className="aspect-[3/2] w-full animate-pulse rounded-2xl bg-[#eef0f4]" />}
          <span className="absolute left-4 top-4 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-bold text-white">원본</span>
        </div>
        <div className="relative rounded-2xl bg-white p-2" style={{ boxShadow: "0 5px 16px 0 rgba(0, 43, 141, 0.1)" }}>
          {scene && p ? <SceneSvg scene={scene} diffIds={p.diffIds} marks={marks} misses={misses} onTap={started && !result && !p.played ? tap : undefined} className={started && !result ? "cursor-crosshair" : ""} /> : <div className="aspect-[3/2] w-full animate-pulse rounded-2xl bg-[#eef0f4]" />}
          <span className="absolute left-4 top-4 rounded-full bg-[#427cff] px-2 py-0.5 text-[11px] font-bold text-white">여기서 찾기</span>
          {!started && !result && !p?.played && <div className="absolute inset-2 flex items-center justify-center rounded-2xl bg-black/35 backdrop-blur-[2px]"><button type="button" onClick={start} className="myb-press h-12 rounded-xl bg-white px-6 text-[15px] font-bold text-[#191f28]">시작하기 · {p?.limitSec ?? 75}초</button></div>}
          {result && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {result.found === result.total && <Lottie src="/myb/lottie_confetti_pop.json" className="h-[260px] w-[260px]" />}
            </div>
          )}
        </div>
        {started && !result && (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" disabled={hintUsed} onClick={hint} className="myb-press h-11 rounded-xl border border-[#dee2e9] bg-white text-[14px] font-bold disabled:opacity-40">💡 힌트 {hintUsed ? "사용함" : "1회"}</button>
            <button type="button" disabled={busy} onClick={() => void submit(foundRef.current)} className="myb-press h-11 rounded-xl bg-[#191f28] text-[14px] font-bold text-white disabled:opacity-40">그만 찾기 ({found.length}/{p?.total ?? 5})</button>
          </div>
        )}
        {result && (
          <div className="rounded-[20px] bg-white p-5 text-center" style={{ boxShadow: "0 5px 16px 0 rgba(0, 43, 141, 0.1)" }}>
            <p className="text-[20px] font-extrabold">{result.found}/{result.total} 찾았어요 {result.found === result.total ? "🎉" : ""}</p>
            <p className="mt-1 text-[14px] font-bold text-[#427cff]">+{fmt(result.points)}P</p>
            <p className="mt-2 text-[12px] text-[#8b94a0]">초록 원 = 찾은 곳 · 분홍 점선 = 놓친 곳</p>
            <button type="button" onClick={() => router.push("/games")} className="myb-press mt-4 h-11 w-full rounded-xl bg-[#427cff] text-[14px] font-bold text-white">다른 게임 하러 가기</button>
          </div>
        )}
        <p className="text-[11px] text-[#b0b8c1]">틀리게 탭하면 3초가 줄어요. 그림은 매일 0시에 바뀌고 모두 같은 그림을 풀어요.</p>
      </div>
    </div>
  );
}

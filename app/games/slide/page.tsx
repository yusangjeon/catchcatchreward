"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameHeader } from "@/components/games/GameHeader";
import { useToast } from "@/components/motion/Toast";
import { fmt } from "@/hooks/useHome";
import type { GamesPayload } from "@/lib/games/service";

type Grid = number[][];
const N = 4;
const COLOR: Record<number, string> = { 2: "#eef2ff", 4: "#dbe4ff", 8: "#ffd6a5", 16: "#ffb86b", 32: "#ff9b5c", 64: "#ff7a45", 128: "#ffe08a", 256: "#ffd84a", 512: "#ffcc1a", 1024: "#ffc400", 2048: "#427cff" };

function empty(): Grid { return Array.from({ length: N }, () => Array(N).fill(0)); }
function addTile(g: Grid): Grid {
  const cells: [number, number][] = [];
  g.forEach((r, i) => r.forEach((v, j) => { if (!v) cells.push([i, j]); }));
  if (!cells.length) return g;
  const [i, j] = cells[Math.floor(Math.random() * cells.length)];
  const n = g.map((r) => [...r]); n[i][j] = Math.random() < 0.9 ? 2 : 4; return n;
}
function slideRow(row: number[]): { row: number[]; gain: number } {
  const a = row.filter((v) => v); let gain = 0; const out: number[] = [];
  for (let i = 0; i < a.length; i++) { if (a[i] === a[i + 1]) { out.push(a[i] * 2); gain += a[i] * 2; i++; } else out.push(a[i]); }
  while (out.length < N) out.push(0);
  return { row: out, gain };
}
function move(g: Grid, dir: "L" | "R" | "U" | "D"): { g: Grid; gain: number; moved: boolean } {
  const rot = (m: Grid) => m[0].map((_, j) => m.map((r) => r[j]));
  let m = g.map((r) => [...r]);
  if (dir === "U" || dir === "D") m = rot(m);
  if (dir === "R" || dir === "D") m = m.map((r) => [...r].reverse());
  let gain = 0;
  m = m.map((r) => { const s = slideRow(r); gain += s.gain; return s.row; });
  if (dir === "R" || dir === "D") m = m.map((r) => [...r].reverse());
  if (dir === "U" || dir === "D") m = rot(m);
  const moved = JSON.stringify(m) !== JSON.stringify(g);
  return { g: m, gain, moved };
}
function canMove(g: Grid): boolean { return (["L", "R", "U", "D"] as const).some((d) => move(g, d).moved); }

/** 2048 — 스와이프/화살표. 게임 종료 또는 "기록 제출"로 하루 1회 보상 */
export default function SlidePage() {
  const router = useRouter();
  const { show } = useToast();
  const [grid, setGrid] = useState<Grid>(empty); // SSR 과 동일하게 비워두고 마운트 후 타일 추가(하이드레이션 불일치 방지)
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [left, setLeft] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<{ points: number } | null>(null);
  const [best, setBest] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const maxTile = Math.max(...grid.flat());

  useEffect(() => {
    fetch("/api/games", { cache: "no-store" }).then((r) => r.json()).then((d: GamesPayload) => setLeft(d.games.find((g) => g.key === "slide")?.left ?? 0)).catch(() => {});
    try { setBest(Number(localStorage.getItem("ccr_2048_best") ?? 0)); } catch { /* noop */ }
    setGrid(addTile(addTile(empty())));
  }, []);

  const doMove = useCallback((dir: "L" | "R" | "U" | "D") => {
    if (over || submitted) return;
    setGrid((g) => {
      const r = move(g, dir);
      if (!r.moved) return g;
      const n = addTile(r.g);
      setScore((s) => { const ns = s + r.gain; try { if (ns > best) { setBest(ns); localStorage.setItem("ccr_2048_best", String(ns)); } } catch { /* noop */ } return ns; });
      if (!canMove(n)) setOver(true);
      return n;
    });
  }, [over, submitted, best]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { const m: Record<string, "L" | "R" | "U" | "D"> = { ArrowLeft: "L", ArrowRight: "R", ArrowUp: "U", ArrowDown: "D" }; if (m[e.key]) { e.preventDefault(); doMove(m[e.key]); } };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [doMove]);

  async function submit() {
    if (submitted || left === 0) return;
    try {
      const res = await fetch("/api/games/slide", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ score, maxTile }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message ?? "실패");
      setSubmitted({ points: j.points }); setLeft(0);
      show(`${fmt(score)}점 기록 · +${fmt(j.points)}P`);
    } catch (e) {
      show(e instanceof Error ? e.message : "실패", "info");
    }
  }
  function reset() { setGrid(addTile(addTile(empty()))); setScore(0); setOver(false); }

  return (
    <div className="min-h-dvh bg-[#f8f9fc] pb-10 text-[#191f28]">
      <GameHeader title="2048 퍼즐" right={left === null ? null : <span>{left > 0 ? "오늘 1회 보상" : "보상 완료"}</span>} />
      <div className="flex flex-col gap-4 px-5 pt-[64px]">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[["점수", fmt(score)], ["최고 타일", fmt(maxTile)], ["최고 기록", fmt(best)]].map(([k, v]) => <div key={k} className="rounded-xl bg-white py-2" style={{ boxShadow: "0 2px 8px rgba(0,43,141,.06)" }}><p className="text-[11px] text-[#8b94a0]">{k}</p><p className="text-[18px] font-extrabold tabular-nums">{v}</p></div>)}
        </div>
        <div
          className="relative select-none rounded-2xl bg-[#bbc3d4] p-2 touch-none"
          onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
          onTouchEnd={(e) => { if (!touch.current) return; const dx = e.changedTouches[0].clientX - touch.current.x, dy = e.changedTouches[0].clientY - touch.current.y; touch.current = null; if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return; doMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "R" : "L") : dy > 0 ? "D" : "U"); }}
        >
          <div className="grid grid-cols-4 gap-2">
            {grid.flat().map((v, i) => (
              <div key={i} className={`flex aspect-square items-center justify-center rounded-xl font-extrabold tabular-nums transition-all ${v ? "myb-pop-in" : ""}`} style={{ background: v ? COLOR[v] ?? "#191f28" : "#cdd3e0", color: v >= 2048 ? "#fff" : v >= 8 && v < 128 ? "#fff" : "#191f28", fontSize: v >= 1024 ? 20 : v >= 128 ? 24 : 28 }}>{v || ""}</div>
            ))}
          </div>
          {over && <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/50 text-white"><p className="text-[22px] font-extrabold">게임 종료</p><p className="mt-1 text-[14px]">{fmt(score)}점 · 최고 타일 {maxTile}</p></div>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={reset} className="myb-press h-12 rounded-xl border border-[#dee2e9] bg-white text-[14px] font-bold">새 게임</button>
          <button type="button" disabled={!!submitted || left === 0 || score === 0} onClick={() => void submit()} className="myb-press h-12 rounded-xl bg-[#427cff] text-[14px] font-bold text-white disabled:opacity-40">{submitted ? `+${fmt(submitted.points)}P 받음` : "기록 제출하고 보상"}</button>
        </div>
        <p className="text-[12px] text-[#8b94a0]">스와이프(또는 방향키)로 같은 숫자를 합치세요. 보상: 1024 타일·1만점 50P · 512·5천점 30P · 256·2천점 15P · 그 외 5P. 하루 1회.</p>
        <button type="button" onClick={() => router.push("/games")} className="text-center text-[13px] text-[#427cff]">다른 게임 보기 →</button>
      </div>
    </div>
  );
}

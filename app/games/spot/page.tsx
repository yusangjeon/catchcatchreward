"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/motion/Toast";
import { fmt } from "@/hooks/useHome";

/* eslint-disable @next/next/no-img-element */

interface Puzzle { dayKey: string; left: string[]; right: string[]; rows: number; cols: number; diffs: number; played: boolean; lastResult?: string; limitSec: number }
interface Result { found: number; total: number; diffs: number[]; points: number }

/** 틀린그림 찾기 — 위 그림과 다른 칸을 아래 그림에서 탭. 60초. 정답은 제출 후 서버가 알려줌 */
export default function SpotPage() {
  const router = useRouter();
  const { show } = useToast();
  const [p, setP] = useState<Puzzle | null>(null);
  const [picks, setPicks] = useState<number[]>([]);
  const [left, setLeft] = useState(60);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/games/spot", { cache: "no-store" }).then((r) => r.json()).then((d: Puzzle) => { setP(d); setLeft(d.limitSec); }).catch(() => {});
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  async function submit(current: number[]) {
    if (busy || result) return;
    setBusy(true);
    if (timer.current) clearInterval(timer.current);
    try {
      const res = await fetch("/api/games/spot", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ picks: current }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message ?? "제출 실패");
      setResult(j as Result);
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
      if (s <= 1) { if (timer.current) clearInterval(timer.current); setTimeout(() => void submitRef.current(), 0); return 0; }
      return s - 1;
    }), 1000);
  }
  const submitRef = useRef(() => {});
  submitRef.current = () => void submit(picks);

  function tap(i: number) {
    if (!started || result) return;
    setPicks((prev) => {
      const next = prev.includes(i) ? prev.filter((x) => x !== i) : prev.length >= (p?.diffs ?? 5) ? prev : [...prev, i];
      return next;
    });
  }

  const diffSet = new Set(result?.diffs ?? []);
  const Board = ({ cells, interactive }: { cells: string[]; interactive: boolean }) => (
    <div className="grid gap-[3px] rounded-2xl bg-white p-2" style={{ gridTemplateColumns: `repeat(${p?.cols ?? 6}, 1fr)`, boxShadow: "0 5px 16px 0 rgba(0, 43, 141, 0.1)" }}>
      {cells.map((e, i) => {
        const picked = picks.includes(i);
        const isDiff = diffSet.has(i);
        const cls = result ? (isDiff ? (picked ? "bg-[#e9f7ef] ring-2 ring-[#1aa260]" : "bg-[#fff0f7] ring-2 ring-[#ff3e9a]") : picked ? "bg-[#f2f3f5] opacity-60" : "") : picked && interactive ? "bg-[#e8f1ff] ring-2 ring-[#427cff]" : "";
        return (
          <button key={i} type="button" disabled={!interactive} onClick={() => tap(i)} className={`flex aspect-square items-center justify-center rounded-lg text-[22px] leading-none ${cls}`} aria-label={`칸 ${i + 1}`}>{e}</button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-dvh bg-[#f8f9fc] pb-10 text-[#191f28]">
      <header className="fixed left-1/2 top-0 z-20 flex h-12 w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-[#f8f9fc] px-6">
        <button type="button" onClick={() => router.back()} aria-label="뒤로" className="flex h-7 w-7 items-center justify-center"><img src="/myb/shop/ic_left.png" width={28} height={28} alt="" className="h-7 w-7" /></button>
        <h1 className="text-[18px] font-semibold">틀린그림 찾기</h1>
        <span className={`w-14 text-right text-[18px] font-bold tabular-nums ${left <= 10 ? "text-[#ff3939]" : "text-[#427cff]"}`}>{started ? `${left}s` : ""}</span>
      </header>
      <div className="flex flex-col gap-3 px-6 pt-[60px]">
        <p className="text-[13px] text-[#5c6573]">위 그림과 <b>다른 칸 {p?.diffs ?? 5}개</b>를 아래 그림에서 찾아 탭하세요. 찾은 칸당 5P, 전부 찾으면 +10P.</p>
        {p?.played && !result && <p className="rounded-xl bg-[#fff6e5] px-4 py-3 text-[13px] text-[#9a5b00]">오늘은 이미 도전했어요 ({p.lastResult}). 내일 새 퍼즐이 나와요.</p>}
        {p ? <Board cells={p.left} interactive={false} /> : <div className="h-[260px] animate-pulse rounded-2xl bg-white" />}
        <p className="text-center text-[11px] text-[#b0b8c1]">▲ 원본 · ▼ 다른 그림</p>
        {p ? <Board cells={p.right} interactive={started && !result && !p.played} /> : <div className="h-[260px] animate-pulse rounded-2xl bg-white" />}
        {!started && p && !p.played && <button type="button" onClick={start} className="myb-press h-[52px] rounded-xl bg-[#427cff] text-[16px] font-bold text-white">시작하기 ({p.limitSec}초)</button>}
        {started && !result && <button type="button" disabled={busy || picks.length === 0} onClick={() => void submit(picks)} className="myb-press h-[52px] rounded-xl bg-[#191f28] text-[16px] font-bold text-white disabled:opacity-40">{picks.length}/{p?.diffs ?? 5} 선택 · 제출하기</button>}
        {result && (
          <div className="rounded-[20px] bg-white p-5 text-center" style={{ boxShadow: "0 5px 16px 0 rgba(0, 43, 141, 0.1)" }}>
            <p className="text-[20px] font-extrabold">{result.found}/{result.total} 찾았어요 {result.found === result.total ? "🎉" : ""}</p>
            <p className="mt-1 text-[14px] text-[#427cff]">+{fmt(result.points)}P</p>
            <p className="mt-2 text-[12px] text-[#8b94a0]">초록 = 맞춘 칸, 분홍 = 놓친 칸</p>
            <button type="button" onClick={() => router.push("/games")} className="myb-press mt-4 h-11 w-full rounded-xl bg-[#427cff] text-[14px] font-bold text-white">다른 게임 하러 가기</button>
          </div>
        )}
        <p className="text-[11px] text-[#b0b8c1]">퍼즐은 매일 0시에 바뀌고 모두 같은 퍼즐을 풀어요 ({p?.dayKey}).</p>
      </div>
    </div>
  );
}

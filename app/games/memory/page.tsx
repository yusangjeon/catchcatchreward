"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/motion/Toast";
import { fmt } from "@/hooks/useHome";
import type { GamesPayload } from "@/lib/games/service";

/* eslint-disable @next/next/no-img-element */

const POOL = ["🍎", "🍋", "🍇", "🍓", "🥝", "🍑", "🍒", "🍩", "🧁", "🍦", "🌸", "🍀", "🐶", "🐱", "🐼", "🦊", "⭐", "🎈", "🎁", "🚗"];
function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}

/** 카드 뒤집기 — 4×4 8쌍. 완료 시 시도 수·시간을 서버에 보내 보상(하루 1회) */
export default function MemoryPage() {
  const router = useRouter();
  const { show } = useToast();
  const [left, setLeft] = useState<number | null>(null);
  const [cards, setCards] = useState<string[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [sec, setSec] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState<{ points: number } | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const lock = useRef(false);

  useEffect(() => {
    fetch("/api/games", { cache: "no-store" }).then((r) => r.json()).then((d: GamesPayload) => setLeft(d.games.find((g) => g.key === "memory")?.left ?? 0)).catch(() => {});
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  function start() {
    const pick = shuffle(POOL).slice(0, 8);
    setCards(shuffle([...pick, ...pick])); setOpen([]); setMatched(new Set()); setMoves(0); setSec(0); setDone(null); setStarted(true);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setSec((s) => s + 1), 1000);
  }

  async function finish(finalMoves: number, finalSec: number) {
    if (timer.current) clearInterval(timer.current);
    try {
      const res = await fetch("/api/games/memory", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ moves: finalMoves, seconds: Math.max(5, finalSec) }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message ?? "실패");
      setDone({ points: j.points }); setLeft(0);
      show(`완료! ${finalMoves}회 · +${fmt(j.points)}P`);
    } catch (e) {
      setDone({ points: 0 });
      show(e instanceof Error ? e.message : "실패", "info");
    }
  }

  function flip(i: number) {
    if (!started || done || lock.current || open.includes(i) || matched.has(i)) return;
    const next = [...open, i];
    setOpen(next);
    if (next.length === 2) {
      lock.current = true;
      const m = moves + 1;
      setMoves(m);
      const [a, b] = next;
      if (cards[a] === cards[b]) {
        const nm = new Set(matched); nm.add(a); nm.add(b);
        setMatched(nm); setOpen([]); lock.current = false;
        if (nm.size === cards.length) void finish(m, sec);
      } else {
        setTimeout(() => { setOpen([]); lock.current = false; }, 650);
      }
    }
  }

  return (
    <div className="min-h-dvh bg-[#f8f9fc] pb-10 text-[#191f28]">
      <header className="fixed left-1/2 top-0 z-20 flex h-12 w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-[#f8f9fc] px-6">
        <button type="button" onClick={() => router.back()} aria-label="뒤로" className="flex h-7 w-7 items-center justify-center"><img src="/myb/shop/ic_left.png" width={28} height={28} alt="" className="h-7 w-7" /></button>
        <h1 className="text-[18px] font-semibold">카드 뒤집기</h1>
        <span className="w-20 text-right text-[13px] font-semibold tabular-nums text-[#5c6573]">{started ? `${moves}회 · ${sec}s` : left === 0 ? "오늘 완료" : ""}</span>
      </header>
      <div className="flex flex-col gap-4 px-6 pt-[64px]">
        <p className="text-[13px] text-[#5c6573]">같은 그림 2장을 찾아 8쌍을 모두 맞추세요. 16회 이내 15P · 24회 이내 10P · 완주 5P.</p>
        <div className="grid grid-cols-4 gap-2">
          {(started ? cards : Array.from({ length: 16 }, () => "")).map((c, i) => {
            const up = open.includes(i) || matched.has(i);
            return (
              <button key={i} type="button" onClick={() => flip(i)} aria-label={`카드 ${i + 1}`} className="aspect-square [perspective:600px]">
                <span className={`relative block h-full w-full transition-transform duration-300 [transform-style:preserve-3d] ${up ? "[transform:rotateY(180deg)]" : ""}`}>
                  <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#427cff] text-[22px] text-white [backface-visibility:hidden]">{started ? "?" : ""}</span>
                  <span className={`absolute inset-0 flex items-center justify-center rounded-xl text-[32px] [backface-visibility:hidden] [transform:rotateY(180deg)] ${matched.has(i) ? "bg-[#e9f7ef]" : "bg-white"}`} style={{ boxShadow: "0 2px 8px rgba(0,43,141,.08)" }}>{c}</span>
                </span>
              </button>
            );
          })}
        </div>
        {!started && <button type="button" disabled={left === 0} onClick={start} className="myb-press h-[52px] rounded-xl bg-[#427cff] text-[16px] font-bold text-white disabled:opacity-40">{left === 0 ? "오늘은 다 했어요. 내일 다시!" : "시작하기"}</button>}
        {done && (
          <div className="rounded-[20px] bg-white p-5 text-center" style={{ boxShadow: "0 5px 16px 0 rgba(0, 43, 141, 0.1)" }}>
            <p className="text-[20px] font-extrabold">{moves}회 · {sec}초 만에 완료 🎉</p>
            <p className="mt-1 text-[14px] text-[#427cff]">+{fmt(done.points)}P</p>
            <button type="button" onClick={() => router.push("/games")} className="myb-press mt-4 h-11 w-full rounded-xl bg-[#427cff] text-[14px] font-bold text-white">다른 게임 하러 가기</button>
          </div>
        )}
      </div>
    </div>
  );
}

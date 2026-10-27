"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GameHeader } from "@/components/games/GameHeader";
import { useToast } from "@/components/motion/Toast";
import { haptic, sfx } from "@/lib/fx";
import { burstAtPointer, confetti } from "@/lib/fxEngine";
import { fmt } from "@/hooks/useHome";
import type { GamesPayload } from "@/lib/games/service";

/* eslint-disable @next/next/no-img-element */

/** 카드 그림 — 브랜드 아이콘 16종 중 8쌍 */
const LOGOS = Array.from({ length: 16 }, (_, i) => `/quiz/covers/s${String(i + 1).padStart(2, "0")}.webp`);
function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}

/** 브랜드 짝 맞추기 — 4×4 8쌍. 완료 시 시도 수·시간을 서버에 보내 보상(하루 1회). 최고 기록은 기기에 저장 */
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
  const [best, setBest] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const lock = useRef(false);

  useEffect(() => {
    fetch("/api/games", { cache: "no-store" }).then((r) => r.json()).then((d: GamesPayload) => setLeft(d.games.find((g) => g.key === "memory")?.left ?? 0)).catch(() => {});
    try { const b = localStorage.getItem("ccr_memory_best"); if (b) setBest(Number(b)); } catch { /* noop */ }
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  function start() {
    const pick = shuffle(LOGOS).slice(0, 8);
    setCards(shuffle([...pick, ...pick])); setOpen([]); setMatched(new Set()); setMoves(0); setSec(0); setDone(null); setStarted(true);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setSec((s) => s + 1), 1000);
  }

  async function finish(finalMoves: number, finalSec: number) {
    if (timer.current) clearInterval(timer.current);
    try { if (best === null || finalMoves < best) { setBest(finalMoves); localStorage.setItem("ccr_memory_best", String(finalMoves)); } } catch { /* noop */ }
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
        haptic("success"); sfx(nm.size === cards.length ? "win" : "hit"); burstAtPointer("sparkle"); if (nm.size === cards.length) setTimeout(() => confetti(140), 300);
        if (nm.size === cards.length) void finish(m, sec);
      } else {
        haptic("tap"); sfx("miss");
        setTimeout(() => { setOpen([]); lock.current = false; }, 650);
      }
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-10 text-[#191f28]">
      <GameHeader title="브랜드 짝 맞추기" right={started ? <span className="text-[var(--color-myb)]">{moves}회 · {sec}s</span> : left === 0 ? <span>오늘 완료</span> : null} />
      <div className="flex flex-col gap-4 px-5 pt-[64px]">
        <div className="flex items-center justify-between text-[13px] text-[#5c6573]">
          <p>같은 브랜드 2장을 찾아 8쌍을 맞추세요</p>
          <p>최고 기록 <b className="text-[#191f28]">{best ?? "-"}</b>회</p>
        </div>
        <div className="relative grid grid-cols-4 gap-2">
          {(started ? cards : Array.from({ length: 16 }, () => "")).map((c, i) => {
            const up = open.includes(i) || matched.has(i);
            return (
              <button key={i} type="button" onClick={() => flip(i)} aria-label={`카드 ${i + 1}`} className="aspect-square [perspective:600px]">
                <span className={`relative block h-full w-full transition-transform duration-300 [transform-style:preserve-3d] ${up ? "[transform:rotateY(180deg)]" : ""}`}>
                  <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-myb)] to-[#ff8a5c] [backface-visibility:hidden]"><img src="/icons/icon-192.png" alt="" className="h-7 w-7 rounded-md opacity-90" /></span>
                  <span className={`absolute inset-0 flex items-center justify-center rounded-xl bg-white p-2 [backface-visibility:hidden] [transform:rotateY(180deg)] ${matched.has(i) ? "ring-2 ring-[#22c55e]" : ""}`} style={{ boxShadow: "0 2px 8px rgba(40,24,14,.08)" }}>{c && <img src={c} alt="" className="h-full w-full rounded-full object-contain" />}</span>
                </span>
              </button>
            );
          })}
          {done && done.points > 0 && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"></div>}
        </div>
        {!started && <button type="button" disabled={left === 0} onClick={start} className="myb-press h-[52px] rounded-xl bg-[var(--color-myb)] text-[16px] font-bold text-white disabled:opacity-40">{left === 0 ? "오늘은 다 했어요. 내일 다시!" : "시작하기"}</button>}
        {done && (
          <div className="rounded-[20px] bg-white p-5 text-center" style={{ boxShadow: "0 5px 16px 0 rgba(40, 24, 14, 0.09)" }}>
            <p className="text-[20px] font-extrabold">{moves}회 · {sec}초 만에 완료</p>
            <p className="mt-1 text-[14px] font-bold text-[var(--color-myb)]">+{fmt(done.points)}P</p>
            <p className="mt-1 text-[12px] text-[#8b94a0]">16회 이내 15P · 24회 이내 10P · 완주 5P</p>
            <button type="button" onClick={() => router.push("/games")} className="myb-press mt-4 h-11 w-full rounded-xl bg-[var(--color-myb)] text-[14px] font-bold text-white">다른 게임 하러 가기</button>
          </div>
        )}
      </div>
    </div>
  );
}

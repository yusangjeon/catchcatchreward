"use client";

/* eslint-disable @next/next/no-img-element */

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GameHeader } from "@/components/games/GameHeader";
import { Lottie } from "@/components/motion/Lottie";
import { useToast } from "@/components/motion/Toast";
import { haptic, sfx } from "@/lib/fx";
import { burst, confetti } from "@/lib/fxEngine";
import { fmt } from "@/hooks/useHome";
import type { GamesPayload } from "@/lib/games/service";

const ART: Record<string, string> = { "🍀": "clover", "🍒": "cherry", "🔔": "bell", "⭐": "star", "💎": "diamond", "🎁": "gift" };
const Sym = ({ s, size = 56 }: { s: string; size?: number }) => (ART[s] ? <img src={`/games/art/${ART[s]}.png`} alt={s} width={size} height={size} className="object-contain" style={{ width: size, height: size }} /> : <span>{s}</span>);

/** 복권 긁기 — 3×3 칸. 같은 그림 3개면 당첨. 당첨은 복권을 받는 순간 서버가 정하고 그리드도 서버가 만든다 */
export default function ScratchPage() {
  const router = useRouter();
  const { show } = useToast();
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const [ticket, setTicket] = useState<{ points: number; grid: string[]; symbol: string | null } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const drawing = useRef(false);

  useEffect(() => {
    fetch("/api/games", { cache: "no-store" }).then((r) => r.json()).then((d: GamesPayload) => setLeft(d.games.find((g) => g.key === "scratch")?.left ?? 0)).catch(() => {});
  }, []);

  function paintCover() {
    const c = canvas.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.globalCompositeOperation = "source-over";
    const g = ctx.createLinearGradient(0, 0, c.width, c.height);
    g.addColorStop(0, "#d4d8e2"); g.addColorStop(0.5, "#aeb5c4"); g.addColorStop(1, "#8f98aa");
    ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "rgba(255,255,255,.35)";
    for (let i = 0; i < 40; i++) ctx.fillRect(Math.random() * c.width, Math.random() * c.height, 2, 2);
    ctx.fillStyle = "#fff"; ctx.font = "bold 20px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("동전으로 긁듯이 문질러 보세요", c.width / 2, c.height / 2 + 7);
  }

  async function buy() {
    if (busy || left === 0) return;
    setBusy(true);
    try {
      const res = await fetch("/api/games/scratch", { method: "POST" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message ?? "실패");
      setTicket(j); setLeft(0); setRevealed(false); setPct(0);
      setTimeout(paintCover, 50);
    } catch (e) {
      show(e instanceof Error ? e.message : "실패", "info");
    } finally {
      setBusy(false);
    }
  }

  function measure(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const data = ctx.getImageData(0, 0, w, h).data;
    let clear = 0, total = 0;
    for (let i = 3; i < data.length; i += 4 * 9) { total++; if (data[i] === 0) clear++; }
    return clear / total;
  }

  function scratchAt(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!ticket || revealed) return;
    const c = canvas.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const r = c.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * c.width, y = ((e.clientY - r.top) / r.height) * c.height;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath(); ctx.arc(x, y, 24, 0, Math.PI * 2); ctx.fill();
    if (Math.random() < 0.18) burst("sparkle", e.clientX, e.clientY);
    const p = measure(ctx, c.width, c.height);
    setPct(p);
    if (p > 0.55) {
      setRevealed(true);
      ctx.clearRect(0, 0, c.width, c.height);
      if (ticket.points >= 50) { haptic("jackpot"); sfx("win"); confetti(180); burst("coins", window.innerWidth / 2, window.innerHeight / 2); } else if (ticket.points > 0) { haptic("success"); sfx("coin"); burst("coins", window.innerWidth / 2, window.innerHeight / 2); burst("stars", window.innerWidth / 2, window.innerHeight / 2); } else { haptic("warn"); sfx("lose"); }
      show(ticket.points > 0 ? `축하해요! ${ticket.symbol} 3개 · ${fmt(ticket.points)}P 당첨` : "꽝… 내일 다시 긁어봐요", ticket.points > 0 ? undefined : "info");
    }
  }

  const winIdx = new Set(ticket?.symbol ? ticket.grid.map((g, i) => (g === ticket.symbol ? i : -1)).filter((i) => i >= 0) : []);

  return (
    <div className="min-h-dvh bg-[#f8f9fc] pb-10 text-[#191f28]">
      <GameHeader title="복권 긁기" right={left === null ? null : <span>{left > 0 ? "오늘 1장" : "오늘 완료"}</span>} />
      <div className="flex flex-col items-center gap-4 px-5 pt-[64px]">
        <div className="relative w-full overflow-hidden rounded-[24px] p-4" style={{ background: "linear-gradient(135deg,#ffe9a8,#ffb86b 60%,#ff8a3d)", boxShadow: "0 10px 30px rgba(255,138,61,.35)" }}>
          <div className="flex items-center justify-between px-1">
            <p className="text-[13px] font-extrabold tracking-wide text-[#7a3f00]">캐치캐치 복권</p>
            <p className="text-[11px] font-bold text-[#7a3f00]/70">같은 그림 3개 = 당첨</p>
          </div>
          <div className="relative mt-3 rounded-2xl bg-white p-3">
            <div className="grid grid-cols-3 gap-2">
              {(ticket?.grid ?? Array(9).fill("?")).map((g, i) => (
                <div key={i} className={`flex aspect-square items-center justify-center rounded-xl text-[34px] ${revealed && winIdx.has(i) ? "bg-[#fff0b3] ring-2 ring-[#ff8a3d]" : "bg-[#f8f9fc]"}`}>{g === "?" ? <span className="text-[#c5cbd3]">?</span> : <Sym s={g} size={64} />}</div>
              ))}
            </div>
            {ticket && !revealed && <canvas ref={canvas} width={330} height={330} onPointerDown={(e) => { drawing.current = true; scratchAt(e); }} onPointerMove={(e) => { if (drawing.current || e.pointerType === "touch") scratchAt(e); }} onPointerUp={() => (drawing.current = false)} onPointerLeave={() => (drawing.current = false)} className="absolute inset-3 h-[calc(100%-24px)] w-[calc(100%-24px)] touch-none rounded-2xl" />}
            {revealed && ticket && ticket.points > 0 && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><Lottie src="/myb/lottie_confetti_pop.json" className="h-[300px] w-[300px]" /></div>}
          </div>
          <div className="mt-3 flex items-center justify-between px-1 text-[12px] font-bold text-[#7a3f00]">
            <span className="flex items-center gap-1"><Sym s="🍒" size={18} />5P <Sym s="🔔" size={18} />10P <Sym s="⭐" size={18} />50P <Sym s="💎" size={18} />500P</span>
            {ticket && !revealed && <span>{Math.round(pct * 100)}% 긁음</span>}
          </div>
        </div>
        {revealed && ticket && <p className={`text-[22px] font-extrabold ${ticket.points > 0 ? "text-[#ff8a3d]" : "text-[#8b94a0]"}`}>{ticket.points > 0 ? `${fmt(ticket.points)}P 당첨!` : "꽝 — 내일 또 도전"}</p>}
        {!ticket ? (
          <button type="button" disabled={busy || left === 0} onClick={() => void buy()} className="myb-press h-[52px] w-full rounded-xl bg-[#427cff] text-[16px] font-bold text-white disabled:opacity-40">{left === 0 ? "오늘은 다 긁었어요" : "오늘의 복권 받기 (무료)"}</button>
        ) : revealed ? (
          <button type="button" onClick={() => router.push("/games")} className="myb-press h-[52px] w-full rounded-xl bg-[#191f28] text-[16px] font-bold text-white">다른 게임 하러 가기</button>
        ) : null}
        <p className="text-center text-[12px] text-[#8b94a0]">당첨 확률 0P 50% · 5P 25% · 10P 15% · 50P 8% · 500P 2%. 결과는 복권을 받는 순간 서버에서 정해져요.</p>
      </div>
    </div>
  );
}

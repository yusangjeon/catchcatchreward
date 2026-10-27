"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { GameHeader } from "@/components/games/GameHeader";
import { Avatar } from "@/components/icons";
import { useToast } from "@/components/motion/Toast";
import { haptic, sfx } from "@/lib/fx";
import { burst, confetti } from "@/lib/fxEngine";
import { fmt } from "@/hooks/useHome";
import type { GamesPayload } from "@/lib/games/service";

type C = "rock" | "paper" | "scissors";
const EMOJI: Record<C, string> = { rock: "✊", paper: "✋", scissors: "✌️" };
const HAND: Record<C, string> = { rock: "/games/art/rock.png", paper: "/games/art/paper.png", scissors: "/games/art/scissors.png" };
const LABEL: Record<C, string> = { rock: "바위", paper: "보", scissors: "가위" };
const OPP = ["민지", "준호", "서연", "도윤", "하은"];

/** 가위바위보 — 카운트다운 "가위·바위·보!" → 결과. 승 10P, 3연승마다 +20P. 하루 3판 */
export default function RspPage() {
  const { show } = useToast();
  const [left, setLeft] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "count" | "result">("idle");
  const [count, setCount] = useState("");
  const [round, setRound] = useState<{ choice: C; cpu: C; result: string; points: number; bonus: number; streak: number } | null>(null);
  const [opp, setOpp] = useState(0);
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    fetch("/api/games", { cache: "no-store" }).then((r) => r.json()).then((d: GamesPayload) => setLeft(d.games.find((g) => g.key === "rsp")?.left ?? 0)).catch(() => {});
    setOpp(Math.floor(Math.random() * OPP.length));
  }, []);
  async function play(choice: C) {
    if (phase === "count" || left === 0) return;
    setPhase("count"); setRound(null);
    const seq = ["가위", "바위", "보!"];
    for (const w of seq) { setCount(w); await new Promise((r) => setTimeout(r, 420)); }
    try {
      const res = await fetch("/api/games/rsp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ choice }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message ?? "실패");
      setRound(j); setLeft(j.left); setStreak(j.streak); setPhase("result");
      if (j.result === "win") { haptic(j.bonus ? "jackpot" : "success"); sfx("win"); burst("stars", window.innerWidth / 2, 260); burst("coins", window.innerWidth / 2, 300); if (j.bonus) setTimeout(() => confetti(120), 200); } else if (j.result === "draw") { haptic("tap"); sfx("pop"); } else { haptic("error"); sfx("lose"); }
      show(j.result === "win" ? `이겼어요! +${j.points}P${j.bonus ? ` (${j.streak}연승 보너스 포함)` : ""}` : j.result === "draw" ? `비겼어요 · +${j.points}P` : "졌어요… 한 판 더!", j.result === "lose" ? "info" : undefined);
    } catch (e) {
      setPhase("idle");
      show(e instanceof Error ? e.message : "실패", "info");
    }
  }
  const title = round ? (round.result === "win" ? "승리!" : round.result === "draw" ? "무승부" : "패배") : "";
  return (
    <div className="min-h-dvh bg-[#0f172a] pb-10 text-white">
      <GameHeader title="가위바위보" dark right={left === null ? null : <span className="text-white/80">{left}판 남음</span>} />
      <div className="flex flex-col items-center gap-5 px-5 pt-[64px]">
        <div className="flex w-full items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
          <div className="flex items-center gap-2"><Avatar seed={OPP[opp]} size={34} /><div><p className="text-[13px] font-bold">{OPP[opp]}</p><p className="text-[11px] text-white/60">오늘의 상대</p></div></div>
          <div className="text-right"><p className="text-[11px] text-white/60">연승</p><p className="text-[18px] font-bold text-[var(--color-gold)]">{streak}</p></div>
        </div>
        <div className="relative flex h-[230px] w-full items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-b from-[#1e293b] to-[#0b1220]">
          {phase === "count" && <p key={count} className="myb-pop-in text-[44px] font-bold tracking-wider text-[var(--color-gold)]">{count}</p>}
          {phase === "result" && round && (
            <div className="flex items-center gap-6">
              <div className="text-center"><p className="text-[12px] text-white/60">나</p><img src={HAND[round.choice]} alt={EMOJI[round.choice]} className="myb-pop-in h-[96px] w-[96px] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,.45)]" /></div>
              <p className={`text-[22px] font-bold ${round.result === "win" ? "text-[#4ade80]" : round.result === "draw" ? "text-[#fbbf24]" : "text-white/50"}`}>{title}</p>
              <div className="text-center"><p className="text-[12px] text-white/60">{OPP[opp]}</p><img src={HAND[round.cpu]} alt={EMOJI[round.cpu]} className="myb-pop-in h-[96px] w-[96px] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,.45)]" style={{ transform: "scaleX(-1)" }} /></div>
            </div>
          )}
          {phase === "idle" && <p className="text-[15px] text-white/60">{left === 0 ? "오늘 3판 다 했어요. 내일 또 해요!" : "아래에서 하나를 고르면 바로 시작!"}</p>}
        </div>
        {round && round.points > 0 && <p className="text-[18px] font-bold text-[#4ade80]">+{fmt(round.points)}P {round.bonus ? <span className="text-[13px] text-[var(--color-gold)]">연승 보너스 +{round.bonus}</span> : null}</p>}
        <div className="grid w-full grid-cols-3 gap-3">
          {(["scissors", "rock", "paper"] as C[]).map((c) => (
            <button key={c} type="button" disabled={phase === "count" || left === 0} onClick={() => void play(c)} className="myb-press flex h-[112px] flex-col items-center justify-center rounded-2xl bg-white/10 transition hover:bg-white/15 disabled:opacity-40">
              <img src={HAND[c]} alt={EMOJI[c]} className="h-[64px] w-[64px] object-contain" /><span className="mt-1 text-[13px] font-semibold text-white/80">{LABEL[c]}</span>
            </button>
          ))}
        </div>
        <p className="text-[12px] text-white/50">승 10P · 무 3P · 3연승마다 +20P. 상대의 손은 서버 난수로 정해져요.</p>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/motion/Toast";
import { fmt } from "@/hooks/useHome";
import type { GamesPayload } from "@/lib/games/service";

/* eslint-disable @next/next/no-img-element */

type C = "rock" | "paper" | "scissors";
const EMOJI: Record<C, string> = { rock: "✊", paper: "✋", scissors: "✌️" };
const LABEL: Record<C, string> = { rock: "바위", paper: "보", scissors: "가위" };

/** 가위바위보 — 하루 3판, 서버 난수. 승 10P · 무 3P */
export default function RspPage() {
  const router = useRouter();
  const { show } = useToast();
  const [left, setLeft] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [round, setRound] = useState<{ choice: C; cpu: C; result: string; points: number } | null>(null);
  const [shaking, setShaking] = useState(false);
  useEffect(() => {
    fetch("/api/games", { cache: "no-store" }).then((r) => r.json()).then((d: GamesPayload) => setLeft(d.games.find((g) => g.key === "rsp")?.left ?? 0)).catch(() => {});
  }, []);
  async function play(choice: C) {
    if (busy || left === 0) return;
    setBusy(true); setShaking(true); setRound(null);
    try {
      const [res] = await Promise.all([fetch("/api/games/rsp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ choice }) }), new Promise((r) => setTimeout(r, 900))]);
      const j = await res.json();
      if (!res.ok) throw new Error(j.message ?? "실패");
      setRound(j); setLeft(j.left);
      show(j.result === "win" ? `이겼어요! +${j.points}P` : j.result === "draw" ? `비겼어요 · +${j.points}P` : "졌어요… 다시!", j.result === "lose" ? "info" : undefined);
    } catch (e) {
      show(e instanceof Error ? e.message : "실패", "info");
    } finally {
      setShaking(false); setBusy(false);
    }
  }
  return (
    <div className="min-h-dvh bg-[#f8f9fc] pb-10 text-[#191f28]">
      <header className="fixed left-1/2 top-0 z-20 flex h-12 w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-[#f8f9fc] px-6">
        <button type="button" onClick={() => router.back()} aria-label="뒤로" className="flex h-7 w-7 items-center justify-center"><img src="/myb/shop/ic_left.png" width={28} height={28} alt="" className="h-7 w-7" /></button>
        <h1 className="text-[18px] font-semibold">가위바위보</h1>
        <span className="w-16 text-right text-[13px] font-semibold text-[#5c6573]">{left === null ? "" : `${left}판 남음`}</span>
      </header>
      <div className="flex flex-col items-center gap-5 px-6 pt-[70px]">
        <div className="flex h-[200px] w-full items-center justify-center rounded-[24px] bg-white" style={{ boxShadow: "0 5px 16px 0 rgba(0, 43, 141, 0.1)" }}>
          {shaking ? <span className="animate-bounce text-[72px]">✊</span> : round ? (
            <div className="flex items-center gap-6">
              <div className="text-center"><p className="text-[12px] text-[#8b94a0]">나</p><p className="text-[56px]">{EMOJI[round.choice]}</p></div>
              <p className={`text-[20px] font-extrabold ${round.result === "win" ? "text-[#427cff]" : round.result === "draw" ? "text-[#ff8a3d]" : "text-[#8b94a0]"}`}>{round.result === "win" ? "승리!" : round.result === "draw" ? "무승부" : "패배"}</p>
              <div className="text-center"><p className="text-[12px] text-[#8b94a0]">상대</p><p className="text-[56px]">{EMOJI[round.cpu]}</p></div>
            </div>
          ) : <p className="text-[15px] text-[#8b94a0]">{left === 0 ? "오늘 3판 다 했어요. 내일 또 해요!" : "아래에서 하나를 고르세요"}</p>}
        </div>
        {round && round.points > 0 && <p className="text-[16px] font-bold text-[#427cff]">+{fmt(round.points)}P 적립</p>}
        <div className="grid w-full grid-cols-3 gap-3">
          {(["scissors", "rock", "paper"] as C[]).map((c) => (
            <button key={c} type="button" disabled={busy || left === 0} onClick={() => void play(c)} className="myb-press flex h-[96px] flex-col items-center justify-center rounded-2xl bg-white text-[40px] disabled:opacity-40" style={{ boxShadow: "0 2px 10px 0 rgba(0, 43, 141, 0.06)" }}>
              {EMOJI[c]}<span className="mt-1 text-[13px] font-semibold">{LABEL[c]}</span>
            </button>
          ))}
        </div>
        <p className="text-[12px] text-[#8b94a0]">승 10P · 무 3P · 패 0P. 결과는 서버 난수로 정해져요.</p>
      </div>
    </div>
  );
}

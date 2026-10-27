"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/motion/Toast";
import { fmt } from "@/hooks/useHome";
import type { GamesPayload } from "@/lib/games/service";

/* eslint-disable @next/next/no-img-element */

/** 복권 긁기 — 하루 1장. 서버가 당첨을 먼저 정하고(POST), 캔버스를 긁어 드러냄 */
export default function ScratchPage() {
  const router = useRouter();
  const { show } = useToast();
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const [prize, setPrize] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const scratched = useRef(0);

  useEffect(() => {
    fetch("/api/games", { cache: "no-store" }).then((r) => r.json()).then((d: GamesPayload) => setLeft(d.games.find((g) => g.key === "scratch")?.left ?? 0)).catch(() => {});
  }, []);

  function paintCover() {
    const c = canvas.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const g = ctx.createLinearGradient(0, 0, c.width, c.height);
    g.addColorStop(0, "#c9ced8"); g.addColorStop(1, "#9aa3b2");
    ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#fff"; ctx.font = "bold 22px sans-serif"; ctx.textAlign = "center"; ctx.fillText("여기를 긁어보세요", c.width / 2, c.height / 2 + 8);
  }

  async function buy() {
    if (busy || left === 0) return;
    setBusy(true);
    try {
      const res = await fetch("/api/games/scratch", { method: "POST" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message ?? "실패");
      setPrize(j.points); setLeft(0); setRevealed(false); scratched.current = 0;
      setTimeout(paintCover, 50);
    } catch (e) {
      show(e instanceof Error ? e.message : "실패", "info");
    } finally {
      setBusy(false);
    }
  }

  function scratch(e: React.PointerEvent<HTMLCanvasElement>) {
    if (prize === null || revealed) return;
    if (e.buttons === 0 && e.pointerType === "mouse") return;
    const c = canvas.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const r = c.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * c.width, y = ((e.clientY - r.top) / r.height) * c.height;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill();
    scratched.current += 1;
    if (scratched.current > 60) {
      setRevealed(true);
      ctx.clearRect(0, 0, c.width, c.height);
      show(prize > 0 ? `축하해요! ${fmt(prize)}P 당첨` : "꽝… 내일 다시 긁어봐요", prize > 0 ? undefined : "info");
    }
  }

  return (
    <div className="min-h-dvh bg-[#f8f9fc] pb-10 text-[#191f28]">
      <header className="fixed left-1/2 top-0 z-20 flex h-12 w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-[#f8f9fc] px-6">
        <button type="button" onClick={() => router.back()} aria-label="뒤로" className="flex h-7 w-7 items-center justify-center"><img src="/myb/shop/ic_left.png" width={28} height={28} alt="" className="h-7 w-7" /></button>
        <h1 className="text-[18px] font-semibold">복권 긁기</h1>
        <span className="w-16 text-right text-[13px] font-semibold text-[#5c6573]">{left === null ? "" : left > 0 ? "오늘 1장" : "오늘 완료"}</span>
      </header>
      <div className="flex flex-col items-center gap-5 px-6 pt-[70px]">
        <div className="relative w-full overflow-hidden rounded-[24px] bg-gradient-to-br from-[#ffe9a8] to-[#ffb86b] p-5" style={{ boxShadow: "0 5px 16px 0 rgba(0, 43, 141, 0.1)" }}>
          <p className="text-[12px] font-bold text-[#9a5b00]">캐치캐치 복권 · 최대 500P</p>
          <div className="relative mt-3 flex h-[150px] items-center justify-center rounded-2xl bg-white">
            <p className={`text-[40px] font-extrabold ${prize && prize > 0 ? "text-[#427cff]" : "text-[#8b94a0]"}`}>{prize === null ? "?" : prize > 0 ? `${fmt(prize)}P` : "꽝"}</p>
            {prize !== null && !revealed && <canvas ref={canvas} width={340} height={150} onPointerDown={scratch} onPointerMove={scratch} className="absolute inset-0 h-full w-full touch-none rounded-2xl" />}
          </div>
        </div>
        {prize === null ? (
          <button type="button" disabled={busy || left === 0} onClick={() => void buy()} className="myb-press h-[52px] w-full rounded-xl bg-[#427cff] text-[16px] font-bold text-white disabled:opacity-40">{left === 0 ? "오늘은 다 긁었어요" : "복권 받기 (무료)"}</button>
        ) : revealed ? (
          <button type="button" onClick={() => router.push("/games")} className="myb-press h-[52px] w-full rounded-xl bg-[#191f28] text-[16px] font-bold text-white">다른 게임 하러 가기</button>
        ) : <p className="text-[13px] text-[#5c6573]">손가락으로 회색 부분을 긁어 결과를 확인하세요</p>}
        <p className="text-[12px] text-[#8b94a0]">0P 50% · 5P 25% · 10P 15% · 50P 8% · 500P 2%. 당첨은 복권을 받는 순간 서버에서 정해져요.</p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { REWARD_EVENT, type RewardOpts } from "@/lib/reward";
import { confetti, burst } from "@/lib/fxEngine";
import { haptic, sfx } from "@/lib/fx";
import { PCoin } from "@/components/icons";

/* eslint-disable @next/next/no-img-element */

type Item = RewardOpts & { resolve: () => void; id: number };

/** 전역 보상 오버레이 — 레이아웃에 1개. z-1400(파티클 레이어 1500 아래) */
export function RewardLayer() {
  const [item, setItem] = useState<Item | null>(null);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<Item>).detail;
      setLeaving(false);
      setItem({ ...d, id: Date.now() });
    };
    window.addEventListener(REWARD_EVENT, on);
    return () => window.removeEventListener(REWARD_EVENT, on);
  }, []);

  useEffect(() => {
    if (!item) return;
    const big = (item.variant ?? "big") === "big";
    timers.current.forEach(clearTimeout); timers.current = [];
    const t = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
    haptic(big ? "jackpot" : "success"); sfx(big ? "win" : "coin");
    if (big) {
      t(() => burst("sparkle", window.innerWidth / 2, 96), 120);
      t(() => { confetti(big ? 120 : 60); burst("coins", window.innerWidth / 2, window.innerHeight * 0.46); }, 480);
    } else {
      t(() => burst("stars", window.innerWidth / 2, window.innerHeight * 0.42), 160);
    }
    const hold = item.holdMs ?? (big ? 2500 : 1200);
    t(() => setLeaving(true), hold);
    t(() => { setItem(null); item.resolve(); }, hold + (big ? 300 : 200));
    return () => { timers.current.forEach(clearTimeout); };
  }, [item]);

  if (!item) return null;
  const big = (item.variant ?? "big") === "big";
  const skip = () => { timers.current.forEach(clearTimeout); setLeaving(true); window.setTimeout(() => { setItem(null); item.resolve(); }, big ? 300 : 200); };
  const to = item.to ?? 0;
  const from = item.from ?? Math.max(0, to - item.points);
  const unit = item.unit ?? "P";

  return (
    <div
      key={item.id}
      onClick={skip}
      className={`fixed inset-0 z-[1400] flex flex-col items-center select-none ${leaving ? (big ? "rw-out" : "rw-out-fast") : big ? "rw-dim" : "rw-dim-fast"}`}
      style={{ background: "rgba(10,8,8,.72)" }}
    >
      {big ? (
        <>
          <div className="rw-rise mt-[max(56px,env(safe-area-inset-top))] flex h-[44px] items-center gap-2 rounded-full bg-white px-5 text-[13px] text-ink-2 shadow-[0_8px_24px_rgba(0,0,0,.25)]" style={{ animationDelay: ".08s" }}>
            내 포인트 <span className="flex items-center gap-1.5 text-[18px] font-bold text-ink"><PCoin size={20} /><Odometer from={from} to={to} /></span>
          </div>
          <h2 className="rw-title mt-[52px] text-[36px] font-extrabold leading-none" style={{ animationDelay: ".3s", background: "linear-gradient(90deg,#ffd86a 0%,#ffb13d 50%,#ff8a5c 100%)", WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 4px 14px rgba(255,138,92,.45))" }}>
            {item.title ?? "보상 지급!"}
          </h2>
          <p className="rw-rise mt-3 text-[15px] font-medium text-white/80" style={{ animationDelay: ".36s" }}>{item.subtitle ?? "축하해요! 보상을 받았어요"}</p>
          <div className="relative mt-[34px] flex h-[240px] w-[240px] items-center justify-center">
            <div className="rw-rays absolute inset-[-40px] rounded-full" style={{ background: "conic-gradient(from 0deg, rgba(255,197,61,0) 0deg, rgba(255,197,61,.55) 18deg, rgba(255,197,61,0) 36deg, rgba(255,197,61,0) 60deg, rgba(255,197,61,.45) 78deg, rgba(255,197,61,0) 96deg, rgba(255,197,61,0) 120deg, rgba(255,197,61,.55) 138deg, rgba(255,197,61,0) 156deg, rgba(255,197,61,0) 180deg, rgba(255,197,61,.45) 198deg, rgba(255,197,61,0) 216deg, rgba(255,197,61,0) 240deg, rgba(255,197,61,.55) 258deg, rgba(255,197,61,0) 276deg, rgba(255,197,61,0) 300deg, rgba(255,197,61,.45) 318deg, rgba(255,197,61,0) 336deg)", mask: "radial-gradient(circle, #000 30%, transparent 70%)", WebkitMask: "radial-gradient(circle, #000 30%, transparent 70%)" }} />
            <div className="rw-glow absolute h-[200px] w-[200px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,214,106,.75) 0%, rgba(255,138,92,.35) 45%, rgba(255,90,45,0) 72%)" }} />
            <img src={item.image ?? "/brand/coins_flat.webp"} alt="" className="rw-coin relative h-[220px] w-[220px] object-contain" style={{ animationDelay: ".42s" }} draggable={false} />
          </div>
          <div className="rw-rise mt-[26px] flex h-[52px] items-center gap-2 rounded-full bg-white px-6 text-[17px] font-bold text-ink shadow-[0_10px_30px_rgba(0,0,0,.3)]" style={{ animationDelay: ".7s" }}>
            <PCoin size={26} /> <span className="text-[22px] font-extrabold text-myb">{unit === "P" ? "" : unit}{item.points.toLocaleString("ko-KR")}{unit === "P" ? "P" : ""}</span> 를 받았어요!
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center pb-10">
          <h2 className="rw-title text-[26px] font-extrabold text-white" style={{ animationDelay: ".05s", textShadow: "0 4px 18px rgba(255,138,92,.5)" }}>{item.title ?? "보상 지급!"}</h2>
          <div className="relative mt-5 flex h-[230px] w-[230px] items-center justify-center">
            <div className="rw-rays absolute inset-[-30px] rounded-full" style={{ background: "conic-gradient(from 0deg, rgba(255,197,61,0) 0deg, rgba(255,197,61,.5) 20deg, rgba(255,197,61,0) 40deg, rgba(255,197,61,0) 90deg, rgba(255,197,61,.5) 110deg, rgba(255,197,61,0) 130deg, rgba(255,197,61,0) 180deg, rgba(255,197,61,.5) 200deg, rgba(255,197,61,0) 220deg, rgba(255,197,61,0) 270deg, rgba(255,197,61,.5) 290deg, rgba(255,197,61,0) 310deg)", mask: "radial-gradient(circle, #000 25%, transparent 70%)", WebkitMask: "radial-gradient(circle, #000 25%, transparent 70%)" }} />
            <img src={item.image ?? "/brand/gift_burst.webp"} alt="" className="rw-coin relative h-[220px] w-[220px] object-contain" style={{ animationDelay: ".1s" }} draggable={false} />
            <span className="rw-sticker absolute -right-2 top-4 rotate-12 rounded-xl bg-gold px-2.5 py-1 text-[14px] font-extrabold text-ink shadow-md" style={{ animationDelay: ".45s" }}>+{item.points.toLocaleString("ko-KR")}{unit}</span>
            <span className="rw-sticker absolute -left-3 bottom-10 -rotate-12 rounded-xl bg-white px-2 py-0.5 text-[12px] font-bold text-myb shadow-md" style={{ animationDelay: ".6s" }}>{item.subtitle ?? "굿잡!"}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/** 자리별 슬롯 롤링(마이비 잔액 알약). 0.87s cubic-bezier */
function Odometer({ from, to }: { from: number; to: number }) {
  const [v, setV] = useState(from);
  useEffect(() => { const id = window.setTimeout(() => setV(to), 60); return () => clearTimeout(id); }, [to]);
  const str = to.toLocaleString("ko-KR");
  const fromStr = from.toLocaleString("ko-KR").padStart(str.length, "0");
  const curStr = v === to ? str : fromStr;
  return (
    <span className="inline-flex h-[1.15em] overflow-hidden leading-none tabular-nums" aria-label={str}>
      {str.split("").map((ch, i) => {
        if (!/\d/.test(ch)) return <span key={i} className="inline-block">{ch}</span>;
        const d = Number(curStr[i] ?? ch);
        return (
          <span key={i} className="inline-block h-[1.15em]">
            <span className="flex flex-col" style={{ transform: `translateY(-${d * 1.15}em)`, transition: "transform .87s cubic-bezier(.2,.9,.25,1)" }}>
              {Array.from({ length: 10 }, (_, k) => <span key={k} className="flex h-[1.15em] items-center">{k}</span>)}
            </span>
          </span>
        );
      })}
    </span>
  );
}

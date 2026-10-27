"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { haptic, sfx } from "@/lib/fx";
import { burst } from "@/lib/fxEngine";

type Pose = "wave" | "look" | "coins";
const SRC: Record<Exclude<Pose, "wave">, string> = { look: "/brand/mascot_3.webp", coins: "/brand/mascot_2.webp" };
/** 손인사 포즈는 몸(mascot_body)과 팔(mascot_arm) 두 장. 팔은 원본 640px 기준 bbox [54,160]~[187,385], 어깨 축 (150,345) */
const ARM = { left: 54 / 640, top: 160 / 640, w: 133 / 640, h: 225 / 640, ox: (150 - 54) / 133, oy: (345 - 160) / 225 };

/**
 * 홈 마스코트(고양이). 숨쉬듯 둥실거리고(idle), 몇 초마다 실제로 **팔을 흔들고**(waving), 가끔 돋보기로 두리번(look).
 * 탭하면 폴짝 뛰면서 코인 더미 포즈 + 코인 파티클 + 진동.
 */
export function Mascot({ size = 132, className, onTap }: { size?: number; className?: string; onTap?: () => void }) {
  const [pose, setPose] = useState<Pose>("wave");
  const [waving, setWaving] = useState(false);
  const [jump, setJump] = useState(false);
  const busy = useRef(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let alive = true; let n = 0; const timers: number[] = [];
    const wave = (ms: number) => { setWaving(true); timers.push(window.setTimeout(() => alive && setWaving(false), ms)); };
    const loop = (delay: number) => {
      timers.push(window.setTimeout(() => {
        if (!alive) return;
        if (busy.current) return loop(1500);
        n++;
        if (n % 3 === 0) { // 두리번 → 손인사 복귀
          setPose("look");
          timers.push(window.setTimeout(() => { if (!alive) return; setPose("wave"); wave(1300); loop(3500 + Math.random() * 2000); }, 1800));
        } else { wave(1300); loop(3000 + Math.random() * 2000); }
      }, delay));
    };
    timers.push(window.setTimeout(() => alive && wave(1300), 500));
    loop(3200);
    return () => { alive = false; timers.forEach(clearTimeout); };
  }, []);

  const tap = () => {
    if (busy.current) return; busy.current = true;
    const r = ref.current?.getBoundingClientRect();
    haptic("success"); sfx("coin");
    if (r) burst("coins", r.left + r.width / 2, r.top + r.height * 0.45);
    setPose("coins"); setJump(true);
    window.setTimeout(() => setJump(false), 700);
    window.setTimeout(() => { setPose("wave"); busy.current = false; setWaving(true); window.setTimeout(() => setWaving(false), 1300); }, 1700);
    onTap?.();
  };

  const img = "absolute inset-0 h-full w-full object-contain transition-opacity duration-300";
  return (
    <button ref={ref} type="button" onClick={tap} aria-label="캐치 마스코트" className={`mascot-wrap relative select-none ${jump ? "mascot-jump" : "mascot-idle"} ${className ?? ""}`} style={{ width: size, height: size }}>
      {/* 손인사: 몸 + 흔드는 팔 */}
      <span className="absolute inset-0" style={{ opacity: pose === "wave" ? 1 : 0, transition: "opacity .3s" }}>
        <img src="/brand/mascot_body.webp" alt="" width={size} height={size} draggable={false} className={img} />
        <img
          src="/brand/mascot_arm.webp" alt="" draggable={false}
          className={`absolute ${waving ? "mascot-wave" : "mascot-arm-rest"}`}
          style={{ left: `${ARM.left * 100}%`, top: `${ARM.top * 100}%`, width: `${ARM.w * 100}%`, height: `${ARM.h * 100}%`, transformOrigin: `${ARM.ox * 100}% ${ARM.oy * 100}%` }}
        />
      </span>
      {(Object.keys(SRC) as (keyof typeof SRC)[]).map((k) => (
        <img key={k} src={SRC[k]} alt="" width={size} height={size} draggable={false} className={img} style={{ opacity: pose === k ? 1 : 0 }} />
      ))}
      <i className="mascot-shadow absolute left-1/2 bottom-[2px] -translate-x-1/2 rounded-full bg-[#2b3a67]/15" style={{ width: size * 0.55, height: size * 0.09 }} />
    </button>
  );
}

"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { haptic, sfx } from "@/lib/fx";
import { burst } from "@/lib/fxEngine";

type Pose = "wave" | "look" | "coins" | "sleep";
const SRC: Record<Pose, string> = { wave: "/brand/mascot_1.webp", look: "/brand/mascot_3.webp", coins: "/brand/mascot_2.webp", sleep: "/brand/mascot_4.webp" };

/**
 * 홈 마스코트(고양이). 숨쉬듯 둥실거리고(idle), 몇 초마다 두리번(look)·손 흔들기(wave)로 포즈를 바꾸며 흔들린다.
 * 탭하면 폴짝 뛰면서 코인 더미 포즈 + 코인 파티클 + 진동. 포즈는 이미지 4장을 겹쳐 두고 opacity 로 크로스페이드.
 */
export function Mascot({ size = 132, className, onTap }: { size?: number; className?: string; onTap?: () => void }) {
  const [pose, setPose] = useState<Pose>("wave");
  const [jump, setJump] = useState(false);
  const [wiggle, setWiggle] = useState(false);
  const busy = useRef(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let alive = true; const timers: number[] = [];
    const loop = () => {
      if (!alive) return;
      timers.push(window.setTimeout(() => {
        if (!alive || busy.current) return loop();
        setPose("look"); setWiggle(true);
        timers.push(window.setTimeout(() => { if (!alive) return; setWiggle(false); }, 900));
        timers.push(window.setTimeout(() => { if (!alive) return; setPose("wave"); setWiggle(true); timers.push(window.setTimeout(() => setWiggle(false), 900)); loop(); }, 2200));
      }, 4200 + Math.random() * 2500));
    };
    loop();
    return () => { alive = false; timers.forEach(clearTimeout); };
  }, []);

  const tap = () => {
    if (busy.current) return; busy.current = true;
    const r = ref.current?.getBoundingClientRect();
    haptic("success"); sfx("coin");
    if (r) burst("coins", r.left + r.width / 2, r.top + r.height * 0.45);
    setPose("coins"); setJump(true);
    window.setTimeout(() => setJump(false), 700);
    window.setTimeout(() => { setPose("wave"); busy.current = false; }, 1800);
    onTap?.();
  };

  return (
    <button ref={ref} type="button" onClick={tap} aria-label="캐치 마스코트" className={`mascot-wrap relative select-none ${jump ? "mascot-jump" : "mascot-idle"} ${className ?? ""}`} style={{ width: size, height: size }}>
      <span className={`absolute inset-0 ${wiggle ? "mascot-wiggle" : ""}`}>
        {(Object.keys(SRC) as Pose[]).map((k) => (
          <img key={k} src={SRC[k]} alt="" width={size} height={size} draggable={false} className="absolute inset-0 h-full w-full object-contain transition-opacity duration-300" style={{ opacity: pose === k ? 1 : 0 }} />
        ))}
      </span>
      <i className="mascot-shadow absolute left-1/2 bottom-[2px] -translate-x-1/2 rounded-full bg-[#2b3a67]/15" style={{ width: size * 0.55, height: size * 0.09 }} />
    </button>
  );
}

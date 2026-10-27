"use client";

import { useEffect, useRef } from "react";
import { haptic, sfx } from "@/lib/fx";
import { burst } from "@/lib/fxEngine";

/** 결과 별 3개 — 하나씩 "짠·짠·짠" 도장처럼 찍힌다(스케일 바운스 + 링 플래시 + 반짝이 파티클 + 진동·효과음). 못 딴 별은 회색으로 작게 들어온다. */
export function StarRating({ earned, size = 44, gap = 10, delay = 0.25, step = 0.28 }: { earned: number; size?: number; gap?: number; delay?: number; step?: number }) {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  useEffect(() => {
    const timers: number[] = [];
    for (let i = 0; i < 3; i++) {
      timers.push(window.setTimeout(() => {
        const el = refs.current[i]; if (!el) return;
        const r = el.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2;
        if (i < earned) { haptic(i === 2 ? "success" : "tap"); sfx("pop"); burst("sparkle", x, y); if (i === earned - 1 && earned === 3) burst("stars", x, y); }
        else { haptic("tap"); sfx("tick"); }
      }, (delay + i * step) * 1000 + 180));
    }
    return () => timers.forEach(clearTimeout);
  }, [earned, delay, step]);
  const w = size * 3 + gap * 2;
  return (
    <span className="relative inline-flex items-end justify-center" style={{ width: w, height: size * 1.15, gap }} aria-label={`별 ${earned}개`} role="img">
      {[0, 1, 2].map((i) => {
        const on = i < earned; const mid = i === 1; const s = mid ? size * 1.15 : size;
        return (
          <span key={i} ref={(el) => { refs.current[i] = el; }} className={on ? "star-stamp" : "star-stamp-off"} style={{ width: s, height: s, animationDelay: `${delay + i * step}s`, transform: `rotate(${i === 0 ? -14 : i === 2 ? 14 : 0}deg)` }}>
            {on && <i className="star-ring" style={{ animationDelay: `${delay + i * step + 0.12}s` }} />}
            <svg width={s} height={s} viewBox="0 0 48 48" aria-hidden style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id={`st-g-${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe36a" /><stop offset=".55" stopColor="#ffb400" /><stop offset="1" stopColor="#f38700" /></linearGradient>
                <linearGradient id={`st-h-${i}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".9" /><stop offset=".6" stopColor="#fff" stopOpacity="0" /></linearGradient>
              </defs>
              {on ? (
                <>
                  <path d="M24 3.5l6.4 13 14.3 2.1-10.4 10.1 2.5 14.2L24 36.2l-12.8 6.7 2.5-14.2L3.3 18.6l14.3-2.1z" fill={`url(#st-g-${i})`} stroke="#d97300" strokeWidth="2.2" strokeLinejoin="round" />
                  <path d="M24 3.5l6.4 13 14.3 2.1-10.4 10.1 2.5 14.2L24 36.2l-12.8 6.7 2.5-14.2L3.3 18.6l14.3-2.1z" fill={`url(#st-h-${i})`} />
                  <path d="M16 15.5c2-3.5 4.5-6 7-7.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".95" />
                </>
              ) : (
                <path d="M24 3.5l6.4 13 14.3 2.1-10.4 10.1 2.5 14.2L24 36.2l-12.8 6.7 2.5-14.2L3.3 18.6l14.3-2.1z" fill="#eceff4" stroke="#d9dee6" strokeWidth="2" strokeLinejoin="round" />
              )}
            </svg>
          </span>
        );
      })}
    </span>
  );
}

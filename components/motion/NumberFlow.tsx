"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 벤핏허브 헤더의 number-flow-react 대체: 값이 바뀌면 이전 값에서 새 값으로 숫자가 흘러가듯 카운트.
 * 600ms, easeOutCubic, tabular-nums. 첫 렌더는 즉시 표시(원본도 초기값은 애니메이션 없음).
 */
export function NumberFlow({ value, duration = 600, className }: { value: number; duration?: number; className?: string }) {
  const [shown, setShown] = useState(value);
  const prev = useRef(value);
  const raf = useRef(0);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    cancelAnimationFrame(raf.current);
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(from + (to - from) * e));
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else prev.current = to;
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return <span className={`tabular-nums ${className ?? ""}`}>{shown.toLocaleString("ko-KR")}</span>;
}

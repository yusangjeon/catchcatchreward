"use client";

import { useEffect, useRef } from "react";
import { _subscribe, createRenderer, pointer } from "@/lib/fxEngine";

/** 전역 파티클 캔버스(포인터 통과). 레이아웃에 1번만 */
export function FxLayer() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const r = createRenderer(c);
    const off = _subscribe(r.add);
    const onDown = (e: PointerEvent) => { pointer.x = e.clientX; pointer.y = e.clientY; };
    document.addEventListener("pointerdown", onDown, { capture: true, passive: true });
    return () => { off(); r.destroy(); document.removeEventListener("pointerdown", onDown, { capture: true }); };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[1500] h-full w-full" />;
}

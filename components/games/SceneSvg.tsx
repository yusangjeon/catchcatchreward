"use client";

import { VIEW_H, VIEW_W, type Scene, type Shape, applyDiffs } from "@/lib/games/spotScenes";

/** 벡터 장면 렌더. diffIds 를 적용한 버전을 그리고, 탭 좌표(viewBox 단위)를 돌려준다 */
export function SceneSvg({ scene, diffIds, marks, misses, onTap, className = "" }: { scene: Scene; diffIds: string[]; marks: { x: number; y: number; ok?: boolean }[]; misses?: { x: number; y: number }[]; onTap?: (x: number, y: number) => void; className?: string }) {
  const shapes = applyDiffs(scene, diffIds);
  const gid = `g-${scene.id}-${diffIds.length}`;
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={`block w-full select-none rounded-2xl ${className}`}
      onPointerDown={(e) => {
        if (!onTap) return;
        const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
        onTap(((e.clientX - r.left) / r.width) * VIEW_W, ((e.clientY - r.top) / r.height) * VIEW_H);
      }}
      role={onTap ? "button" : "img"}
      aria-label={scene.name}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={scene.bg[0]} /><stop offset="1" stopColor={scene.bg[1]} /></linearGradient>
      </defs>
      <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill={`url(#${gid})`} />
      {shapes.map((s) => <ShapeEl key={s.id} s={s} />)}
      {misses?.map((m, i) => (
        <g key={`m${i}`} opacity="0.85"><line x1={m.x - 8} y1={m.y - 8} x2={m.x + 8} y2={m.y + 8} stroke="#ef4444" strokeWidth="3" strokeLinecap="round" /><line x1={m.x + 8} y1={m.y - 8} x2={m.x - 8} y2={m.y + 8} stroke="#ef4444" strokeWidth="3" strokeLinecap="round" /></g>
      ))}
      {marks.map((m, i) => (
        <circle key={`c${i}`} cx={m.x} cy={m.y} r="22" fill="none" stroke={m.ok === false ? "#ff3e9a" : "#22c55e"} strokeWidth="4" strokeDasharray={m.ok === false ? "6 4" : undefined} className="myb-pop-in" />
      ))}
    </svg>
  );
}

function ShapeEl({ s }: { s: Shape }) {
  const common = { opacity: s.op ?? 1 } as const;
  switch (s.t) {
    case "rect": return <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} {...common} />;
    case "circle": return <circle cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} {...common} />;
    case "ellipse": return <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} {...common} />;
    case "poly": return <polygon points={s.pts} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} {...common} />;
    case "path": return <path d={s.d} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} strokeLinecap="round" {...common} />;
    case "line": return <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={s.stroke} strokeWidth={s.sw} strokeLinecap="round" {...common} />;
  }
}

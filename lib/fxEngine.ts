"use client";

/**
 * 파티클·플라잉 코인 엔진(클라이언트 전용). <FxLayer/> 가 전역 캔버스를 1개 띄우고, 여기 함수들은 큐에 넣기만 한다.
 *  burst(kind, x, y)  — 화면 좌표에 파티클 폭발(sparkle·miss·coins·stars·hearts)
 *  confetti()         — 양쪽 하단에서 컨페티 캐논
 *  flyCoins(from, target, n, onArrive) — 코인이 포물선으로 target 요소까지 날아감(WAAPI)
 */
export type BurstKind = "sparkle" | "miss" | "coins" | "stars" | "hearts" | "ring";
interface Particle { x: number; y: number; vx: number; vy: number; born: number; ttl: number; size: number; color: string; rot: number; vr: number; shape: "rect" | "circle" | "star" | "coin" | "shard" | "heart" | "ring"; g: number; drag: number }

const listeners = new Set<(ps: Particle[]) => void>();
/** 마지막 포인터 위치(FxLayer 가 갱신) — 버튼 핸들러에서 좌표 없이 이펙트를 쓰기 위해 */
export const pointer = { x: 0, y: 0 };
export function burstAtPointer(kind: BurstKind) { burst(kind, pointer.x || window.innerWidth / 2, pointer.y || window.innerHeight / 2); }
/** 헤더 잔액(id=hdr-balance)으로 코인 날리기 */
export function flyToBalance(n = 5, onArrive?: (i: number) => void) {
  const target = typeof document !== "undefined" ? document.getElementById("hdr-balance") : null;
  flyCoins({ x: pointer.x || window.innerWidth / 2, y: pointer.y || window.innerHeight / 2 }, target, n, (i) => { if (i === 0 && target) { target.classList.remove("fx-bump"); void target.offsetWidth; target.classList.add("fx-bump"); } onArrive?.(i); });
}
export function _subscribe(fn: (ps: Particle[]) => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
function emit(ps: Particle[]) { for (const l of listeners) l(ps); }

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const PALETTE = ["#427cff", "#22d3ee", "#22c55e", "#fde047", "#ff8a3d", "var(--color-myb)", "#a855f7", "#ffffff"];

export function burst(kind: BurstKind, x: number, y: number) {
  const now = performance.now();
  const ps: Particle[] = [];
  const radial = (n: number, spd: [number, number], mk: (a: number, s: number) => Partial<Particle>) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd(-0.3, 0.3), s = rnd(spd[0], spd[1]);
      ps.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, born: now, ttl: 700, size: 5, color: "#fff", rot: rnd(0, 6.28), vr: rnd(-0.2, 0.2), shape: "circle", g: 0.05, drag: 0.96, ...mk(a, s) });
    }
  };
  switch (kind) {
    case "sparkle":
      radial(22, [3, 9], () => ({ shape: pick(["circle", "star", "star"]), color: pick(["#22c55e", "#bbf7d0", "#fde047", "#ffffff", "#22d3ee"]), size: rnd(3, 8), ttl: rnd(500, 850), g: 0.08 }));
      ps.push({ x, y, vx: 0, vy: 0, born: now, ttl: 520, size: 10, color: "#22c55e", rot: 0, vr: 0, shape: "ring", g: 0, drag: 1 });
      break;
    case "miss":
      radial(12, [3, 7], () => ({ shape: "shard", color: pick(["#ff3b6b", "#ff8aa8", "#ffffff"]), size: rnd(4, 9), ttl: rnd(350, 600), g: 0.25, drag: 0.94 }));
      ps.push({ x, y, vx: 0, vy: 0, born: now, ttl: 380, size: 8, color: "#ff3b6b", rot: 0, vr: 0, shape: "ring", g: 0, drag: 1 });
      break;
    case "coins":
      for (let i = 0; i < 10; i++) ps.push({ x: x + rnd(-10, 10), y, vx: rnd(-4, 4), vy: rnd(-9, -4), born: now, ttl: rnd(800, 1100), size: rnd(8, 13), color: "#f5b014", rot: rnd(0, 6.28), vr: rnd(-0.25, 0.25), shape: "coin", g: 0.28, drag: 0.985 });
      break;
    case "stars":
      radial(16, [4, 10], () => ({ shape: "star", color: pick(["#fde047", "#ffb400", "#ffffff", "#ff8a3d"]), size: rnd(5, 11), ttl: rnd(600, 1000), g: 0.1 }));
      break;
    case "hearts":
      for (let i = 0; i < 10; i++) ps.push({ x: x + rnd(-14, 14), y, vx: rnd(-1.5, 1.5), vy: rnd(-5, -2.5), born: now, ttl: rnd(900, 1300), size: rnd(7, 12), color: pick(["var(--color-myb)", "#ff7ab8", "#ff8a3d"]), rot: 0, vr: 0, shape: "heart", g: -0.02, drag: 0.98 });
      break;
    case "ring":
      ps.push({ x, y, vx: 0, vy: 0, born: now, ttl: 500, size: 10, color: "#427cff", rot: 0, vr: 0, shape: "ring", g: 0, drag: 1 });
      break;
  }
  emit(ps);
}

/** 컨페티 캐논: 좌·우 하단에서 위로 */
export function confetti(count = 140) {
  const now = performance.now();
  const W = window.innerWidth, H = window.innerHeight;
  const ps: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const left = i % 2 === 0;
    const a = left ? rnd(-1.35, -0.75) : rnd(-2.4, -1.8); // 라디안: 위쪽으로
    const s = rnd(11, 19);
    ps.push({ x: left ? 10 : W - 10, y: H * 0.85, vx: Math.cos(a) * s * (left ? 1 : 1), vy: Math.sin(a) * s, born: now, ttl: rnd(1800, 2800), size: rnd(5, 10), color: pick(PALETTE), rot: rnd(0, 6.28), vr: rnd(-0.3, 0.3), shape: pick(["rect", "rect", "rect", "circle", "star"]), g: 0.16, drag: 0.985 });
  }
  emit(ps);
}

/** 코인이 target 요소 중심으로 날아감(포물선). 도착마다 onArrive(i) */
export function flyCoins(from: { x: number; y: number }, target: HTMLElement | null, n = 5, onArrive?: (i: number) => void, icon = "/brand/coin.svg") {
  if (typeof document === "undefined") return;
  const t = target?.getBoundingClientRect();
  const tx = t ? t.left + t.width / 2 : window.innerWidth / 2, ty = t ? t.top + t.height / 2 : 60;
  for (let i = 0; i < n; i++) {
    const el = document.createElement("img");
    el.src = icon; el.alt = "";
    el.style.cssText = `position:fixed;left:0;top:0;width:22px;height:22px;z-index:1600;pointer-events:none;will-change:transform;filter:drop-shadow(0 2px 4px rgba(0,0,0,.25))`;
    document.body.appendChild(el);
    const sx = from.x - 11 + rnd(-14, 14), sy = from.y - 11 + rnd(-14, 14);
    const mx = (sx + tx) / 2 + rnd(-40, 40), my = Math.min(sy, ty) - rnd(40, 90);
    const anim = el.animate([
      { transform: `translate(${sx}px,${sy}px) scale(.6)`, opacity: 0 },
      { transform: `translate(${sx}px,${sy}px) scale(1.15)`, opacity: 1, offset: 0.12 },
      { transform: `translate(${mx}px,${my}px) scale(1)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${tx - 11}px,${ty - 11}px) scale(.45)`, opacity: 0.9 },
    ], { duration: 650 + i * 70, delay: i * 45, easing: "cubic-bezier(.3,.6,.3,1)", fill: "forwards" });
    anim.onfinish = () => { el.remove(); onArrive?.(i); };
  }
}

/** 캔버스 렌더러(FxLayer 가 사용) */
export function createRenderer(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  let ps: Particle[] = [];
  let raf = 0;
  const resize = () => { const d = window.devicePixelRatio || 1; canvas.width = window.innerWidth * d; canvas.height = window.innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  resize();
  const star = (r: number) => { ctx.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r, a = (i * Math.PI) / 5 - Math.PI / 2; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); };
  const heart = (r: number) => { ctx.beginPath(); ctx.moveTo(0, r * 0.35); ctx.bezierCurveTo(r, -r * 0.6, r * 2.2, r * 0.6, 0, r * 1.6); ctx.bezierCurveTo(-r * 2.2, r * 0.6, -r, -r * 0.6, 0, r * 0.35); ctx.closePath(); };
  const frame = () => {
    const now = performance.now();
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ps = ps.filter((p) => now - p.born < p.ttl);
    for (const p of ps) {
      const t = (now - p.born) / p.ttl;
      p.vy += p.g; p.vx *= p.drag; p.vy *= p.drag; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      const alpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
      ctx.save(); ctx.globalAlpha = Math.max(0, alpha); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color;
      switch (p.shape) {
        case "rect": ctx.scale(1, Math.cos(now / 90 + p.rot) * 0.8 + 0.2); ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); break;
        case "circle": ctx.shadowColor = p.color; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, 6.28); ctx.fill(); break;
        case "star": ctx.shadowColor = p.color; ctx.shadowBlur = 6; star(p.size / 2); ctx.fill(); break;
        case "shard": ctx.fillRect(-p.size / 2, -1.5, p.size, 3); break;
        case "heart": heart(p.size / 2); ctx.fill(); break;
        case "coin": {
          const g = ctx.createRadialGradient(-p.size * 0.2, -p.size * 0.2, 1, 0, 0, p.size / 2); g.addColorStop(0, "#ffe27a"); g.addColorStop(1, "#e09a0a");
          ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, p.size / 2, (p.size / 2) * Math.abs(Math.cos(p.rot * 2)) + 1, 0, 0, 6.28); ctx.fill();
          ctx.strokeStyle = "rgba(0,0,0,.15)"; ctx.lineWidth = 1; ctx.stroke(); break;
        }
        case "ring": { const r = p.size + t * 70; ctx.strokeStyle = p.color; ctx.lineWidth = Math.max(0.5, 6 * (1 - t)); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.28); ctx.stroke(); break; }
      }
      ctx.restore();
    }
    if (ps.length) raf = requestAnimationFrame(frame); else raf = 0;
  };
  const add = (more: Particle[]) => { ps.push(...more); if (!raf) raf = requestAnimationFrame(frame); };
  window.addEventListener("resize", resize);
  return { add, destroy: () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); } };
}

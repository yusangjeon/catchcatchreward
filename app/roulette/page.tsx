"use client";

import { DuoIcon, duoPath, type DuoName } from "@/components/icons/duo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PCoin } from "@/components/icons";
import { haptic, sfx } from "@/lib/fx";
import { burst, confetti } from "@/lib/fxEngine";
import { showReward } from "@/lib/reward";
import { NumberFlow } from "@/components/motion/NumberFlow";
import { useToast } from "@/components/motion/Toast";
import { fmt } from "@/hooks/useHome";
import type { PublicPrize, RoulettePayload, SpinResult } from "@/lib/roulette/types";

/* eslint-disable @next/next/no-img-element */

/**
 * 룰렛 — 첫 1회 무료, 이후 스탬프 10개 = 1회. 결과는 서버(/api/roulette/spin)가 정하고 휠은 그 조각으로 멈추는 연출만 한다.
 * 연출: rAF 로 각도를 직접 굴리며(당김 → 가속 → 긴 감속 → 살짝 넘겼다 되돌아옴) 조각 경계를 지날 때마다 포인터가 튕기고 틱 소리·진동.
 *      림 전구 24개가 도는 동안 체이스, 당첨 시 전체 점멸 + 당첨 조각 펄스 + 컨페티/코인/보상 오버레이. 꽝은 휠 흔들림 + 멋쩍은 마스코트.
 */
const WHEEL = 310;
const R = 150; // viewBox 반지름
const SPIN_MS = 5600;
const BULBS = 24;

type Tone = { a: string; b: string; text: string; icon: DuoName | null };
function toneOf(p: PublicPrize | undefined, i: number): Tone {
  if (!p) return { a: "#e9ecf5", b: "#d8dde9", text: "#2b3a67", icon: null };
  if (p.kind === "none") return { a: "#eceff4", b: "#d9dee6", text: "#6b7180", icon: null };
  if (p.kind === "gifticon") return { a: "#ff6fa6", b: "#e23d7b", text: "#fff", icon: "gift" };
  if (p.value >= 1000) return { a: "#ffd45c", b: "#f29a00", text: "#5a3300", icon: "coin" };
  if (p.value >= 300) return { a: "#ff8a5c", b: "#ff5a2d", text: "#fff", icon: "coin" };
  const alt = [{ a: "#5b8dff", b: "#2f6fed" }, { a: "#8f7bff", b: "#6b55e6" }, { a: "#3fb4c8", b: "#0f9bb0" }][i % 3];
  return { ...alt, text: "#fff", icon: "coin" };
}

/** 각도 → 포인터(12시) 아래 조각 인덱스. 조각 i 는 [i*seg, (i+1)*seg) 가 12시 기준 시계방향. 휠이 deg 만큼 돌면 12시 아래 각 = (360 - deg) mod 360 */
function indexAt(deg: number, seg: number) {
  const a = ((360 - (deg % 360)) + 360) % 360;
  return Math.floor(a / seg);
}

export default function RoulettePage() {
  const router = useRouter();
  const { show } = useToast();
  const [data, setData] = useState<RoulettePayload | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [deg, setDeg] = useState(0);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nudge, setNudge] = useState(0); // 포인터 튕김 트리거
  const [winIdx, setWinIdx] = useState<number | null>(null);
  const [lose, setLose] = useState(false);
  const [lights, setLights] = useState<"idle" | "chase" | "win">("idle");
  const raf = useRef(0);
  const degRef = useRef(0);

  const load = useCallback(() => fetch("/api/roulette", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => {}), []);
  useEffect(() => { void load(); return () => cancelAnimationFrame(raf.current); }, [load]);

  const prizes = data?.prizes ?? [];
  const n = prizes.length || 6;
  const seg = 360 / n;

  /** 당김(−14°, 380ms) → 본 회전(ease-out 5승, 살짝 오버슈트 후 복귀) */
  function animateTo(target: number, onDone: () => void) {
    const start = degRef.current; const t0 = performance.now();
    const PULL = 380, pull = -14;
    let lastIdx = indexAt(start, seg); let ticks = 0;
    const ease = (t: number) => 1 - Math.pow(1 - t, 5);
    const frame = (now: number) => {
      const el = now - t0; let d: number;
      if (el < PULL) { const k = el / PULL; d = start + pull * Math.sin(k * Math.PI / 2); }
      else {
        const k = Math.min(1, (el - PULL) / SPIN_MS);
        const main = (start + pull) + (target - (start + pull)) * ease(k);
        const over = k > 0.86 ? Math.sin((k - 0.86) / 0.14 * Math.PI) * 2.2 * (1 - k) * 10 : 0; // 끝에서 2° 안팎 넘겼다 복귀
        d = main + over;
      }
      degRef.current = d; setDeg(d);
      const idx = indexAt(d, seg);
      if (idx !== lastIdx) { lastIdx = idx; ticks++; setNudge((x) => x + 1); sfx("tick"); if (ticks % 2 === 0 || el > PULL + SPIN_MS * 0.6) haptic("tap"); }
      if (el < PULL + SPIN_MS) raf.current = requestAnimationFrame(frame);
      else { degRef.current = target; setDeg(target); onDone(); }
    };
    raf.current = requestAnimationFrame(frame);
  }

  async function onSpin() {
    if (!data || spinning) return;
    if (!data.canSpin) { haptic("warn"); show(`스탬프가 ${data.needed - data.stamps}개 더 필요해요`, "info"); return; }
    setSpinning(true); setError(null); setWinIdx(null); setLose(false); setLights("chase");
    haptic("tap"); sfx("pop");
    try {
      const res = await fetch("/api/roulette/spin", { method: "POST" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message ?? "룰렛을 돌릴 수 없어요");
      const r = j as SpinResult;
      // 포인터 12시. 조각 i 중앙각 = i*seg + seg/2 → 휠을 그만큼 되돌리면 12시. 6바퀴 추가, 중앙에서 ±28% 랜덤 오프셋(매번 다른 자리)
      const base = Math.floor(degRef.current / 360) * 360;
      const jitter = (Math.random() - 0.5) * seg * 0.56;
      const target = base + 6 * 360 - (r.index * seg + seg / 2) + jitter;
      animateTo(target, () => {
        setSpinning(false);
        setData((d) => (d ? { ...d, stamps: r.wallet.stamps, freeSpin: false, canSpin: r.wallet.stamps >= d.needed, wallet: r.wallet } : d));
        if (r.prize.kind === "none") {
          setLights("idle"); setLose(true); haptic("warn"); sfx("lose");
          setTimeout(() => { setLose(false); setResult(r); }, 650);
        } else {
          setWinIdx(r.index); setLights("win");
          const cx = window.innerWidth / 2, cy = window.innerHeight / 2 - 40;
          if (r.prize.kind === "points") {
            haptic("success"); sfx("win"); burst("stars", cx, cy);
            setTimeout(() => { void showReward({ variant: "big", points: r.prize.value, to: r.wallet.balance, title: "룰렛 당첨!", subtitle: "축하해요! 포인트가 적립됐어요" }).then(() => { setResult(r); confetti(120); show(`${fmt(r.prize.value)}P를 받았어요!`); }); }, 500);
          } else {
            haptic("jackpot"); sfx("win"); confetti(220); burst("coins", cx, cy); burst("stars", cx, cy);
            setTimeout(() => { setResult(r); show(`${r.prize.name} 당첨!`); }, 700);
          }
        }
        void load();
      });
    } catch (e) {
      setSpinning(false); setLights("idle");
      setError(e instanceof Error ? e.message : "룰렛을 돌릴 수 없어요");
    }
  }

  const closeResult = () => { setResult(null); setWinIdx(null); setLights("idle"); };
  const stamps = data?.stamps ?? 0, needed = data?.needed ?? 10;
  const left = Math.max(0, needed - stamps);

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-10 text-[#191f28]">
      <header className="fixed left-1/2 top-0 z-20 flex h-12 w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-[var(--color-bg)] px-6">
        <button type="button" onClick={() => router.back()} aria-label="뒤로" className="flex h-7 w-7 items-center justify-center">
          <img src="/brand/ic_left.svg" width={28} height={28} alt="" className="h-7 w-7" />
        </button>
        <h1 className="text-[18px] font-semibold text-[#191f28]">무료 룰렛</h1>
        <Link href="/wallet" className="flex items-center gap-[6px]">
          <PCoin size={18} />
          <span id="hdr-balance" className="text-[18px] font-semibold leading-[18px] text-[#33363f]">{data ? <NumberFlow value={data.wallet.balance} /> : "—"}</span>
        </Link>
      </header>

      <div className="flex flex-col gap-5 px-5 pt-[60px]">
        {/* 휠 */}
        <section className="relative overflow-hidden rounded-[24px] px-4 pb-5 pt-5" style={{ background: "linear-gradient(180deg,#1b2440 0%,#2b3a67 100%)", boxShadow: "0 10px 30px rgba(27,36,64,.25)" }}>
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-[12px] font-semibold text-white/70">{data?.freeSpin ? "첫 룰렛은 무료예요" : `스탬프 ${needed}개 = 1회`}</p>
              <p className="mt-0.5 text-[18px] font-extrabold">최대 <span className="text-[#ffd45c]">편의점 5,000원권</span></p>
            </div>
            <span className={`flex h-[30px] items-center gap-1.5 rounded-full px-3 text-[12px] font-bold ${data?.canSpin ? "bg-[#ffd45c] text-[#5a3300]" : "bg-white/15 text-white"}`}>
              <DuoIcon name="ticket" size={14} />{data ? (data.freeSpin ? "무료 1회" : `${Math.floor(stamps / needed)}회 가능`) : "—"}
            </span>
          </div>

          <div className="relative mx-auto mt-4" style={{ width: WHEEL, height: WHEEL + 14 }}>
            {/* 포인터(핀) — 조각 경계마다 튕김 */}
            <svg key={nudge} width={44} height={56} viewBox="0 0 44 56" className={`absolute left-1/2 top-[-6px] z-20 -translate-x-1/2 ${nudge ? "rl-nudge" : ""}`} style={{ transformOrigin: "50% 22%" }} aria-hidden>
              <defs><linearGradient id="rl-pin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe08a" /><stop offset="1" stopColor="#f29a00" /></linearGradient></defs>
              <path d="M22 54 6 18a16 16 0 1 1 32 0z" fill="url(#rl-pin)" stroke="#b86a00" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="22" cy="18" r="6" fill="#fff" opacity=".9" />
            </svg>

            {/* 림 + 전구 */}
            <div className={`absolute left-0 top-[14px] rounded-full ${lights === "chase" ? "rl-chase" : lights === "win" ? "rl-win" : ""}`} style={{ width: WHEEL, height: WHEEL, background: "radial-gradient(circle at 50% 35%, #3a4a7e 0%, #1b2440 70%)", boxShadow: "0 16px 36px rgba(0,0,0,.35), inset 0 2px 6px rgba(255,255,255,.15)" }}>
              {Array.from({ length: BULBS }).map((_, i) => {
                const a = (i / BULBS) * Math.PI * 2 - Math.PI / 2; const rr = WHEEL / 2 - 10;
                return <i key={i} className="rl-bulb absolute h-[9px] w-[9px] rounded-full" style={{ left: WHEEL / 2 + rr * Math.cos(a) - 4.5, top: WHEEL / 2 + rr * Math.sin(a) - 4.5, animationDelay: `${(i % 3) * 0.12}s` }} />;
              })}
              {/* 원판 */}
              <div className={`absolute left-[22px] top-[22px] rounded-full ${lose ? "rl-shake" : ""}`} style={{ width: WHEEL - 44, height: WHEEL - 44 }}>
                <svg width={WHEEL - 44} height={WHEEL - 44} viewBox="0 0 300 300" style={{ transform: `rotate(${deg}deg)`, willChange: "transform" }} aria-label="룰렛">
                  <defs>
                    {(prizes.length ? prizes : (Array.from({ length: 6 }) as PublicPrize[])).map((p, i) => { const t = toneOf(p, i); return <linearGradient key={i} id={`rl-seg-${i}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={t.a} /><stop offset="1" stopColor={t.b} /></linearGradient>; })}
                    <radialGradient id="rl-hub" cx=".4" cy=".35" r=".8"><stop offset="0" stopColor="#ffe9a8" /><stop offset=".55" stopColor="#ffc53d" /><stop offset="1" stopColor="#e88a00" /></radialGradient>
                    <radialGradient id="rl-gloss" cx=".5" cy=".5" r=".5"><stop offset=".7" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".18" /></radialGradient>
                  </defs>
                  <circle cx={R} cy={R} r={R} fill="#fff" />
                  {(prizes.length ? prizes : (Array.from({ length: 6 }) as PublicPrize[])).map((p, i) => {
                    const a0 = (i * seg - 90) * (Math.PI / 180), a1 = ((i + 1) * seg - 90) * (Math.PI / 180);
                    const x0 = R + R * Math.cos(a0), y0 = R + R * Math.sin(a0), x1 = R + R * Math.cos(a1), y1 = R + R * Math.sin(a1);
                    const mid = i * seg + seg / 2; const t = toneOf(p, i);
                    const label = p ? (p.kind === "gifticon" ? "편의점 5천원" : p.kind === "none" ? "꽝" : p.name) : "";
                    const icon = t.icon ? duoPath(t.icon) : null;
                    const win = winIdx === i;
                    return (
                      <g key={i} className={win ? "rl-seg-win" : ""} style={{ transformOrigin: "150px 150px" }}>
                        <path d={`M${R} ${R} L${x0} ${y0} A${R} ${R} 0 ${seg > 180 ? 1 : 0} 1 ${x1} ${y1} Z`} fill={`url(#rl-seg-${i})`} />
                        {win && <path d={`M${R} ${R} L${x0} ${y0} A${R} ${R} 0 ${seg > 180 ? 1 : 0} 1 ${x1} ${y1} Z`} fill="#fff" className="rl-seg-flash" />}
                        <g transform={`rotate(${mid} ${R} ${R})`}>
                          {icon && (
                            <g transform={`translate(${R - 13} ${R - 128}) scale(1.1)`} style={{ color: t.text }}>
                              {icon.back && <path d={icon.back} fill="currentColor" opacity=".3" />}
                              <path d={icon.front} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={icon.fill ?? "none"} />
                            </g>
                          )}
                          <text x={R} y={R - 78} fill={t.text} fontSize={p?.kind === "gifticon" ? 12 : 16} fontWeight={800} textAnchor="middle" dominantBaseline="middle" style={{ letterSpacing: -0.3 }}>{label}</text>
                        </g>
                      </g>
                    );
                  })}
                  {/* 조각 경계선 */}
                  {Array.from({ length: n }).map((_, i) => { const a = (i * seg - 90) * (Math.PI / 180); return <line key={i} x1={R} y1={R} x2={R + R * Math.cos(a)} y2={R + R * Math.sin(a)} stroke="#fff" strokeWidth="2.5" />; })}
                  <circle cx={R} cy={R} r={R} fill="url(#rl-gloss)" />
                  <circle cx={R} cy={R} r={R - 1.5} fill="none" stroke="#fff" strokeWidth="3" />
                </svg>
                {/* 허브(고정) */}
                <button type="button" onClick={() => void onSpin()} disabled={!data || spinning} aria-label="룰렛 돌리기" className={`absolute left-1/2 top-1/2 flex h-[76px] w-[76px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[15px] font-black tracking-wide text-[#5a3300] ${spinning ? "" : "rl-hub-pulse"}`} style={{ background: "radial-gradient(circle at 40% 35%, #ffe9a8 0%, #ffc53d 55%, #e88a00 100%)", boxShadow: "0 6px 0 #b86a00, 0 10px 22px rgba(0,0,0,.35), inset 0 2px 4px rgba(255,255,255,.7)" }}>
                  {spinning ? "GO!" : "SPIN"}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void onSpin()}
            disabled={!data || spinning}
            className={`myb-press mt-5 flex h-[54px] w-full items-center justify-center gap-2 rounded-[14px] text-[16px] font-bold transition ${!data || spinning ? "bg-white/20 text-white/70" : data.canSpin ? "bg-[var(--color-myb)] text-white shadow-[0_6px_18px_rgba(255,90,45,.45)]" : "bg-white/15 text-white"}`}
          >
            {spinning ? "돌아가는 중…" : !data ? "불러오는 중" : data.freeSpin ? "무료로 돌리기" : data.canSpin ? `룰렛 돌리기 · 스탬프 ${needed}개 사용` : `스탬프 ${left}개 더 모으면 돌릴 수 있어요`}
          </button>
          {error && <p className="mt-2 text-center text-[13px] text-[#ffb4a6]">{error}</p>}
        </section>

        {/* 스탬프 카드 */}
        <section className="rounded-[20px] bg-white p-5" style={{ boxShadow: "0 5px 16px 0 rgba(40, 24, 14, 0.06)" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold">내 스탬프</h2>
            <span className="text-[14px] font-medium text-[#5c6573]"><b className="text-[18px] font-bold text-[var(--color-myb)]">{stamps}</b> / {needed}</span>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2.5">
            {Array.from({ length: needed }).map((_, i) => {
              const filled = i < Math.min(stamps, needed);
              return (
                <span key={i} className={`flex aspect-square items-center justify-center rounded-full ${filled ? "bg-[var(--color-myb-soft)] text-myb" : "bg-[#f3f4f7] text-[#c3c9d3]"}`}>
                  {filled ? <DuoIcon name="stamp" size={26} className="myb-pop-in" /> : <span className="text-[12px] font-semibold">{i + 1}</span>}
                </span>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-[14px] bg-[#f8f9fc] px-4 py-3">
            <p className="text-[13px] leading-[18px] text-[#5c6573]">퀴즈 세트 완료·출석체크·미니게임마다 <b className="text-ink">스탬프 1개</b></p>
            <Link href="/quiz" className="shrink-0 rounded-full bg-ink px-3 py-1.5 text-[12px] font-bold text-white">모으러 가기</Link>
          </div>
        </section>

        {/* 경품·확률 */}
        <section className="rounded-[20px] bg-white p-5">
          <h2 className="text-[16px] font-bold">경품과 당첨 확률</h2>
          <ul className="mt-3 flex flex-col divide-y divide-[var(--color-bg-2)]">
            {prizes.map((p, i) => {
              const t = toneOf(p, i);
              return (
                <li key={p.id} className="flex items-center justify-between py-3 text-[14px]">
                  <span className="flex items-center gap-2.5">
                    <i className="h-[18px] w-[18px] rounded-full" style={{ background: `linear-gradient(135deg,${t.a},${t.b})` }} />
                    {p.name}
                  </span>
                  <span className="font-semibold tabular-nums text-[#5c6573]">{p.probability}%</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-[12px] leading-[17px] text-[#8b94a0]">확률과 결과는 서버에서 계산해요. 기프티콘은 당첨 후 영업일 기준 3일 내 발송.</p>
        </section>

        {data && data.history.length > 0 && (
          <section className="rounded-[20px] bg-white p-5">
            <h2 className="text-[16px] font-bold">최근 당첨 내역</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {data.history.map((h) => (
                <li key={h.id} className="flex items-center justify-between text-[14px]">
                  <span className={h.kind === "none" ? "text-[#8b94a0]" : ""}>{h.prizeName}</span>
                  <span className="text-[12px] text-[#b0b8c1]">{new Date(h.spunAt).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* 결과 모달 */}
      {result && (
        <>
          <div className="myb-fade-in fixed inset-0 z-[999] bg-black/70" onClick={closeResult} />
          <div className="pointer-events-none fixed inset-0 z-[1000] flex items-center justify-center px-6">
            <div className="myb-modal-in pointer-events-auto relative w-full max-w-[342px] overflow-hidden rounded-[26px] bg-white px-6 pb-6 pt-7 text-center">
              {result.prize.kind !== "none" && <div className="rl-rays pointer-events-none absolute left-1/2 top-[90px] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2" />}
              <img src={result.prize.kind === "none" ? "/brand/mascot_5.webp" : "/brand/mascot_2.webp"} alt="" width={150} height={150} className="myb-pop-in relative mx-auto h-[150px] w-[150px] object-contain" />
              <p className="relative mt-3 text-[20px] font-bold">{result.prize.kind === "none" ? "아쉬워요, 다음 기회에!" : result.prize.kind === "gifticon" ? "대박! 기프티콘 당첨" : "축하해요! 당첨됐어요"}</p>
              <p className="relative mt-2 flex items-center justify-center gap-1.5 text-[28px] font-extrabold text-[var(--color-myb)]">
                {result.prize.kind === "points" && <PCoin size={28} />}
                {result.prize.kind === "points" ? `+${fmt(result.prize.value)}` : result.prize.kind === "gifticon" ? result.prize.name : ""}
              </p>
              {result.prize.kind === "gifticon" && <p className="mt-1 text-[13px] text-[#5c6573]">기프티콘은 영업일 3일 내 발송돼요.</p>}
              {result.prize.kind === "none" && <p className="mt-1 text-[13px] text-[#5c6573]">스탬프 10개 모으면 다시 도전할 수 있어요.</p>}
              <button type="button" onClick={closeResult} className="myb-press mt-6 h-[52px] w-full rounded-xl bg-[var(--color-myb)] text-[16px] font-bold text-white">확인</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

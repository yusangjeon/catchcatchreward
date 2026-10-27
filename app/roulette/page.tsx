"use client";

import { DuoIcon, IconTile } from "@/components/icons/duo";
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
 * 룰렛 — 스탬프 10개 = 1회. 결과는 서버(/api/roulette/spin)가 정하고, 휠은 그 조각으로 멈추는 연출만 한다.
 * 톤: 마이비 벤핏허브(헤더 48, bg var(--color-bg), 카드 r20, var(--color-myb)). 휠 300px SVG, 5바퀴 + 조각 중앙, 4.2s cubic-bezier(0.17,0.67,0.12,1).
 */
const SEG_COLORS = ["var(--color-myb)", "var(--color-myb-line)", "#2f5fd6", "#8bb3ff", "#1d4fc4", "#b5cdff"];
const WHEEL = 300;
const SPIN_MS = 4200;

export default function RoulettePage() {
  const router = useRouter();
  const { show } = useToast();
  const [data, setData] = useState<RoulettePayload | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [deg, setDeg] = useState(0);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const turns = useRef(0);

  const load = useCallback(() => fetch("/api/roulette", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => {}), []);
  useEffect(() => {
    void load();
  }, [load]);

  const prizes = data?.prizes ?? [];
  const n = prizes.length || 6;
  const seg = 360 / n;

  async function onSpin() {
    if (!data || spinning) return;
    if (!data.canSpin) {
      show(`스탬프가 ${data.needed - data.stamps}개 더 필요해요`, "info");
      return;
    }
    setSpinning(true);
    setError(null);
    try {
      const res = await fetch("/api/roulette/spin", { method: "POST" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message ?? "룰렛을 돌릴 수 없어요");
      const r = j as SpinResult;
      // 포인터는 12시. 조각 i 의 중앙각 = i*seg + seg/2 → 휠을 -(중앙각) 만큼 돌리면 12시에 온다. 5바퀴 추가.
      turns.current += 5;
      const target = turns.current * 360 - (r.index * seg + seg / 2);
      setDeg(target);
      setTimeout(() => {
        setSpinning(false);
        if (r.prize.kind === "none") { haptic("warn"); sfx("lose"); setResult(r); }
        else if (r.prize.kind === "points") { void showReward({ variant: "big", points: r.prize.value, to: r.wallet.balance, title: "룰렛 당첨!", subtitle: "축하해요! 포인트가 적립됐어요" }).then(() => { setResult(r); burst("stars", window.innerWidth / 2, window.innerHeight / 2 - 40); show(`${fmt(r.prize.value)}P를 받았어요!`); }); }
        else { haptic("jackpot"); sfx("win"); confetti(200); burst("coins", window.innerWidth / 2, window.innerHeight / 2); burst("stars", window.innerWidth / 2, window.innerHeight / 2 - 40); setResult(r); }
        if (r.prize.kind === "gifticon") show(`${r.prize.name} 당첨!`);
        setData((d) => (d ? { ...d, stamps: r.wallet.stamps, canSpin: r.wallet.stamps >= d.needed, wallet: r.wallet } : d));
        void load();
      }, SPIN_MS + 100);
    } catch (e) {
      setSpinning(false);
      setError(e instanceof Error ? e.message : "룰렛을 돌릴 수 없어요");
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-10 text-[#191f28]">
      <header className="fixed left-1/2 top-0 z-20 flex h-12 w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-[var(--color-bg)] px-6">
        <button type="button" onClick={() => router.back()} aria-label="뒤로" className="flex h-7 w-7 items-center justify-center">
          <img src="/brand/ic_left.svg" width={28} height={28} alt="" className="h-7 w-7" />
        </button>
        <h1 className="text-[18px] font-semibold text-[#191f28]">무료 룰렛</h1>
        <Link href="/wallet" className="flex items-center gap-[6px]">
          <PCoin size={18} />
          <span className="text-[18px] font-semibold leading-[18px] text-[#33363f]">{data ? <NumberFlow value={data.wallet.balance} /> : "—"}</span>
        </Link>
      </header>

      <div className="flex flex-col gap-6 px-6 pt-[64px]">
        {/* 스탬프 카드 */}
        <section className="rounded-[20px] bg-white p-5" style={{ boxShadow: "0 5px 16px 0 rgba(40, 24, 14, 0.09)" }}>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[16px] font-semibold">
              <DuoIcon name="stamp" size={24} className="text-myb" />
              내 스탬프
            </h2>
            <span className="text-[14px] font-medium text-[#5c6573]">
              <b className="text-[18px] font-bold text-[var(--color-myb)]">{data?.stamps ?? 0}</b> / {data?.needed ?? 10}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {Array.from({ length: data?.needed ?? 10 }).map((_, i) => {
              const filled = i < Math.min(data?.stamps ?? 0, data?.needed ?? 10);
              return (
                <span key={i} className={`flex aspect-square items-center justify-center rounded-full border ${filled ? "border-[#ffb3d9] bg-[var(--color-myb-soft)]" : "border-dashed border-[#dee2e9] bg-[var(--color-bg)]"}`}>
                  {filled ? <DuoIcon name="stamp" size={28} className="myb-pop-in text-myb" /> : <span className="text-[12px] font-medium text-[#b0b8c1]">{i + 1}</span>}
                </span>
              );
            })}
          </div>
          <p className="mt-3 text-[13px] leading-[18px] text-[#5c6573]">퀴즈 세트 완료·출석체크마다 스탬프 1개. 10개 모으면 룰렛 1회를 돌릴 수 있어요.</p>
        </section>

        {/* 휠 */}
        <section className="flex flex-col items-center">
          <div className="relative" style={{ width: WHEEL, height: WHEEL + 16 }}>
            {/* 포인터 */}
            <svg width={28} height={22} viewBox="0 0 28 22" className="absolute left-1/2 top-0 z-10 -translate-x-1/2" aria-hidden>
              <path d="M14 22 1 2h26L14 22Z" fill="#191f28" />
            </svg>
            <div className="absolute left-0 top-4 rounded-full" style={{ width: WHEEL, height: WHEEL, boxShadow: "0 12px 30px rgba(0, 43, 141, 0.18)" }}>
              <svg
                width={WHEEL}
                height={WHEEL}
                viewBox="0 0 300 300"
                style={{ transform: `rotate(${deg}deg)`, transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.17, 0.67, 0.12, 1)` : "none" }}
                aria-label="룰렛"
              >
                <circle cx="150" cy="150" r="150" fill="#fff" />
                {(prizes.length ? prizes : (Array.from({ length: 6 }) as PublicPrize[])).map((p, i) => {
                  const a0 = (i * seg - 90) * (Math.PI / 180);
                  const a1 = ((i + 1) * seg - 90) * (Math.PI / 180);
                  const x0 = 150 + 150 * Math.cos(a0), y0 = 150 + 150 * Math.sin(a0);
                  const x1 = 150 + 150 * Math.cos(a1), y1 = 150 + 150 * Math.sin(a1);
                  const mid = (i * seg + seg / 2 - 90) * (Math.PI / 180);
                  const tx = 150 + 98 * Math.cos(mid), ty = 150 + 98 * Math.sin(mid);
                  const rot = i * seg + seg / 2;
                  const dark = i % 2 === 0;
                  return (
                    <g key={i}>
                      <path d={`M150 150 L${x0} ${y0} A150 150 0 ${seg > 180 ? 1 : 0} 1 ${x1} ${y1} Z`} fill={SEG_COLORS[i % SEG_COLORS.length]} />
                      <text x={tx} y={ty} fill={dark ? "#fff" : "#191f28"} fontSize={p?.kind === "gifticon" ? 11 : 15} fontWeight={700} textAnchor="middle" dominantBaseline="middle" transform={`rotate(${rot} ${tx} ${ty})`}>
                        {p?.kind === "gifticon" ? "편의점 5천원" : p?.kind === "none" ? "꽝" : p?.name ?? ""}
                      </text>
                    </g>
                  );
                })}
                <circle cx="150" cy="150" r="150" fill="none" stroke="#fff" strokeWidth="6" />
                <circle cx="150" cy="150" r="34" fill="#fff" />
                <circle cx="150" cy="150" r="28" fill="#191f28" />
                <text x="150" y="151" fill="#fff" fontSize="12" fontWeight={800} textAnchor="middle" dominantBaseline="middle">SPIN</text>
              </svg>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void onSpin()}
            disabled={!data || spinning}
            className={`myb-press mt-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl text-[16px] font-bold text-white transition ${!data || spinning ? "bg-[var(--color-myb-line)]" : data.canSpin ? "bg-[var(--color-myb)]" : "bg-[#ced5e0]"}`}
          >
            {spinning ? "돌아가는 중…" : data?.canSpin ? "룰렛 돌리기 (스탬프 10개 사용)" : `스탬프 ${Math.max(0, (data?.needed ?? 10) - (data?.stamps ?? 0))}개 더 모으면 돌릴 수 있어요`}
          </button>
          {error && <p className="mt-2 text-[13px] text-[#ff3939]">{error}</p>}
          {!data?.canSpin && !spinning && (
            <Link href="/quiz" className="mt-3 text-[14px] font-medium text-[var(--color-myb)]">퀴즈 풀고 스탬프 모으기 →</Link>
          )}
        </section>

        {/* 경품·확률 */}
        <section className="rounded-[20px] bg-white p-5">
          <h2 className="text-[16px] font-semibold">경품과 당첨 확률</h2>
          <ul className="mt-3 flex flex-col divide-y divide-[var(--color-bg-2)]">
            {prizes.map((p, i) => (
              <li key={p.id} className="flex items-center justify-between py-3 text-[14px]">
                <span className="flex items-center gap-2">
                  <i className="h-3 w-3 rounded-full" style={{ background: SEG_COLORS[i % SEG_COLORS.length] }} />
                  {p.name}
                </span>
                <span className="font-semibold text-[#5c6573]">{p.probability}%</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[12px] leading-[17px] text-[#8b94a0]">확률과 결과는 서버에서 계산해요. 기프티콘은 당첨 후 영업일 기준 3일 내 발송(1차 수동).</p>
        </section>

        {data && data.history.length > 0 && (
          <section className="rounded-[20px] bg-white p-5">
            <h2 className="text-[16px] font-semibold">최근 당첨 내역</h2>
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
          <div className="myb-fade-in fixed inset-0 z-[999] bg-black/70" onClick={() => setResult(null)} />
          <div className="pointer-events-none fixed inset-0 z-[1000] flex items-center justify-center px-6">
            <div className="myb-modal-in pointer-events-auto relative w-full max-w-[342px] overflow-hidden rounded-[26px] bg-white px-6 pb-6 pt-8 text-center">
              {result.prize.kind !== "none" && (
                <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/4">
                  
                </div>
              )}
              {result.prize.kind === "none" ? <div className="mx-auto w-fit"><IconTile name="wheel" tone="gray" size={120} icon={64} round /></div> : <img src="/brand/coins.webp" alt="" width={120} height={120} className="myb-pop-in myb-float relative mx-auto h-[120px] w-[120px] object-contain" />}
              <p className="relative mt-4 text-[20px] font-bold">{result.prize.kind === "none" ? "아쉬워요, 다음 기회에!" : "축하해요! 당첨됐어요"}</p>
              <p className="relative mt-2 flex items-center justify-center gap-1.5 text-[26px] font-extrabold text-[var(--color-myb)]">
                {result.prize.kind === "points" && <PCoin size={26} />}
                {result.prize.kind === "points" ? `+${fmt(result.prize.value)}` : result.prize.name}
              </p>
              {result.prize.kind === "gifticon" && <p className="mt-1 text-[13px] text-[#5c6573]">기프티콘은 영업일 3일 내 발송돼요.</p>}
              <button type="button" onClick={() => setResult(null)} className="myb-press mt-6 h-[52px] w-full rounded-xl bg-[var(--color-myb)] text-[16px] font-bold text-white">확인</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PCoin } from "@/components/icons";
import { haptic, sfx } from "@/lib/fx";
import { confetti } from "@/lib/fxEngine";

/* eslint-disable @next/next/no-img-element */

/**
 * 온보딩(마이비4 영상 구조): 스플래시 → "와우! 내가 놓친 1,000P 발견" → 당첨자 전용 게임 미션(/game/:id?onb=1) →
 * 홈 복귀 "축하해요! 이제 캐치캐치와 단짝!" → 코치마크 투어 3단계(퀵메뉴·등급·오늘의 루틴) → 완료.
 * 진행 상태는 localStorage `ccr_onb` = game | tour | done. 첫 방문(값 없음) + 홈에서만 시작.
 */
export const ONB_KEY = "ccr_onb";
export const ONB_HERO_GAME = "cab33ec3-af0a-4806-bdb8-ccb63da7aca0"; // Royal Kingdom(lib/benefit/seed GAMES[0])

type Stage = "splash" | "discover" | "celebrate" | "tour" | null;
const TOUR: { target: string; title: string; sub: string; mascot: string }[] = [
  { target: "quick", title: "가장 많이 버는 콘텐츠는\n다 여기 있어요!", sub: "출석·만보기·게임·룰렛까지 한 번에", mascot: "/brand/mascot_2.webp" },
  { target: "tier", title: "등급 올리고\n전용 혜택을 누려보세요!", sub: "포인트 모으고 월간 과제 달성하면 승격", mascot: "/brand/mascot_3.webp" },
  { target: "routine", title: "오늘의 루틴 챙기고\n퀴즈를 풀어보세요!", sub: "출석 → 퀴즈 3개 → 무료 룰렛, 매일 반복", mascot: "/brand/mascot_1.webp" },
];

function readStage(): string | null {
  try { return localStorage.getItem(ONB_KEY); } catch { return null; }
}
function writeStage(v: string) {
  try { localStorage.setItem(ONB_KEY, v); } catch { /* noop */ }
}

/** 오버레이 안에서 떨어지는 컨페티 조각(CSS) */
function Pieces({ n = 36 }: { n?: number }) {
  const colors = ["#ff6b6b", "#ffd166", "#06d6a0", "#4cc9f0", "#c77dff", "#ff8fab", "#ffffff"];
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <i key={i} className="onb-piece pointer-events-none absolute rounded-[2px]" style={{ left: `${(i * 37) % 100}%`, width: 5 + (i % 3) * 3, height: 8 + (i % 4) * 3, background: colors[i % colors.length], animationDelay: `${(i % 9) * 0.33}s`, animationDuration: `${2.8 + (i % 5) * 0.5}s`, transform: `rotate(${i * 23}deg)` }} />
      ))}
    </>
  );
}

export function Onboarding() {
  const pathname = usePathname();
  const router = useRouter();
  const [stage, setStage] = useState<Stage>(null);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const started = useRef(false);

  // 홈 첫 진입에서만 시작. 게임 미션에서 돌아오면(tour) 축하 → 투어
  useEffect(() => {
    if (pathname !== "/") return;
    const v = readStage();
    if (v === "tour") { started.current = true; setStage("celebrate"); return; } // 게임 미션 CTA 뒤 홈 복귀
    if (v === null && !started.current) { started.current = true; setStage("splash"); }
  }, [pathname]);

  // 스플래시 1.6s → 발견 2.8s → 게임 미션
  useEffect(() => {
    if (stage === "splash") { const t = setTimeout(() => { setStage("discover"); haptic("success"); sfx("win"); }, 1600); return () => clearTimeout(t); }
    if (stage === "discover") { const t = setTimeout(() => goGame(), 3000); return () => clearTimeout(t); }
    if (stage === "celebrate") { sfx("win"); haptic("jackpot"); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const goGame = useCallback(() => { writeStage("game"); setStage(null); router.push(`/game/${ONB_HERO_GAME}?onb=1`); }, [router]);
  const finish = useCallback(() => { writeStage("done"); setStage(null); setRect(null); document.body.style.overflow = ""; haptic("success"); sfx("pop"); confetti(140); }, []);

  // 코치마크: 대상 요소를 화면 가운데로 스크롤한 뒤 좌표 측정
  const measure = useCallback((i: number) => {
    const el = document.querySelector<HTMLElement>(`[data-tour="${TOUR[i].target}"]`);
    if (!el) { setRect(null); return; }
    el.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
    requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      setRect({ x: r.left - 6, y: r.top - 6, w: r.width + 12, h: r.height + 12 });
    });
  }, []);
  useEffect(() => {
    if (stage !== "tour") return;
    document.body.style.overflow = "hidden";
    measure(step);
    const onResize = () => measure(step);
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); document.body.style.overflow = ""; };
  }, [stage, step, measure]);

  if (!stage) return null;

  if (stage === "splash") {
    return (
      <div className="onb-fade fixed inset-0 z-[2000] flex flex-col items-center justify-center text-white" style={{ background: "linear-gradient(160deg,#ff7a45 0%,#ff5a2d 55%,#e0441a 100%)" }}>
        <img src="/brand/mascot_1.webp" alt="" width={150} height={150} className="onb-splash-pop h-[150px] w-[150px] object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,.25)]" draggable={false} />
        <p className="onb-splash-pop mt-6 text-[30px] font-extrabold tracking-[-0.5px]" style={{ animationDelay: ".12s" }}>캐치캐치리워드</p>
        <p className="onb-splash-pop mt-2 text-[13px] font-bold uppercase tracking-[3px] text-white/85" style={{ animationDelay: ".24s" }}>Rewarding your taste!</p>
        <div className="absolute bottom-10 h-[3px] w-[120px] overflow-hidden rounded-full bg-white/25"><i className="onb-bar block h-full rounded-full bg-white" /></div>
      </div>
    );
  }

  if (stage === "discover") {
    return (
      <button type="button" onClick={goGame} className="onb-fade fixed inset-0 z-[2000] flex flex-col items-center justify-center overflow-hidden text-white" style={{ background: "radial-gradient(circle at 50% 38%, #27407a 0%, #141c38 45%, #0b1024 100%)" }}>
        {[0, 1, 2, 3, 4, 5].map((i) => <i key={i} className="onb-streamer pointer-events-none absolute w-[6px] rounded-full" style={{ left: `${8 + i * 16}%`, height: 70 + (i % 3) * 30, background: ["#ff6b6b", "#ffd166", "#06d6a0", "#4cc9f0", "#c77dff", "#ff8fab"][i], animationDelay: `${i * 0.35}s`, animationDuration: `${3 + (i % 3)}s` }} />)}
        <Pieces />
        <span className="pointer-events-none absolute left-1/2 top-[38%] h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,212,92,.45) 0%, rgba(255,212,92,0) 70%)" }} />
        <img src="/brand/coin_wings.webp" alt="" width={230} height={230} className="onb-wings relative h-[230px] w-[230px] object-contain" draggable={false} />
        <p className="onb-splash-pop mt-2 text-center text-[24px] font-bold leading-[33px]" style={{ animationDelay: ".3s" }}>와우! 내가 놓친<br /><span className="text-[#ffd45c]">1,000P</span> 발견✨</p>
        <p className="onb-splash-pop mt-3 text-[13px] text-white/60" style={{ animationDelay: ".5s" }}>첫 미션 완료하면 바로 받을 수 있어요 · 탭해서 확인</p>
      </button>
    );
  }

  if (stage === "celebrate") {
    return (
      <div className="onb-fade fixed inset-0 z-[2000] flex flex-col items-center justify-center overflow-hidden bg-[#0b1024]/82 px-8 text-center text-white backdrop-blur-[2px]">
        <Pieces n={44} />
        <img src="/brand/mascot_party.webp" alt="" width={220} height={220} className="onb-splash-pop h-[220px] w-[220px] object-contain" draggable={false} />
        <p className="onb-splash-pop mt-2 text-[26px] font-bold leading-[34px]" style={{ animationDelay: ".15s" }}>축하해요!<br />이제 <span className="text-[#ffd45c]">캐치캐치</span>와 단짝!</p>
        <p className="onb-splash-pop mt-4 text-[15px] leading-[22px] text-white/80" style={{ animationDelay: ".3s" }}>이제 더 다양한 방법으로<br /><b className="text-white">포인트</b>를 모아보세요!</p>
        <button type="button" onClick={() => { setStep(0); setStage("tour"); haptic("tap"); }} className="myb-press onb-splash-pop mt-9 flex h-[54px] w-full max-w-[340px] items-center justify-center rounded-[16px] bg-myb text-[16px] font-bold text-white shadow-[0_10px_26px_rgba(255,90,45,.45)]" style={{ animationDelay: ".45s" }}>둘러보기 시작</button>
        <button type="button" onClick={finish} className="mt-4 text-[13px] text-white/50">건너뛰기</button>
      </div>
    );
  }

  // tour
  const t = TOUR[step];
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const above = rect ? rect.y > vh * 0.45 : false;
  const last = step === TOUR.length - 1;
  return (
    <div className="fixed inset-0 z-[2000]">
      {/* 구멍 뚫린 딤: 대상 영역만 밝게 */}
      {rect ? (
        <div className="onb-hole absolute rounded-[20px] ring-2 ring-white/70" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, boxShadow: "0 0 0 9999px rgba(8,12,30,.74)" }} />
      ) : (
        <div className="absolute inset-0 bg-[#080c1e]/75" />
      )}
      {/* 말풍선 */}
      <div key={step} className={`onb-bubble absolute left-5 ${!above && rect && rect.y + rect.h > vh * 0.45 ? "right-[150px]" : "right-5"}`} style={rect ? (above ? { bottom: vh - rect.y + 14 } : { top: rect.y + rect.h + 14 }) : { top: "30%" }}>
        <div className="relative mx-auto w-fit max-w-full rounded-[18px] bg-white px-5 py-4 text-ink shadow-[0_12px_30px_rgba(0,0,0,.35)]">
          <span className={`absolute left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-white ${above ? "-bottom-2" : "-top-2"}`} />
          <p className="whitespace-pre-line text-[17px] font-bold leading-[24px]"><span className="text-myb">{step + 1}</span>/{TOUR.length} · {t.title}</p>
          <p className="mt-1 text-[12px] text-ink-2">{t.sub}</p>
        </div>
      </div>
      <img key={`m${step}`} src={t.mascot} alt="" width={150} height={150} className="onb-mascot pointer-events-none absolute bottom-[112px] right-4 h-[150px] w-[150px] object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,.4)]" draggable={false} />
      <div className="absolute inset-x-5 bottom-[calc(28px+env(safe-area-inset-bottom))] flex flex-col items-center gap-3">
        <button type="button" onClick={() => { if (last) finish(); else { setStep(step + 1); haptic("tap"); sfx("pop"); } }} className="myb-press flex h-[54px] w-full items-center justify-center rounded-[16px] bg-myb text-[16px] font-bold text-white shadow-[0_10px_26px_rgba(255,90,45,.45)]">
          {last ? "캐치캐치 하러가기!" : "다음"}
        </button>
        {!last && <button type="button" onClick={finish} className="text-[13px] text-white/60">건너뛰기</button>}
      </div>
      <span className="pointer-events-none absolute left-5 top-[calc(14px+env(safe-area-inset-top))] flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-bold text-white"><PCoin size={14} /> 둘러보기</span>
    </div>
  );
}

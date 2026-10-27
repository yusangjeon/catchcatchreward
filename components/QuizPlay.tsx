"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckIcon, CXCoin, PCoin } from "./icons";
import { ToastOnMount } from "./motion/Toast";
import { haptic, sfx } from "@/lib/fx";
import { burst, confetti } from "@/lib/fxEngine";
import { showReward } from "@/lib/reward";

/* eslint-disable @next/next/no-img-element */
import { SetGridCard } from "./SetCard";
import { fmt } from "@/hooks/useHome";
import type { PublicQuestion, SetPayload, SubmitResult } from "@/lib/types";


export function QuizPlay({ setId }: { setId: string }) {
  const router = useRouter();
  const [data, setData] = useState<SetPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    fetch(`/api/quiz/${setId}`, { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.message ?? "불러오기 실패");
        setData(j as SetPayload);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "불러오기 실패"));
  }, [setId]);

  if (error) return <Center><p className="text-muted">{error}</p><Link href="/" className="mt-4 rounded-xl bg-myb px-5 py-3 font-bold text-white">홈으로</Link></Center>;
  if (!data) return <Center><div className="h-8 w-8 animate-spin rounded-full border-4 border-myb-soft border-t-myb" /></Center>;
  if (result) return <RewardScreen result={result} />;
  if (data.set.done) return <Center><p className="text-[18px] font-bold">이미 참여한 퀴즈예요</p><Link href="/" className="mt-4 rounded-xl bg-myb px-5 py-3 font-bold text-white">홈으로</Link></Center>;

  const q = data.questions[idx];
  const total = data.questions.length;
  const picked = answers[q.id];
  const last = idx === total - 1;

  async function next() {
    if (!picked || busy) return;
    if (!last) {
      setIdx(idx + 1);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/quiz/${setId}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers: Object.entries(answers).map(([quizId, optionId]) => ({ quizId, optionId })) }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message ?? "제출 실패");
      const r = j as SubmitResult;
      const total = r.points + r.bonus + r.starterBonus;
      await showReward({ variant: "big", points: total, to: r.wallet.balance, from: r.wallet.balance - total });
      setResult(r);
      setTimeout(() => { confetti(120); burst("coins", window.innerWidth / 2, 260); }, 250);
    } catch (e) {
      setError(e instanceof Error ? e.message : "제출 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* 상단 흰 영역 */}
      <div className="bg-white px-[40px] pb-[36px]">
        <div className="relative flex h-[60px] items-center pt-2">
          <button type="button" onClick={() => (idx > 0 ? setIdx(idx - 1) : router.back())} aria-label="뒤로" className="-ml-1 p-1">
            <img src="/brand/ic_back.svg" alt="" className="h-[22px] w-[12px]" />
          </button>
          <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pt-2 text-[17px] font-bold tabular-nums">
            {String(idx + 1).padStart(2, "0")} <span className="font-medium text-[#b8bfc9]">/ {String(total).padStart(2, "0")}</span>
          </p>
        </div>
        <span className="mt-[40px] inline-flex h-5 items-center gap-1 rounded-md bg-myb-soft px-2 text-[12px] font-semibold text-myb-dark">
          <img src="/brand/ic_list.svg" alt="" className="h-[14px] w-[14px]" />
          객관식
        </span>
        <h1 className="mt-[26px] whitespace-pre-line text-[22px] font-bold leading-[1.4]">{q.question}</h1>
        <p className="mt-[10px] flex items-center gap-1.5 text-[13px] font-medium"><img src="/brand/ic_check.svg" alt="" className="h-[13px] w-[13px]" /> 1개만 선택 가능해요.</p>
      </div>

      {/* 하단 파란 영역 */}
      <div className="flex flex-1 flex-col bg-myb px-[40px] pt-[38px] pb-28">
        <div className="flex items-center gap-3">
          <img src="/brand/mascot_1.webp" alt="" className="h-[52px] w-[52px] rounded-full ring-[3px] ring-white" />
          <div>
            <p className="text-[13px] font-medium text-white">
              {data.persona.title} · <b className="font-extrabold">{data.persona.code}</b>
            </p>
            <div className="mt-1.5 flex gap-2">
              <span className="flex h-[26px] items-center rounded-full bg-white px-3.5 text-[12px] tracking-widest text-ink-2">•••</span>
              <span className="flex h-[26px] items-center rounded-full bg-white px-2.5 text-[13px]">{data.persona.emojis}</span>
              <span className="h-[26px] w-10 rounded-full bg-white/35" />
            </div>
          </div>
        </div>

        <Options q={q} picked={picked} onPick={(oid) => { haptic("tap"); sfx("pop"); setAnswers({ ...answers, [q.id]: oid }); }} />
      </div>

      <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 bg-myb px-[40px] pb-6 pt-3" style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}>
        <button
          type="button"
          disabled={!picked || busy}
          onClick={() => void next()}
          className={`h-[52px] w-full rounded-xl text-[15px] font-bold transition ${picked ? "bg-white text-myb-dark" : "bg-[var(--color-myb-line)] text-white/80"}`}
        >
          {busy ? "제출 중…" : last ? "결과 보기" : "다음 질문으로"}
        </button>
      </div>
    </div>
  );
}

function Options({ q, picked, onPick }: { q: PublicQuestion; picked?: string; onPick: (id: string) => void }) {
  const imageMode = q.options.every((o) => !!o.imageUrl);
  if (imageMode) {
    return (
      <ul className="mt-[30px] grid grid-cols-2 gap-[10px]">
        {q.options.map((o) => {
          const on = picked === o.id;
          return (
            <li key={o.id}>
              <button type="button" onClick={() => onPick(o.id)} className={`relative w-full overflow-hidden rounded-2xl bg-white text-left shadow-[0_6px_0_rgba(0,0,0,0.18)] ${on ? "ring-4 ring-white" : ""}`}>
                <img src={o.imageUrl} alt="" className="h-[130px] w-full object-cover" />
                <Radio on={on} className="absolute left-2.5 top-2.5" />
                <span className="block py-[7px] text-center text-[14px] font-semibold">{o.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }
  return (
    <ul className="mt-[30px] flex flex-col gap-[14px]">
      {q.options.map((o) => {
        const on = picked === o.id;
        return (
          <li key={o.id}>
            <button
              type="button"
              onClick={() => onPick(o.id)}
              className={`flex h-[64px] w-full items-center gap-4 rounded-2xl px-5 text-left text-[15px] font-medium shadow-[0_6px_0_rgba(0,0,0,0.22)] transition ${
                on ? "bg-myb-dark text-white" : "bg-white text-ink"
              }`}
            >
              <Radio on={on} />
              {o.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Radio({ on, className = "" }: { on: boolean; className?: string }) {
  return (
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${on ? "border-white bg-white text-myb-dark" : "border-[#c9cfd8] bg-white"} ${className}`}>
      {on && <CheckIcon size={18} />}
    </span>
  );
}

function RewardScreen({ result }: { result: SubmitResult }) {
  return (
    <div className="min-h-dvh bg-white pb-32">
      <div className="flex h-[60px] items-center px-4 pt-2">
        <Link href="/" aria-label="뒤로" className="p-1"><img src="/brand/ic_back.svg" alt="" className="h-[22px] w-[12px]" /></Link>
      </div>
      <div className="mt-[20px] flex justify-center">
        <span className="flex h-[42px] items-center gap-3 rounded-full bg-[var(--color-myb-soft)] px-6 text-[13px] text-ink-2">
          내 포인트 <span className="flex items-center gap-1.5 text-[17px] font-extrabold text-ink"><PCoin size={20} />{fmt(result.wallet.balance)}</span>
        </span>
      </div>

      {/* 코인 일러스트 — 원본 img_points_group.webp + Lottie confetti_pop(1회) */}
      <div className="relative mx-auto mt-[18px] flex h-[160px] w-[260px] items-center justify-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2">
          
        </div>
        {/* 원본 보상 일러스트(코인 스택 + 뱃지 + 색종이) — 앱스토어 스크린샷 픽셀, 레퍼런스 약 150×235 */}
        <img src="/brand/coins_hero.webp" alt="" className="myb-pop-in myb-float relative h-[160px] w-[260px] object-contain" draggable={false} />
      </div>
      <ToastOnMount text="포인트를 받았어요!" />

      <h1 className="mt-[10px] text-center text-[22px] font-bold">축하해요! 보상을 받았어요</h1>
      <p className="mt-[14px] text-center text-[13px] leading-[1.7] text-muted">
        매일 이벤트에 참여하고 푸짐한 보상을 받아보세요.<br />
        <span className="text-myb-dark">뱃지를 누르면</span> 자세한 내용을 볼 수 있어요.
      </p>

      <div className="mx-5 mt-[30px] rounded-2xl border border-[#e3e8f0] p-[18px]">
        <div className="flex items-center justify-around text-[14px] text-ink-2">
          <span className="flex items-center gap-3">포인트 <span className="flex items-center gap-1.5 text-[20px] font-extrabold text-ink"><PCoin size={22} />{fmt(result.points)}</span></span>
          <span className="h-7 w-px bg-line" />
          <span className="flex items-center gap-3">스탬프 <span className="flex items-center gap-1.5 text-[20px] font-extrabold text-ink"><CXCoin size={22} />+1</span></span>
        </div>
        {result.starterBonus > 0 && (
          <p className="mt-4 flex h-[42px] items-center justify-center gap-1.5 rounded-xl bg-[#fff6e5] text-[13px] text-[#9a5b00]">
            <img src="/brand/gift.webp" alt="" className="h-5 w-5 object-contain" /> 뉴비 스타터팩 2배로 <PCoin size={18} /> <b className="text-[16px] font-extrabold text-[#ff8a3d]">+{fmt(result.starterBonus)}</b> 더 받았어요
          </p>
        )}
        {result.bonus > 0 && (
          <p className="mt-4 flex h-[42px] items-center justify-center gap-1.5 rounded-xl bg-[var(--color-myb-soft)] text-[13px] text-ink-2">
            랜덤 보상으로 <PCoin size={18} /> <b className="text-[16px] font-extrabold text-myb-dark">+{result.bonus}</b> 더 받았어요
          </p>
        )}
        {result.newBadges.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {result.newBadges.map((b) => (
              <span key={b.code} className="rounded-full bg-myb-soft px-3 py-1.5 text-[13px] font-semibold text-myb-dark">
                {b.emoji} {b.name} 뱃지 획득
              </span>
            ))}
          </div>
        )}
      </div>

      {result.stats.length > 0 && (
        <section className="px-5 pt-[36px]">
          <h2 className="text-[19px] font-bold">다른 사람들은 어떻게 골랐을까요?</h2>
          <ul className="mt-4 flex flex-col gap-4">
            {result.stats.map((st, i) => (
              <li key={i} className="rounded-2xl bg-[var(--color-bg-2)] p-4">
                <p className="text-[14px] font-semibold leading-[1.4]">{st.question}</p>
                <ul className="mt-3 flex flex-col gap-2">
                  {st.options.map((o) => (
                    <li key={o.label}>
                      <div className="flex items-center justify-between text-[13px]">
                        <span className={o.mine ? "font-bold text-myb-dark" : "text-ink-2"}>{o.mine ? "✓ " : ""}{o.label}</span>
                        <b className="tabular-nums">{o.pct}%</b>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-white">
                        <div className={`myb-progress h-full rounded-full ${o.mine ? "bg-myb" : "bg-[#c9d4ea]"}`} style={{ width: `${o.pct}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.recommended.length > 0 && (
        <section className="px-5 pt-[36px]">
          <h2 className="text-[19px] font-bold">이런 퀴즈는 어때요?</h2>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6">
            {result.recommended.map((s) => <SetGridCard key={s.id} s={s} />)}
          </div>
        </section>
      )}

      <div className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-[430px] -translate-x-1/2 gap-3 bg-white/90 px-5 pt-3 backdrop-blur" style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}>
        <Link href="/quiz" className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-[var(--color-myb-soft)] text-[16px] font-bold text-myb-dark">둘러보기</Link>
        <Link href="/" className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-myb text-[16px] font-bold text-white">계속하기</Link>
      </div>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center">{children}</div>;
}

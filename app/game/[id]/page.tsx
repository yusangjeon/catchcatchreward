"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DuoIcon } from "@/components/icons/duo";
import { PCoin } from "@/components/icons";
import { OfferHeader, PreviewChip, usePreviewTap } from "@/components/offers/Preview";
import { ONB_KEY } from "@/components/Onboarding";
import { fmt } from "@/hooks/useHome";
import { haptic, sfx } from "@/lib/fx";
import type { GameDetailPayload } from "@/lib/game/types";

/* eslint-disable @next/next/no-img-element */

/**
 * 게임 미션 상세 — 마이비4 "당첨자 전용" 구조: 뱃지 → 아이콘 → 제목·남은 기간 → "즉시 1,000P 받는 미션 · 3분 소요!" →
 * 미션 카드(레벨 + 추가보상 칩 + 보상 행 P 126 + P 1,000 + 프리패스) → 프리패스 안내 띠 → 확인해 주세요 → 하단 고정 CTA.
 * 온보딩(?onb=1)에서는 CTA 가 홈 투어로 이어진다. 제휴 연동 전에는 미리보기 토스트.
 */
export default function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<GameDetailPayload | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [onb, setOnb] = useState(false);
  const tap = usePreviewTap();
  useEffect(() => {
    try { setOnb(new URLSearchParams(window.location.search).get("onb") === "1"); } catch { /* noop */ }
    fetch(`/api/game/${id}`, { cache: "no-store" }).then(async (r) => { if (!r.ok) { setNotFound(true); return; } setData(await r.json()); }).catch(() => setNotFound(true));
  }, [id]);

  if (notFound) return <div className="min-h-dvh bg-[var(--color-bg)]"><OfferHeader title="게임 미션" /><p className="mt-20 text-center text-[14px] text-muted">게임을 찾을 수 없어요.</p></div>;
  const g = data?.game;
  const total = (g?.missionPoint ?? 0) + (g?.bonusPoint ?? 1000);
  const cta = () => {
    if (onb) {
      try { localStorage.setItem(ONB_KEY, "tour"); } catch { /* noop */ }
      haptic("success"); sfx("coin");
      router.push("/");
      return;
    }
    tap();
  };

  return (
    <div className="min-h-dvh bg-white pb-32">
      <OfferHeader title="" right={onb ? undefined : <PreviewChip />} />

      <section className="flex flex-col items-center px-6 pt-1 text-center">
        <span className="rounded-full bg-[#6b55e6] px-2.5 py-1 text-[11px] font-bold text-white shadow-[0_4px_12px_rgba(107,85,230,.35)]">당첨자 전용</span>
        {g ? <img src={g.icon} alt="" width={84} height={84} className="myb-pop-in mt-3 h-[84px] w-[84px] rounded-[22px] object-cover shadow-[0_10px_24px_rgba(0,0,0,.14)]" /> : <div className="mt-3 h-[84px] w-[84px] animate-pulse rounded-[22px] bg-bg-2" />}
        <p className="mt-3 text-[17px] font-bold text-ink">{g?.title ?? "…"}</p>
        <p className="mt-1 flex items-center gap-1 text-[12px] text-muted">{data?.daysLeft ?? "—"}일 남음 <DuoIcon name="clock" size={12} /></p>
      </section>

      <section className="mx-5 mt-6">
        <p className="flex items-center gap-2 text-[15px] font-bold text-ink">즉시 {fmt(g?.bonusPoint ?? 1000)}P 받는 미션 <span className="rounded-md bg-blue-soft px-1.5 py-0.5 text-[11px] font-bold text-blue">3분 소요!</span></p>
        <div className="mt-3 rounded-[16px] border-[1.5px] border-blue/60 bg-[#f6f9ff] p-4">
          <p className="text-[14px] font-bold text-ink">{g?.missionText ?? "미션 달성"}</p>
          <div className="relative mt-4 rounded-[12px] bg-white px-3 py-3">
            <span className="absolute -top-2.5 left-1/2 flex -translate-x-1/2 gap-1">
              <i className="rounded-full bg-myb px-2 py-[3px] text-[9px] font-bold not-italic text-white">추가보상</i>
              <i className="rounded-full bg-myb px-2 py-[3px] text-[9px] font-bold not-italic text-white">추가보상</i>
            </span>
            <p className="flex items-center justify-center gap-1.5 text-[14px] font-bold text-ink">
              <span className="flex items-center gap-1 text-blue"><PCoin size={15} />{fmt(g?.missionPoint ?? 0)}</span><span className="text-muted">+</span>
              <span className="flex items-center gap-1 text-blue"><PCoin size={15} />{fmt(g?.bonusPoint ?? 1000)}</span><span className="text-muted">+</span>
              <span className="rounded-md bg-[#f3eefe] px-1.5 py-0.5 text-[12px] font-bold text-[#6b55e6]">프리패스</span>
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-[12px] bg-bg-2 px-3 py-2.5 text-[12px] text-ink-2">
          <span className="rounded-md bg-[#f3eefe] px-1.5 py-0.5 text-[11px] font-bold text-[#6b55e6]">프리패스</span>꿀 걱정 없이 퀴즈 8회를 바로 풀 수 있어요!
        </div>
      </section>

      <div className="mt-6 h-2 bg-bg" />

      <section className="mx-5 mt-5 text-[12px] leading-[18px] text-ink-2">
        <p className="text-[15px] font-bold text-ink">확인해 주세요</p>
        <ul className="mt-2 list-disc pl-4">
          <li>게임 첫 미션을 완료한 경우 보상은 혜택 탭에서 받을 수 있어요.</li>
          <li>프리패스는 캐치 러쉬에서 받을 수 있고, 보상을 받은 당일에만 쓸 수 있어요.</li>
          <li>이 이벤트는 한 계정당 한 번만 참여할 수 있어요.</li>
          {(data?.notices ?? []).slice(3, 6).map((n, i) => <li key={i}>{n}</li>)}
        </ul>
      </section>

      <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 bg-white/95 px-5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <button type="button" onClick={cta} className="myb-press routine-pulse flex h-[54px] w-full items-center justify-center gap-1.5 rounded-[14px] bg-myb text-[16px] font-bold text-white shadow-[0_6px_18px_rgba(255,90,45,.35)]">
          <PCoin size={18} />{fmt(total)} + 프리패스 받기!
        </button>
      </div>
    </div>
  );
}

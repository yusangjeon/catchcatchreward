"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PSvg, PXCoin } from "@/components/icons";
import { Countdown } from "@/components/motion/Countdown";
import { NumberFlow } from "@/components/motion/NumberFlow";
import { fmt } from "@/hooks/useHome";
import type { BenefitPayload, BenefitGame, BenefitSurvey } from "@/lib/benefit/types";

/* eslint-disable @next/next/no-img-element */

/**
 * 혜택 탭 — 마이비 benefit-hub.myb.im(BEGINNER 세그먼트) 오프라인 렌더 DOM 스냅샷을 치수 그대로 복제.
 * 기준: 390px 폭, 헤더 48, 러쉬 카운트다운 74, 히어로 그라디언트 섹션 795, 설문 카드 radius 20, 적립 메뉴 아이콘 40.
 */
const HERO_BG =
  "linear-gradient(rgb(18, 20, 31) 8%, rgb(19, 23, 34) 24%, rgb(26, 38, 62) 40%, rgb(32, 48, 81) 50%, rgb(39, 60, 100) 61%, rgb(78, 102, 140) 71%, rgb(157, 173, 200) 82%, rgb(221, 226, 238) 92%, rgb(248, 249, 252) 100%)";
const CARD_SHADOW = "0 5px 16px 0 rgba(0, 43, 141, 0.1)";

export default function BenefitsPage() {
  const [data, setData] = useState<BenefitPayload | null>(null);
  useEffect(() => {
    fetch("/api/benefit", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  return (
    <div className="min-h-[calc(100dvh-84px)] bg-[#f8f9fc] text-[#191f28]">
      {/* 헤더 48px, fixed */}
      <header className="fixed left-1/2 top-0 z-20 flex h-12 w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-[#f8f9fc] px-6">
        <div className="flex items-center gap-2 pl-[3px]">
          <h1 className="text-[26px] font-semibold leading-[31px] text-[#191f28]">혜택</h1>
        </div>
        <Link href="/wallet" className="flex items-center justify-end gap-[6px] pr-[3px]">
          <PXCoin size={18} />
          <span className="text-[18px] font-semibold leading-[18px] text-[#33363f]">
            {data ? <NumberFlow value={data.balance} /> : <span className="myb-skeleton inline-block h-[18px] w-8 rounded" />}
          </span>
        </Link>
      </header>

      <div className="flex flex-col pb-10 pt-[51px]">
        {/* 히어로: 오늘의 AI 추천 게임 */}
        <section className="relative" style={{ background: HERO_BG }}>
          {data ? <Countdown endsAt={data.rushEndsAt} /> : <div className="h-[74px] bg-white/[0.08]" />}

          <div className="relative flex flex-col items-center px-6 pt-8">
            <div className="flex items-center justify-center gap-1">
              <img src="/myb/bh/ic_promotion_spark.webp" width={12} height={12} alt="" className="h-3 w-3 shrink-0 object-contain" />
              <img src="/myb/bh/title_ai_game.svg" width={140} height={17} alt="오늘의 AI 추천 게임" className="block h-[17px] w-[140px] shrink-0" />
              <img src="/myb/bh/ic_promotion_spark.webp" width={12} height={12} alt="" className="h-3 w-3 shrink-0 object-contain" />
            </div>

            <div className="mt-4 flex w-full flex-col items-center gap-7">
              {data ? <HeroGame g={data.hero} /> : <HeroSkeleton />}
              <div className="relative w-full">
                <span
                  className="absolute left-1/2 top-[-16px] z-10 flex h-[26px] -translate-x-1/2 items-center justify-center gap-[2px] whitespace-nowrap rounded-full py-1 pl-[10px] pr-3 text-[13px] font-bold tracking-[-0.39px] text-[#191f28]"
                  style={{ background: "linear-gradient(rgb(255, 209, 71) 0%, rgb(255, 157, 0) 100%)" }}
                >
                  <img src="/myb/bh/ic_promotion_lightning.webp" width={14} height={14} alt="" className="h-[14px] w-[14px]" />
                  지금 아니면 혜택 끝!
                  <img src="/myb/bh/ic_promotion_lightning.webp" width={14} height={14} alt="" className="h-[14px] w-[14px]" />
                </span>
                <button type="button" className="myb-press flex h-[50px] w-full items-center justify-center gap-[3px] rounded-xl bg-[#427cff] py-[14px] text-[16px] font-bold tracking-[-0.16px] text-white">
                  <span className="flex items-center gap-1"><PSvg size={16} />{data ? fmt(data.hero.missionPoint) : "—"}</span>
                  +
                  <span className="flex items-center gap-1"><PSvg size={16} />{data ? fmt(data.hero.bonusPoint) : "1,000"} 추가 보상!</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-[6px] px-5 pb-4 pt-8">
            <h2 className="text-[20px] font-medium leading-[23px] text-white">이런 게임도 있어요</h2>
            <img src="/myb/bh/img_promotion_ai_label.webp" width={47} height={21} alt="AI 추천" className="h-[21px] w-[47px]" />
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-6">
            {data ? data.games.map((g) => <GameCard key={g.id} g={g} />) : [0, 1, 2].map((i) => <div key={i} className="myb-skeleton h-[220px] w-[150px] shrink-0 rounded-2xl" />)}
          </div>

          <button type="button" className="my-4 flex h-[58px] w-full items-center justify-center gap-2 text-[16px] font-medium tracking-[-0.16px] text-[#33363f]">
            더 많은 게임 보기
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden><path d="m9.5 6 6 6-6 6" stroke="#33363f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </section>

        {/* 지금 가장 Hot한 설문 */}
        <section className="flex flex-col">
          <div className="flex items-center justify-between px-5 pb-4">
            <h2 className="text-[20px] font-medium leading-[23px]">지금 가장 Hot한 설문 🔥</h2>
            <img src="/myb/bh/ic_arrow_section_title.webp" width={24} height={24} alt="더보기" className="h-6 w-6" />
          </div>
          <div className="mx-6 mb-8 flex flex-col gap-5 rounded-[20px] bg-white px-5 pb-6 pt-5">
            {data ? data.surveys.map((s, i) => <SurveyRow key={s.id} s={s} rank={i + 1} />) : [0, 1, 2, 3, 4].map((i) => <div key={i} className="myb-skeleton h-12 rounded-lg" />)}
          </div>
        </section>

        {/* 내게 맞는 적립 찾기 */}
        <section className="flex flex-col gap-3 px-6">
          <h2 className="text-[20px] font-medium leading-[23px]">내게 맞는 적립 찾기</h2>
          <div className="flex flex-col gap-6 rounded-[20px] bg-white p-5">
            {(data?.earnMenu ?? []).map((m) => (
              <Link key={m.key} href={m.href} className="flex items-center gap-3">
                <img src={m.icon} width={40} height={40} alt="" className="h-10 w-10 shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <p className="text-[16px] font-semibold leading-[18px]">{m.title}</p>
                    {m.hot && (
                      <span className="flex h-5 w-9 items-center justify-center rounded-full text-[12px] font-semibold leading-3 text-white" style={{ background: "linear-gradient(104.59deg, rgb(255, 38, 0) 1.99%, rgb(255, 173, 80) 118.63%)" }}>
                        Hot
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] font-medium leading-[16.1px] text-[#5c6573]">{m.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function HeroGame({ g }: { g: BenefitGame }) {
  return (
    <button type="button" className="myb-press flex w-full flex-col items-center gap-3">
      <img src={g.icon} width={141} height={141} alt="" className="myb-pop-in h-[141px] w-[141px] rounded-2xl bg-[#f1f3f8] object-cover" style={{ boxShadow: CARD_SHADOW }} />
      <div className="flex w-full flex-col items-center gap-1">
        <p className="w-full truncate text-center text-[16px] font-semibold leading-[21.6px] tracking-[-0.16px] text-white">{g.title}</p>
        <p className="text-[14px] font-medium leading-[18.9px] tracking-[-0.14px] text-[#dee2e9]">{g.missionText}</p>
      </div>
    </button>
  );
}

function HeroSkeleton() {
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="myb-skeleton h-[141px] w-[141px] rounded-2xl" />
      <div className="myb-skeleton h-[22px] w-32 rounded" />
      <div className="myb-skeleton h-[19px] w-24 rounded" />
    </div>
  );
}

function GameCard({ g }: { g: BenefitGame }) {
  return (
    <button
      type="button"
      className="myb-press flex h-[220px] w-[150px] shrink-0 flex-col items-center justify-between overflow-hidden rounded-2xl border border-[#f1f3f8] bg-white px-4 pb-4 pt-5 text-left"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <div className="flex w-full flex-col items-center gap-[10px]">
        <img src={g.icon} width={84} height={84} alt="" className="h-[84px] w-[84px] rounded-[17.455px] bg-[#f1f3f8] object-cover" />
        <div className="flex w-full flex-col items-center gap-[2px]">
          <p className="w-full truncate text-center text-[15px] font-semibold leading-[20.25px] text-[#191f28]">{g.title}</p>
          <p className="w-full truncate text-center text-[14px] font-medium leading-[18.9px] tracking-[-0.14px] text-[#5c6573]">{g.missionText}</p>
        </div>
      </div>
      <div className="flex h-9 w-full items-center justify-center gap-[1px] rounded-[10px] bg-[#427cff] p-[10px] text-[14px] font-bold leading-[16.1px] text-white">
        <span className="flex items-center gap-[3px]"><PSvg size={14} />{fmt(g.missionPoint)}</span>+{fmt(g.bonusPoint)}
      </div>
    </button>
  );
}

const MEDALS = ["/myb/bh/ic_beginner_medal_01.webp", "/myb/bh/ic_beginner_medal_02.webp", "/myb/bh/ic_beginner_medal_03.webp"];

function SurveyRow({ s, rank }: { s: BenefitSurvey; rank: number }) {
  return (
    <button type="button" className="flex h-12 w-full items-center gap-[14px] text-left">
      <div className="flex min-w-0 flex-1 items-center gap-[10px]">
        <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center">
          {rank <= 3 ? (
            <img src={MEDALS[rank - 1]} width={34} height={34} alt={`${rank}위`} className="h-[34px] w-[34px]" />
          ) : (
            <span className="text-[18px] font-semibold leading-[20.7px] text-[#8b94a0]">{rank}</span>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-[10px]">
          <p className="truncate text-[16px] font-medium leading-[18px] text-[#191f28]">{s.title}</p>
          <div className="flex gap-1">
            <span className="flex h-5 items-center justify-center rounded-full bg-[#f0f4ff] px-[6px] py-[3px] text-[12px] font-medium leading-[13.8px] text-[#427cff]">{s.loi}분</span>
            {s.label && (
              <span className="flex h-5 items-center justify-center rounded-full px-[6px] py-[3px] text-[12px] font-medium leading-[13.8px]" style={{ background: s.label.bg, color: s.label.color }}>
                {s.label.text}
              </span>
            )}
          </div>
        </div>
      </div>
      <span className="flex h-[26px] shrink-0 items-center justify-center gap-[3px] rounded-full bg-[#427cff] py-[5px] pl-2 pr-[9px] text-[14px] font-semibold leading-[16.1px] text-white">
        <PSvg size={15} />{fmt(s.reward)}
      </span>
    </button>
  );
}

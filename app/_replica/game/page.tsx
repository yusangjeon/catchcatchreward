"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Countdown } from "@/components/motion/Countdown";
import { fmt } from "@/hooks/useHome";
import type { BenefitGame } from "@/lib/benefit/types";
import type { GamePayload } from "@/lib/game/types";

/* eslint-disable @next/next/no-img-element */

/**
 * 게임적립 — 마이비 adjoe.myb.im 브릿지(보너스 모드) 오프라인 렌더 DOM 복제. 다크 #191f28, 상태바 55 제외.
 * 헤더 46 · 로또 바 40 · 카운트다운 75 · 히어로 128 · 메인 카드 350×160 r20 · 추천 카드 350×104 r20 · 게임왕 카드 350×88
 */
const CARD_SHADOW = "rgba(0, 0, 0, 0.25) 0px -8px 32px 0px, rgba(0, 39, 47, 0.6) 0px 4px 30px 0px";
const LIST_SHADOW = "rgba(0, 39, 47, 0.6) 0px 4px 30px 0px";

export default function GamePage() {
  const router = useRouter();
  const [data, setData] = useState<GamePayload | null>(null);
  useEffect(() => {
    fetch("/api/game", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#191f28] pb-6 text-white">
      {/* 배경: img_bridge_bg_bonus.svg 295% + 아래로 어두워지는 그라디언트 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1304px]" style={{ background: "linear-gradient(rgba(25, 31, 40, 0) 55%, rgb(25, 31, 40) 95%) no-repeat 50% 0% / 100% 100%, url(/myb/adj/img_bridge_bg_bonus.svg) no-repeat 50% 0% / 295% auto" }} />

      <div className="relative flex flex-col">
        <header className="sticky top-0 z-20 flex h-[46px] items-center justify-center bg-[#191f28]">
          <button type="button" onClick={() => router.back()} aria-label="뒤로" className="absolute left-[14px] top-[9px] h-7 w-7">
            <img src="/myb/adj/ic_promotion_arrow_left.svg" width={28} height={28} alt="" className="h-7 w-7" />
          </button>
          <span className="text-[16px] font-medium leading-[19px] text-white">게임적립</span>
        </header>

        {/* 로또 바 40 */}
        <button type="button" className="relative flex h-10 w-full items-center justify-center overflow-hidden bg-[#006e93]">
          <span className="flex items-center gap-2">
            <img src="/myb/adj/ic_bridge_lotto.webp" width={20} height={20} alt="" className="h-5 w-5" />
            <span className="flex items-end gap-1 whitespace-nowrap text-[14px] leading-4">
              <span className="font-medium text-white">게임하고</span>
              <span className="font-semibold text-[#ffd37d]">{data?.lottoPrize ?? "500만P"}</span>
              <span className="font-medium text-white">로또 당첨 기회 받아가세요</span>
            </span>
          </span>
          <img src="/myb/adj/ic_promotion_caret_right.svg" width={22} height={22} alt="" className="absolute right-3 top-[9px] h-[22px] w-[22px]" />
        </button>

        {data ? <Countdown endsAt={data.rushEndsAt} variant="adjoe" /> : <div className="h-[75px] bg-white/5" />}

        {/* 히어로 128 */}
        <section className="relative flex h-32 items-center justify-between px-5">
          <div className="flex flex-col">
            <p className="whitespace-nowrap text-[22px] font-bold leading-[29.7px] tracking-[-0.22px] text-white">게임하고 첫 보상 받으면</p>
            <div className="flex items-center gap-1">
              <img src="/myb/adj/ic_bridge_token20.svg" width={20} height={20} alt="" className="h-5 w-5" />
              <p className="whitespace-nowrap bg-clip-text text-[22px] font-bold leading-[29.7px] tracking-[-0.22px] text-transparent" style={{ backgroundImage: "linear-gradient(141.525deg, rgb(255, 55, 242) 1.5851%, rgb(255, 255, 255) 58.127%, rgb(255, 55, 242) 97.2%)" }}>
                {fmt(data?.hero.bonusPoint ?? 1000)} 보너스!
              </p>
            </div>
          </div>
          <img src="/myb/adj/img_bridge_hero_bonus.webp" width={128} height={128} alt="" className="h-32 w-32" />
        </section>

        {/* 메인 카드 350×160 */}
        <div className="px-5">
          <div className="relative z-0 flex flex-col gap-3 rounded-[20px] p-4" style={{ background: "linear-gradient(176deg, rgb(255, 255, 255) 30.458%, rgb(0, 225, 255) 254.37%)", boxShadow: CARD_SHADOW }}>
            <DoubleBadge />
            <div className="flex items-center">
              {data ? <img src={data.hero.icon} width={72} height={72} alt="" className="h-[72px] w-[72px] rounded-[14px] bg-[#ced5e0] object-cover" /> : <div className="myb-skeleton h-[72px] w-[72px] rounded-[14px]" />}
              <div className="ml-4 flex min-w-0 flex-1 flex-col justify-center gap-1">
                <img src="/myb/adj/img_bridge_ai_label.webp" width={55} height={19} alt="AI 추천" className="h-[19px] w-[55px]" />
                <p className="truncate text-[15px] font-semibold leading-[20.25px] tracking-[-0.15px] text-[#191f28]">{data?.hero.title ?? "…"}</p>
                <p className="truncate text-[14px] font-semibold leading-[18.9px] tracking-[-0.14px] text-[var(--color-myb)]">{data?.hero.missionText ?? ""}</p>
              </div>
            </div>
            <Link href={data ? `/game/${data.hero.id}` : "#"} className="myb-press flex h-11 w-full items-center justify-center gap-1 rounded-xl bg-[var(--color-myb)]">
              <span className="flex items-center gap-1 text-[16px] leading-[21.6px] tracking-[-0.16px]">
                <img src="/myb/adj/ic_bridge_token16.svg" width={16} height={16} alt="" className="h-4 w-4" />
                <span className="font-medium text-[#ced5e0] line-through">{fmt(data?.hero.missionPoint ?? 0)}</span>
                <span className="font-bold text-white">{fmt((data?.hero.missionPoint ?? 0) * 2)}</span>
                <span className="font-bold text-white">+</span>
                <img src="/myb/adj/ic_bridge_token16.svg" width={16} height={16} alt="" className="h-4 w-4" />
                <span className="font-bold text-white">{fmt(data?.hero.bonusPoint ?? 1000)}</span>
              </span>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 pb-4 pt-8">
          <h2 className="truncate text-[18px] font-bold leading-[24.3px] tracking-[-0.18px] text-white">마이비의 추천 게임 더보기</h2>
        </div>
        <div className="flex flex-col gap-3 px-5">
          {data ? data.games.map((g) => <GameRow key={g.id} g={g} />) : [0, 1, 2, 3].map((i) => <div key={i} className="myb-skeleton h-[104px] rounded-[20px]" />)}
        </div>

        <Link href="/benefits" className="mt-[10px] flex h-[58px] items-center justify-center gap-2">
          <span className="whitespace-nowrap text-[16px] font-medium leading-[21.6px] tracking-[-0.16px] text-white">더 많은 게임 보기</span>
          <img src="/myb/adj/ic_bridge_arrow_right.svg" width={7} height={24} alt="" className="h-6 w-[7px]" />
        </Link>

        {/* 게임왕 카드 350×88 */}
        <div className="px-5 pt-6">
          <button type="button" className="relative h-[88px] w-full overflow-hidden rounded-[20px] bg-[#33363f] text-left">
            <img src="/myb/adj/img_bridge_gameking_badge.svg" width={108} height={108} alt="" className="absolute left-[-25px] top-2 h-[108px] w-[108px] opacity-40" />
            <p className="absolute left-5 top-5 whitespace-nowrap text-[16px] font-semibold leading-[21.6px] tracking-[-0.16px] text-white">
              게임왕 달성하고 최대 <span className="text-[#19fa50]">{fmt(data?.gameKing.maxReward ?? 1500)}P</span> 받기!
            </p>
            <span className="absolute left-5 top-[47px] whitespace-nowrap text-[16px] font-semibold leading-[21.6px] tracking-[-0.16px] text-white">LV.{data?.gameKing.level ?? 1}</span>
            <div className="absolute left-[57px] top-12 h-5 w-[84px] overflow-hidden rounded-full bg-[#5a5a5a]">
              <div className="myb-progress absolute left-0 top-0 h-5 rounded-l-[48px]" style={{ width: `${data ? (data.gameKing.progress / data.gameKing.goal) * 100 : 0}%`, background: "linear-gradient(270deg, rgb(255, 0, 224) 0%, rgb(124, 101, 255) 100%)" }} />
              <span className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold leading-[17.55px] tracking-[-0.13px] text-white">{data?.gameKing.progress ?? 0}/{data?.gameKing.goal ?? 3}</span>
            </div>
            <img src="/myb/adj/ic_bridge_toast_arrow.svg" width={24} height={24} alt="" className="absolute right-3 top-8 h-6 w-6 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DoubleBadge() {
  return <span className="absolute right-4 top-[-8px] z-[3] whitespace-nowrap rounded-full bg-[#ec58d4] px-3 py-[3px] text-[14px] font-extrabold leading-[18.9px] tracking-[-0.14px] text-white">2배</span>;
}

function GameRow({ g }: { g: BenefitGame }) {
  return (
    <div className="relative z-0 flex h-[104px] items-center rounded-[20px] bg-white px-4 py-3" style={{ boxShadow: LIST_SHADOW }}>
      <DoubleBadge />
      <img src={g.icon} width={64} height={64} alt="" className="h-16 w-16 rounded-[14px] bg-[#ced5e0] object-cover" />
      <div className="ml-4 flex w-[166px] min-w-0 flex-col justify-center gap-[2px]">
        <p className="truncate text-[14px] font-medium leading-[18.9px] tracking-[-0.14px] text-[#191f28]">{g.title}</p>
        <div className="flex flex-col gap-1">
          <p className="truncate text-[13px] font-medium leading-[17.55px] tracking-[-0.13px] text-[#5c6573]">{g.missionText}</p>
          <div className="flex items-center gap-[2px]">
            <span className="flex items-center gap-[2px] text-[15px] leading-[20.25px] tracking-[-0.15px]">
              <img src="/myb/adj/ic_bridge_token15.webp" width={15} height={15} alt="" className="h-[15px] w-[15px]" />
              <span className="font-medium text-[#b0b8c1] line-through">{fmt(g.missionPoint)}</span>
              <span className="font-bold text-[#191f28]">{fmt(g.missionPoint * 2)}</span>
              <span className="font-bold text-[#191f28]">+</span>
              <span className="font-bold text-[#191f28]">{fmt(g.bonusPoint)}</span>
            </span>
          </div>
        </div>
      </div>
      <Link href={`/game/${g.id}`} className="myb-press ml-auto flex h-9 w-14 items-center justify-center rounded-lg bg-[var(--color-myb)] px-[14px] py-[7px] text-[15px] font-semibold leading-[20.25px] tracking-[-0.15px] text-white">이동</Link>
    </div>
  );
}

"use client";

import { DuoIcon, IconTile, type DuoName, type Tone } from "@/components/icons/duo";
import Link from "next/link";
import { PCoin, ChevronRight } from "@/components/icons";
import { NumberFlow } from "@/components/motion/NumberFlow";
import { Countdown } from "@/components/motion/Countdown";
import { useHome, fmt } from "@/hooks/useHome";
import { useEffect, useState } from "react";
import type { BenefitGame } from "@/lib/benefit/types";
import type { SurveyItem } from "@/lib/survey/types";
import type { CpqItem } from "@/lib/cpq/types";

/* eslint-disable @next/next/no-img-element */

 

const CARD_SHADOW = "0 5px 16px rgba(40,24,14,.08)";

const EARN: { name: DuoName; tone: Tone; title: string; sub: string; href: string; chip?: string }[] = [
  { name: "calendar", tone: "green", title: "출석체크", sub: "매일 10P + 스탬프 1 · 7일 연속 +50P", href: "/attendance" },
  { name: "quiz", tone: "blue", title: "취향 퀴즈", sub: "세트 완료마다 포인트 + 랜덤 보너스 + 스탬프", href: "/quiz", chip: "HOT" },
  { name: "search", tone: "violet", title: "틀린그림찾기", sub: "하루 3판 · LV1→3 점점 어려워져요 · 완주 보너스", href: "/games/spot", chip: "NEW" },
  { name: "gamepad", tone: "violet", title: "미니게임", sub: "2048 · 복권 · 가위바위보 · 카드 뒤집기", href: "/games" },
  { name: "wheel", tone: "amber", title: "무료 룰렛", sub: "스탬프 10개 = 1회 · 최대 편의점 5,000원", href: "/roulette" },
  { name: "people", tone: "pink", title: "친구 초대", sub: "친구 300P · 친구가 첫 퀴즈 완료하면 나는 500P", href: "/invite", chip: "500P" },
  { name: "pin", tone: "teal", title: "매장 미션", sub: "매장 방문·저장·리뷰 인증하고 포인트 + 스탬프", href: "/missions" },
  { name: "bag", tone: "blue", title: "쇼핑 방문 적립", sub: "제휴 쇼핑몰 방문만 해도 하루 5P", href: "/shop" },
];

interface Offers { games: BenefitGame[]; surveys: SurveyItem[]; surveyTotal: number; cpq: CpqItem[] }

/** 혜택 탭 — 우리 기능 허브(오늘 할 일 · 진행 중 이벤트 · 적립 메뉴 · 준비 중 제휴) */
export default function BenefitsPage() {
  const { data } = useHome();
  const [offers, setOffers] = useState<Offers | null>(null);
  useEffect(() => {
    Promise.all([fetch("/api/game").then((r) => r.json()), fetch("/api/survey").then((r) => r.json()), fetch("/api/cpq").then((r) => r.json())])
      .then(([g, sv, c]) => setOffers({ games: [g.hero, ...g.games], surveys: sv.hot, surveyTotal: sv.totalAvailable, cpq: c.list }))
      .catch(() => {});
  }, []);
  const todayDone = data?.todayDone ?? 0;
  const todo = [
    { label: `퀴즈 ${Math.min(3, todayDone)}/3`, done: todayDone >= 3, href: "/quiz", pts: "세트당 P" },
    { label: "출석체크", done: !!data?.attendedToday, href: "/attendance", pts: "10P" },
    { label: "틀린그림 1판", done: false, href: "/games/spot", pts: "최대 30P" },
  ];
  return (
    <div className="min-h-[calc(100dvh-84px)] bg-bg text-ink">
      <header className="fixed left-1/2 top-0 z-20 flex h-12 w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-bg px-6">
        <h1 className="text-[26px] font-semibold leading-[31px]">혜택</h1>
        <Link href="/wallet" className="flex h-[32px] items-center gap-[6px] rounded-full bg-white px-3 shadow-sm">
          <PCoin size={18} />
          <span className="text-[16px] font-bold leading-[18px]">{data ? <NumberFlow value={data.wallet.balance} /> : <span className="myb-skeleton inline-block h-[18px] w-8 rounded" />}</span>
        </Link>
      </header>

      <div className="flex flex-col gap-8 px-5 pb-10 pt-[64px]">
        {/* 오늘 할 일 */}
        <section className="relative overflow-hidden rounded-[22px] p-5 text-white" style={{ background: "linear-gradient(135deg,#2f6fed 0%,#5b8cff 70%,#7fa6ff 100%)", boxShadow: "0 10px 28px rgba(47,111,237,.28)" }}>
          <DuoIcon name="sparkle" size={96} className="pointer-events-none absolute -right-2 -top-3 text-white/25" />
          <p className="text-[13px] font-medium text-white/85">{data?.newbie.active ? `${data.newbie.dayNo}일차 · 3일 혜택 진행 중` : "오늘 할 일"}</p>
          <p className="mt-1 text-[22px] font-bold leading-[28px]">오늘 다 하면<br />최대 {fmt(data?.newbie.active ? 300 + 10 + 30 + 60 : 10 + 30 + 60)}P 이상</p>
          <ul className="mt-4 flex flex-col gap-2">
            {todo.map((t) => (
              <li key={t.label}>
                <Link href={t.href} className="flex h-[44px] items-center justify-between rounded-[12px] bg-white/18 px-3 backdrop-blur-sm">
                  <span className="flex items-center gap-2 text-[14px] font-bold"><span className={`flex h-5 w-5 items-center justify-center rounded-full text-[12px] ${t.done ? "bg-white text-[#2f6fed]" : "bg-white/30"}`}>{t.done ? "✓" : ""}</span>{t.label}</span>
                  <span className="text-[12px] font-semibold text-white/90">{t.done ? "완료" : t.pts} ›</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 진행 중 이벤트 */}
        <section>
          <h2 className="text-[18px] font-bold">지금 진행 중</h2>
          <div className="no-scrollbar -mx-5 mt-3 flex gap-3 overflow-x-auto px-5">
            {data?.newbie.active && (
              <Link href="/newbie" className="flex w-[220px] shrink-0 flex-col justify-between rounded-[18px] bg-white p-4" style={{ boxShadow: CARD_SHADOW }}>
                <span className="w-fit rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-bold text-[#9a5b00]">신규 유저</span>
                <p className="mt-2 text-[16px] font-bold">3일 혜택 최대 {fmt(data.newbie.totalMax)}P</p>
                <p className="mt-1 text-[12px] text-ink-2">{data.newbie.dayNo}일차 퀴즈 {data.newbie.doneToday}/{data.newbie.goal}{data.newbie.claimableCount > 0 ? " · 받을 보상 있음" : ""}</p>
              </Link>
            )}
            <Link href="/rush" className="flex w-[220px] shrink-0 flex-col justify-between rounded-[18px] bg-white p-4" style={{ boxShadow: CARD_SHADOW }}>
              <span className="flex items-center justify-between"><span className="w-fit rounded-full bg-myb-soft px-2 py-0.5 text-[11px] font-bold text-myb-dark">주간 러쉬</span>{data && <Countdown endsAt={data.rushEndsAt} compact />}</span>
              <p className="mt-2 text-[16px] font-bold">스탬프 {data?.rush.stamps ?? 0}/{data?.rush.total ?? 7}</p>
              <p className="mt-1 text-[12px] text-ink-2">{data && data.rush.claimable > 0 ? `받을 보상 ${data.rush.claimable}개` : "7개 모으면 300P"}</p>
            </Link>
            <Link href="/monthly" className="flex w-[220px] shrink-0 flex-col justify-between rounded-[18px] bg-white p-4" style={{ boxShadow: CARD_SHADOW }}>
              <span className="w-fit rounded-full bg-[#eeeaff] px-2 py-0.5 text-[11px] font-bold text-[#6b55e6]">월간</span>
              <p className="mt-2 text-[16px] font-bold">월간 도전 과제 3,300P</p>
              <p className="mt-1 text-[12px] text-ink-2">퀴즈·출석·게임·룰렛·초대</p>
            </Link>
          </div>
        </section>

        {/* 적립 메뉴 */}
        <section>
          <h2 className="text-[18px] font-bold">포인트 적립</h2>
          <ul className="mt-3 flex flex-col gap-5 rounded-[20px] bg-white p-5" style={{ boxShadow: CARD_SHADOW }}>
            {EARN.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className="flex items-center gap-3">
                  <IconTile name={m.name} tone={m.tone} size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5"><p className="text-[16px] font-semibold leading-[18px]">{m.title}</p>{m.chip && <span className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white" style={{ background: "linear-gradient(104deg,#ff2600,#ffad50)" }}>{m.chip}</span>}</span>
                    <p className="mt-1.5 text-[13px] leading-[16px] text-ink-2">{m.sub}</p>
                  </span>
                  <ChevronRight className="text-muted" size={18} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 제휴 오퍼(연동 전 미리보기): 게임 · 설문 · 초간단 */}
        <section>
          <div className="flex items-end justify-between">
            <h2 className="text-[18px] font-bold">게임하고 적립 <span className="ml-1 text-[12px] font-medium text-muted">첫 미션 +1,000P</span></h2>
            <Link href="/game" className="text-[13px] font-semibold text-ink-2">전체보기 ›</Link>
          </div>
          <div className="no-scrollbar -mx-5 mt-3 flex gap-3 overflow-x-auto px-5">
            {(offers?.games ?? []).slice(0, 6).map((g) => (
              <Link key={g.id} href={`/game/${g.id}`} className="w-[132px] shrink-0 rounded-[18px] bg-white p-3" style={{ boxShadow: CARD_SHADOW }}>
                <img src={g.icon} alt="" width={108} height={108} className="h-[108px] w-[108px] rounded-[16px] object-cover" />
                <p className="mt-2 truncate text-[13px] font-bold">{g.title}</p>
                <p className="truncate text-[11px] text-ink-2">{g.missionText}</p>
                <p className="mt-1 flex items-center gap-1 text-[13px] font-bold text-myb-dark"><PCoin size={13} />{fmt(g.missionPoint + g.bonusPoint)}</p>
              </Link>
            ))}
            {!offers && [0, 1, 2].map((i) => <div key={i} className="h-[196px] w-[132px] shrink-0 animate-pulse rounded-[18px] bg-white" />)}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between">
            <h2 className="text-[18px] font-bold">설문 보상 <span className="ml-1 text-[12px] font-medium text-muted">오늘 {fmt(offers?.surveyTotal ?? 0)}P 가능</span></h2>
            <Link href="/survey" className="text-[13px] font-semibold text-ink-2">전체보기 ›</Link>
          </div>
          <ul className="mt-3 flex flex-col gap-2.5">
            {(offers?.surveys ?? []).slice(0, 3).map((sv) => (
              <li key={sv.id}>
                <Link href="/survey" className="flex items-center gap-3 rounded-[18px] bg-white p-3.5" style={{ boxShadow: CARD_SHADOW }}>
                  <IconTile name="doc" tone="violet" size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-bold">{sv.title}</span>
                    <span className="mt-0.5 block text-[11px] text-muted">약 {Math.max(1, sv.loi)}분</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-[15px] font-bold text-myb-dark"><PCoin size={16} />{fmt(sv.reward)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-end justify-between">
            <h2 className="text-[18px] font-bold">초간단 적립 <span className="ml-1 text-[12px] font-medium text-muted">1분 미션</span></h2>
            <Link href="/cpq" className="text-[13px] font-semibold text-ink-2">전체보기 ›</Link>
          </div>
          <ul className="mt-3 flex flex-col gap-2.5">
            {(offers?.cpq ?? []).slice(0, 3).map((c) => (
              <li key={c.id}>
                <Link href="/cpq" className="flex items-center gap-3 rounded-[18px] bg-white p-3.5" style={{ boxShadow: CARD_SHADOW }}>
                  <img src={c.icon} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-[12px] bg-bg-2 object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="inline-block rounded-full bg-bg-2 px-2 py-0.5 text-[10px] font-bold text-ink-2">{c.type}</span>
                    <span className="mt-1 block truncate text-[14px] font-bold">{c.title}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-[15px] font-bold text-myb-dark"><PCoin size={16} />+{fmt(c.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-center text-[11px] text-muted">게임·설문·초간단 적립은 제휴사 연동 전 미리보기예요</p>
        </section>
      </div>
    </div>
  );
}

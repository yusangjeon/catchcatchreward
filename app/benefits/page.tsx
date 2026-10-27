"use client";

import { DuoIcon, IconTile, type DuoName, type Tone } from "@/components/icons/duo";
import Link from "next/link";
import { PCoin, ChevronRight } from "@/components/icons";
import { NumberFlow } from "@/components/motion/NumberFlow";
import { Countdown } from "@/components/motion/Countdown";
import { useHome, fmt } from "@/hooks/useHome";
import { useEffect, useState } from "react";
import type { BenefitGame, BenefitSurvey } from "@/lib/benefit/types";
import type { CpqItem } from "@/lib/cpq/types";

/* eslint-disable @next/next/no-img-element */

 

const CARD_SHADOW = "0 5px 16px rgba(40,24,14,.08)";

const EARN: { name: DuoName; tone: Tone; title: string; sub: string; href: string; chip?: string }[] = [
  { name: "calendar", tone: "green", title: "출석체크", sub: "매일 10P + 스탬프 1 · 7일 연속 +50P", href: "/attendance" },
  { name: "bolt", tone: "blue", title: "만보기", sub: "걷기만 해도 하루 최대 210P · 1,000걸음마다 보상", href: "/walk", chip: "NEW" },
  { name: "quiz", tone: "blue", title: "취향 퀴즈", sub: "세트 완료마다 포인트 + 랜덤 보너스 + 스탬프", href: "/quiz", chip: "HOT" },
  { name: "search", tone: "violet", title: "틀린그림찾기", sub: "하루 3판 · LV1→3 점점 어려워져요 · 완주 보너스", href: "/games/spot", chip: "NEW" },
  { name: "gamepad", tone: "violet", title: "미니게임", sub: "2048 · 복권 · 가위바위보 · 카드 뒤집기 · 틀린그림", href: "/games", chip: "HOT" },
  { name: "wheel", tone: "amber", title: "무료 룰렛", sub: "스탬프 10개 = 1회 · 최대 편의점 5,000원", href: "/roulette" },
  { name: "people", tone: "pink", title: "친구 초대", sub: "친구 300P · 친구가 첫 퀴즈 완료하면 나는 500P", href: "/invite", chip: "500P" },
  { name: "pin", tone: "teal", title: "플레이스 방문하기", sub: "동네 플레이스 방문·저장·리뷰 인증하고 포인트 + 스탬프", href: "/missions" },
  { name: "bag", tone: "blue", title: "쇼핑 방문 적립", sub: "제휴 쇼핑몰 방문만 해도 하루 5P", href: "/shop" },
];

interface Offers { hero: BenefitGame; games: BenefitGame[]; surveys: BenefitSurvey[]; surveyTotal: number; cpq: CpqItem[]; rushEndsAt: string }

/** 게임 히어로 배경 — 원본(벤핏허브)의 네이비→연회색 그라디언트를 우리 bg 로 끝나게 */
const HERO_BG = "linear-gradient(#12141f 8%, #131722 24%, #1a263e 40%, #203051 50%, #273c64 61%, #4e668c 71%, #9dadc8 82%, #e3e4ea 92%, #faf9f7 100%)";

/** 혜택 탭 — 우리 기능 허브(오늘 할 일 · 진행 중 이벤트 · 적립 메뉴 · 준비 중 제휴) */
export default function BenefitsPage() {
  const { data } = useHome();
  const [offers, setOffers] = useState<Offers | null>(null);
  useEffect(() => {
    Promise.all([fetch("/api/benefit").then((r) => r.json()), fetch("/api/survey").then((r) => r.json()), fetch("/api/cpq").then((r) => r.json())])
      .then(([b, sv, c]) => setOffers({ hero: b.hero, games: b.games, surveys: b.surveys, surveyTotal: sv.totalAvailable, cpq: c.list, rushEndsAt: b.rushEndsAt }))
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

      {/* 오늘의 AI 추천 게임 — 원본 벤핏허브 구조(카운트다운 띠 → 히어로 게임 → 추가 보상 CTA → 게임 카드 → 더 많은 게임) */}
      <section className="relative pt-[48px]" style={{ background: HERO_BG }}>
        {offers ? <Countdown endsAt={offers.rushEndsAt} /> : <div className="h-[74px] bg-white/[0.08]" />}
        <div className="relative flex flex-col items-center px-6 pt-7">
          <p className="flex items-center gap-1.5 text-[15px] font-bold tracking-[-0.3px] text-white"><DuoIcon name="sparkle" size={14} className="text-gold" />오늘의 AI 추천 게임<DuoIcon name="sparkle" size={14} className="text-gold" /></p>
          <div className="mt-4 flex w-full flex-col items-center gap-7">
            {offers ? (
              <Link href={`/game/${offers.hero.id}`} className="myb-press flex w-full flex-col items-center gap-3">
                <img src={offers.hero.icon} width={141} height={141} alt="" className="myb-pop-in h-[141px] w-[141px] rounded-[28px] object-cover" style={{ boxShadow: "0 12px 30px rgba(0,0,0,.35)" }} />
                <div className="flex w-full flex-col items-center gap-1">
                  <p className="w-full truncate text-center text-[17px] font-bold text-white">{offers.hero.title}</p>
                  <p className="text-[14px] font-medium text-[#dee2e9]">{offers.hero.missionText}</p>
                </div>
              </Link>
            ) : (
              <div className="flex w-full flex-col items-center gap-3"><div className="myb-skeleton h-[141px] w-[141px] rounded-[28px]" /><div className="myb-skeleton h-[22px] w-32 rounded" /><div className="myb-skeleton h-[19px] w-24 rounded" /></div>
            )}
            <div className="relative w-full">
              <span className="absolute left-1/2 top-[-16px] z-10 flex h-[26px] -translate-x-1/2 items-center justify-center gap-1 whitespace-nowrap rounded-full px-3 text-[13px] font-bold text-ink" style={{ background: "linear-gradient(#ffd147 0%, #ff9d00 100%)" }}>
                <DuoIcon name="bolt" size={13} />지금 아니면 혜택 끝!<DuoIcon name="bolt" size={13} />
              </span>
              <Link href={offers ? `/game/${offers.hero.id}` : "/game"} className="myb-press flex h-[52px] w-full items-center justify-center gap-1 rounded-[14px] bg-myb text-[16px] font-bold text-white shadow-[0_8px_20px_rgba(255,90,45,.35)]">
                <span className="flex items-center gap-1"><PCoin size={18} />{offers ? fmt(offers.hero.missionPoint) : "—"}</span>
                <span className="mx-0.5">+</span>
                <span className="flex items-center gap-1"><PCoin size={18} />{offers ? fmt(offers.hero.bonusPoint) : "1,000"} 추가 보상!</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-5 pb-4 pt-8">
          <h2 className="text-[20px] font-semibold leading-[23px] text-white">이런 게임도 있어요</h2>
          <span className="flex h-[21px] items-center gap-0.5 rounded-full bg-white/15 px-2 text-[11px] font-bold text-white"><DuoIcon name="sparkle" size={11} className="text-gold" />AI 추천</span>
        </div>
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-6">
          {offers ? offers.games.map((g) => (
            <Link key={g.id} href={`/game/${g.id}`} className="myb-press flex h-[220px] w-[150px] shrink-0 flex-col items-center justify-between overflow-hidden rounded-[18px] bg-white px-4 pb-4 pt-5" style={{ boxShadow: CARD_SHADOW }}>
              <div className="flex w-full flex-col items-center gap-[10px]">
                <img src={g.icon} width={84} height={84} alt="" className="h-[84px] w-[84px] rounded-[18px] object-cover" />
                <div className="flex w-full flex-col items-center gap-[2px]">
                  <p className="w-full truncate text-center text-[15px] font-bold text-ink">{g.title}</p>
                  <p className="w-full truncate text-center text-[13px] font-medium text-ink-2">{g.missionText}</p>
                </div>
              </div>
              <span className="flex h-9 w-full items-center justify-center gap-[2px] rounded-[10px] bg-myb-soft text-[14px] font-bold text-myb-dark">
                <span className="flex items-center gap-[3px]"><PCoin size={14} />{fmt(g.missionPoint)}</span>+{fmt(g.bonusPoint)}
              </span>
            </Link>
          )) : [0, 1, 2].map((i) => <div key={i} className="myb-skeleton h-[220px] w-[150px] shrink-0 rounded-[18px]" />)}
        </div>
        <Link href="/game" className="my-3 flex h-[58px] w-full items-center justify-center gap-1 text-[16px] font-semibold text-ink">
          더 많은 게임 보기 <ChevronRight size={20} />
        </Link>
      </section>

      {/* 지금 가장 Hot한 설문 — 원본 랭킹 리스트(메달 1~3위) */}
      <section className="px-5 pb-2 pt-2">
        <div className="flex items-center justify-between pb-3">
          <h2 className="flex items-center gap-1.5 text-[20px] font-semibold leading-[23px]">지금 가장 Hot한 설문 <DuoIcon name="flame" size={20} className="text-myb" /></h2>
          <Link href="/survey" aria-label="설문 보상" className="text-ink-2"><ChevronRight size={24} /></Link>
        </div>
        <div className="flex flex-col gap-5 rounded-[20px] bg-white px-5 pb-6 pt-5" style={{ boxShadow: CARD_SHADOW }}>
          {offers ? offers.surveys.map((sv, i) => (
            <Link key={sv.id} href="/survey" className="flex h-12 w-full items-center gap-[14px]">
              <span className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[15px] font-bold ${i === 0 ? "bg-[#fff1c2] text-[#b07a00]" : i === 1 ? "bg-[#eef1f6] text-[#6b7686]" : i === 2 ? "bg-[#fde9dc] text-[#b5602a]" : "text-muted"}`}>{i + 1}</span>
              <span className="flex min-w-0 flex-1 flex-col gap-[6px]">
                <span className="truncate text-[16px] font-medium">{sv.title}</span>
                <span className="flex gap-1">
                  <span className="flex h-5 items-center rounded-full bg-blue-soft px-[6px] text-[12px] font-medium text-blue">{sv.loi}분</span>
                  {sv.label && <span className="flex h-5 items-center rounded-full px-[6px] text-[12px] font-medium" style={{ background: sv.label.bg, color: sv.label.color }}>{sv.label.text}</span>}
                </span>
              </span>
              <span className="flex h-[26px] shrink-0 items-center gap-[3px] rounded-full bg-myb px-2.5 text-[14px] font-semibold text-white"><PCoin size={14} />{fmt(sv.reward)}</span>
            </Link>
          )) : [0, 1, 2, 3, 4].map((i) => <div key={i} className="myb-skeleton h-12 rounded-lg" />)}
        </div>
      </section>

      <div className="flex flex-col gap-8 px-5 pb-10 pt-6">
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

        {/* 초간단 적립(연동 전 미리보기) */}
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

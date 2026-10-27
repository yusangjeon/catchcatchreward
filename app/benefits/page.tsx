"use client";

import { DuoIcon, IconTile, type DuoName, type Tone } from "@/components/icons/duo";
import Link from "next/link";
import { PCoin, ChevronRight } from "@/components/icons";
import { NumberFlow } from "@/components/motion/NumberFlow";
import { Countdown } from "@/components/motion/Countdown";
import { useHome, fmt } from "@/hooks/useHome";

 

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

const SOON: { name: DuoName; title: string; sub: string; href: string }[] = [
  { name: "gamepad", title: "게임적립", sub: "게임 설치·플레이 보상", href: "/game" },
  { name: "chat", title: "설문 보상", sub: "설문 참여하고 포인트", href: "/survey" },
  { name: "bolt", title: "초간단적립", sub: "앱 설치·가입 참여", href: "/cpq" },
];

/** 혜택 탭 — 우리 기능 허브(오늘 할 일 · 진행 중 이벤트 · 적립 메뉴 · 준비 중 제휴) */
export default function BenefitsPage() {
  const { data } = useHome();
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
          <p className="mt-1 text-[22px] font-extrabold leading-[28px]">오늘 다 하면<br />최대 {fmt(data?.newbie.active ? 300 + 10 + 30 + 60 : 10 + 30 + 60)}P 이상</p>
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
                <p className="mt-2 text-[16px] font-extrabold">3일 혜택 최대 {fmt(data.newbie.totalMax)}P</p>
                <p className="mt-1 text-[12px] text-ink-2">{data.newbie.dayNo}일차 퀴즈 {data.newbie.doneToday}/{data.newbie.goal}{data.newbie.claimableCount > 0 ? " · 받을 보상 있음" : ""}</p>
              </Link>
            )}
            <Link href="/rush" className="flex w-[220px] shrink-0 flex-col justify-between rounded-[18px] bg-white p-4" style={{ boxShadow: CARD_SHADOW }}>
              <span className="flex items-center justify-between"><span className="w-fit rounded-full bg-myb-soft px-2 py-0.5 text-[11px] font-bold text-myb-dark">주간 러쉬</span>{data && <Countdown endsAt={data.rushEndsAt} compact />}</span>
              <p className="mt-2 text-[16px] font-extrabold">스탬프 {data?.rush.stamps ?? 0}/{data?.rush.total ?? 7}</p>
              <p className="mt-1 text-[12px] text-ink-2">{data && data.rush.claimable > 0 ? `받을 보상 ${data.rush.claimable}개` : "7개 모으면 300P"}</p>
            </Link>
            <Link href="/monthly" className="flex w-[220px] shrink-0 flex-col justify-between rounded-[18px] bg-white p-4" style={{ boxShadow: CARD_SHADOW }}>
              <span className="w-fit rounded-full bg-[#eeeaff] px-2 py-0.5 text-[11px] font-bold text-[#6b55e6]">월간</span>
              <p className="mt-2 text-[16px] font-extrabold">월간 도전 과제 3,300P</p>
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

        {/* 준비 중 */}
        <section>
          <h2 className="text-[18px] font-bold">곧 열려요 <span className="ml-1 text-[12px] font-medium text-muted">제휴사 연동 준비 중</span></h2>
          <ul className="mt-3 grid grid-cols-3 gap-3">
            {SOON.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className="flex flex-col items-center rounded-[16px] bg-white px-2 py-4 text-center" style={{ boxShadow: CARD_SHADOW }}>
                  <IconTile name={m.name} tone="gray" size={40} />
                  <p className="mt-2 text-[13px] font-bold">{m.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{m.sub}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

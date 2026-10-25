"use client";

import Link from "next/link";
import { useHome, fmt } from "@/hooks/useHome";
import { BellIcon, ChevronRight, GiftIcon, PCoin } from "@/components/icons";
import { SetCard } from "@/components/SetCard";

const QUICK = [
  { icon: "📅", label: "출석체크" },
  { icon: "🎮", label: "미니게임" },
  { icon: "🍯", label: "꿀 충전", tip: "903개 충전 가능" },
  { icon: "💌", label: "친구초대" },
];

export default function HomePage() {
  const { data, error } = useHome();
  const sets = data?.sets ?? [];

  return (
    <div className="bg-white">
      {/* 상단바 */}
      <header className="flex h-14 items-center justify-between px-5">
        <Link href="/wallet" className="flex items-center gap-2">
          <PCoin size={30} />
          <span className="text-[19px] font-bold tabular-nums">{data ? fmt(data.wallet.balance) : "—"}</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex h-9 items-center gap-1.5 rounded-lg border border-line bg-bg-2 px-3 text-[14px] font-semibold">
            <span className="inline-block h-4 w-4 rotate-45 rounded-[4px] bg-[#d9c7a3] ring-2 ring-[#f0e6d2]" aria-hidden />
            베이직
          </span>
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-myb text-white">
            <GiftIcon />
            <i className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red ring-2 ring-white" />
          </span>
          <BellIcon className="text-[#b8bfc9]" />
        </div>
      </header>

      {/* 비포인트 러쉬 배너 */}
      <div className="flex h-[54px] items-center justify-between bg-gradient-to-r from-[#efe6ff] via-[#f3e4fb] to-[#ffe3f3] px-5">
        <p className="flex items-center gap-1.5 text-[15px] font-extrabold text-purple">
          <span className="relative">
            비포인트 러쉬
            <span className="absolute -right-3 -top-3 text-[14px]" aria-hidden>🪙</span>
          </span>
          <span className="ml-2 text-[13px] font-semibold">6일 남음</span>
        </p>
        <button type="button" className="relative flex h-9 items-center gap-0.5 rounded-xl bg-gradient-to-r from-[#8e5cf0] to-[#b56cf3] px-3 text-[13px] font-bold text-white">
          무료 룰렛 돌리기 <ChevronRight size={14} />
          <i className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red ring-2 ring-white" />
        </button>
      </div>

      {/* 오늘의 루틴 */}
      <section className="px-5 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[21px] font-bold">오늘의 루틴</h2>
          <button type="button" className="flex h-8 items-center gap-0.5 rounded-full border border-[#dfe3ea] px-3 text-[13px] text-ink-2">
            더보기 <ChevronRight size={13} />
          </button>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-[#ffcf6b] bg-[#fffbf1] p-4">
          <span className="text-[38px] leading-none" aria-hidden>🍯</span>
          <div className="flex-1">
            <p className="text-[17px] font-semibold">첫번째 무료 꿀 <b className="font-extrabold">받기</b></p>
            <p className="mt-0.5 text-[14px] text-muted">퀴즈 푸는데 필요해요</p>
          </div>
          <Link href="/quiz" className="relative flex h-10 items-center rounded-xl bg-myb px-5 text-[15px] font-bold text-white">
            이동
            <i className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red ring-2 ring-white" />
          </Link>
        </div>
      </section>

      {/* 내게 딱 맞는 퀴즈 */}
      <section className="mt-8 bg-[#f4f6fa] pb-6 pt-7">
        <Link href="/quiz" className="flex items-center justify-between px-5">
          <h2 className="text-[22px] font-bold">내게 딱 맞는 퀴즈</h2>
          <ChevronRight size={22} className="text-ink-2" />
        </Link>
        <div className="mt-4 flex gap-3 px-5">
          <span className="flex h-12 items-center gap-1.5 rounded-xl border border-myb-line bg-myb-soft px-4 text-[17px] font-semibold">
            <span aria-hidden>🍯</span> 보유 꿀 {data ? data.honey : "—"} <ChevronRight size={14} className="text-muted" />
          </span>
          <span className="relative flex h-12 flex-1 items-center justify-between overflow-hidden rounded-xl bg-gradient-to-r from-[#3f7cff] via-[#6a6cf8] to-[#9c5af5] px-4 text-white">
            <span className="whitespace-nowrap text-[18px] font-black italic tracking-tight text-[#ffe14d]">프리패스</span>
            <span className="whitespace-nowrap text-[12px] font-semibold">광고 시청 없이</span>
          </span>
        </div>

        <div className="no-scrollbar mt-5 flex gap-4 overflow-x-auto px-5">
          {sets.length > 0
            ? sets.map((s) => <SetCard key={s.id} s={s} />)
            : [0, 1, 2].map((i) => <div key={i} className="h-[230px] w-[150px] shrink-0 animate-pulse rounded-xl bg-bg-2" />)}
        </div>

        <div className="mx-5 mt-6 border-t border-[#e3e7ee]" />
        <ul className="mt-5 grid grid-cols-4 px-3">
          {QUICK.map((qk) => (
            <li key={qk.label} className="relative flex flex-col items-center gap-1">
              {qk.tip && (
                <span className="absolute -top-6 whitespace-nowrap rounded-full bg-[#ff8a3d] px-2.5 py-1 text-[11px] font-bold text-white after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-[#ff8a3d]">
                  {qk.tip}
                </span>
              )}
              <span className="text-[30px] leading-none" aria-hidden>{qk.icon}</span>
              <span className="text-[12px] font-medium text-ink-2">{qk.label}</span>
            </li>
          ))}
        </ul>
      </section>

      {error && <p className="py-3 text-center text-xs text-red">연결 오류: {error}</p>}
    </div>
  );
}

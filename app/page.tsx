"use client";

import Link from "next/link";
import { useHome } from "@/hooks/useHome";
import { BellIcon, ChevronRight, GiftIcon, PCoin } from "@/components/icons";
import { SetCard } from "@/components/SetCard";
import { Banners } from "@/components/motion/Banners";
import { NumberFlow } from "@/components/motion/NumberFlow";

/* eslint-disable @next/next/no-img-element */

/** 마이비 reward-banner 원본(327×72) — upload.myb.im 캡처본 */
const BANNERS = ["/myb/up/2025-12-19T03_30_12.125Z_banner.webp", "/myb/up/2025-12-29T08_07_33.114Z_133.webp", "/myb/up/2025-12-29T08_07_50.926Z_banner.webp", "/myb/up/2026-02-11T05-23-58.433Z_2509_myb_quizpass-banner_v1_327x72.webp", "/myb/up/2026-04-24T07-33-12.788Z_2604_myb_manboki-banner_v1_327x72-1.webp", "/myb/up/2026-04-24T07-33-32.380Z_2604_myb_manboki-banner_v1_327x72.webp", "/myb/up/2026-04-27T01-55-48.943Z_2604_myb_manboki-banner_v1_327x72.webp"];

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
      <header className="flex h-[55px] items-center justify-between px-5">
        <Link href="/wallet" className="flex items-center gap-2">
          <PCoin size={24} />
          <span className="text-[16px] font-bold tabular-nums">{data ? <NumberFlow value={data.wallet.balance} /> : "—"}</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex h-[26px] items-center gap-1.5 rounded-lg border border-line bg-bg-2 px-2 text-[12px] font-semibold">
            <span className="inline-block h-3 w-3 rotate-45 rounded-[3px] bg-[#d9c7a3] ring-2 ring-[#f0e6d2]" aria-hidden />
            베이직
          </span>
          <span className="relative flex h-[26px] w-[26px] items-center justify-center rounded-md bg-myb text-white">
            <GiftIcon size={16} />
            <i className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red ring-2 ring-white" />
          </span>
          <BellIcon size={22} className="text-[#b8bfc9]" />
        </div>
      </header>

      {/* 비포인트 러쉬 배너 */}
      <div className="flex h-[44px] items-center justify-between bg-gradient-to-r from-[#efe6ff] via-[#f3e4fb] to-[#ffe3f3] px-5">
        <p className="flex items-center gap-1.5 text-[14px] font-extrabold text-purple">
          {/* 원본 라벨 이미지 ic_bpointrush.webp(351×52) */}
          <img src="/myb/bh/ic_bpointrush.webp" alt="비포인트 러쉬" height={22} className="h-[22px] w-auto" draggable={false} />
          <span className="ml-1 text-[12px] font-semibold">{data ? `${Math.max(1, Math.ceil((new Date(data.rushEndsAt).getTime() - Date.now()) / 86400_000))}일 남음` : "—"}</span>
        </p>
        <button type="button" className="relative flex h-[26px] items-center gap-0.5 rounded-lg bg-gradient-to-r from-[#8e5cf0] to-[#b56cf3] px-2.5 text-[11px] font-bold text-white">
          무료 룰렛 돌리기 <ChevronRight size={12} />
          <i className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red ring-2 ring-white" />
        </button>
      </div>

      {/* 오늘의 루틴 */}
      <section className="px-5 pt-[26px]">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold">오늘의 루틴</h2>
          <button type="button" className="flex h-7 items-center gap-0.5 rounded-full border border-[#dfe3ea] px-2.5 text-[12px] text-ink-2">
            더보기 <ChevronRight size={12} />
          </button>
        </div>
        <div className="mt-[14px] flex h-[74px] items-center gap-3 rounded-2xl border-2 border-[#ffcf6b] bg-[#fffbf1] px-4">
          <span className="text-[28px] leading-none" aria-hidden>🍯</span>
          <div className="flex-1">
            <p className="text-[15px] font-semibold">첫번째 무료 꿀 <b className="font-extrabold">받기</b></p>
            <p className="mt-0.5 text-[13px] text-muted">퀴즈 푸는데 필요해요</p>
          </div>
          <Link href="/quiz" className="relative flex h-8 items-center rounded-lg bg-myb px-4 text-[13px] font-bold text-white">
            이동
            <i className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red ring-2 ring-white" />
          </Link>
        </div>
      </section>

      {/* 내게 딱 맞는 퀴즈 */}
      <section className="mt-[14px] bg-[#f4f6fa] pb-5 pt-[26px]">
        <Link href="/quiz" className="flex items-center justify-between px-5">
          <h2 className="text-[20px] font-bold">내게 딱 맞는 퀴즈</h2>
          <ChevronRight size={20} className="text-ink-2" />
        </Link>
        <div className="mt-[14px] flex gap-3 px-5">
          <span className="flex h-[42px] items-center gap-1.5 rounded-xl border border-myb-line bg-myb-soft px-3.5 text-[15px] font-semibold">
            <span aria-hidden>🍯</span> 보유 꿀 {data ? data.honey : "—"} <ChevronRight size={14} className="text-muted" />
          </span>
          <span className="relative flex h-[42px] flex-1 items-center justify-between overflow-hidden rounded-xl bg-gradient-to-r from-[#3f7cff] via-[#6a6cf8] to-[#9c5af5] px-4 text-white">
            <span className="whitespace-nowrap text-[16px] font-black italic tracking-tight text-[#ffe14d]">프리패스</span>
            <span className="whitespace-nowrap text-[11px] font-semibold">광고 시청 없이</span>
          </span>
        </div>

        <div className="no-scrollbar mt-[18px] flex gap-4 overflow-x-auto px-5">
          {sets.length > 0
            ? sets.map((s) => <SetCard key={s.id} s={s} />)
            : [0, 1, 2].map((i) => <div key={i} className="h-[220px] w-[145px] shrink-0 animate-pulse rounded-xl bg-bg-2" />)}
        </div>

        <div className="mx-5 mt-2 border-t border-[#e3e7ee]" />
        <ul className="mt-[14px] grid grid-cols-4 px-3">
          {QUICK.map((qk) => (
            <li key={qk.label} className="relative flex flex-col items-center gap-1">
              {qk.tip && (
                <span className="absolute -top-6 whitespace-nowrap rounded-full bg-[#ff8a3d] px-2.5 py-1 text-[11px] font-bold text-white after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-[#ff8a3d]">
                  {qk.tip}
                </span>
              )}
              <span className="text-[26px] leading-none" aria-hidden>{qk.icon}</span>
              <span className="text-[11px] font-medium text-ink-2">{qk.label}</span>
            </li>
          ))}
        </ul>

        {/* 리워드 배너(자동 롤링) — 원본 327×72 */}
        <Banners images={BANNERS} className="mx-5 mt-[22px]" />
      </section>

      {error && <p className="py-3 text-center text-xs text-red">연결 오류: {error}</p>}
    </div>
  );
}

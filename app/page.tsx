"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHome, fmt } from "@/hooks/useHome";
import { useToast } from "@/components/motion/Toast";
import { ChevronRight, PCoin } from "@/components/icons";
import { SetCard } from "@/components/SetCard";
import { Banners } from "@/components/motion/Banners";
import { NumberFlow } from "@/components/motion/NumberFlow";

/* eslint-disable @next/next/no-img-element */

/** 마이비 reward-banner 원본(327×72) — upload.myb.im 캡처본 */
const BANNERS = ["/myb/up/2025-12-19T03_30_12.125Z_banner.webp", "/myb/up/2025-12-29T08_07_33.114Z_133.webp", "/myb/up/2025-12-29T08_07_50.926Z_banner.webp", "/myb/up/2026-02-11T05-23-58.433Z_2509_myb_quizpass-banner_v1_327x72.webp", "/myb/up/2026-04-24T07-33-12.788Z_2604_myb_manboki-banner_v1_327x72-1.webp", "/myb/up/2026-04-24T07-33-32.380Z_2604_myb_manboki-banner_v1_327x72.webp", "/myb/up/2026-04-27T01-55-48.943Z_2604_myb_manboki-banner_v1_327x72.webp"];

/** 퀵메뉴 아이콘 — 앱스토어 스크린샷 원본 픽셀(꿀 충전은 툴팁에 가려져 꿀단지 아이콘으로 대체) */
const QUICK: { icon: string; label: string; href?: string; tip?: string }[] = [
  { icon: "/myb/native/qm_attend.png", label: "출석체크" },
  { icon: "/myb/native/qm_minigame.png", label: "미니게임", href: "/roulette" },
  { icon: "/myb/native/ic_honey_jar.png", label: "꿀 충전", tip: "매일 0시 충전" },
  { icon: "/myb/native/qm_invite.png", label: "친구초대", href: "/invite" },
];

export default function HomePage() {
  const router = useRouter();
  const { data, error, reload } = useHome();
  const { show } = useToast();
  const sets = data?.sets ?? [];

  /** 출석체크: 1일 1회 10P + 스탬프 1 (마이비 러쉬 스탬프 미션과 동일 보상) */
  async function attend() {
    const res = await fetch("/api/attendance", { method: "POST" });
    const j = await res.json();
    if (!res.ok) return show("출석체크에 실패했어요", "info");
    if (j.already) show("오늘은 이미 출석했어요", "info");
    else show(`출석 완료! ${fmt(j.points)}P와 스탬프 1개를 받았어요`);
    await reload();
  }

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
            <img src="/myb/native/ic_basic_hex.png" alt="" className="h-[14px] w-[14px]" />
            베이직
          </span>
          <Link href="/roulette" aria-label="선물함(룰렛)"><img src="/myb/native/ic_gift_badge.png" alt="" className="h-[28px] w-[28px]" /></Link>
          <Link href="/notifications" aria-label="알림" className="relative">
            <img src="/myb/native/ic_bell.png" alt="" className="h-[24px] w-[24px]" />
            {data && (data.rush.claimable > 0 || !data.attendedToday) && <i className="absolute -right-0.5 top-0 h-2 w-2 rounded-full bg-red ring-2 ring-white" />}
          </Link>
        </div>
      </header>

      {/* 비포인트 러쉬 배너 */}
      <div className="flex h-[44px] items-center justify-between bg-gradient-to-r from-[#efe6ff] via-[#f3e4fb] to-[#ffe3f3] px-5">
        <p className="flex items-center gap-1.5 text-[14px] font-extrabold text-purple">
          {/* 원본 라벨 이미지 ic_bpointrush.webp(351×52) */}
          <img src="/myb/bh/ic_bpointrush.webp" alt="비포인트 러쉬" height={22} className="h-[22px] w-auto" draggable={false} />
          <span className="ml-1 text-[12px] font-semibold">{data ? `${Math.max(1, Math.ceil((new Date(data.rushEndsAt).getTime() - Date.now()) / 86400_000))}일 남음` : "—"}</span>
        </p>
        <Link href="/rush" className="relative flex h-[26px] items-center gap-0.5 rounded-lg bg-gradient-to-r from-[#8e5cf0] to-[#b56cf3] px-2.5 text-[11px] font-bold text-white">
          {data ? `스탬프 ${data.rush.stamps}/${data.rush.total}` : "미션 보기"} <ChevronRight size={12} />
          {data && (data.rush.claimable > 0 || data.wallet.stamps >= 10) && <i className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red ring-2 ring-white" />}
        </Link>
      </div>

      {/* 오늘의 루틴 */}
      <section className="px-5 pt-[26px]">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold">오늘의 루틴</h2>
          <Link href="/rush" className="flex h-7 items-center gap-0.5 rounded-full border border-[#dfe3ea] px-2.5 text-[12px] text-ink-2">
            더보기 <ChevronRight size={12} />
          </Link>
        </div>
        <div className="mt-[12px] flex h-[70px] items-center gap-3 rounded-2xl border-2 border-[#ffcf6b] bg-[#fffbf1] px-4">
          <img src="/myb/native/ic_honey_jar.png" alt="" className="h-[36px] w-[30px] object-contain" />
          <div className="flex-1">
            <p className="text-[15px] font-semibold">오늘의 꿀 <b className="font-extrabold">{data ? `${data.honey}/${data.honeyMax}` : "—"}</b></p>
            <p className="mt-0.5 text-[13px] text-muted">{data && data.honey === 0 ? "내일 0시에 다시 충전돼요" : "퀴즈 푸는데 필요해요"}</p>
          </div>
          <Link href="/quiz" className="relative flex h-8 items-center rounded-lg bg-myb px-4 text-[13px] font-bold text-white">
            이동
            {data && data.honey > 0 && <i className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red ring-2 ring-white" />}
          </Link>
        </div>
      </section>

      {/* 내게 딱 맞는 퀴즈 */}
      <section className="mt-[12px] bg-[#f4f6fa] pb-5 pt-[24px]">
        <Link href="/quiz" className="flex items-center justify-between px-5">
          <h2 className="text-[20px] font-bold">내게 딱 맞는 퀴즈</h2>
          <ChevronRight size={20} className="text-ink-2" />
        </Link>
        <div className="mt-[14px] flex gap-3 px-5">
          <span className="flex h-[42px] items-center gap-1.5 rounded-xl border border-myb-line bg-myb-soft px-3.5 text-[15px] font-semibold">
            <img src="/myb/native/ic_honey_small.png" alt="" className="h-[16px] w-[14px] object-contain" /> 보유 꿀 {data ? data.honey : "—"} <ChevronRight size={14} className="text-muted" />
          </span>
          {/* 프리패스 배너 — 원본 픽셀(캐릭터 장식 포함) */}
          <span className="relative flex h-[42px] flex-1 items-end">
            <img src="/myb/native/img_freepass_pill.png" alt="프리패스 · 광고 시청 없이" className="absolute bottom-0 left-0 h-[52px] w-full object-fill object-bottom" />
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
            <li
              key={qk.label}
              className="relative flex cursor-pointer flex-col items-center gap-1"
              role="button"
              onClick={qk.label === "출석체크" ? () => void attend() : qk.href ? () => router.push(qk.href!) : () => show(`꿀은 매일 0시에 ${data?.honeyMax ?? 8}개 충전돼요`, "info")}
            >
              {qk.label === "출석체크" && data?.attendedToday && <span className="absolute -top-1 right-3 flex h-4 w-4 items-center justify-center rounded-full bg-myb text-[10px] text-white">✓</span>}
              {qk.tip && (
                <span className="absolute -top-6 whitespace-nowrap rounded-full bg-[#ff8a3d] px-2.5 py-1 text-[11px] font-bold text-white after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-[#ff8a3d]">
                  {qk.tip}
                </span>
              )}
              <img src={qk.icon} alt="" className="h-[30px] w-[34px] object-contain" />
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

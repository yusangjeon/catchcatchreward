"use client";

import { Mascot } from "@/components/motion/Mascot";
import { DuoIcon, IconTile, type DuoName, type Tone } from "@/components/icons/duo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useHome, fmt } from "@/hooks/useHome";
import { useToast } from "@/components/motion/Toast";
import { burstAtPointer, confetti, flyToBalance } from "@/lib/fxEngine";
import { showReward } from "@/lib/reward";
import { ChevronRight, PCoin } from "@/components/icons";
import { SetCard } from "@/components/SetCard";
import { Banners, type BannerSlide } from "@/components/motion/Banners";
import { NumberFlow } from "@/components/motion/NumberFlow";
import { FlatIcon } from "@/components/icons/duo";
import { ONB_KEY } from "@/components/Onboarding";

/* eslint-disable @next/next/no-img-element */

/** 홈 하단 롤링 배너 */
const BANNERS: BannerSlide[] = [
  { title: "친구 초대하고 500P", sub: "친구는 300P, 나는 첫 퀴즈 완료 시 500P", icon: "people", tone: "pink", href: "/invite", bg: "linear-gradient(90deg,#ffe9f1,#fff4f8)" },
  { title: "매일 무료 룰렛 1회", sub: "스탬프 10개마다 한 번 더, 최대 5,000원 편의점 상품권", icon: "wheel", tone: "amber", href: "/roulette", bg: "linear-gradient(90deg,#fff3d6,#fff9ea)" },
  { title: "월간 도전 과제 최대 3,300P", sub: "이번 달 퀴즈·출석·게임 다 채우면", icon: "trophy", tone: "violet", href: "/monthly", bg: "linear-gradient(90deg,#2b3a67,#4257a3)", dark: true },
  { title: "틀린그림찾기 하루 3판", sub: "LV1→3 점점 어려워져요 · 완주 보너스", icon: "search", tone: "blue", href: "/games/spot", bg: "linear-gradient(90deg,#e8f1ff,#f3f8ff)" },
];

/** 퀵메뉴(마이비 영상 기준: 출석체크·만보기·3일 혜택·게임적립·내 쇼핑 … 가로 스크롤 + 점 인디케이터) */
const QUICK: { key: string; name?: DuoName; tone?: Tone; label: string; href?: string; tip?: string }[] = [
  { key: "attend", name: "calendar", tone: "green", label: "출석체크" },
  { key: "walk", name: "bolt", tone: "blue", label: "만보기", href: "/walk" },
  { key: "games", name: "gamepad", tone: "violet", label: "미니게임", href: "/games" },
  { key: "honey", name: "drop", tone: "amber", label: "꿀 충전" },
  { key: "shop", name: "bag", tone: "blue", label: "내 쇼핑", href: "/shop" },
  { key: "store", name: "pin", tone: "teal", label: "플레이스", href: "/missions" },
  { key: "roulette", name: "wheel", tone: "orange", label: "룰렛", href: "/roulette" },
  { key: "invite", name: "people", tone: "pink", label: "친구초대", href: "/invite" },
  { key: "newbie", label: "3일 혜택", href: "/newbie", tip: "최대 1,500P" },
  { key: "doc", name: "doc", tone: "violet", label: "설문보상", href: "/survey" },
];

/** 상단 회전 칩 쌍(마이비4: "함께적립 ›" "룰렛 돌리기 ›" 가 몇 초마다 바뀜) */
const CHIP_PAIRS: { icon: string; label: string; href: string; bg: string; color: string }[][] = [
  [{ icon: "invite", label: "친구초대 500P", href: "/invite", bg: "#ffe9f1", color: "#d63a74" }, { icon: "roulette", label: "룰렛 돌리기", href: "/roulette", bg: "#fff3d6", color: "#b06a00" }],
  [{ icon: "flame", label: "캐치 러쉬", href: "/rush", bg: "#fff0ea", color: "#e0441a" }, { icon: "trophy", label: "월간 과제 3,300P", href: "/monthly", bg: "#eeeaff", color: "#6b55e6" }],
  [{ icon: "walk", label: "걷고 210P", href: "/walk", bg: "#e8f1ff", color: "#2f6fed" }, { icon: "search", label: "틀린그림찾기", href: "/games/spot", bg: "#e6f7f1", color: "#0f9b6a" }],
];

/** 포인트 모아서 살 수 있어요 — 지갑 상품 타일(원본 픽셀) */
const PRODUCTS: { brand: string; name: string; points: number; img?: string; emoji?: string; bg: string }[] = [
  { brand: "GS25", name: "빙그레)바나나우유240ML", points: 1900, img: "/products/banana_milk.webp", bg: "var(--color-bg-2)" },
  { brand: "스타벅스", name: "아이스 카페 아메리카노T", points: 6956, img: "/products/americano_tall.webp", bg: "#dff3ea" },
  { brand: "네이버페이", name: "네이버페이 포인트 10,000원", points: 12000, img: "/products/npay_10000.webp", bg: "var(--color-bg-2)" },
  { brand: "신세계", name: "신세계 상품권 10,000원", points: 14900, img: "/products/ssg_10000.webp", bg: "var(--color-bg-2)" },
];

export default function HomePage() {
  const router = useRouter();
  const { data, error, reload } = useHome();
  const { show } = useToast();
  const sets = data?.sets ?? [];
  const [welcome, setWelcome] = useState(false);
  const [installHint, setInstallHint] = useState(false);
  const [ad, setAd] = useState<{ left: number } | null>(null); // 꿀 충전 모의 광고

  useEffect(() => {
    if (!ad || ad.left <= 0) return;
    const id = setTimeout(() => setAd((a) => (a ? { left: a.left - 1 } : a)), 1000);
    return () => clearTimeout(id);
  }, [ad]);
  async function finishAd() {
    const res = await fetch("/api/honey", { method: "POST" });
    const j = await res.json();
    setAd(null);
    if (!res.ok) return show(j.message ?? "충전 실패", "info");
    show(`꿀 1개 충전! 오늘 ${j.topups}/${j.max}회`);
    await reload();
  }

  // 가입 보너스 웰컴 시트(1회) · PWA 설치 힌트(모바일 브라우저, 닫으면 다시 안 띄움)
  useEffect(() => {
    if (!data) return;
    try {
      if (data.welcome.justNow && !localStorage.getItem("ccr_welcome") && localStorage.getItem(ONB_KEY) === "done") {
        setWelcome(true);
        localStorage.setItem("ccr_welcome", "1");
      }
      const standalone = window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && (navigator as unknown as { standalone?: boolean }).standalone === true);
      const mobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
      if (!standalone && mobile && !localStorage.getItem("ccr_install_hint")) setInstallHint(true);
    } catch {
      /* 저장소 접근 불가 */
    }
  }, [data]);
  function closeInstallHint() {
    setInstallHint(false);
    try {
      localStorage.setItem("ccr_install_hint", "1");
    } catch {
      /* noop */
    }
  }

  /** 출석체크: 1일 1회 10P + 스탬프 1 (마이비 러쉬 스탬프 미션과 동일 보상) */
  async function attend() {
    const res = await fetch("/api/attendance", { method: "POST" });
    const j = await res.json();
    if (!res.ok) return show("출석체크에 실패했어요", "info");
    if (j.already) show(`오늘은 이미 출석했어요 (${j.streak}일 연속)`, "info");
    else { burstAtPointer("coins"); await showReward({ variant: "small", points: j.points + (j.bonus ?? 0), title: j.bonus ? `${j.streak}일 연속 출석 보너스!` : "출석 보상 지급!", subtitle: j.streak > 1 ? `${j.streak}일 연속` : "스탬프 +1" }); flyToBalance(6); if (j.bonus) setTimeout(() => confetti(100), 300); }
    if (!j.already) show(`출석 완료! ${fmt(j.points)}P와 스탬프 1개를 받았어요${j.streak > 1 ? ` · ${j.streak}일 연속` : ""}${j.bonus ? ` · 보너스 +${j.bonus}P` : ""}`);
    await reload();
  }

  return (
    <div className="bg-white">
      {/* 상단바 */}
      <div className="relative" style={{ background: "linear-gradient(180deg,#fff3cc 0%,#fff3cc 12%,#fff8e3 50%,#fffdf6 74%,#ffffff 100%)" }}>
      <header className="flex h-[55px] items-center justify-between px-5">
        <Link href="/wallet" className="flex items-center gap-2">
          <PCoin size={24} />
          <span id="hdr-balance" className="text-[16px] font-bold tabular-nums">{data ? <NumberFlow value={data.wallet.balance} /> : "—"}</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/me" className="flex h-[26px] items-center gap-1.5 rounded-full bg-white/80 px-2.5 text-[12px] font-semibold shadow-[0_1px_3px_rgba(0,0,0,.06)]">
            {data?.me.avatarUrl ? <img src={data.me.avatarUrl} alt="" className="h-[16px] w-[16px] rounded-full object-cover" /> : <DuoIcon name="badge" size={14} className="text-[#2f6fed]" />}
            {data?.newbie.active ? "신규 유저" : data?.me.loggedIn ? (data.me.nickname ?? "MY").slice(0, 6) : "베이직"}
          </Link>
          <Link href="/gifts" aria-label="선물함" className="text-ink"><DuoIcon name="gift" size={26} /></Link>
          <Link href="/notifications" aria-label="알림" className="relative">
            <DuoIcon name="bell" size={26} className="text-ink" />
            {data && (data.rush.claimable > 0 || !data.attendedToday) && <i className="absolute -right-0.5 top-0 h-2 w-2 rounded-full bg-red ring-2 ring-white" />}
          </Link>
        </div>
      </header>

      {/* 회전 칩 2개(마이비4) */}
      <PillChips />

      {/* 오늘의 루틴(마이비4 "첫번째 무료 꿀 받기" 카드) + 마스코트 */}
      {(() => {
        const nb = data?.newbie.active ? data.newbie : undefined;
        const reward = nb ? [300, 500, 700][nb.dayNo - 1] ?? 0 : 0; // lib/quiz/newbie NEWBIE_REWARDS 와 동일(server-only 라 직접 import 불가)
        const done = data ? Math.min(3, data.todayDone) : 0;
        const routines = [
          { key: "attend", icon: "attend", title: "오늘의 출석 보상 받기", sub: "10P + 룰렛 스탬프 1개 · 7일 연속 +50P", done: !!data?.attendedToday, cta: "받기", onTap: () => void attend() },
          { key: "quiz", icon: "quiz", title: nb ? `${nb.dayNo}일차 퀴즈 ${done}/3 풀기` : `오늘의 퀴즈 ${done}/3 풀기`, sub: nb ? (nb.claimableCount > 0 ? `${reward.toLocaleString()}P 받을 수 있어요!` : `다 풀면 ${reward.toLocaleString()}P · 세트마다 포인트+스탬프`) : "세트마다 포인트 + 랜덤 보너스 + 스탬프", done: done >= 3 && !(nb && nb.claimableCount > 0), cta: nb && nb.claimableCount > 0 ? "받기" : "풀기", href: nb ? "/newbie" : "/quiz" },
          { key: "roulette", icon: "roulette", title: "오늘의 무료 룰렛 돌리기", sub: "최대 1,000P · 편의점 5,000원 상품권", done: data ? !data.rouletteFree : false, cta: "돌리기", href: "/roulette" },
          { key: "spot", icon: "search", title: "틀린그림 1판", sub: "하루 3판 · 완주하면 최대 45P", done: false, cta: "하기", href: "/games/spot" },
        ];
        const doneCount = routines.filter((r) => r.done).length;
        const first = routines.find((r) => !r.done) ?? routines[0];
        const idx = routines.indexOf(first);
        const ord = ["첫 번째", "두 번째", "세 번째", "마지막"][idx] ?? "오늘의";
        const body = (
          <>
            <FlatIcon file={first.icon} size={44} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-bold text-ink">{first.title}</span>
              <span className="block truncate text-[12px] text-ink-2">{first.sub}</span>
            </span>
            <span className="relative flex h-9 shrink-0 items-center rounded-full bg-myb px-4 text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(255,90,45,.35)]">{first.cta}<i className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red ring-2 ring-white" /></span>
          </>
        );
        return (
          <section className="relative px-5 pt-[18px]" data-tour="routine">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[18px] font-bold text-ink">오늘의 루틴</p>
                <p className="mt-0.5 text-[12px] text-ink-2">{data ? `${ord} 루틴 · 오늘 ${doneCount}/${routines.length} 완료` : "매일 챙기는 포인트 루틴"}</p>
              </div>
              <Link href="/benefits" className="mb-0.5 flex items-center text-[13px] text-muted">더보기 <ChevronRight size={16} /></Link>
            </div>
            <div className="relative mt-3">
              <div className="absolute -top-[74px] right-1 z-10"><Mascot size={96} /></div>
              <div className="myb-press flex items-center gap-3 rounded-[18px] border border-[#ffe0a6] bg-white px-4 py-3.5 shadow-[0_8px_22px_rgba(224,150,40,.16)]" style={{ background: "linear-gradient(90deg,#fff9e9 0%,#ffffff 60%)" }}>
                {first.href ? <Link href={first.href} className="flex min-w-0 flex-1 items-center gap-3">{body}</Link> : <button type="button" onClick={first.onTap} className="flex min-w-0 flex-1 items-center gap-3 text-left">{body}</button>}
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 px-1">
                {routines.map((r) => <i key={r.key} className={`h-[5px] flex-1 rounded-full ${r.done ? "bg-myb" : "bg-[#f0e4cf]"}`} />)}
              </div>
            </div>
          </section>
        );
      })()}

      {/* 내게 딱 맞는 퀴즈 */}
      <section className="mt-[22px] px-5">
        <Link href="/quiz" className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-ink">내게 딱 맞는 퀴즈</h2>
          <ChevronRight size={20} className="text-muted" />
        </Link>
        <div className="mt-2.5 flex gap-2">
          <span className="flex h-[30px] items-center gap-1.5 rounded-full bg-white px-3 text-[12px] font-bold text-ink shadow-[0_2px_8px_rgba(224,150,40,.12)]"><FlatIcon file="honey" size={18} />보유 꿀 {data?.honey ?? 0}</span>
          {data?.starter.active ? (
            <span className="flex h-[30px] items-center gap-1.5 rounded-full px-3 text-[12px] font-bold text-white" style={{ background: "linear-gradient(90deg,#6b55e6,#9b7bff)" }}><DuoIcon name="sparkle" size={13} />스타터팩 보상 2배</span>
          ) : (
            <span className="flex h-[30px] items-center gap-1.5 rounded-full bg-white px-3 text-[12px] font-bold text-ink-2 shadow-[0_2px_8px_rgba(224,150,40,.12)]"><DuoIcon name="clock" size={13} />오늘 {data?.honey ?? 0}번 참여 가능</span>
          )}
        </div>
      </section>

      {/* 퀴즈 가로 카드(크림 영역 위에 겹침) */}
      <section className="pt-[6px]">
        <div className="no-scrollbar flex gap-[14px] overflow-x-auto px-5">
          {sets.length > 0 ? sets.slice(0, 8).map((s) => <SetCard key={s.id} s={s} size={150} />) : [0, 1, 2].map((i) => <div key={i} className="h-[230px] w-[150px] shrink-0 animate-pulse rounded-xl bg-bg-2" />)}
        </div>
      </section>
      </div>

      {/* 퀵메뉴 2×5 그리드(마이비4) */}
      <section className="px-5 pt-[26px]" data-tour="quick">
        <QuickMenu
          items={QUICK.map((q) => (q.key === "newbie" ? { ...q, tip: data?.newbie.active ? q.tip : undefined } : q.key === "roulette" && data?.rouletteFree ? { ...q, tip: "무료 1회" } : q))}
          attended={!!data?.attendedToday}
          onTap={(key, href) => {
            if (key === "attend") return void attend();
            if (key === "honey") return data && data.honeyTopups.used >= data.honeyTopups.max ? show(`오늘 충전은 ${data.honeyTopups.max}번까지예요. 내일 0시에 8개 충전`, "info") : setAd({ left: 15 });
            if (href) router.push(href);
          }}
        />
      </section>

      {/* 내 등급(마이비4 "내 등급은 베이직 → B플러스 승격") */}
      <section className="mt-[22px] px-5" data-tour="tier">
        <div className="rounded-[20px] bg-white p-5" style={{ boxShadow: "0 5px 16px rgba(40,24,14,.07)" }}>
          <div className="flex items-center gap-3">
            <img src="/brand/badge.webp" alt="" width={44} height={44} className="h-11 w-11 object-contain" draggable={false} />
            <p className="flex items-center gap-2 text-[16px] font-bold text-ink">내 등급은 <Link href="/me" className="flex items-center gap-0.5 rounded-full bg-blue-soft px-2.5 py-1 text-[13px] font-bold text-blue">{data?.tier.name ?? "베이직"} <ChevronRight size={14} /></Link></p>
          </div>
          {data?.tier.next ? (
            <>
              <p className="mt-3 text-[13px] font-semibold text-ink-2"><b className="text-ink">{data.tier.next}</b> 승격에 필요해요!</p>
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center gap-3 rounded-[14px] bg-bg px-3.5 py-3">
                  <FlatIcon file="coin" size={34} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between text-[13px] font-bold text-ink">{fmt(data.tier.needEarned)}P 모으기 <span className="flex items-center gap-1 text-blue"><PCoin size={14} />{fmt(Math.min(data.tier.earned, data.tier.needEarned))}</span></span>
                    <span className="mt-1.5 block h-[6px] overflow-hidden rounded-full bg-[#e6e9ef]"><i className="tier-bar block h-full rounded-full bg-gradient-to-r from-[#5b8cff] to-blue" style={{ width: `${Math.min(100, (data.tier.earned / Math.max(1, data.tier.needEarned)) * 100)}%` }} /></span>
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-[14px] bg-bg px-3.5 py-3">
                  <FlatIcon file="trophy" size={34} />
                  <span className="flex min-w-0 flex-1 items-center justify-between text-[13px] font-bold text-ink">월간 도전 과제 {data.tier.needMonthly}회 달성 <span className="text-ink-2">{data.tier.monthlyDone}회 완료</span></span>
                </div>
              </div>
              <Link href="/monthly" className="myb-press mt-3 flex h-11 items-center justify-center rounded-[12px] bg-bg-2 text-[14px] font-bold text-ink">월간 도전 과제 보기</Link>
              <p className="mt-2.5 text-center text-[11px] text-muted">{data.tier.next} 혜택 · {data.tier.perk}</p>
            </>
          ) : (
            <p className="mt-3 text-[13px] text-ink-2">{data ? "최고 등급이에요! 전용 고보상 미션을 먼저 받아요." : "등급을 불러오는 중…"}</p>
          )}
        </div>
      </section>

      {/* 실시간 적립 티커 */}
      {data && data.recentWins.length > 0 && <WinTicker wins={data.recentWins} />}

      {/* 포인트 모아서 살 수 있어요 */}
      <section className="mt-[30px] px-5">
        <Link href="/exchange" className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold">포인트 모아서 살 수 있어요</h2>
          <span className="flex items-center text-[13px] text-muted">전체보기 <ChevronRight size={16} /></span>
        </Link>
        {data?.newbie.active && (
          <>
            <Link href="/newbie" className="mt-[18px] flex items-center gap-3 rounded-[18px] px-4 py-3.5" style={{ background: "linear-gradient(135deg,#fff3cc 0%,#ffe4d3 100%)" }}>
              <img src="/brand/qm/gift.webp" alt="" width={52} height={52} className="h-[52px] w-[52px] object-contain" draggable={false} />
              <span className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[15px] font-bold text-ink">신규 유저 전용 혜택 <span className="rounded-full bg-myb px-1.5 py-0.5 text-[10px] font-bold text-white">D-{Math.max(0, 4 - data.newbie.dayNo)}</span></p>
                <p className="text-[12.5px] text-ink-2">3일 동안 매일 퀴즈 3개 풀면 최대 {fmt(data.newbie.totalMax)}P</p>
              </span>
              <ChevronRight size={18} className="text-[#c9a46a]" />
            </Link>
            <div className="relative mt-[14px] grid grid-cols-2 gap-[26px]">
              {[{ brand: "네이버페이 포인트쿠폰", name: "네이버페이 1,000원", price: "1,500", img: "/products/npay_10000.webp", bg: "#f1efec" }, { brand: "트레져러", name: "한국거래소 금 1,000원", price: "무제한", img: "/brand/gold.webp", bg: "#fff4d6" }].map((p) => (
                <Link key={p.name} href="/newbie" className="block">
                  <div className="overflow-hidden rounded-[18px]">
                    <p className="flex h-[32px] items-center justify-center bg-myb text-[12px] font-bold text-white">신규 유저 전용</p>
                    <div className="relative flex h-[136px] items-center justify-center" style={{ background: p.bg }}>
                      <img src={p.img} alt="" className="h-[96px] w-[96px] rounded-xl object-cover" />
                      <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-ink-2 shadow-[0_2px_8px_rgba(40,24,14,.12)]"><DuoIcon name="lock" size={15} /></span>
                      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-semibold text-white">{data.newbie.dayNo}일차 퀴즈 {data.newbie.doneToday}/{data.newbie.goal} · 다 풀면 열려요</span>
                    </div>
                  </div>
                  <p className="mt-2.5 text-[12px] text-muted">{p.brand}</p>
                  <p className="mt-0.5 text-[15px] font-medium">{p.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-[16px] font-bold"><PCoin size={16} />{p.price}</p>
                </Link>
              ))}
              <span className="pointer-events-none absolute left-1/2 top-[90px] flex h-[38px] w-[38px] -translate-x-1/2 items-center justify-center rounded-full bg-gold text-[12px] font-extrabold text-ink shadow-[0_3px_8px_rgba(40,24,14,.18)]">VS</span>
            </div>
          </>
        )}
        <div className="mt-[22px] grid grid-cols-2 gap-x-[26px] gap-y-6">
          {PRODUCTS.map((p) => (
            <Link key={p.name} href="/exchange" className="block">
              <div className="flex h-[170px] items-center justify-center rounded-[18px]" style={{ background: p.bg }}>
                {p.img ? <img src={p.img} alt="" className={p.img.startsWith("/products/") ? "h-full w-full rounded-[18px] object-cover" : "h-[150px] w-[150px] object-contain"} /> : <span className="text-[72px] leading-none">{p.emoji}</span>}
              </div>
              <p className="mt-2.5 text-[12px] text-muted">{p.brand}</p>
              <p className="mt-0.5 truncate text-[15px] font-medium">{p.name}</p>
              <p className="mt-1 flex items-center gap-1 text-[16px] font-bold"><PCoin size={16} />{fmt(p.points)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 나를 위한 맞춤 서비스 */}
      <section className="mt-[36px] px-5">
        <h2 className="text-[20px] font-bold">나를 위한 맞춤 서비스</h2>
        <p className="mt-1 text-[14px] text-ink-2">참여 패턴을 분석해 딱 맞는 서비스를 추천해요</p>
        <ul className="mt-[18px] rounded-[20px] bg-white px-4 py-1" style={{ boxShadow: "0 5px 16px rgba(40,24,14,.07)" }}>
          {[
            { name: "people", tone: "pink", title: "친구 초대", desc: "친구 초대하면 300P 적립", value: "300P", href: "/invite" },
            { name: "flame", tone: "orange", title: "캐치 러쉬", desc: data ? `이번 주 스탬프 ${data.rush.stamps}/${data.rush.total} · 미션 완료하면 룰렛 스탬프` : "주간 스탬프 미션", value: data && data.rush.claimable > 0 ? "받기" : `${data?.rush.stamps ?? 0}/${data?.rush.total ?? 8}`, href: "/rush", dot: !!data && data.rush.claimable > 0 },
            { name: "trophy", tone: "violet", title: "월간 도전 과제", desc: "이번 달 과제 달성하면 최대 3,300P", value: "3,300P", href: "/monthly" },
            { name: "pin", tone: "teal", title: "플레이스 방문하기", desc: "매장 방문·저장·리뷰하고 스탬프", value: "최대 500P", href: "/missions" },
            { name: "wheel", tone: "amber", title: "무료 룰렛", desc: data?.rouletteFree ? "오늘의 무료 룰렛 1회가 남았어요" : data && data.wallet.stamps >= 10 ? "스탬프 10개 모였어요! 한 번 더 돌리기" : `스탬프 ${data?.wallet.stamps ?? 0}/10 · 10개마다 1회 추가`, value: data?.rouletteFree ? "무료 1회" : `${data?.wallet.stamps ?? 0}/10`, href: "/roulette", dot: !!data && (data.rouletteFree || data.wallet.stamps >= 10) },
          ].map((c) => (
            <li key={c.title} className="border-b border-bg-3 last:border-b-0">
              <Link href={c.href} className="flex items-center gap-3 py-[13px]">
                <IconTile name={c.name as DuoName} tone={c.tone as Tone} size={46} />
                <span className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold">{c.title}</p>
                  <p className="mt-0.5 truncate text-[12px] text-ink-2">{c.desc}</p>
                </span>
                <span className="relative flex shrink-0 items-center gap-0.5 text-[13px] font-bold text-ink-2">
                  {c.value}<ChevronRight size={18} className="text-muted" />{c.dot && <i className="absolute -left-2 -top-1 h-2 w-2 rounded-full bg-red" />}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 리워드 배너(자동 롤링) — 원본 327×72 */}
      <Banners slides={BANNERS} className="mx-5 mb-2 mt-[26px]" />

      {error && <p className="py-3 text-center text-xs text-red">연결 오류: {error}</p>}

      {installHint && (
        <div className="fixed bottom-[92px] left-1/2 z-30 flex w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2 items-center gap-3 rounded-2xl bg-[#191f28] px-4 py-3 text-white shadow-lg">
          <img src="/icons/icon-192.png" alt="" className="h-9 w-9 rounded-lg" />
          <p className="flex-1 text-[12px] leading-[17px]">브라우저 메뉴에서 <b>홈 화면에 추가</b>하면 앱처럼 전체화면으로 열려요</p>
          <button type="button" onClick={closeInstallHint} aria-label="닫기" className="text-[18px] leading-none text-white/70">×</button>
        </div>
      )}

      {ad && (
        <>
          <div className="fixed inset-0 z-[999] bg-black/80" />
          <div className="fixed left-1/2 top-1/2 z-[1000] w-[calc(100%-48px)] max-w-[382px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[20px] bg-[#191f28] text-white">
            <div className="flex h-[200px] flex-col items-center justify-center bg-gradient-to-br from-[var(--color-myb)] to-[#ff8a5c]">
              <img src="/brand/coins_flat.webp" alt="" className="h-24 w-24 object-contain" />
              <p className="mt-2 text-[14px] font-bold">광고 영상 자리 (리워드 SDK 연동 예정)</p>
            </div>
            <div className="p-5 text-center">
              <p className="text-[13px] text-white/70">{ad.left > 0 ? `${ad.left}초 후 꿀 1개가 충전돼요` : "시청 완료!"}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-[var(--color-gold)] transition-all duration-1000" style={{ width: `${((15 - ad.left) / 15) * 100}%` }} /></div>
              {ad.left > 0 ? <button type="button" onClick={() => setAd(null)} className="mt-4 text-[12px] text-white/50">그만 보기</button> : <button type="button" onClick={() => void finishAd()} className="myb-press mt-4 h-11 w-full rounded-xl bg-[var(--color-gold)] text-[14px] font-bold text-[#191f28]">꿀 받기</button>}
            </div>
          </div>
        </>
      )}
      {welcome && data && (
        <>
          <div className="myb-fade-in fixed inset-0 z-[999] bg-black/60" onClick={() => setWelcome(false)} />
          <div className="myb-modal-in fixed bottom-0 left-1/2 z-[1000] w-full max-w-[430px] -translate-x-1/2 rounded-t-[24px] bg-white px-6 pb-8 pt-7 text-center">
            <img src="/brand/gift_burst.webp" alt="" className="mx-auto h-[140px] w-[140px] object-contain" />
            <p className="mt-2 text-[22px] font-bold">환영해요! 가입 보너스 <span className="text-myb">{fmt(data.welcome.points)}P</span></p>
            <p className="mt-2 text-[13px] leading-[19px] text-muted">
              {data.starter.active ? `지금부터 ${Math.max(1, Math.ceil((new Date(data.starter.endsAt).getTime() - Date.now()) / 86400_000))}일 동안 퀴즈 보상이 2배예요.` : "취향 퀴즈 풀고 포인트 받아보세요."}<br />
              매일 출석하고 러쉬 미션으로 스탬프를 모으면 룰렛도 돌릴 수 있어요.
            </p>
            <button type="button" onClick={() => setWelcome(false)} className="myb-press mt-5 h-[52px] w-full rounded-xl bg-myb text-[16px] font-bold text-white">퀴즈 풀러 가기</button>
          </div>
        </>
      )}
    </div>
  );
}

/** 퀵메뉴: 2×5 그리드(흰 카드). 꿀·3일 혜택·룰렛 무료 등은 말풍선 팁 */
function QuickMenu({ items, attended, onTap }: { items: typeof QUICK; attended: boolean; onTap: (key: string, href?: string) => void }) {
  return (
    <ul className="grid grid-cols-5 gap-y-5 rounded-[20px] bg-white px-2 pb-5 pt-6" style={{ boxShadow: "0 5px 16px rgba(40,24,14,.07)" }}>
      {items.map((qk) => (
        <li key={qk.key} className="relative flex flex-col items-center">
          <button type="button" onClick={() => onTap(qk.key, qk.href)} className="myb-press flex flex-col items-center gap-[8px]">
            {qk.tip && <span className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-myb px-2 py-[3px] text-[10px] font-bold text-white after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-[3px] after:border-transparent after:border-t-myb">{qk.tip}</span>}
            {qk.key === "attend" && attended && <span className="absolute right-2 top-[-4px] z-10 flex h-4 w-4 items-center justify-center rounded-full bg-myb text-[10px] text-white ring-2 ring-white">✓</span>}
            <img src={`/brand/qm/${qk.key}.webp`} alt="" width={46} height={46} className="h-[46px] w-[46px] object-contain" draggable={false} />
            <span className="text-[12px] font-medium text-ink">{qk.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** 상단 회전 칩: 3.5초마다 쌍이 바뀜 */
function PillChips() {
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((x) => (x + 1) % CHIP_PAIRS.length), 3500); return () => clearInterval(id); }, []);
  return (
    <div className="flex gap-2 px-5 pt-1">
      {CHIP_PAIRS[i].map((c) => (
        <Link key={`${i}-${c.label}`} href={c.href} className="chip-in myb-press flex h-[38px] flex-1 items-center gap-2 rounded-full px-3 text-[13px] font-bold" style={{ background: c.bg, color: c.color }}>
          <FlatIcon file={c.icon} size={22} /><span className="min-w-0 flex-1 truncate">{c.label}</span><ChevronRight size={16} />
        </Link>
      ))}
    </div>
  );
}

/** 실시간 적립 티커: "AB12**** 님이 방금 퀴즈 풀고 20P 받았어요!" */
function WinTicker({ wins }: { wins: { who: string; text: string; points: number }[] }) {
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((x) => (x + 1) % wins.length), 3200); return () => clearInterval(id); }, [wins.length]);
  const w = wins[i];
  return (
    <div className="mx-5 mt-4 flex h-[40px] items-center gap-2 overflow-hidden rounded-full bg-[#f3f4f8] px-4 text-[12px] text-ink-2">
      <PCoin size={16} />
      <p key={i} className="tick-in min-w-0 flex-1 truncate"><b className="text-ink">{w.who}</b> 님이 방금 {w.text} <b className="text-myb">{fmt(w.points)}P</b> 받았어요!</p>
    </div>
  );
}

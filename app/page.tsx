"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useHome, fmt } from "@/hooks/useHome";
import { useToast } from "@/components/motion/Toast";
import { ChevronRight, PCoin } from "@/components/icons";
import { SetCard } from "@/components/SetCard";
import { Banners } from "@/components/motion/Banners";
import { NumberFlow } from "@/components/motion/NumberFlow";

/* eslint-disable @next/next/no-img-element */

/** 마이비 reward-banner 원본(327×72) — upload.myb.im 캡처본 */
const BANNERS = ["/myb/up/2025-12-19T03_30_12.125Z_banner.webp", "/myb/up/2025-12-29T08_07_33.114Z_133.webp", "/myb/up/2025-12-29T08_07_50.926Z_banner.webp", "/myb/up/2026-02-11T05-23-58.433Z_2509_myb_quizpass-banner_v1_327x72.webp", "/myb/up/2026-04-24T07-33-12.788Z_2604_myb_manboki-banner_v1_327x72-1.webp", "/myb/up/2026-04-24T07-33-32.380Z_2604_myb_manboki-banner_v1_327x72.webp", "/myb/up/2026-04-27T01-55-48.943Z_2604_myb_manboki-banner_v1_327x72.webp"];

/** 퀵메뉴(마이비 영상 기준: 출석체크·만보기·3일 혜택·게임적립·내 쇼핑 … 가로 스크롤 + 점 인디케이터) */
const QUICK: { key: string; icon?: string; label: string; href?: string; tip?: string }[] = [
  { key: "attend", icon: "/myb/native/qm_attend.png", label: "출석체크" },
  { key: "games", icon: "/myb/native/qm_minigame.png", label: "미니게임", href: "/games" },
  { key: "newbie", label: "3일 혜택", href: "/newbie", tip: "최대 1,500P" },
  { key: "honey", icon: "/myb/native/ic_honey_jar.png", label: "꿀 충전" },
  { key: "invite", icon: "/myb/native/qm_invite.png", label: "친구초대", href: "/invite" },
  { key: "shop", icon: "/myb/res/naverpay_circle.png", label: "내 쇼핑", href: "/shop" },
  { key: "store", label: "매장미션", href: "/missions" },
  { key: "roulette", icon: "/myb/native/ic_gift_blue.png", label: "룰렛", href: "/roulette" },
];

/** 포인트 모아서 살 수 있어요 — 지갑 상품 타일(원본 픽셀) */
const PRODUCTS: { brand: string; name: string; points: number; img?: string; emoji?: string; bg: string }[] = [
  { brand: "GS25", name: "빙그레)바나나우유240ML", points: 1900, img: "/products/banana_milk.webp", bg: "#f6f7fb" },
  { brand: "스타벅스", name: "아이스 카페 아메리카노T", points: 6956, img: "/products/americano_tall.webp", bg: "#dff3ea" },
  { brand: "네이버페이", name: "네이버페이 포인트 10,000원", points: 12000, img: "/myb/native/tile_npay.png", bg: "#f6f7fb" },
  { brand: "신세계", name: "신세계 상품권 10,000원", points: 14900, img: "/myb/native/tile_ssg.png", bg: "#f6f7fb" },
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
      if (data.welcome.justNow && !localStorage.getItem("ccr_welcome")) {
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
    else show(`출석 완료! ${fmt(j.points)}P와 스탬프 1개를 받았어요${j.streak > 1 ? ` · ${j.streak}일 연속` : ""}${j.bonus ? ` · 보너스 +${j.bonus}P` : ""}`);
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
          <Link href="/me" className="flex h-[26px] items-center gap-1.5 rounded-lg border border-line bg-bg-2 px-2 text-[12px] font-semibold">
            {data?.me.avatarUrl ? <img src={data.me.avatarUrl} alt="" className="h-[16px] w-[16px] rounded-full object-cover" /> : <img src="/myb/native/ic_basic_hex.png" alt="" className="h-[14px] w-[14px]" />}
            {data?.newbie.active ? "신규 유저" : data?.me.loggedIn ? (data.me.nickname ?? "MY").slice(0, 6) : "베이직"}
          </Link>
          <Link href="/gifts" aria-label="선물함"><img src="/myb/native/ic_gift_badge.png" alt="" className="h-[28px] w-[28px]" /></Link>
          <Link href="/notifications" aria-label="알림" className="relative">
            <img src="/myb/native/ic_bell.png" alt="" className="h-[24px] w-[24px]" />
            {data && (data.rush.claimable > 0 || !data.attendedToday) && <i className="absolute -right-0.5 top-0 h-2 w-2 rounded-full bg-red ring-2 ring-white" />}
          </Link>
        </div>
      </header>

      {/* 히어로: 오늘도 만나서 반가워요 / N일차 퀴즈 3개로 시작해요! */}
      <section className="relative overflow-hidden px-5 pb-[22px] pt-[26px]" style={{ background: "linear-gradient(180deg,#fff6cf 0%,#fffaf0 55%,#ffffff 100%)" }}>
        <span className="absolute right-5 top-4 flex h-[26px] items-center gap-1 rounded-full bg-myb px-3 text-[12px] font-bold text-white">
          <img src="/myb/native/ic_clock_gray.png" alt="" className="h-[13px] w-[13px] brightness-0 invert" /> {data ? (data.newbie.active ? `${data.newbie.dayNo}일차` : "오늘") : "—"}
        </span>
        <img src="/myb/native/avatar_intj.png" alt="" className="pointer-events-none absolute -right-1 top-[46px] h-[104px] w-[104px] object-contain" />
        <p className="text-[14px] font-medium text-ink-2">오늘도 만나서 반가워요</p>
        <p className="mt-1 text-[22px] font-extrabold leading-[30px]">
          <span className="text-myb">{data?.newbie.active ? `${data.newbie.dayNo}일차 퀴즈 ${data.newbie.goal}개` : "오늘의 퀴즈 3개"}</span>로 시작해요!
        </p>
        <Link href={data?.newbie.active ? "/newbie" : "/quiz"} className="mt-[22px] flex h-[52px] items-center gap-3 rounded-[14px] border border-[#c9d8ff] bg-white px-4">
          <span className="text-[15px] font-bold tabular-nums text-myb">{data ? Math.min(3, data.todayDone) : 0}/3</span>
          <span className="flex flex-1 gap-1.5">
            {[0, 1, 2].map((i) => <i key={i} className={`h-[8px] flex-1 rounded-full ${data && data.todayDone > i ? "bg-myb" : "bg-[#dfe8ff]"}`} />)}
          </span>
        </Link>
      </section>

      {/* 퀴즈 가로 카드 */}
      <section className="pt-[18px]">
        <div className="no-scrollbar flex gap-[14px] overflow-x-auto px-5">
          {sets.length > 0 ? sets.slice(0, 8).map((s) => <SetCard key={s.id} s={s} size={150} />) : [0, 1, 2].map((i) => <div key={i} className="h-[230px] w-[150px] shrink-0 animate-pulse rounded-xl bg-bg-2" />)}
        </div>
      </section>

      {/* 퀵메뉴(가로 스크롤 + 점) */}
      <section className="pt-[26px]">
        <QuickMenu
          items={QUICK}
          attended={!!data?.attendedToday}
          onTap={(key, href) => {
            if (key === "attend") return void attend();
            if (key === "honey") return data && data.honeyTopups.used >= data.honeyTopups.max ? show(`오늘 충전은 ${data.honeyTopups.max}번까지예요. 내일 0시에 8개 충전`, "info") : setAd({ left: 15 });
            if (href) router.push(href);
          }}
        />
      </section>

      {/* 포인트 모아서 살 수 있어요 */}
      <section className="mt-[30px] px-5">
        <Link href="/exchange" className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold">💰 포인트 모아서 살 수 있어요</h2>
          <ChevronRight size={20} className="text-ink-2" />
        </Link>
        {data?.newbie.active && (
          <>
            <Link href="/newbie" className="mt-[18px] flex items-center gap-3 rounded-[14px] border border-[#b9ccff] bg-[#eef3ff] px-4 py-3">
              <span className="text-[26px]">🎉</span>
              <span>
                <p className="text-[15px] font-bold text-myb">신규 유저 전용 혜택</p>
                <p className="text-[13px] text-ink-2">3일 동안 매일 퀴즈 3개 풀면 최대 {fmt(data.newbie.totalMax)}P</p>
              </span>
            </Link>
            <div className="relative mt-[14px] grid grid-cols-2 gap-[26px]">
              {[{ brand: "네이버페이 포인트쿠폰", name: "네이버페이 1,000원", price: "1,500", img: "/myb/native/tile_npay.png", bg: "#6e6e6e" }, { brand: "트레져러", name: "한국거래소 금 1,000원", price: "무제한", img: "/myb/native/tile_gold.png", bg: "#8b6f3a" }].map((p) => (
                <Link key={p.name} href="/newbie" className="block">
                  <div className="overflow-hidden rounded-[18px]">
                    <p className="flex h-[36px] items-center justify-center bg-myb text-[13px] font-bold text-white">🎉 신규 유저 전용 🎉</p>
                    <div className="relative flex h-[136px] items-center justify-center" style={{ background: p.bg }}>
                      <img src={p.img} alt="" className="h-[90px] w-[90px] object-contain opacity-60" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-white">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-[18px] text-ink">🔒</span>
                        <span className="text-[14px] font-bold">{data.newbie.dayNo}일차 미션 완료하기</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2.5 text-[12px] text-muted">{p.brand}</p>
                  <p className="mt-0.5 text-[15px] font-medium">{p.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-[16px] font-extrabold"><PCoin size={16} />{p.price}</p>
                </Link>
              ))}
              <span className="pointer-events-none absolute left-1/2 top-[90px] flex h-[42px] w-[42px] -translate-x-1/2 items-center justify-center rounded-full text-[13px] font-black italic text-white shadow-md" style={{ background: "linear-gradient(135deg,#7c5cff,#c84cff)" }}>VS</span>
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
              <p className="mt-1 flex items-center gap-1 text-[16px] font-extrabold"><PCoin size={16} />{fmt(p.points)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 나를 위한 맞춤 서비스 */}
      <section className="mt-[36px] px-5">
        <h2 className="text-[20px] font-bold">나를 위한 맞춤 서비스</h2>
        <p className="mt-1 text-[14px] text-ink-2">참여 패턴을 분석해 딱 맞는 서비스를 추천해요</p>
        <ul className="mt-[18px] flex flex-col gap-3">
          {[
            { emoji: "🤝", title: "친구 초대", desc: "친구 초대하면 300P 적립", href: "/invite" },
            { emoji: "🔥", title: "비포인트 러쉬", desc: data ? `이번 주 스탬프 ${data.rush.stamps}/${data.rush.total} · 미션 완료하면 룰렛 스탬프` : "주간 스탬프 미션", href: "/rush", dot: !!data && data.rush.claimable > 0 },
            { emoji: "🏆", title: "월간 도전 과제", desc: "이번 달 과제 달성하면 최대 3,300P", href: "/monthly" },
            { emoji: "📍", title: "동네 매장 미션", desc: "매장 방문·저장·리뷰하고 스탬프", href: "/missions" },
            { emoji: "🎡", title: "무료 룰렛", desc: data && data.wallet.stamps >= 10 ? "스탬프 10개 모였어요! 지금 돌리기" : `스탬프 ${data?.wallet.stamps ?? 0}/10 · 10개면 룰렛 1회`, href: "/roulette", dot: !!data && data.wallet.stamps >= 10 },
          ].map((c) => (
            <li key={c.title}>
              <Link href={c.href} className="flex items-center gap-4 rounded-[18px] bg-white px-5 py-4" style={{ boxShadow: "0 4px 16px rgba(0,43,141,.08)" }}>
                <span className="text-[34px] leading-none">{c.emoji}</span>
                <span className="min-w-0 flex-1">
                  <p className="text-[17px] font-bold">{c.title}</p>
                  <p className="mt-0.5 truncate text-[13px] text-ink-2">{c.desc}</p>
                </span>
                <span className="relative flex h-[38px] items-center rounded-[10px] bg-myb px-4 text-[14px] font-bold text-white">
                  이동{c.dot && <i className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red ring-2 ring-white" />}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 리워드 배너(자동 롤링) — 원본 327×72 */}
      <Banners images={BANNERS} className="mx-5 mb-2 mt-[26px]" />

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
            <div className="flex h-[200px] flex-col items-center justify-center bg-gradient-to-br from-[#427cff] to-[#6d4cf2]">
              <img src="/myb/bh/img_bpointrush_visual.webp" alt="" className="h-24 w-24" />
              <p className="mt-2 text-[14px] font-bold">광고 영상 자리 (리워드 SDK 연동 예정)</p>
            </div>
            <div className="p-5 text-center">
              <p className="text-[13px] text-white/70">{ad.left > 0 ? `${ad.left}초 후 꿀 1개가 충전돼요` : "시청 완료!"}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-[#fde047] transition-all duration-1000" style={{ width: `${((15 - ad.left) / 15) * 100}%` }} /></div>
              {ad.left > 0 ? <button type="button" onClick={() => setAd(null)} className="mt-4 text-[12px] text-white/50">그만 보기</button> : <button type="button" onClick={() => void finishAd()} className="myb-press mt-4 h-11 w-full rounded-xl bg-[#fde047] text-[14px] font-bold text-[#191f28]">꿀 받기</button>}
            </div>
          </div>
        </>
      )}
      {welcome && data && (
        <>
          <div className="myb-fade-in fixed inset-0 z-[999] bg-black/60" onClick={() => setWelcome(false)} />
          <div className="myb-modal-in fixed bottom-0 left-1/2 z-[1000] w-full max-w-[430px] -translate-x-1/2 rounded-t-[24px] bg-white px-6 pb-8 pt-7 text-center">
            <img src="/myb/bh/img_bpointrush_visual.webp" alt="" className="mx-auto h-[120px] w-[120px]" />
            <p className="mt-2 text-[22px] font-extrabold">환영해요! 가입 보너스 <span className="text-myb">{fmt(data.welcome.points)}P</span></p>
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

/** 퀵메뉴: 5개씩 가로 스크롤, 점 인디케이터. 3일 혜택은 금색 "3일" 타이포 + 말풍선 */
function QuickMenu({ items, attended, onTap }: { items: typeof QUICK; attended: boolean; onTap: (key: string, href?: string) => void }) {
  const [page, setPage] = useState(0);
  const pages = Math.ceil(items.length / 5);
  return (
    <div>
      <ul className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto px-3" onScroll={(e) => setPage(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
        {items.map((qk) => (
          <li key={qk.key} className="relative flex w-1/5 shrink-0 snap-start flex-col items-center gap-[10px] pt-[26px]">
            <button type="button" onClick={() => onTap(qk.key, qk.href)} className="myb-press flex flex-col items-center gap-[10px]">
              {qk.tip && <span className="absolute -top-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-myb px-2.5 py-1 text-[11px] font-bold text-white after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-myb">{qk.tip}</span>}
              {qk.key === "attend" && attended && <span className="absolute right-2 top-[22px] flex h-4 w-4 items-center justify-center rounded-full bg-myb text-[10px] text-white">✓</span>}
              {qk.key === "newbie" ? (
                <span className="flex h-[40px] w-[40px] items-center justify-center text-[24px] font-black italic leading-none" style={{ background: "linear-gradient(180deg,#ffe27a,#f5a524)", WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 1px 0 #b06a00)" }}>3일</span>
              ) : qk.key === "store" ? (
                <span className="flex h-[40px] w-[40px] items-center justify-center text-[30px] leading-none">📍</span>
              ) : (
                <img src={qk.icon} alt="" className={`h-[40px] w-[40px] object-contain ${qk.key === "shop" ? "rounded-full" : ""}`} />
              )}
              <span className="text-[13px] font-medium text-ink">{qk.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-center gap-1">
        {Array.from({ length: pages }).map((_, i) => <i key={i} className={`h-[5px] rounded-full transition-all ${i === page ? "w-[22px] bg-[#8b94a0]" : "w-[12px] bg-[#e5e8ee]"}`} />)}
      </div>
    </div>
  );
}

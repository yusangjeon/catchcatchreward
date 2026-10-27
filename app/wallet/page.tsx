"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useState } from "react";
import { useHome, fmt } from "@/hooks/useHome";
import { ChevronRight, CXCoin, PCoin, PCoinPink, PXCoin } from "@/components/icons";

import { NumberFlow } from "@/components/motion/NumberFlow";
import { PRODUCTS as EX } from "@/lib/exchange/products";

const Info = () => <img src="/brand/ic_info.svg" alt="안내" className="h-[16px] w-[16px]" />;
const TABS = ["자산", "상품 구매", "뱃지"] as const;

/** 상품 카테고리 원형 */
const BRANDS: { name: string; img?: string; label?: string; bg?: string; pad?: boolean }[] = [
  { name: "전체", img: "/brand/gift.webp", pad: true },
  { name: "카페", label: "☕", bg: "bg-[#fff4d6]" },
  { name: "편의점", label: "🏪", bg: "bg-[#eef7ff]" },
  { name: "상품권", img: "/brand/ticket.webp", pad: true },
  { name: "포인트", img: "/brand/coins.webp", pad: true },
  { name: "금", img: "/brand/gold.webp", pad: true },
];
const PRODUCTS = EX.map((p) => ({ name: p.name, p: p.points as number | null, img: p.img }));

export default function WalletPage() {
  const { data } = useHome();
  const [tab, setTab] = useState<(typeof TABS)[number]>("자산");
  const balance = data?.wallet.balance ?? 0;
  const stampCount = data?.wallet.stamps ?? 0;

  return (
    <div className="px-5 pt-[24px]">
      <h1 className="text-[22px] font-bold">지갑</h1>

      {/* 세그먼트 */}
      <div className="mt-[14px] grid h-[50px] grid-cols-3 rounded-2xl bg-bg-2 p-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex items-center justify-center gap-1.5 rounded-xl text-[13px] ${tab === t ? "bg-white font-bold shadow-sm" : "font-medium text-ink-2"}`}
          >
            {t === "상품 구매" && <img src="/brand/gift.webp" alt="" className={`h-[16px] w-[16px] object-contain ${tab === t ? "" : "grayscale"}`} />}
            {t}
          </button>
        ))}
      </div>

      {tab === "자산" && (
        <section className="animate-pop">
          <h2 className="mt-[36px] flex items-center gap-1.5 text-[17px] font-bold">총 보상 잔액 <Info /></h2>
          <div className="mt-[18px] flex items-center justify-between">
            <p className="flex items-center gap-2"><PXCoin size={30} /><span className="text-[26px] font-extrabold tabular-nums"><NumberFlow value={balance} /> 원</span></p>
            <Link href="/history" className="flex items-center text-[13px] text-muted">내역 <ChevronRight size={15} /></Link>
          </div>
          <Link href="/roulette" className="mt-[14px] flex h-[42px] items-center justify-between rounded-xl border border-line px-3 text-[12px]">
            <span className="flex items-center gap-2"><CXCoin size={18} /> 스탬프 <b className="text-myb-dark">{stampCount}개</b> · 10개 모으면 무료 룰렛 1회</span>
            <span className="flex items-center gap-1 text-[11px] text-muted">룰렛 <ChevronRight size={14} /></span>
          </Link>

          <h2 className="mt-[46px] flex items-center gap-1.5 text-[17px] font-bold">내 자산 <Info /></h2>
          <AssetRow icon={<PCoin size={22} />} name="포인트" value={fmt(balance)} />
          <AssetRow icon={<CXCoin size={22} />} name="룰렛 스탬프" value={`${stampCount}개`} />

          <Link href="/shop" className="mt-[30px] flex h-[46px] items-center justify-between rounded-xl bg-[#fff0f6] px-4 text-[13px]">
            <span className="flex items-center gap-1.5"><img src="/brand/qm_shop.webp" alt="" className="h-[18px] w-[18px] object-contain" /> 쇼핑 방문 적립</span>
            <span className="flex items-center gap-1 text-[14px] font-extrabold"><PCoinPink size={16} />하루 5P <ChevronRight size={15} className="text-muted" /></span>
          </Link>

          <Link href="/exchange" className="mt-2 flex h-[84px] items-center justify-between rounded-2xl border border-line px-4">
            <div>
              <p className="flex items-center gap-2 text-[14px] font-bold text-[#c98a00]">
                <span className="rounded-full border border-[#e3a300] px-2 py-0.5 text-[11px]">교환</span> 포인트로 상품 교환
              </p>
              <p className="mt-1.5 flex items-center gap-1 whitespace-nowrap text-[18px] font-extrabold"><img src="/brand/ticket.webp" alt="" className="h-[22px] w-[22px] object-contain" /> {fmt(balance)}P <span className="ml-1 text-[12px] font-medium text-ink-2">최소 1,000P부터</span></p>
            </div>
            <ChevronRight className="text-muted" />
          </Link>
          <Link href="/roulette" className="mt-3 flex items-center justify-between rounded-2xl border border-myb-line px-4 py-4">
            <div>
              <p className="flex items-center gap-2 text-[14px] font-bold text-myb-dark">
                <span className="rounded-full border border-myb-dark px-2 py-0.5 text-[11px]">모으는 중</span> 스탬프 적금
              </p>
              <p className="mt-1.5 text-[13px] text-muted">스탬프 {data?.wallet.stamps ?? 0}개 · 10개 모으면 룰렛 1회 <ChevronRight size={12} className="inline text-muted" /></p>
              <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-line"><div className="myb-progress h-full rounded-full bg-myb" style={{ width: `${Math.min(100, ((data?.wallet.stamps ?? 0) % 10) * 10)}%` }} /></div>
            </div>
            <img src="/brand/piggy.webp" alt="" className="h-[56px] w-[86px] object-contain" />
          </Link>
        </section>
      )}

      {tab === "상품 구매" && (
        <section className="animate-pop">
          <h2 className="mt-[34px] text-[18px] font-bold">인기 브랜드 상품을 모아봤어요</h2>
          <div className="no-scrollbar mt-[18px] flex gap-[14px] overflow-x-auto">
            {BRANDS.map((b, i) => (
              <span key={b.name} className={`flex h-[58px] w-[58px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-white text-center text-[9px] font-extrabold shadow-sm ${b.bg ?? ""} ${i === 0 ? "ring-2 ring-myb ring-offset-2" : ""}`}>
                {b.img ? <img src={b.img} alt={b.name} className={b.pad ? "h-[38px] w-[38px] object-contain" : "h-full w-full object-cover"} /> : <span className="text-[24px]">{b.label}</span>}
              </span>
            ))}
          </div>
          <div className="no-scrollbar mt-[22px] grid grid-flow-col grid-rows-2 gap-x-[10px] gap-y-6 overflow-x-auto [grid-auto-columns:100px]">
            {PRODUCTS.map((p) => (
              <Link key={p.name} href={p.p === null ? "/wallet" : "/exchange"} className="block w-[100px]">
                <img src={p.img} alt="" className="aspect-square w-full rounded-xl object-cover" />
                <p className="mt-2.5 line-clamp-2 text-[12px] leading-snug">{p.name}</p>
                {p.p === null ? (
                  <p className="mt-1.5 flex items-center gap-1 text-[13px] font-bold"><PCoin size={14} />무제한</p>
                ) : (
                  <>
                    <p className="mt-1.5 flex items-center gap-1 text-[13px] font-bold"><PCoin size={14} />{fmt(p.p)}</p>

                  </>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {tab === "뱃지" && (
        <section className="animate-pop">
          <h2 className="mt-8 text-[21px] font-bold">내 취향 뱃지</h2>
          <p className="mt-1 text-[14px] text-muted">퀴즈 응답으로 쌓인 취향이 뱃지가 돼요.</p>
          {data && data.badges.length > 0 ? (
            <ul className="mt-5 grid grid-cols-3 gap-4">
              {data.badges.map((b) => (
                <li key={b.code} className="flex flex-col items-center rounded-2xl border border-line p-4 text-center">
                  <span className="text-[40px]" aria-hidden>{b.emoji}</span>
                  <span className="mt-2 text-[14px] font-bold">{b.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-2xl bg-bg-2 p-8 text-center text-[14px] text-muted">아직 뱃지가 없어요.<br />퀴즈를 풀면 생겨요.</div>
          )}
          {data && data.badgeProgress.some((b) => !b.earned) && (
            <>
              <h3 className="mt-8 text-[16px] font-bold">다음 뱃지까지</h3>
              <ul className="mt-3 flex flex-col gap-3">
                {data.badgeProgress.filter((b) => !b.earned).sort((a, b) => b.current / b.min - a.current / a.min).map((b) => (
                  <li key={b.code} className="flex items-center gap-3 rounded-2xl border border-line px-4 py-3">
                    <span className="text-[28px] grayscale" aria-hidden>{b.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-[14px]">
                        <span className="font-semibold">{b.name}</span>
                        <span className="tabular-nums text-muted">{b.current}/{b.min}</span>
                      </div>
                      <p className="mt-0.5 truncate text-[12px] text-muted">{b.description}</p>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg-2">
                        <div className="myb-progress h-full rounded-full bg-myb" style={{ width: `${Math.round((b.current / b.min) * 100)}%` }} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </div>
  );
}

function AssetRow({ icon, name, value }: { icon: React.ReactNode; name: string; value: string }) {
  return (
    <div className="mt-[18px] flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-bg-2">{icon}</span>
        <div>
          <p className="flex items-center gap-0.5 text-[12px] text-muted">{name} <ChevronRight size={13} /></p>
          <p className="text-[18px] font-extrabold tabular-nums">{value}</p>
        </div>
      </div>
      <Link href="/exchange" className="flex h-8 items-center rounded-lg bg-myb px-4 text-[13px] font-bold text-white">교환</Link>
    </div>
  );
}

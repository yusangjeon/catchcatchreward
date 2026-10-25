"use client";

import { useState } from "react";
import { useHome, fmt } from "@/hooks/useHome";
import { ChevronRight, ClockIcon, CXCoin, GiftIcon, InfoIcon, PCoin, PXCoin } from "@/components/icons";

const CONX_RATE = 3426.45;
const TABS = ["자산", "상품 구매", "뱃지"] as const;

const BRANDS = [
  { name: "전체", bg: "bg-myb text-white", label: "✓" },
  { name: "배달의민족", bg: "bg-white", label: "배달의민족" },
  { name: "마이비", bg: "bg-white", label: "🏦" },
  { name: "MGC", bg: "bg-[#ffd400]", label: "MGC" },
  { name: "DUNKIN", bg: "bg-white text-[#ff6e1f]", label: "DUNKIN'" },
  { name: "스타벅스", bg: "bg-[#00704a] text-white", label: "★" },
];
const PRODUCTS = [
  { name: "한국거래소 금 투자", p: null, cx: null, emoji: "🪙", bg: "bg-[#fff1cc]" },
  { name: "마이비 포인트적금", p: null, cx: null, emoji: "🏦", bg: "bg-[#eef3ff]" },
  { name: "네이버페이 포인트 10,000원", p: 12000, cx: 602, emoji: "🟢", bg: "bg-[#f6f7fb]" },
  { name: "포테이토 피자 스몰 세트", p: 9900, cx: 497, emoji: "🍕", bg: "bg-[#f6f7fb]" },
  { name: "현금 15,000원", p: 18000, cx: 903, emoji: "💵", bg: "bg-[#fff8e6]" },
  { name: "아이스 카페 아메리카노 T", p: 6956, cx: 349.11, emoji: "🥤", bg: "bg-[#f6f7fb]" },
  { name: "신세계 상품권 10,000원", p: 14900, cx: 787.9, emoji: "🎫", bg: "bg-[#f6f7fb]" },
  { name: "빙그레 바나나우유 240ML", p: 1900, cx: 95.3, emoji: "🍌", bg: "bg-[#f6f7fb]" },
  { name: "뿌링클+콜라 1.25L", p: 24900, cx: 1249, emoji: "🍗", bg: "bg-[#f6f7fb]" },
];

export default function WalletPage() {
  const { data } = useHome();
  const [tab, setTab] = useState<(typeof TABS)[number]>("자산");
  const balance = data?.wallet.balance ?? 0;
  const conx = (balance / CONX_RATE).toFixed(3);

  return (
    <div className="px-5 pt-5">
      <h1 className="text-[27px] font-bold">지갑</h1>

      {/* 세그먼트 */}
      <div className="mt-4 grid h-14 grid-cols-3 rounded-2xl bg-bg-2 p-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex items-center justify-center gap-1.5 rounded-xl text-[15px] ${tab === t ? "bg-white font-bold shadow-sm" : "font-medium text-ink-2"}`}
          >
            {t === "상품 구매" && <GiftIcon size={16} className={tab === t ? "text-myb" : "text-ink-2"} />}
            {t}
          </button>
        ))}
      </div>

      {tab === "자산" && (
        <section className="animate-pop">
          <h2 className="mt-8 flex items-center gap-1.5 text-[19px] font-bold">총 보상 잔액 <InfoIcon className="text-[#c5cbd4]" /></h2>
          <div className="mt-3 flex items-center justify-between">
            <p className="flex items-center gap-2"><PXCoin size={34} /><span className="text-[30px] font-extrabold tabular-nums">{fmt(balance)} 원</span></p>
            <span className="flex items-center text-[14px] text-muted">내역 <ChevronRight size={16} /></span>
          </div>
          <div className="mt-4 flex h-14 items-center justify-between rounded-xl border border-[#e3e8f0] px-4 text-[14px]">
            <span className="flex items-center gap-2"><CXCoin size={20} /> 1 CONX당 <b className="text-red">{fmt(CONX_RATE)}원</b>이에요. <span className="text-red">▲</span></span>
            <span className="flex items-center gap-1 text-[12px] text-muted"><ClockIcon /> 15분전</span>
          </div>

          <h2 className="mt-9 flex items-center gap-1.5 text-[19px] font-bold">내 자산 <InfoIcon className="text-[#c5cbd4]" /></h2>
          <AssetRow icon={<PCoin size={26} />} name="B포인트" value={fmt(balance)} />
          <AssetRow icon={<CXCoin size={26} />} name="CONX" value={conx} />

          <div className="mt-5 flex h-14 items-center justify-between rounded-xl bg-[#fff0f6] px-4 text-[14px]">
            <span className="flex items-center gap-1.5"><span aria-hidden>🛍️</span> 쇼핑적립 예정 포인트</span>
            <span className="flex items-center gap-1 text-[18px] font-extrabold"><PCoin size={18} className="!bg-pink" />5,298 <ChevronRight size={16} className="text-muted" /></span>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#e3e8f0] p-5">
            <div>
              <p className="flex items-center gap-2 text-[16px] font-bold text-[#e3a300]">
                <span className="rounded-full border border-[#e3a300] px-2 py-0.5 text-[12px]">진행중</span> 트레저러 금 투자
              </p>
              <p className="mt-2 whitespace-nowrap text-[19px] font-extrabold">💰 63,383원 <span className="ml-1 text-[13px] font-medium text-ink-2">총 손익</span> <span className="text-[14px] text-red">▲ 20,474 (48%)</span></p>
            </div>
            <ChevronRight className="text-muted" />
          </div>
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#9fd3e6] p-5">
            <div>
              <p className="flex items-center gap-2 text-[16px] font-bold text-myb-dark">
                <span className="rounded-full border border-myb-dark px-2 py-0.5 text-[12px]">예치 중</span> B포인트 적금
              </p>
              <p className="mt-1.5 text-[14px] text-muted">스탬프 {data?.wallet.stamps ?? 0}개 · 10개 모으면 룰렛 1회</p>
            </div>
            <span className="text-[40px]" aria-hidden>🏦</span>
          </div>
        </section>
      )}

      {tab === "상품 구매" && (
        <section className="animate-pop">
          <h2 className="mt-8 text-[21px] font-bold">인기 브랜드 상품을 모아봤어요</h2>
          <div className="no-scrollbar mt-5 flex gap-4 overflow-x-auto">
            {BRANDS.map((b, i) => (
              <span key={b.name} className={`flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border border-[#e3e8f0] text-center text-[11px] font-extrabold shadow-sm ${b.bg} ${i === 0 ? "ring-2 ring-myb ring-offset-2" : ""}`}>
                {b.label}
              </span>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-x-3 gap-y-7">
            {PRODUCTS.map((p) => (
              <div key={p.name}>
                <div className={`flex aspect-square items-center justify-center rounded-xl text-[44px] ${p.bg}`} aria-hidden>{p.emoji}</div>
                <p className="mt-2.5 line-clamp-2 text-[14px] leading-snug">{p.name}</p>
                {p.p === null ? (
                  <p className="mt-1.5 flex items-center gap-1 text-[15px] font-bold"><PCoin size={16} />무제한</p>
                ) : (
                  <>
                    <p className="mt-1.5 flex items-center gap-1 text-[15px] font-bold"><PCoin size={16} />{fmt(p.p)}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[15px] font-bold"><CXCoin size={16} />{fmt(p.cx!)}</p>
                  </>
                )}
              </div>
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
                <li key={b.code} className="flex flex-col items-center rounded-2xl border border-[#e3e8f0] p-4 text-center">
                  <span className="text-[40px]" aria-hidden>{b.emoji}</span>
                  <span className="mt-2 text-[14px] font-bold">{b.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-2xl bg-bg-2 p-8 text-center text-[14px] text-muted">아직 뱃지가 없어요.<br />퀴즈를 풀면 생겨요.</div>
          )}
        </section>
      )}
    </div>
  );
}

function AssetRow({ icon, name, value }: { icon: React.ReactNode; name: string; value: string }) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-bg-2">{icon}</span>
        <div>
          <p className="flex items-center gap-0.5 text-[14px] text-muted">{name} <ChevronRight size={14} /></p>
          <p className="text-[21px] font-extrabold tabular-nums">{value}</p>
        </div>
      </div>
      <button type="button" className="h-10 rounded-lg bg-myb px-5 text-[15px] font-bold text-white">교환</button>
    </div>
  );
}

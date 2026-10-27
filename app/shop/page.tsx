"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MerchantCard, NewTag, Rate } from "@/components/shop/MerchantCard";
import type { Merchant, ShopPayload } from "@/lib/shop/types";

/* eslint-disable @next/next/no-img-element */

/**
 * 쇼핑적립 — 마이비 shop.myb.im 메인 웹뷰 오프라인 렌더 DOM 좌표 복제(390 기준, 상태바 45px 제외).
 * 헤더 60 · 추천 배너 74 · 적립 예정 카드 137 · 즐겨찾기 70원 · 2배 배너 78 · 추천 카드 167×122 · 전체 카드 167×126 · 유의사항 var(--color-bg-3)
 */
const SHADOW = "0 5px 16px 0 rgba(40, 24, 14, 0.09)";

export default function ShopPage() {
  const router = useRouter();
  const [data, setData] = useState<ShopPayload | null>(null);
  const [bannerOpen, setBannerOpen] = useState(true);
  const [favOpen, setFavOpen] = useState(true);
  const [popup, setPopup] = useState(false);

  useEffect(() => {
    fetch("/api/shop", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: ShopPayload) => {
        setData(j);
        try {
          if (j.firstPurchaseTarget && !sessionStorage.getItem("ccr_shop_popup")) setPopup(true);
        } catch {
          setPopup(j.firstPurchaseTarget);
        }
      })
      .catch(() => {});
  }, []);

  const byId = (id: string) => data?.merchants.find((m) => m.id === id);
  const all = data?.merchants.filter((m) => m.id !== "coupang_pincrux_group") ?? [];

  function closePopup() {
    setPopup(false);
    try {
      sessionStorage.setItem("ccr_shop_popup", "1");
    } catch {}
  }

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] text-[#191f28]">
      {/* 헤더 60 (원본 105 = 상태바 45 + 60) */}
      <header className="fixed left-1/2 top-0 z-10 flex h-[60px] w-full max-w-[430px] -translate-x-1/2 items-center justify-center bg-white py-4">
        <button type="button" onClick={() => router.back()} aria-label="뒤로" className="flex h-7 w-[60px] items-center justify-center">
          <img src="/myb/shop/ic_left.png" width={28} height={28} alt="" className="h-7 w-7" />
        </button>
        <h1 className="flex h-7 flex-1 items-center justify-center text-center text-[16px] font-medium text-[#191f28]">쇼핑적립</h1>
        <span className="h-7 w-[60px]" />
      </header>

      <div className="flex flex-col pt-[60px]">
        {/* 오늘의 쇼핑 추천 배너 342×74 */}
        {bannerOpen && (
          <div className="mb-[14px] px-6">
            <Link href={`/shop/${data?.topBanner.merchantId ?? "coupang_pincrux_group"}`} className="relative flex h-[74px] items-center justify-center gap-[10px] rounded-[14px] bg-[var(--color-myb-soft)]">
              <img src={data?.topBanner.image ?? "/myb/res/img_shopping_round_coupang.png"} width={48} height={48} alt="" className="h-12 w-12 rounded-full" />
              <div className="flex w-[252px] flex-col justify-center gap-[7px]">
                <p className="text-[14px] leading-[16.1px] text-[#5c657c]">{data?.topBanner.title ?? "오늘의 쇼핑 추천"}</p>
                <p className="text-[16px] font-semibold leading-[18px] text-[#191f28]">{data?.topBanner.description ?? "쿠팡 최대 1,100P 적립"}</p>
              </div>
              <button
                type="button"
                aria-label="닫기"
                onClick={(e) => {
                  e.preventDefault();
                  setBannerOpen(false);
                }}
                className="absolute right-4 top-4 h-4 w-4"
              >
                <img src="/myb/shop/ic_close.png" width={16} height={16} alt="" className="h-4 w-4" />
              </button>
            </Link>
          </div>
        )}

        {/* 적립 예정 포인트 카드 342×137 */}
        <div className="mt-[10px] mb-[34px] px-6">
          <div className="flex flex-col items-center justify-center rounded-[14px] bg-white px-5 py-6" style={{ boxShadow: SHADOW }}>
            <div className="relative mb-4 flex w-full items-center gap-1 text-[16px] font-medium leading-[18px] text-[#33363f]">
              적립 예정 포인트
              <img src="/myb/shop/ic_question.png" width={17} height={17} alt="안내" className="h-[17px] w-[17px]" />
            </div>
            <div className="flex w-full flex-col items-center gap-2">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/myb/shop/ic_bpoint.png" width={25} height={25} alt="" className="h-[25px] w-[25px]" />
                  <span className="text-[26px] font-bold leading-[30px] tabular-nums text-[#191f28]">{data ? data.pendingPoint.toLocaleString("ko-KR") : "0"}</span>
                </div>
                <Link href="/wallet" className="flex items-center justify-center rounded-[100px] border border-[#dee2e9] px-3 py-2 text-[13px] font-semibold leading-[14.95px] text-[#5c6573]">
                  적립내역
                </Link>
              </div>
              <div className="flex w-full items-center gap-1 text-[12px] leading-[13.8px] text-[#b0b8c1]">
                {data?.asOf ?? "—"} 기준
                <img src="/myb/shop/ic_refresh.png" width={14} height={14} alt="새로고침" className="h-[14px] w-[14px]" />
              </div>
            </div>
          </div>
        </div>

        {/* 📌 즐겨찾는 쇼핑몰 */}
        <div className="mb-10 flex flex-col">
          <div className="flex items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <h2 className="text-[20px] font-medium leading-6">📌️ 즐겨찾는 쇼핑몰</h2>
              <button type="button" className="flex h-[29px] items-center justify-center whitespace-nowrap rounded-[30px] border border-[#ced5e0] bg-white px-[10px] text-[13px] font-medium leading-[15px] tracking-[-0.26px] text-[#5c6573]">관리</button>
            </div>
            <button type="button" onClick={() => setFavOpen((v) => !v)} aria-label="접기" className="flex h-6 w-6 items-center justify-center">
              <img src="/myb/shop/ic_up.png" width={24} height={24} alt="" className={`h-6 w-6 transition-transform duration-200 ${favOpen ? "" : "rotate-180"}`} />
            </button>
          </div>
          {favOpen && (
            <div className="no-scrollbar mt-5 flex h-[120px] gap-[10px] overflow-x-auto px-6">
              {(data?.favorites ?? []).map((id) => {
                const m = byId(id);
                if (!m) return null;
                return (
                  <Link key={id} href={`/shop/${id}`} className="flex w-[82px] shrink-0 flex-col items-center">
                    <div className="relative mb-3 h-[70px] w-[70px] rounded-full">
                      <img src={m.logoCircle} width={70} height={70} alt="" className="h-[70px] w-[70px] rounded-full" />
                      <span className="absolute right-0 top-0 flex h-[19px] w-7 items-center justify-center rounded-[100px] border border-black bg-[#ec58d4] text-[9px] font-bold leading-[10.35px] tracking-[-0.2px] text-white">MY</span>
                    </div>
                    <p className="mb-1 h-[14px] w-full overflow-hidden whitespace-nowrap text-center text-[12px] font-medium leading-[14px] text-[#8b94a0]">{m.name}</p>
                    <p className="flex h-4 items-center justify-center gap-1 text-[14px] font-semibold leading-4 text-[#33363f]">
                      최대 <span className="font-bold text-[var(--color-myb)]">{m.rate} %</span>
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 🛍️ 오늘 여기서 쇼핑 어때요? */}
        <div className="mb-7 flex flex-col">
          <div className="flex items-center justify-between px-6">
            <h2 className="text-[20px] font-medium leading-6">🛍️ 오늘 여기서 쇼핑 어때요?</h2>
          </div>
          <div className="relative mx-6 mt-4 h-[78px] overflow-hidden rounded-xl bg-[var(--color-myb-soft)]">
            <img src="/myb/shop/img_welcome_2x.png" width={40} height={40} alt="" className="absolute left-3 top-[19px] h-10 w-10 object-contain" />
            <span className="absolute left-[33px] top-[46px] flex h-[15px] w-6 items-center justify-center whitespace-nowrap rounded-[40px] px-[6px] py-[2px] text-[9px] font-extrabold text-white" style={{ background: "linear-gradient(to left, rgb(66, 195, 255), rgb(66, 124, 255))" }}>2X</span>
            <div className="absolute left-[67px] top-1/2 flex w-[261px] -translate-y-1/2 flex-col gap-2">
              <p className="whitespace-nowrap text-[15px] font-bold leading-[15px] tracking-[-0.3px] text-[#191f28]">
                <span className="text-[var(--color-myb)]">웰컴 2배 적립 혜택</span> ✨
              </p>
              <p className="text-[14px] font-medium leading-[18.2px] tracking-[-0.14px] text-[#5c6573]">지금 보이는 적립 혜택을 2배로 적립해드려요!</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 px-6 py-5">
            {(data?.recommended ?? ["coupang_pincrux_group", "naver_plus_store_adbc", "gmarket", "auction"]).map((id) => {
              const m = byId(id);
              if (!m) return <div key={id} className="myb-skeleton h-[122px] rounded-[14px]" />;
              return m.id === "coupang_pincrux_group" ? <CoupangCard key={id} m={m} /> : <RecommendCard key={id} m={m} />;
            })}
          </div>
        </div>

        {/* 전체 쇼핑몰 */}
        <div className="flex flex-col gap-5 px-6 pb-5">
          <div className="flex h-9 items-center justify-between">
            <h2 className="text-[20px] font-medium leading-6">전체 쇼핑몰</h2>
            <button type="button" className="flex items-center justify-center gap-1 rounded-[99px] border border-[#dee2e9] bg-white py-2 pl-3 pr-2">
              <span className="text-[14px] font-medium leading-4 text-[#5c6573]">인기 쇼핑몰 순</span>
              <img src="/myb/shop/ic_filter.png" width={18} height={18} alt="" className="h-[18px] w-[18px]" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            {all.length > 0 ? all.map((m) => <MerchantCard key={m.id} m={m} />) : [0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="myb-skeleton h-[126px] rounded-xl" />)}
          </div>
        </div>

        {/* 쇼핑적립 유의사항 */}
        <div className="mt-10 flex items-center justify-center bg-[var(--color-bg-3)]">
          <div className="flex w-full flex-col gap-[15px] px-5 pb-[100px] pt-8">
            <p className="text-[14px] font-medium leading-[16.1px] text-[#191f28]">쇼핑적립 유의사항</p>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-[13px] font-medium leading-[14.95px] text-[#8b94a0]">
              {(data?.notices ?? []).map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* 첫 구매 두 배 팝업 — img_promotion_banner.png 351×429 r26 + 그라디언트 버튼 + 🚨 필 */}
      {popup && (
        <>
          <div className="myb-fade-in fixed inset-0 z-[999] bg-black/70" onClick={closePopup} />
          <div className="pointer-events-none fixed inset-0 z-[1000] flex items-center justify-center">
            <div className="myb-modal-in pointer-events-auto relative mx-[19.5px] w-[351px] max-w-[calc(100%-39px)]">
              <div
                className="relative flex aspect-[351/429] w-full flex-col items-center justify-end rounded-[26px] bg-cover bg-center"
                style={{ backgroundImage: "url(/myb/shop/img_promotion_banner.png)" }}
              >
                <button type="button" onClick={closePopup} aria-label="닫기" className="absolute right-5 top-5 z-[3] flex h-[30px] w-[30px] items-center justify-center rounded-full">
                  <img src="/myb/shop/ic_x.png" width={24} height={24} alt="" className="h-6 w-6" />
                </button>
                <div className="relative flex w-full flex-col items-center justify-center gap-[18px] px-5 pb-5">
                  <div className="relative flex w-full gap-[10px]">
                    <Link
                      href="/shop/coupang_pincrux_group"
                      onClick={closePopup}
                      className="myb-press flex h-[55px] w-full items-center justify-center rounded-[14px] px-4 py-[18px] text-center text-[16px] font-bold text-white"
                      style={{ background: "linear-gradient(90deg, rgb(0, 121, 251) 0%, rgb(55, 0, 255) 100%)", boxShadow: SHADOW }}
                    >
                      첫 구매 혜택받기!
                    </Link>
                    <div className="absolute left-1/2 top-[-22px] flex h-8 -translate-x-1/2 items-center justify-center gap-[10px] whitespace-nowrap rounded-[99px] bg-white px-[10px]" style={{ boxShadow: SHADOW }}>
                      <p className="text-[15px] leading-[15px]">
                        <span className="font-bold text-[var(--color-myb)]">🚨 10월까지만</span>
                        <span className="font-medium"> 누릴 수 있어요! 🚨</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/** 추천 영역 일반 카드 167×122: white r14 border var(--color-bg-3) shadow padding 16 gap 12 */
function RecommendCard({ m }: { m: Merchant }) {
  return (
    <Link href={`/shop/${m.id}`} className="myb-press relative flex h-[122px] flex-col gap-3 rounded-[14px] border border-[var(--color-bg-3)] bg-white p-4" style={{ boxShadow: SHADOW }}>
      {m.isNew && <NewTag />}
      <div className="flex h-8 items-center justify-center">
        <img src={m.logo} alt={m.name} className="max-h-8 max-w-[133px] object-contain" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="overflow-hidden whitespace-nowrap text-[14px] font-medium leading-[16.1px] text-[#33363f]">{m.name}</p>
        <Rate m={m} suffix="%" />
      </div>
    </Link>
  );
}

/** 쿠팡 카드 167×122: bg #f8f7ff, border rgba(132,56,249,.4), HOT 태그, 2만원/5만원 불릿 */
function CoupangCard({ m }: { m: Merchant }) {
  const rows = [
    ["2만원 이상", "최대 500P"],
    ["5만원 이상", "최대 1,100P"],
  ];
  return (
    <Link href={`/shop/${m.id}`} className="myb-press relative flex h-[122px] flex-col justify-between gap-3 rounded-[14px] border border-[rgba(132,56,249,0.4)] bg-[#f8f7ff] p-4" style={{ boxShadow: SHADOW }}>
      <img src="/myb/shop/img_tag_hot.png" width={49} height={25} alt="HOT" className="absolute right-[15px] top-[-8px] h-[25px] w-[49px]" />
      <div className="flex h-8 items-center justify-center">
        <img src={m.logo} alt={m.name} className="max-h-8 max-w-[133px] object-contain" />
      </div>
      <div className="flex flex-col gap-2">
        {rows.map(([a, b]) => (
          <div key={a} className="flex gap-1">
            <span className="mt-[6px] h-[3px] w-[3px] shrink-0 rounded-full bg-[#8336f0]" />
            <p className="text-[13px] font-medium leading-4 tracking-[-0.26px] text-[#5c6573]">
              {a}
              <span className="ml-[2px] whitespace-nowrap font-bold text-[#8336f0]">{b}</span>
            </p>
          </div>
        ))}
      </div>
    </Link>
  );
}

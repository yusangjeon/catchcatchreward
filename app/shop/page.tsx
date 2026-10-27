"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DuoIcon, IconTile } from "@/components/icons/duo";
import { PCoin, ChevronRight } from "@/components/icons";
import { OfferHeader } from "@/components/offers/Preview";
import { MerchantCard } from "@/components/shop/MerchantCard";
import { fmt } from "@/hooks/useHome";
import type { Merchant, ShopPayload } from "@/lib/shop/types";

/* eslint-disable @next/next/no-img-element */

/**
 * 쇼핑 적립 — 우리 톤. 오늘의 추천(크림 카드) → 적립 예정 포인트 → 즐겨찾기 → 첫 구매 2배 띠 → 적립률 높은 곳 2열 → 전체 쇼핑몰(정렬) → 유의사항 아코디언.
 * 상세 CTA 는 /api/shop/out 경유(하루 1회 방문 5P 적립 후 제휴 링크).
 */
export default function ShopPage() {
  const [data, setData] = useState<ShopPayload | null>(null);
  const [sort, setSort] = useState<"recommend" | "rate" | "name">("recommend");
  const [noticeOpen, setNoticeOpen] = useState(false);
  useEffect(() => { fetch("/api/shop", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => {}); }, []);

  const byId = (id: string) => data?.merchants.find((m) => m.id === id);
  const top = data ? byId(data.topBanner.merchantId) : undefined;
  const favorites = (data?.favorites ?? []).map(byId).filter(Boolean) as Merchant[];
  const recommended = (data?.recommended ?? []).map(byId).filter(Boolean) as Merchant[];
  const all = useMemo(() => {
    const list = [...(data?.merchants ?? [])];
    if (sort === "rate") list.sort((a, b) => (b.rate === 0 ? 99 : b.rate) - (a.rate === 0 ? 99 : a.rate));
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    else list.sort((a, b) => a.recommendIndex - b.recommendIndex);
    return list;
  }, [data, sort]);

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-10">
      <OfferHeader title="쇼핑 적립" right={<Link href="/history" className="text-[13px] font-semibold text-ink-2">적립내역</Link>} />

      {/* 오늘의 추천 */}
      {data && top && (
        <Link href={`/shop/${top.id}`} className="mx-5 mt-2 flex items-center gap-3.5 rounded-[20px] px-4 py-3.5" style={{ background: "linear-gradient(135deg,#fff3cc 0%,#ffe7d6 100%)" }}>
          <img src={top.logoCircle} alt="" width={48} height={48} className="h-12 w-12 rounded-full bg-white object-cover" />
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] font-semibold text-[#9a5b00]">{data.topBanner.title}</span>
            <span className="block truncate text-[16px] font-bold text-ink">{data.topBanner.description}</span>
          </span>
          <ChevronRight className="text-[#c9a46a]" size={18} />
        </Link>
      )}

      {/* 적립 예정 */}
      <section className="mx-5 mt-4 rounded-[20px] bg-white p-5" style={{ boxShadow: "0 5px 16px rgba(40,24,14,.07)" }}>
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[15px] font-bold text-ink">적립 예정 포인트 <DuoIcon name="doc" size={14} className="text-muted" /></p>
          <span className="text-[11px] text-muted">{data?.asOf ?? "—"} 기준</span>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <p className="flex items-center gap-2 text-[30px] font-bold leading-none text-ink"><PCoin size={30} />{fmt(data?.pendingPoint ?? 0)}</p>
          <span className="rounded-full bg-bg-2 px-3 py-1.5 text-[12px] font-semibold text-ink-2">구매 확정 후 적립</span>
        </div>
      </section>

      {/* 즐겨찾기 */}
      <section className="mt-7 px-5">
        <h2 className="flex items-center gap-2 text-[18px] font-bold text-ink"><DuoIcon name="star" size={20} className="text-amber" /> 즐겨찾는 쇼핑몰</h2>
        <div className="no-scrollbar -mx-5 mt-3 flex gap-4 overflow-x-auto px-5">
          {favorites.map((m) => (
            <Link key={m.id} href={`/shop/${m.id}`} className="flex w-[72px] shrink-0 flex-col items-center text-center">
              <img src={m.logoCircle} alt="" width={64} height={64} className="h-16 w-16 rounded-full bg-white object-cover shadow-[0_3px_10px_rgba(0,0,0,.08)]" />
              <span className="mt-2 w-full truncate text-[12px] text-ink-2">{m.name}</span>
              <span className="text-[12px] font-bold text-myb-dark">{m.rate === 0 ? "1,100P" : `${m.rate}%`}</span>
            </Link>
          ))}
          <Link href="#all" className="flex w-[72px] shrink-0 flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[#dfe3ea] text-muted"><DuoIcon name="search" size={22} /></span>
            <span className="mt-2 text-[12px] text-muted">추가</span>
          </Link>
          {!data && [0, 1, 2].map((i) => <div key={i} className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-white" />)}
        </div>
      </section>

      {/* 첫 구매 2배 */}
      <section className="mx-5 mt-7 flex items-center gap-3 rounded-[20px] p-4 text-white" style={{ background: "linear-gradient(135deg,#ff7a45 0%,#ff5a2d 100%)", boxShadow: "0 8px 22px rgba(255,90,45,.25)" }}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20"><DuoIcon name="bag" size={24} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold">첫 구매는 적립 2배</span>
          <span className="block text-[12px] text-white/85">지금 보이는 적립률의 두 배로 드려요</span>
        </span>
        <span className="rounded-full bg-white px-2.5 py-1 text-[12px] font-bold text-myb-dark">2X</span>
      </section>

      {/* 적립률 높은 곳 */}
      <section className="mt-7 px-5">
        <h2 className="text-[18px] font-bold text-ink">지금 적립률 높은 곳</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {recommended.map((m, i) => <MerchantCard key={m.id} m={m} hot={i === 0} />)}
          {!data && [0, 1, 2, 3].map((i) => <div key={i} className="h-[118px] animate-pulse rounded-[18px] bg-white" />)}
        </div>
      </section>

      {/* 전체 */}
      <section id="all" className="mt-8 px-5">
        <div className="flex items-end justify-between">
          <h2 className="text-[18px] font-bold text-ink">전체 쇼핑몰 <span className="ml-1 text-[12px] font-medium text-muted">{data ? `${data.merchants.length}곳` : ""}</span></h2>
          <div className="flex gap-1">
            {([["recommend", "추천순"], ["rate", "적립률순"], ["name", "이름순"]] as const).map(([k, l]) => (
              <button key={k} type="button" onClick={() => setSort(k)} className={`h-7 rounded-full px-2.5 text-[11px] font-semibold ${sort === k ? "bg-ink text-white" : "bg-white text-ink-2"}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {all.map((m) => <MerchantCard key={m.id} m={m} />)}
        </div>
      </section>

      {/* 유의사항 */}
      <section className="mx-5 mt-8 rounded-[16px] bg-[#f1f2f5] px-4 py-3">
        <button type="button" onClick={() => setNoticeOpen((v) => !v)} className="flex w-full items-center justify-between text-[13px] font-bold text-ink">
          꼭 읽어주세요 <DuoIcon name="doc" size={14} className={`text-muted transition ${noticeOpen ? "rotate-0" : ""}`} />
        </button>
        {noticeOpen && <ul className="mt-2 list-disc pl-4 text-[12px] leading-[18px] text-ink-2">{(data?.notices ?? []).map((n, i) => <li key={i}>{n}</li>)}</ul>}
      </section>

      <div className="mx-5 mt-6 flex items-center gap-3 rounded-[16px] bg-white p-4" style={{ boxShadow: "0 3px 12px rgba(40,24,14,.05)" }}>
        <IconTile name="coin" tone="amber" size={40} />
        <p className="text-[12px] leading-[17px] text-ink-2">쇼핑몰로 이동만 해도 <b className="text-ink">하루 1회 5P</b>가 적립돼요. 구매 적립은 구매 확정 후 들어와요.</p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DuoIcon, IconTile } from "@/components/icons/duo";
import { PCoin } from "@/components/icons";
import { OfferHeader } from "@/components/offers/Preview";
import { MerchantCard } from "@/components/shop/MerchantCard";
import { useToast } from "@/components/motion/Toast";
import type { MerchantPayload } from "@/lib/shop/types";

/* eslint-disable @next/next/no-img-element */

/**
 * 쇼핑몰 상세 — 우리 톤. 로고 원형 + 제목(최대 적립) + 즐겨찾기 별 → 적립 순서(번호 카드) → 적립 대상 표 → 꼭 읽어보세요 → 다른 쇼핑몰 → 하단 고정 CTA(제휴 링크, 방문 적립 5P)
 */
const SHADOW = "0 5px 16px rgba(40,24,14,.07)";

export function MerchantView({ merchantId }: { merchantId: string }) {
  const { show } = useToast();
  const [data, setData] = useState<MerchantPayload | null>(null);
  const [error, setError] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setData(null);
    fetch(`/api/shop/${merchantId}`, { cache: "no-store" })
      .then(async (r) => { if (!r.ok) throw new Error(); const j = (await r.json()) as MerchantPayload; setData(j); setLiked(j.isFavorite); })
      .catch(() => setError(true));
  }, [merchantId]);

  if (error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-bg)] px-6 text-center">
        <IconTile name="bag" tone="gray" size={96} />
        <p className="mt-4 text-[16px] font-bold text-ink">쇼핑몰을 찾을 수 없어요</p>
        <Link href="/shop" className="mt-4 rounded-[14px] bg-myb px-5 py-3 font-bold text-white">쇼핑 적립으로</Link>
      </div>
    );
  }

  const m = data?.merchant;
  const isCoupang = merchantId === "coupang_pincrux_group";
  const toggleLike = () => { setLiked((v) => !v); show(liked ? "즐겨찾기에서 뺐어요" : "즐겨찾는 쇼핑몰에 담았어요", "info"); };

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-32">
      <OfferHeader title="쇼핑 적립" right={<button type="button" onClick={toggleLike} aria-label="즐겨찾기" className={`flex h-8 w-8 items-center justify-center rounded-full ${liked ? "bg-amber-soft text-amber" : "bg-white text-[#c3c9d3]"}`}><DuoIcon name="star" size={18} /></button>} />

      <section className="mx-5 mt-2 rounded-[22px] bg-white p-5" style={{ boxShadow: SHADOW }}>
        <div className="flex items-center gap-4">
          {m ? <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-[#eceff4] shadow-[0_3px_10px_rgba(0,0,0,.06)]"><img src={m.logoCircle} width={36} height={36} alt="" className="h-9 w-9 object-contain" /></span> : <div className="h-16 w-16 animate-pulse rounded-full bg-bg-2" />}
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-ink-2">{m?.name ?? "…"}에서 쇼핑하면</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[24px] font-bold leading-[30px] text-ink">최대 <span className="flex items-center gap-1"><PCoin size={22} />{isCoupang ? "1,100P" : `${m?.rate ?? "—"}%`}</span></p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <span className="rounded-full bg-myb-soft px-2.5 py-1 text-[11px] font-bold text-myb-dark">첫 구매 2배</span>
          <span className="rounded-full bg-bg-2 px-2.5 py-1 text-[11px] font-semibold text-ink-2">방문만 해도 하루 {data?.clickPoints ?? 5}P</span>
        </div>
      </section>

      <section className="mx-5 mt-4 rounded-[20px] bg-white p-5" style={{ boxShadow: SHADOW }}>
        <p className="text-[15px] font-bold text-ink">이렇게 적립돼요</p>
        <ol className="mt-3 flex flex-col gap-3">
          {(data?.detail.guide ?? []).map((line, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-myb-soft text-[12px] font-bold text-myb-dark">{i + 1}</span>
              <p className="text-[14px] font-semibold leading-[22px] text-ink">{line.map((t, j) => <span key={j} className={t.accent ? "text-myb-dark" : ""}>{t.text}</span>)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-5 mt-4 rounded-[20px] bg-white p-5" style={{ boxShadow: SHADOW }}>
        <p className="text-[15px] font-bold text-ink">적립 대상</p>
        <div className="mt-3 flex flex-col divide-y divide-bg-2">
          {(data?.detail.description ?? []).map((d, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 text-[14px]">
              <span className="text-ink-2">{d.left}</span>
              <span className="text-ink"><b className="text-myb-dark">{d.right}</b> <span className="text-[12px] text-muted">{d.postfix}</span></span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-5 mt-4 rounded-[20px] bg-[#fff4f1] p-5">
        <p className="flex items-center gap-1.5 text-[15px] font-bold text-[#d7301c]"><DuoIcon name="bell" size={16} /> 꼭 읽어보세요</p>
        <ul className="mt-2 list-disc pl-4 text-[13px] leading-[19px] text-ink-2">{(data?.detail.deny ?? []).map((t, i) => <li key={i}>{t}</li>)}</ul>
      </section>

      <section className="mt-8">
        <h2 className="px-5 text-[18px] font-bold text-ink">이 쇼핑몰은 어때요?</h2>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-5">{(data?.nudge ?? []).map((n) => <MerchantCard key={n.id} m={n} width={150} />)}</div>
      </section>

      <section className="mx-5 mt-8 rounded-[16px] bg-[#f1f2f5] p-4">
        <p className="text-[13px] font-bold text-ink">쇼핑 적립 유의사항</p>
        <ul className="mt-2 list-disc pl-4 text-[12px] leading-[18px] text-ink-2">{(data?.notices ?? []).map((t, i) => <li key={i}>{t}</li>)}</ul>
      </section>

      <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 bg-white/90 px-5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        {data?.detail.buttons.length ? (
          <div className="flex gap-2">
            {data.detail.buttons.map((b) => (
              <a key={b.id} href={data.outHref} target="_blank" rel="noopener noreferrer" onClick={() => show(`쇼핑몰로 이동해요 · 방문 적립 ${data.clickPoints}P`)} className="myb-press flex h-[54px] flex-1 items-center justify-center rounded-[14px] bg-myb text-[15px] font-bold text-white shadow-[0_6px_18px_rgba(255,90,45,.35)]">{b.label}</a>
            ))}
          </div>
        ) : (
          <a href={data?.outHref ?? "#"} target="_blank" rel="noopener noreferrer" onClick={() => show(`쇼핑몰로 이동해요 · 방문 적립 ${data?.clickPoints ?? 5}P`)} className="myb-press flex h-[54px] w-full items-center justify-center gap-1.5 rounded-[14px] bg-myb text-[16px] font-bold text-white shadow-[0_6px_18px_rgba(255,90,45,.35)]">
            {m?.name ?? "쇼핑몰"}로 쇼핑하러 가기 <DuoIcon name="bag" size={18} />
          </a>
        )}
      </div>
    </div>
  );
}

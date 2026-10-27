"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MerchantCard } from "@/components/shop/MerchantCard";
import { useToast } from "@/components/motion/Toast";
import type { MerchantPayload } from "@/lib/shop/types";

/* eslint-disable @next/next/no-img-element */

/**
 * 쇼핑몰 상세 — shop.myb.im/merchant 웹뷰 DOM 복제.
 * bg #f8f9fc · 헤더 60 · 로고 64 · 제목 24/600 lh36 · 번호 안내 20px 원 · 카드 r12 padding 20 16 shadow · 추천 160×126 · 유의사항 white · 하단 고정 버튼 58
 */
const SHADOW = "0 5px 16px 0 rgba(0, 43, 141, 0.1)";

export function MerchantView({ merchantId }: { merchantId: string }) {
  const router = useRouter();
  const { show } = useToast();
  const [data, setData] = useState<MerchantPayload | null>(null);
  const [error, setError] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setData(null);
    fetch(`/api/shop/${merchantId}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const j = (await r.json()) as MerchantPayload;
        setData(j);
        setLiked(j.isFavorite);
      })
      .catch(() => setError(true));
  }, [merchantId]);

  if (error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#f8f9fc] px-6 text-center">
        <img src="/myb/shop/img_notfound.png" alt="" className="h-40 w-40 object-contain" />
        <p className="mt-4 text-[16px] font-medium text-[#33363f]">쇼핑몰을 찾을 수 없어요</p>
        <Link href="/shop" className="mt-4 rounded-[14px] bg-[#427cff] px-5 py-3 font-medium text-white">쇼핑적립으로</Link>
      </div>
    );
  }

  const m = data?.merchant;
  const isCoupang = merchantId === "coupang_pincrux_group";

  return (
    <div className="min-h-dvh bg-[#f8f9fc] text-[#191f28]">
      <header className="fixed left-1/2 top-0 z-10 flex h-[60px] w-full max-w-[430px] -translate-x-1/2 items-center justify-center bg-[#f8f9fc] py-4">
        <button type="button" onClick={() => router.back()} aria-label="뒤로" className="flex h-7 w-[60px] items-center justify-center">
          <img src="/myb/shop/ic_left.png" width={28} height={28} alt="" className="h-7 w-7" />
        </button>
        <span className="h-7 flex-1" />
        <span className="h-7 w-[60px]" />
      </header>

      <div className="flex flex-col pt-[60px]">
        <div className="relative flex flex-col pb-[30px]">
          {/* 즐겨찾기 별 (ic_like 30) — 히트영역 padding 30 */}
          <button
            type="button"
            aria-label="즐겨찾기"
            onClick={() => {
              setLiked((v) => !v);
              show(liked ? "즐겨찾기에서 해제했어요" : "즐겨찾는 쇼핑몰에 추가했어요", "info");
            }}
            className="absolute right-6 top-[-30px] pb-[30px] pl-[30px] pt-[30px]"
          >
            <img src={liked ? "/myb/shop/ic_like.png" : "/myb/shop/ic_like_disable.png"} width={30} height={30} alt="" className="h-[30px] w-[30px]" />
          </button>

          <div className="mb-[26px] flex flex-col gap-5 px-6">
            {m ? <img src={m.logoCircle} width={64} height={64} alt="" className="h-16 w-16 rounded-full" /> : <div className="myb-skeleton h-16 w-16 rounded-full" />}
            {/* 원본 템플릿은 첫 줄이 빈 줄(br)로 시작 — 3줄 108px 그대로 재현 */}
            <h1 className="text-[24px] font-semibold leading-9 text-[#191f28]">
              <br />
              지금 {m?.name ?? "…"}에서 쇼핑하면
              <br />
              <span className="text-[#427cff]">{isCoupang ? "최대 1,100P" : `최대 ${m?.rate ?? "—"} %`}</span> 적립!
            </h1>
          </div>

          <div className="mb-10 flex flex-col px-6">
            <p className="text-[14px] font-semibold leading-[18px] text-[#5c6573]">지금 구매하면</p>
            <div className="mt-4 flex flex-col gap-3">
              {(data?.detail.guide ?? []).map((line, i) => (
                <div key={i} className="flex gap-2">
                  <span className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-[100px] bg-[#5c6573] text-[12px] font-extrabold leading-5 text-white">{i + 1}</span>
                  <p className="flex flex-wrap text-[16px] font-semibold leading-6 text-[#33363f]">
                    {line.map((t, j) => (
                      <span key={j} className={t.accent ? "text-[#427cff]" : ""}>{t.text.replace(/ /g, " ")}</span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-[72px] flex flex-col gap-4 px-6">
            <div className="flex flex-col gap-[14px] rounded-xl bg-white px-4 py-5" style={{ boxShadow: SHADOW }}>
              <p className="text-[16px] font-semibold leading-5 text-[#33363f]">적립 대상</p>
              <div className="flex flex-col gap-1">
                {(data?.detail.description ?? []).map((d, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-[14px] font-medium leading-[23px] text-[#5c6573]">{d.left}</span>
                    <span className="text-right text-[12px] leading-[23px] text-[#33363f]">
                      <b className="text-[14px] font-bold">{d.right}</b> {d.postfix}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-[14px] rounded-xl bg-white px-4 py-5" style={{ boxShadow: SHADOW }}>
              <p className="text-[16px] font-semibold leading-5 text-[#ff3939]">꼭 읽어보세요!</p>
              <div className="flex flex-col gap-1">
                {(data?.detail.deny ?? []).map((t, i) => (
                  <div key={i} className="flex gap-1">
                    <span className="mt-2 h-[3px] w-[3px] shrink-0 rounded-[100px] bg-[#8b94a0]" />
                    <p className="text-[14px] font-medium leading-5 text-[#33363f]">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <h2 className="px-6 text-[18px] font-medium leading-6">이 쇼핑몰도 추천해요!</h2>
            <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-6">
              {(data?.nudge ?? []).map((n) => <MerchantCard key={n.id} m={n} width={160} />)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center bg-white">
          <div className="flex w-full flex-col gap-[15px] px-5 pb-[150px] pt-8">
            <p className="text-[14px] font-medium leading-[16.1px] text-[#191f28]">쇼핑적립 유의사항</p>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-[13px] font-medium leading-[14.95px] text-[#8b94a0]">
              {(data?.notices ?? []).map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* 하단 고정 CTA 113: 버튼 58 r14 bg #427cff, margin 14 20 40 */}
      <div className="fixed bottom-0 left-1/2 z-10 flex w-full max-w-[430px] -translate-x-1/2 bg-white">
        {data?.detail.buttons.length ? (
          <div className="mx-5 mb-[41px] mt-[14px] flex w-full gap-[10px]">
            {data.detail.buttons.map((b) => (
              <a key={b.id} href={data.outHref} target="_blank" rel="noopener noreferrer" onClick={() => show(`쇼핑몰로 이동해요 · 방문 적립 ${data.clickPoints}P`)} className="myb-press flex h-[58px] flex-1 items-center justify-center rounded-[14px] bg-[#427cff] px-4 py-5 text-[16px] font-medium text-white">
                {b.label}
              </a>
            ))}
          </div>
        ) : (
          <a href={data?.outHref ?? "#"} target="_blank" rel="noopener noreferrer" onClick={() => show(`쇼핑몰로 이동해요 · 방문 적립 ${data?.clickPoints ?? 5}P`)} className="myb-press mx-5 mb-[41px] mt-[14px] flex h-[58px] w-full items-center justify-center gap-[10px] rounded-[14px] bg-[#427cff] px-4 py-5 text-[16px] font-medium text-white">
            쇼핑하러 가기
          </a>
        )}
      </div>
    </div>
  );
}

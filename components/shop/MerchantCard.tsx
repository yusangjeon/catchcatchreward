"use client";

import Link from "next/link";
import type { Merchant } from "@/lib/shop/types";

/* eslint-disable @next/next/no-img-element */

/** shop.myb.im "NEW" 태그 — gradient 200% 가로 흐름(shimmer) */
export function NewTag() {
  return (
    <span className="myb-newtag absolute right-[15px] top-[-8px] flex h-[25px] w-[49px] items-center justify-center rounded-xl pl-1 pr-[6px] text-center text-[14px] font-bold leading-[21px] text-white">NEW</span>
  );
}

/** 적립률 표기: ic_bpoint 18 + "1.2" 20/700 + "% 적립" 16/500 */
export function Rate({ m, suffix = "% 적립" }: { m: Merchant; suffix?: string }) {
  const isCoupang = m.rate === 0;
  return (
    <div className="flex items-center gap-1">
      <img src="/myb/shop/ic_bpoint.png" width={18} height={18} alt="" className="h-[18px] w-[18px]" />
      <div className="flex items-end gap-[2px] overflow-hidden whitespace-nowrap text-[#33363f]">
        <span className="text-[20px] font-bold leading-[23px]">{isCoupang ? "1,100" : m.rate}</span>
        <span className="text-[16px] font-medium leading-[22px]">{isCoupang ? "P 적립" : suffix}</span>
      </div>
    </div>
  );
}

/**
 * 전체 쇼핑몰·추천 카드 — 167×126(그리드) / 160×126(가로 스크롤). white r12 padding 18 16 gap 12 border #f2f3f5
 * @param shadow 추천 영역(r14, 그림자, padding 16)
 */
export function MerchantCard({ m, width, shadow = false, suffix }: { m: Merchant; width?: number; shadow?: boolean; suffix?: string }) {
  return (
    <Link
      href={`/shop/${m.id}`}
      className={`myb-press relative flex shrink-0 flex-col gap-3 border border-[#f2f3f5] bg-white ${shadow ? "rounded-[14px] p-4" : "rounded-xl px-4 py-[18px]"}`}
      style={{ width, boxShadow: shadow ? "0 5px 16px 0 rgba(0, 43, 141, 0.1)" : undefined }}
    >
      {m.isNew && <NewTag />}
      <div className="flex h-8 items-center justify-center">
        <img src={m.logo} alt={m.name} className="max-h-8 max-w-[133px] object-contain" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="h-[17px] overflow-hidden whitespace-nowrap text-[14px] font-medium leading-[16.1px] text-[#33363f]">{m.name}</p>
        <Rate m={m} suffix={suffix} />
      </div>
    </Link>
  );
}

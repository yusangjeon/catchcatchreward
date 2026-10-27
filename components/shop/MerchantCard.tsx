"use client";

import Link from "next/link";
import { PCoin } from "@/components/icons";
import type { Merchant } from "@/lib/shop/types";

/* eslint-disable @next/next/no-img-element */

export function NewTag() {
  return <span className="absolute right-3 top-3 rounded-full bg-pink px-2 py-0.5 text-[10px] font-bold text-white">NEW</span>;
}

/** 적립률: 코인 + 숫자(브랜드색) + 단위 */
export function Rate({ m, size = "md" }: { m: Merchant; size?: "md" | "lg" }) {
  const isCoupang = m.rate === 0;
  const big = size === "lg";
  return (
    <span className="flex items-center gap-1 whitespace-nowrap">
      <PCoin size={big ? 20 : 16} />
      <span className={`font-bold text-myb-dark ${big ? "text-[22px]" : "text-[17px]"}`}>{isCoupang ? "1,100" : m.rate}</span>
      <span className={`font-semibold text-ink-2 ${big ? "text-[14px]" : "text-[12px]"}`}>{isCoupang ? "P" : "%"}</span>
    </span>
  );
}

/** 쇼핑몰 카드 — 흰 카드 + 그림자(테두리 없음), 로고 가운데, 이름, 적립률. hot 이면 브랜드 테두리 + HOT 칩 */
export function MerchantCard({ m, width, hot = false }: { m: Merchant; width?: number; hot?: boolean }) {
  return (
    <Link
      href={`/shop/${m.id}`}
      className={`myb-press relative flex shrink-0 flex-col gap-3 rounded-[18px] bg-white px-4 pb-4 pt-5 ${hot ? "ring-2 ring-myb" : ""}`}
      style={{ width, boxShadow: "0 4px 14px rgba(40,24,14,.06)" }}
    >
      {m.isNew && !hot && <NewTag />}
      {hot && <span className="absolute right-3 top-3 rounded-full bg-myb px-2 py-0.5 text-[10px] font-bold text-white">HOT</span>}
      <div className="flex h-8 items-center justify-start">
        <img src={m.logo} alt={m.name} className="max-h-7 max-w-[120px] object-contain" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="truncate text-[13px] font-medium text-ink-2">{m.name}</p>
        <Rate m={m} />
      </div>
    </Link>
  );
}

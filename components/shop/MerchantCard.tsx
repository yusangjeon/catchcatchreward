"use client";

import Link from "next/link";
import { PCoin } from "@/components/icons";
import { DuoIcon } from "@/components/icons/duo";
import type { Merchant } from "@/lib/shop/types";

/* eslint-disable @next/next/no-img-element */

/** NEW: 연한 핑크 칩 + 점 / HOT: 잉크 칩 + 불꽃 아이콘 */
export function NewTag() {
  return <span className="absolute right-3 top-3 inline-flex h-[20px] items-center gap-1 rounded-full bg-pink-soft px-2 text-[10px] font-bold tracking-wide text-pink"><i className="h-1.5 w-1.5 rounded-full bg-pink" />NEW</span>;
}
export function HotTag() {
  return <span className="absolute right-3 top-3 inline-flex h-[20px] items-center gap-0.5 rounded-full bg-ink px-2 text-[10px] font-bold tracking-wide text-white"><DuoIcon name="flame" size={11} className="text-[#ffb400]" />HOT</span>;
}

/** 쇼핑몰 아이콘 — 공식 파비콘을 흰 원 안에(마이비 로고 자산 미사용) */
export function MerchantIcon({ m, size = 44 }: { m: Merchant; size?: number }) {
  return (
    <span className="flex shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-[#eceff4]" style={{ width: size, height: size }}>
      <img src={m.logoCircle} alt={m.name} width={Math.round(size * 0.55)} height={Math.round(size * 0.55)} className="object-contain" style={{ width: size * 0.55, height: size * 0.55 }} loading="lazy" />
    </span>
  );
}

/** 적립률: 코인 + 숫자(잉크) + 단위 */
export function Rate({ m, size = "md" }: { m: Merchant; size?: "md" | "lg" }) {
  const isCoupang = m.rate === 0;
  const big = size === "lg";
  return (
    <span className="flex items-center gap-1 whitespace-nowrap">
      <PCoin size={big ? 20 : 16} />
      <span className={`font-bold text-ink ${big ? "text-[22px]" : "text-[17px]"}`}>{isCoupang ? "1,100" : m.rate}</span>
      <span className={`font-semibold text-muted ${big ? "text-[14px]" : "text-[12px]"}`}>{isCoupang ? "P" : "%"}</span>
    </span>
  );
}

/** 쇼핑몰 카드 — 아이콘(원형) 왼쪽 + 이름 + 적립률. 테두리 없는 흰 카드 */
export function MerchantCard({ m, width, hot = false }: { m: Merchant; width?: number; hot?: boolean }) {
  return (
    <Link href={`/shop/${m.id}`} className="myb-press relative flex shrink-0 flex-col gap-3 rounded-[18px] bg-white p-4" style={{ width, boxShadow: "0 4px 14px rgba(40,24,14,.06)" }}>
      {m.isNew && !hot && <NewTag />}
      {hot && <HotTag />}
      <MerchantIcon m={m} size={44} />
      <div className="flex flex-col gap-1">
        <p className="truncate text-[14px] font-bold text-ink">{m.name}</p>
        <Rate m={m} />
      </div>
    </Link>
  );
}

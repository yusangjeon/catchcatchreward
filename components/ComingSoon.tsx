"use client";

import { IconTile, type DuoName } from "@/components/icons/duo";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* eslint-disable @next/next/no-img-element */

/** 제휴 연동 전 자리 화면 — 광고 유입 유저가 가짜 오퍼를 만나지 않도록 대체 행동을 안내 */
export function ComingSoon({ title, desc, icon = "sparkle", alt }: { title: string; desc: string; icon?: DuoName; alt: { label: string; href: string; sub: string }[] }) {
  const router = useRouter();
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-ink">
      <header className="fixed left-1/2 top-0 z-20 flex h-12 w-full max-w-[430px] -translate-x-1/2 items-center bg-bg px-6">
        <button type="button" onClick={() => router.back()} aria-label="뒤로" className="flex h-7 w-7 items-center justify-center"><img src="/brand/ic_left.svg" width={28} height={28} alt="" className="h-7 w-7" /></button>
        <h1 className="flex-1 text-center text-[18px] font-semibold">{title}</h1>
        <span className="w-7" />
      </header>
      <div className="flex flex-1 flex-col items-center px-6 pt-[92px]">
        <IconTile name={icon} tone="gray" size={120} icon={64} round />
        <span className="mt-4 rounded-full bg-myb-soft px-3 py-1 text-[12px] font-bold text-myb-dark">제휴사 연동 준비 중</span>
        <p className="mt-3 text-center text-[20px] font-extrabold">{title}은 곧 열려요</p>
        <p className="mt-2 text-center text-[13px] leading-[20px] text-ink-2">{desc}</p>
        <ul className="mt-8 flex w-full flex-col gap-3">
          {alt.map((a) => (
            <li key={a.href}>
              <Link href={a.href} className="myb-press flex h-[64px] items-center justify-between rounded-2xl bg-white px-5 shadow-[0_5px_16px_rgba(40,24,14,.08)]">
                <span><p className="text-[15px] font-bold">{a.label}</p><p className="mt-0.5 text-[12px] text-muted">{a.sub}</p></span>
                <span className="text-[13px] font-bold text-myb">바로가기 ›</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

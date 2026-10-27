"use client";

import { useRouter } from "next/navigation";

/* eslint-disable @next/next/no-img-element */

/** 게임 공통 헤더(48, 벤핏허브 톤). right 에 타이머·남은 횟수 */
export function GameHeader({ title, right, dark = false }: { title: string; right?: React.ReactNode; dark?: boolean }) {
  const router = useRouter();
  return (
    <header className={`fixed left-1/2 top-0 z-20 flex h-12 w-full max-w-[430px] -translate-x-1/2 items-center justify-between px-6 ${dark ? "bg-[#0f172a] text-white" : "bg-[#f8f9fc] text-[#191f28]"}`}>
      <button type="button" onClick={() => router.back()} aria-label="뒤로" className="flex h-7 w-7 items-center justify-center">
        <img src="/myb/shop/ic_left.png" width={28} height={28} alt="" className={`h-7 w-7 ${dark ? "brightness-0 invert" : ""}`} />
      </button>
      <h1 className="text-[18px] font-semibold">{title}</h1>
      <div className="flex w-20 justify-end text-[13px] font-semibold tabular-nums">{right}</div>
    </header>
  );
}

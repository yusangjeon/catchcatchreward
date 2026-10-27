"use client";

import Link from "next/link";
import { HeartIcon, PCoin } from "./icons";
/* eslint-disable @next/next/no-img-element */
import type { SetCard as SetCardT } from "@/lib/types";
import { fmt } from "@/hooks/useHome";

/** 홈 가로 스크롤용 카드 (150px 정사각) */
export function SetCard({ s, size = 145 }: { s: SetCardT; size?: number }) {
  return (
    <Link href={`/quiz/${s.id}`} className="block shrink-0" style={{ width: size }}>
      <div className="relative overflow-hidden rounded-xl bg-bg-2" style={{ width: size, height: size }}>
        <img src={s.imageUrl} alt="" className={`h-full w-full object-cover ${s.done ? "opacity-50" : ""}`} loading="lazy" />
        {s.todayOnly && (
          <div className="absolute inset-x-0 top-0 flex h-[26px] items-center justify-between bg-myb px-2 text-[11px] font-bold text-white">
            <span className="flex items-center gap-1"><img src="/myb/native/ic_today_clock.png" alt="" className="h-[15px] w-[15px]" /> 오늘만</span>
            <span className="tabular-nums">00:00:00</span>
          </div>
        )}
        {s.targeted && !s.todayOnly && <span className="absolute left-2 top-2 rounded-full bg-[#6d4cf2] px-2 py-0.5 text-[10px] font-bold text-white">내 취향 맞춤</span>}
        {s.done && <span className="absolute inset-x-0 bottom-0 bg-black/55 py-1 text-center text-[12px] font-bold text-white">참여 완료</span>}
        <HeartIcon size={22} className="absolute bottom-2 right-2 text-white drop-shadow" />
      </div>
      <p className="mt-2.5 line-clamp-2 text-[14px] font-medium leading-[1.4] text-ink">{s.title}</p>
      <p className="mt-1.5 flex items-center gap-1 text-[18px] font-extrabold text-ink"><PCoin size={18} />{fmt(s.rewardPoints)}</p>
      <p className="mt-0.5 text-[12px] text-muted">{fmt(s.participants)}명 참여</p>
    </Link>
  );
}

/** 퀴즈 탭·추천 영역용 2열 그리드 카드 */
export function SetGridCard({ s }: { s: SetCardT }) {
  return (
    <Link href={`/quiz/${s.id}`} className="block">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-bg-2">
        <img src={s.imageUrl} alt="" className={`h-full w-full object-cover ${s.done ? "opacity-50" : ""}`} loading="lazy" />
        {s.targeted && <span className="absolute left-2 top-2 rounded-full bg-[#6d4cf2] px-2 py-0.5 text-[10px] font-bold text-white">내 취향 맞춤</span>}
        {s.done && <span className="absolute inset-x-0 bottom-0 bg-black/55 py-1 text-center text-[12px] font-bold text-white">참여 완료</span>}
      </div>
      <p className="mt-2.5 line-clamp-2 text-[14px] font-medium leading-[1.4]">{s.title}</p>
      <p className="mt-1.5 flex items-center gap-1 text-[18px] font-extrabold"><PCoin size={18} />{fmt(s.rewardPoints)}</p>
      <p className="mt-0.5 text-[12px] text-muted">{fmt(s.capacity)}명 가능 · {fmt(s.participants)}명 참여</p>
    </Link>
  );
}

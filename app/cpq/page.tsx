"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/motion/Toast";
import { fmt } from "@/hooks/useHome";
import type { CpqPayload } from "@/lib/cpq/types";

/* eslint-disable @next/next/no-img-element */

/**
 * 무한적립 이벤트 — 마이비 reward-event.myb.im/rewards 오프라인 렌더 DOM 복제. 상태바 45 제외, 헤더 60.
 * 상단 흰 블록 142 · 보상받기 카드 70 · 필터 바 65(sticky) · 행 56 gap 30 · 하단 띠 18 #e9eef9
 */
export default function CpqPage() {
  const router = useRouter();
  const { show } = useToast();
  const [data, setData] = useState<CpqPayload | null>(null);
  const [filter, setFilter] = useState("전체");
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    fetch("/api/cpq", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => {});
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const list = (data?.list ?? []).filter((x) => filter === "전체" || x.type === filter || (filter === "퀴즈맞히기" && x.type === "퀴즈맞추기"));
  const canClaim = (data?.mission.currentCount ?? 0) >= (data?.mission.goalCount ?? 1);

  return (
    <div className="min-h-dvh bg-[#f8f9fc] text-[#191f28]">
      <header className="relative z-[99] flex h-[60px] items-center justify-center bg-white py-4">
        <button type="button" onClick={() => router.back()} aria-label="뒤로" className="flex h-7 w-[60px] items-center justify-center">
          <img src="/myb/cpq/ic_left.webp" width={28} height={28} alt="" className="h-7 w-7" />
        </button>
        <h1 className="flex h-[18px] flex-1 items-center justify-center text-[16px] leading-[18px]">무한적립 이벤트</h1>
        <span className="w-[50px]" />
      </header>

      <div className="flex flex-col items-center bg-white px-6 py-[10px]">
        <div className="flex h-9 w-full items-center justify-between">
          <p className="text-[22px] font-semibold leading-[25.3px]">{fmt(data?.totalAvailable ?? 0)}P 적립 가능</p>
          <div className="flex items-center gap-[5px] rounded-full border border-[#dbe6ff] px-[10px] py-[5px]">
            <img src="/myb/cpq/ic_bpoint.png" width={18} height={18} alt="" className="h-[18px] w-[18px]" />
            <span className="text-[14px] font-medium leading-6 text-[#427cff]">{fmt(data?.balance ?? 0)}</span>
          </div>
        </div>
        <div className="mt-4 flex w-full items-center justify-between gap-5 rounded-[14px] bg-[#f8f9fc] py-4 pl-5 pr-[18px]">
          <div className="relative flex items-center text-[14px] font-medium leading-[16.1px] text-[#33363f]">
            <p>
              이벤트 <span className="font-semibold text-[#427cff]">{data?.mission.goalCount ?? 1}개</span> 참여하면 <span className="font-semibold text-[#427cff]">추가P 지급!</span>
            </p>
            <img src="/myb/cpq/ic_help.png" width={20} height={20} alt="안내" className="h-5 w-5 opacity-60" />
          </div>
          <button
            type="button"
            disabled={!canClaim}
            onClick={() => show(`${fmt(data?.mission.maxRewardAmount ?? 100)}P를 받았어요!`)}
            className={`flex h-[38px] items-center gap-1 rounded-[10px] py-2 pl-[9px] pr-[10px] text-[13px] font-medium leading-[22px] text-white ${canClaim ? "bg-[#427cff]" : "bg-[#ced5e0]"}`}
          >
            <img src="/myb/cpq/ic_bpoint3.png" width={16} height={16} alt="" className="h-4 w-4" />보상받기
          </button>
        </div>
      </div>

      {/* 필터 바 sticky 65 */}
      <div className="sticky top-0 z-10 flex h-[65px] flex-col justify-center bg-white">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto whitespace-nowrap px-6 py-[14px]">
          {(data?.filters ?? ["전체", "퀴즈맞히기", "선착순퀴즈", "플레이스저장", "플레이스검색"]).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={`flex h-9 shrink-0 items-center rounded-[20px] px-[14px] py-[10px] text-[14px] font-medium leading-[16.1px] ${filter === f ? "bg-[#427cff] text-white" : "bg-[#f2f3f5] text-[#191f28]"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center bg-[#f8f9fc] p-5">
        <div className="flex w-full flex-col justify-center gap-[30px]">
          {data
            ? list.map((x) => (
                <button key={`${x.id}-${x.idx}`} type="button" onClick={() => show("오퍼월 미션 페이지로 이동해요 (연동 예정)", "info")} className="flex h-14 w-full items-center gap-3 text-left">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px] border border-[#dee2e9] bg-white">
                    <img src={x.icon} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <p className="truncate text-[15px] font-medium leading-[17.25px] text-[#191f28]">{x.title}</p>
                    <p className="truncate text-[12px] font-medium leading-[13.8px] text-[#8b94a0]">{x.type}</p>
                  </div>
                  <div className="flex h-[38px] shrink-0 items-center gap-[5px] rounded-[20px] bg-[#427cff] py-[10px] pl-[10px] pr-3">
                    <img src="/myb/cpq/ic_bpoint2.png" width={18} height={18} alt="" className="h-[18px] w-[18px]" />
                    <span className="min-w-[29px] text-right text-[14px] font-semibold leading-[16.1px] text-white">+{fmt(x.price)}</span>
                  </div>
                </button>
              ))
            : [0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="myb-skeleton h-14 rounded-[14px]" />)}
        </div>
      </div>
      <div className="h-[18px] bg-[#e9eef9]" />

      {/* 맨 위로 50 */}
      <button
        type="button"
        aria-label="맨 위로"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-[60px] right-4 z-20 flex h-[50px] w-[50px] items-center justify-center rounded-full border border-[#dee2e9] bg-white transition-opacity duration-300 ${showTop ? "opacity-100" : "pointer-events-none opacity-0"}`}
        style={{ boxShadow: "rgba(0, 20, 66, 0.1) 0px 0px 10px 0px" }}
      >
        <img src="/myb/cpq/ic_top.png" width={20} height={20} alt="" className="h-5 w-5" />
      </button>
    </div>
  );
}

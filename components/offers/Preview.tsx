"use client";

import { useToast } from "@/components/motion/Toast";

/** 제휴 오퍼(게임·설문·초간단)는 연동 전 목업. 참여 버튼은 안내 토스트만 */
export function usePreviewTap() {
  const { show } = useToast();
  return () => show("제휴사 연동 후 참여할 수 있어요. 지금은 미리보기예요", "info");
}

export function PreviewChip({ className }: { className?: string }) {
  return <span className={`inline-flex h-[22px] items-center rounded-full bg-[#f1f2f5] px-2.5 text-[11px] font-semibold text-[#6b7180] ${className ?? ""}`}>미리보기</span>;
}

/** 간단 헤더(48) — 뒤로 + 제목 + 우측 슬롯 */
export function OfferHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between bg-[var(--color-bg)]/90 px-5 backdrop-blur">
      <button type="button" onClick={() => history.back()} aria-label="뒤로" className="flex h-7 w-7 items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/ic_left.svg" width={28} height={28} alt="" className="h-7 w-7" />
      </button>
      <h1 className="text-[17px] font-bold text-ink">{title}</h1>
      <div className="flex w-20 justify-end">{right}</div>
    </header>
  );
}

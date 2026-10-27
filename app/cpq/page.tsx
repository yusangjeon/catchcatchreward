"use client";

import { useEffect, useMemo, useState } from "react";
import { DuoIcon, IconTile } from "@/components/icons/duo";
import { PCoin } from "@/components/icons";
import { OfferHeader, PreviewChip, usePreviewTap } from "@/components/offers/Preview";
import { fmt } from "@/hooks/useHome";
import type { CpqPayload } from "@/lib/cpq/types";

/* eslint-disable @next/next/no-img-element */

/** 초간단 적립 — 퀴즈·플레이스 저장·검색·팔로우 같은 1분 미션 목록(연동 전 목업). 상단 적립 가능 카드 → 필터 칩 → 리스트 */
export default function CpqPage() {
  const [data, setData] = useState<CpqPayload | null>(null);
  const [filter, setFilter] = useState("전체");
  const tap = usePreviewTap();
  useEffect(() => { fetch("/api/cpq", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => {}); }, []);
  const filters = useMemo(() => Array.from(new Set(["전체", ...(data?.filters ?? [])])), [data]);
  const list = useMemo(() => (data?.list ?? []).filter((x) => filter === "전체" || x.type === filter), [data, filter]);

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-10">
      <OfferHeader title="초간단 적립" right={<PreviewChip />} />

      <section className="mx-5 mt-2 rounded-[22px] p-5 text-white" style={{ background: "linear-gradient(135deg,#2f6fed 0%,#1f4fc8 100%)", boxShadow: "0 10px 26px rgba(47,111,237,.25)" }}>
        <p className="text-[13px] font-semibold text-white/80">오늘 참여하면</p>
        <p className="mt-1 flex items-center gap-1.5 text-[26px] font-bold leading-[32px]"><PCoin size={26} />{fmt(data?.totalAvailable ?? 0)} <span className="text-[16px] font-semibold text-white/80">적립 가능</span></p>
        <div className="mt-4 flex items-center justify-between rounded-[14px] bg-white/15 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <DuoIcon name="bolt" size={22} className="text-[#ffd45c]" />
            <div><p className="text-[13px] font-bold">오늘의 보너스 미션</p><p className="text-[11px] text-white/75">{data?.mission.goalCount ?? 1}개 참여하면 +{fmt(data?.mission.maxRewardAmount ?? 100)}P</p></div>
          </div>
          <span className="text-[14px] font-bold tabular-nums">{data?.mission.currentCount ?? 0}/{data?.mission.goalCount ?? 1}</span>
        </div>
      </section>

      <div className="no-scrollbar sticky top-12 z-10 mt-5 flex gap-2 overflow-x-auto bg-[var(--color-bg)]/95 px-5 py-2 backdrop-blur">
        {filters.map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={`h-[34px] shrink-0 rounded-full px-3.5 text-[13px] font-semibold transition ${filter === f ? "bg-ink text-white" : "bg-white text-ink-2 shadow-[0_1px_4px_rgba(0,0,0,.06)]"}`}>{f}</button>
        ))}
      </div>

      <ul className="mt-1 flex flex-col gap-2.5 px-5">
        {list.map((x) => (
          <li key={x.id} className="flex items-center gap-3 rounded-[18px] bg-white p-3.5" style={{ boxShadow: "0 3px 12px rgba(40,24,14,.05)" }}>
            <img src={x.icon} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-[12px] bg-bg-2 object-cover" />
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded-full bg-bg-2 px-2 py-0.5 text-[10px] font-bold text-ink-2">{x.type}</span>
              <p className="mt-1 truncate text-[14px] font-bold text-ink">{x.title}</p>
              <p className="truncate text-[11px] text-muted">{x.provider}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <span className="flex items-center gap-1 text-[14px] font-bold text-myb-dark"><PCoin size={14} />+{fmt(x.price)}</span>
              <button type="button" onClick={tap} className="myb-press h-8 rounded-full bg-myb px-3.5 text-[12px] font-bold text-white">참여</button>
            </div>
          </li>
        ))}
        {!data && [0, 1, 2, 3, 4].map((i) => <li key={i} className="h-[78px] animate-pulse rounded-[18px] bg-white" />)}
        {data && list.length === 0 && (
          <li className="flex flex-col items-center py-14 text-center"><IconTile name="bolt" tone="gray" size={64} /><p className="mt-3 text-[14px] text-muted">이 종류의 미션이 아직 없어요</p></li>
        )}
      </ul>

      <section className="mx-5 mt-6 rounded-[16px] bg-[#f1f2f5] p-4 text-[12px] leading-[18px] text-ink-2">
        <p className="font-bold text-ink">알아두세요</p>
        <ul className="mt-1.5 list-disc pl-4">
          <li>참여 방법을 끝까지 따라야 적립돼요. 보통 1분이면 끝나요.</li>
          <li>같은 미션은 한 번만 참여할 수 있어요.</li>
          <li>적립은 참여 확인 후 최대 24시간 안에 들어와요.</li>
        </ul>
      </section>
    </div>
  );
}

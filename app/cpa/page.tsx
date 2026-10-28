"use client";

import { useEffect, useState } from "react";
import { DuoIcon, FlatIcon } from "@/components/icons/duo";
import { PCoin } from "@/components/icons";
import { OfferHeader, PreviewChip, usePreviewTap } from "@/components/offers/Preview";
import { fmt } from "@/hooks/useHome";
import { KIND_ICON, KIND_LABEL, type CpaItem } from "@/lib/cpa/seed";

interface Payload { items: CpaItem[]; hot: CpaItem[]; mission: { currentPoint: number; goalPoint: number; rewardPoint: number }; totalAvailable: number }
const FILTERS: { key: "all" | CpaItem["kind"]; label: string }[] = [{ key: "all", label: "전체" }, { key: "signup", label: "가입" }, { key: "follow", label: "팔로우" }, { key: "subscribe", label: "구독" }, { key: "install", label: "설치" }, { key: "visit", label: "방문" }];

/** 고보상·간편 참여 — 마이비 "고보상/간편적립 CPA"(native-easy) 구조. 히어로(오늘 받을 수 있는 P + 누적 미션) → HOT 가로 카드 → 필터 → 리스트. 제휴 연동 전 미리보기 */
export default function CpaPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [f, setF] = useState<(typeof FILTERS)[number]["key"]>("all");
  const tap = usePreviewTap();
  useEffect(() => { fetch("/api/cpa", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => {}); }, []);
  const list = (data?.items ?? []).filter((i) => f === "all" || i.kind === f);
  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-12">
      <OfferHeader title="고보상 참여" right={<PreviewChip />} />
      <section className="relative mx-5 mt-2 overflow-hidden rounded-[22px] p-5 text-white" style={{ background: "linear-gradient(135deg,#0f9b6a 0%,#17b57e 60%,#3fd39a 100%)", boxShadow: "0 10px 26px rgba(15,155,106,.28)" }}>
        <DuoIcon name="megaphone" size={120} className="pointer-events-none absolute -right-5 -top-6 text-white/12" />
        <p className="text-[13px] font-semibold text-white/85">오늘 참여하면</p>
        <p className="mt-1 flex items-center gap-1.5 text-[30px] font-bold leading-none"><PCoin size={28} />{fmt(data?.totalAvailable ?? 0)} <span className="text-[14px] font-semibold text-white/85">받을 수 있어요</span></p>
        <div className="mt-4 rounded-[14px] bg-white/15 p-3">
          <div className="flex items-center justify-between text-[12px] font-bold"><span className="flex items-center gap-1"><DuoIcon name="bolt" size={13} />누적 참여 미션</span><span>{fmt(data?.mission.currentPoint ?? 0)} / {fmt(data?.mission.goalPoint ?? 1000)}P → +{data?.mission.rewardPoint ?? 100}P</span></div>
          <div className="mt-2 h-[6px] overflow-hidden rounded-full bg-white/25"><i className="block h-full rounded-full bg-white" style={{ width: `${Math.min(100, ((data?.mission.currentPoint ?? 0) / (data?.mission.goalPoint ?? 1000)) * 100)}%` }} /></div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="flex items-center gap-1.5 px-5 text-[18px] font-bold text-ink">지금 가장 보상 큰 참여 <DuoIcon name="flame" size={18} className="text-myb" /></h2>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-5">
          {(data?.hot ?? []).map((i) => (
            <button key={i.id} type="button" onClick={tap} className="myb-press flex w-[150px] shrink-0 flex-col rounded-[18px] bg-white p-4 text-left" style={{ boxShadow: "0 5px 16px rgba(40,24,14,.07)" }}>
              <FlatIcon file={KIND_ICON[i.kind]} size={44} />
              <span className="mt-3 truncate text-[14px] font-bold text-ink">{i.title}</span>
              <span className="mt-0.5 truncate text-[11px] text-ink-2">{i.action}</span>
              <span className="mt-2 flex items-center gap-1 text-[15px] font-bold text-myb-dark"><PCoin size={15} />{fmt(i.reward)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 px-5">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {FILTERS.map((x) => <button key={x.key} type="button" onClick={() => setF(x.key)} className={`h-9 shrink-0 rounded-full px-4 text-[13px] font-bold ${f === x.key ? "bg-ink text-white" : "bg-white text-ink-2 shadow-[0_2px_8px_rgba(40,24,14,.06)]"}`}>{x.label}</button>)}
        </div>
        <ul className="mt-4 flex flex-col gap-2.5">
          {list.map((i) => (
            <li key={i.id} className="flex items-center gap-3 rounded-[18px] bg-white p-4" style={{ boxShadow: "0 4px 14px rgba(40,24,14,.06)" }}>
              <FlatIcon file={KIND_ICON[i.kind]} size={44} />
              <span className="min-w-0 flex-1">
                <span className="inline-block rounded-full bg-bg-2 px-2 py-0.5 text-[10px] font-bold text-ink-2">{KIND_LABEL[i.kind]}</span>
                <span className="mt-1 block truncate text-[14px] font-bold text-ink">{i.title}</span>
                <span className="block truncate text-[11px] text-ink-2">{i.action}</span>
              </span>
              <span className="flex flex-col items-end gap-1.5">
                <span className="flex items-center gap-1 text-[15px] font-bold text-myb-dark"><PCoin size={15} />{fmt(i.reward)}</span>
                <button type="button" onClick={tap} className="myb-press h-8 rounded-full bg-myb px-3 text-[12px] font-bold text-white">참여</button>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-[11px] text-muted">참여 완료 후 보상 지급까지 최대 1시간 걸릴 수 있어요 · 제휴사 연동 전 미리보기</p>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { DuoIcon, IconTile } from "@/components/icons/duo";
import { PCoin } from "@/components/icons";
import { OfferHeader, PreviewChip, usePreviewTap } from "@/components/offers/Preview";
import { fmt } from "@/hooks/useHome";
import type { SurveyItem, SurveyPayload } from "@/lib/survey/types";

/* eslint-disable @next/next/no-img-element */

const strip = (t: string) => t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "").trim();
const TONE: Record<string, string> = { 추천해요: "bg-amber-soft text-amber", "보상+20%": "bg-violet-soft text-violet", 보상UP: "bg-violet-soft text-violet", New: "bg-pink-soft text-pink", 필수설문: "bg-blue-soft text-blue", 간단해요: "bg-green-soft text-green", 할만해요: "bg-green-soft text-green" };
function Labels({ item, max = 2 }: { item: SurveyItem; max?: number }) {
  return (
    <span className="flex flex-wrap gap-1">
      {item.labels.slice(0, max).map((l, i) => { const t = strip(l.text); return <span key={i} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${TONE[t] ?? "bg-bg-2 text-ink-2"}`}>{t}</span>; })}
    </span>
  );
}
function Row({ item, onTap }: { item: SurveyItem; onTap: () => void }) {
  return (
    <button type="button" onClick={onTap} className="myb-press flex w-full items-center gap-3 rounded-[18px] bg-white p-3.5 text-left" style={{ boxShadow: "0 3px 12px rgba(40,24,14,.05)" }}>
      <IconTile name="doc" tone="violet" size={44} />
      <span className="min-w-0 flex-1">
        <Labels item={item} />
        <span className="mt-1 block truncate text-[14px] font-bold text-ink">{item.title}</span>
        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted"><DuoIcon name="clock" size={11} /> 약 {Math.max(1, item.loi)}분</span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-[15px] font-bold text-myb-dark"><PCoin size={16} />{fmt(item.reward)}</span>
    </button>
  );
}

/** 설문 보상 — 연동 전 목업. 히어로(바이올렛) → 기초 설문 2장 → 한정 보상 가로 카드 → 가볍게 2열 → 전체 리스트 */
export default function SurveyPage() {
  const [data, setData] = useState<SurveyPayload | null>(null);
  const tap = usePreviewTap();
  useEffect(() => { fetch("/api/survey", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => {}); }, []);

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-10">
      <OfferHeader title="설문 보상" right={<PreviewChip />} />

      <section className="mx-5 mt-2 flex items-center justify-between overflow-hidden rounded-[22px] px-5 py-5 text-white" style={{ background: "linear-gradient(135deg,#8f7bff 0%,#6b55e6 100%)", boxShadow: "0 10px 26px rgba(107,85,230,.28)" }}>
        <div>
          <p className="text-[13px] font-semibold text-white/80">오늘 설문 참여하면</p>
          <p className="mt-1 flex items-center gap-1.5 text-[26px] font-bold leading-[32px]"><PCoin size={26} />{fmt(data?.totalAvailable ?? 0)}</p>
          <p className="mt-1 text-[12px] text-white/75">생각을 말하면 포인트가 쌓여요</p>
        </div>
        <img src="/mock/hero_survey.webp" alt="" width={100} height={100} className="h-[100px] w-[100px] rounded-[18px] object-cover" />
      </section>

      {/* 기초 설문 */}
      <section className="mt-7 px-5">
        <h2 className="text-[18px] font-bold text-ink">먼저 알려주세요 <span className="ml-1 text-[12px] font-medium text-muted">맞춤 설문의 기준이 돼요</span></h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(data?.profiling ?? []).map((p) => (
            <button key={p.id} type="button" onClick={tap} className="myb-press rounded-[18px] bg-white p-4 text-left" style={{ boxShadow: "0 3px 12px rgba(40,24,14,.05)" }}>
              <IconTile name="people" tone="blue" size={40} />
              <p className="mt-3 line-clamp-2 text-[13px] font-bold leading-[18px] text-ink">{p.title}</p>
              <p className="mt-2 flex items-center gap-1 text-[14px] font-bold text-myb-dark"><PCoin size={14} />{fmt(p.reward)}</p>
            </button>
          ))}
        </div>
      </section>

      {/* 한정 보상 */}
      <section className="mt-7">
        <h2 className="px-5 text-[18px] font-bold text-ink">기간 한정 보상 UP</h2>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-5">
          {(data?.featured ?? []).map((f) => (
            <button key={f.id} type="button" onClick={tap} className="myb-press w-[240px] shrink-0 rounded-[20px] p-4 text-left text-white" style={{ background: "linear-gradient(160deg,#ff8a5c 0%,#ff5a2d 100%)" }}>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">보상 +20%</span>
              <p className="mt-3 line-clamp-2 text-[14px] font-bold leading-[19px]">{f.title}</p>
              <div className="mt-4 flex items-end justify-between">
                <span className="flex items-center gap-1 text-[11px] text-white/80"><DuoIcon name="clock" size={11} /> 약 {f.loi}분</span>
                <span className="flex items-center gap-1 text-[18px] font-bold"><PCoin size={18} />{fmt(f.reward)}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 가볍게 */}
      <section className="mt-7 px-5">
        <h2 className="text-[18px] font-bold text-ink">1분이면 끝나요</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(data?.light ?? []).slice(0, 4).map((l) => (
            <button key={l.id} type="button" onClick={tap} className="myb-press rounded-[18px] bg-white p-4 text-left" style={{ boxShadow: "0 3px 12px rgba(40,24,14,.05)" }}>
              <Labels item={l} max={1} />
              <p className="mt-2 line-clamp-2 text-[13px] font-bold leading-[18px] text-ink">{l.title}</p>
              <p className="mt-2 flex items-center gap-1 text-[14px] font-bold text-myb-dark"><PCoin size={14} />{fmt(l.reward)}</p>
            </button>
          ))}
        </div>
      </section>

      {/* 전체 */}
      <section className="mt-7 px-5">
        <h2 className="text-[18px] font-bold text-ink">전체 설문 <span className="ml-1 text-[12px] font-medium text-muted">{data ? `${data.all.length}개` : ""}</span></h2>
        <ul className="mt-3 flex flex-col gap-2.5">
          {(data?.all ?? []).map((s) => <li key={s.id}><Row item={s} onTap={tap} /></li>)}
          {!data && [0, 1, 2, 3].map((i) => <li key={i} className="h-[78px] animate-pulse rounded-[18px] bg-white" />)}
        </ul>
      </section>
    </div>
  );
}

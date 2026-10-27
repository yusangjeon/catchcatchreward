"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DuoIcon, IconTile } from "@/components/icons/duo";
import { PCoin } from "@/components/icons";
import { OfferHeader, PreviewChip, usePreviewTap } from "@/components/offers/Preview";
import { fmt } from "@/hooks/useHome";
import type { GameDetailPayload } from "@/lib/game/types";

/* eslint-disable @next/next/no-img-element */

/** 게임 상세 — 아이콘·보상 요약 → 참여 순서 3단계 → 안내 → 하단 고정 CTA(연동 전 목업) */
export default function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<GameDetailPayload | null>(null);
  const [notFound, setNotFound] = useState(false);
  const tap = usePreviewTap();
  useEffect(() => {
    fetch(`/api/game/${id}`, { cache: "no-store" }).then(async (r) => { if (!r.ok) { setNotFound(true); return; } setData(await r.json()); }).catch(() => setNotFound(true));
  }, [id]);

  if (notFound) return <div className="min-h-dvh bg-[var(--color-bg)]"><OfferHeader title="게임 상세" /><p className="mt-20 text-center text-[14px] text-muted">게임을 찾을 수 없어요.</p></div>;
  const g = data?.game;
  const steps = [
    { n: 1, title: "게임 설치", sub: "스토어에서 설치하고 실행해요" },
    { n: 2, title: g?.missionText ?? "미션 달성", sub: "조건 달성 시 자동으로 확인돼요" },
    { n: 3, title: "보상 받기", sub: `미션 ${fmt(g?.missionPoint ?? 0)}P + 보너스 ${fmt(g?.bonusPoint ?? 0)}P` },
  ];
  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-28">
      <OfferHeader title="게임 상세" right={<PreviewChip />} />
      <section className="mx-5 mt-2 rounded-[22px] bg-white p-5 text-center" style={{ boxShadow: "0 5px 16px rgba(40,24,14,.07)" }}>
        {g ? <img src={g.icon} alt="" width={88} height={88} className="mx-auto h-[88px] w-[88px] rounded-[22px] object-cover" /> : <div className="mx-auto h-[88px] w-[88px] animate-pulse rounded-[22px] bg-bg-2" />}
        <p className="mt-3 text-[18px] font-bold text-ink">{g?.title ?? "…"}</p>
        <p className="mt-1 text-[13px] text-ink-2">{g?.missionText}</p>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[26px] font-bold text-myb-dark"><PCoin size={26} />{fmt((g?.missionPoint ?? 0) + (g?.bonusPoint ?? 0))}</p>
        <div className="mt-3 flex justify-center gap-1.5">
          <span className="rounded-full bg-amber-soft px-2.5 py-1 text-[11px] font-bold text-amber">첫 미션 +{fmt(g?.bonusPoint ?? 1000)} 보너스</span>
          <span className="flex items-center gap-1 rounded-full bg-bg-2 px-2.5 py-1 text-[11px] font-semibold text-ink-2"><DuoIcon name="clock" size={12} /> {data?.daysLeft ?? "—"}일 남음</span>
        </div>
      </section>

      <section className="mx-5 mt-5 rounded-[20px] bg-white p-4" style={{ boxShadow: "0 5px 16px rgba(40,24,14,.07)" }}>
        <p className="text-[15px] font-bold text-ink">참여 순서</p>
        <ol className="mt-3 flex flex-col gap-3">
          {steps.map((s) => (
            <li key={s.n} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-myb-soft text-[13px] font-bold text-myb-dark">{s.n}</span>
              <div className="min-w-0"><p className="text-[14px] font-bold text-ink">{s.title}</p><p className="mt-0.5 text-[12px] text-ink-2">{s.sub}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-5 mt-5 flex items-center gap-3 rounded-[20px] bg-white p-4" style={{ boxShadow: "0 5px 16px rgba(40,24,14,.07)" }}>
        <IconTile name="ticket" tone="violet" size={44} />
        <div className="min-w-0 flex-1"><p className="text-[14px] font-bold text-ink">프리패스</p><p className="text-[12px] text-ink-2">첫 미션 완료하면 러쉬 게임 미션도 바로 달성돼요</p></div>
      </section>

      {data && (
        <section className="mx-5 mt-5 rounded-[16px] bg-[#f1f2f5] p-4 text-[12px] leading-[18px] text-ink-2">
          <p className="font-bold text-ink">확인해 주세요</p>
          <ul className="mt-1.5 list-disc pl-4">{data.notices.slice(0, 6).map((n, i) => <li key={i}>{n}</li>)}</ul>
        </section>
      )}

      <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 bg-white/90 px-5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <button type="button" onClick={tap} className="myb-press flex h-[54px] w-full items-center justify-center gap-1.5 rounded-[14px] bg-myb text-[16px] font-bold text-white shadow-[0_6px_18px_rgba(255,90,45,.35)]">
          설치하고 <PCoin size={18} />{fmt((g?.missionPoint ?? 0) + (g?.bonusPoint ?? 0))} 받기
        </button>
      </div>
    </div>
  );
}

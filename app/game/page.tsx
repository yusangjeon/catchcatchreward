"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DuoIcon, IconTile } from "@/components/icons/duo";
import { PCoin, ChevronRight } from "@/components/icons";
import { OfferHeader, PreviewChip, usePreviewTap } from "@/components/offers/Preview";
import { Countdown } from "@/components/motion/Countdown";
import { fmt } from "@/hooks/useHome";
import type { GamePayload } from "@/lib/game/types";

/* eslint-disable @next/next/no-img-element */

/**
 * 게임하고 적립 — 제휴(오퍼월) 연동 전 목업. 마이비 브릿지(다크)와 다르게 라이트 카드 리스트로 구성.
 * 히어로(오렌지 그라디언트 + 일러스트) → AI 추천 1장 → 게임 리스트 → 게임왕 도전 → 안내
 */
export default function GamePage() {
  const [data, setData] = useState<GamePayload | null>(null);
  const tap = usePreviewTap();
  useEffect(() => { fetch("/api/game", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => {}); }, []);

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-10">
      <OfferHeader title="게임하고 적립" right={<PreviewChip />} />

      {/* 히어로 */}
      <section className="mx-5 mt-2 overflow-hidden rounded-[22px] text-white" style={{ background: "linear-gradient(135deg,#ff7a45 0%,#ff5a2d 55%,#e0441a 100%)", boxShadow: "0 10px 26px rgba(255,90,45,.28)" }}>
        <div className="flex items-center justify-between px-5 pt-5">
          <div>
            <p className="text-[13px] font-semibold text-white/80">새 게임 설치하고 첫 미션 완료하면</p>
            <p className="mt-1 flex items-center gap-1.5 text-[24px] font-bold leading-[30px]"><PCoin size={24} />+{fmt(data?.hero.bonusPoint ?? 1000)} 보너스</p>
            <p className="mt-1 text-[12px] text-white/75">미션 보상에 추가로 드려요</p>
          </div>
          <img src="/mock/hero_game.webp" alt="" width={104} height={104} className="h-[104px] w-[104px] rounded-[18px] object-cover" />
        </div>
        <div className="mt-4 bg-white/12 px-5 py-2.5 text-[12px] font-semibold text-white/90">
          {data ? <span className="flex items-center gap-1.5"><DuoIcon name="clock" size={14} /> 이번 주 보너스 종료까지 <Countdown endsAt={data.rushEndsAt} compact /></span> : "…"}
        </div>
      </section>

      {/* AI 추천 */}
      {data && (
        <section className="mx-5 mt-5 rounded-[20px] bg-white p-4" style={{ boxShadow: "0 5px 16px rgba(40,24,14,.07)" }}>
          <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-violet-soft px-2.5 text-[11px] font-bold text-violet"><DuoIcon name="sparkle" size={12} /> 취향 맞춤 추천</span>
          <div className="mt-3 flex items-center gap-3.5">
            <img src={data.hero.icon} alt="" width={64} height={64} className="h-16 w-16 shrink-0 rounded-[16px] object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold text-ink">{data.hero.title}</p>
              <p className="mt-0.5 truncate text-[13px] text-ink-2">{data.hero.missionText}</p>
              <p className="mt-1 flex items-center gap-1 text-[14px] font-bold text-myb-dark"><PCoin size={16} />{fmt(data.hero.missionPoint + data.hero.bonusPoint)} <span className="text-[11px] font-semibold text-muted">(미션 {fmt(data.hero.missionPoint)} + 보너스 {fmt(data.hero.bonusPoint)})</span></p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href={`/game/${data.hero.id}`} className="myb-press flex h-11 items-center justify-center rounded-xl bg-bg-2 text-[14px] font-bold text-ink">자세히</Link>
            <button type="button" onClick={tap} className="myb-press flex h-11 items-center justify-center rounded-xl bg-myb text-[14px] font-bold text-white">설치하고 시작</button>
          </div>
        </section>
      )}

      {/* 게임 리스트 */}
      <section className="mt-7 px-5">
        <div className="flex items-end justify-between">
          <h2 className="text-[18px] font-bold text-ink">지금 참여할 수 있는 게임</h2>
          <span className="text-[12px] font-medium text-muted">{data ? `${data.games.length + 1}개` : ""}</span>
        </div>
        <ul className="mt-3 flex flex-col gap-2.5">
          {(data ? [data.hero, ...data.games] : []).map((g) => (
            <li key={g.id}>
              <Link href={`/game/${g.id}`} className="myb-press flex items-center gap-3 rounded-[18px] bg-white p-3.5" style={{ boxShadow: "0 3px 12px rgba(40,24,14,.05)" }}>
                <img src={g.icon} alt="" width={56} height={56} className="h-14 w-14 shrink-0 rounded-[14px] object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold text-ink">{g.title}</p>
                  <p className="mt-0.5 truncate text-[12px] text-ink-2">{g.missionText}</p>
                  <p className="mt-1 flex items-center gap-1 text-[13px] font-bold text-myb-dark"><PCoin size={14} />{fmt(g.missionPoint)} <span className="rounded-full bg-amber-soft px-1.5 py-0.5 text-[10px] font-bold text-amber">+{fmt(g.bonusPoint)} 보너스</span></p>
                </div>
                <ChevronRight className="shrink-0 text-[#b0b8c1]" />
              </Link>
            </li>
          ))}
          {!data && [0, 1, 2, 3].map((i) => <li key={i} className="h-[84px] animate-pulse rounded-[18px] bg-white" />)}
        </ul>
      </section>

      {/* 게임왕 */}
      {data && (
        <section className="mx-5 mt-7 rounded-[20px] bg-white p-4" style={{ boxShadow: "0 5px 16px rgba(40,24,14,.07)" }}>
          <div className="flex items-center gap-3">
            <IconTile name="trophy" tone="amber" size={44} />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-ink">게임왕 도전</p>
              <p className="text-[12px] text-ink-2">서로 다른 게임 {data.gameKing.goal}개 첫 미션 완료하면 최대 {fmt(data.gameKing.maxReward)}P</p>
            </div>
            <span className="text-[14px] font-bold tabular-nums text-myb-dark">{data.gameKing.progress}/{data.gameKing.goal}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-2">
            <div className="myb-progress h-full rounded-full bg-myb" style={{ width: `${(data.gameKing.progress / data.gameKing.goal) * 100}%` }} />
          </div>
        </section>
      )}

      <section className="mx-5 mt-6 rounded-[16px] bg-[#f1f2f5] p-4 text-[12px] leading-[18px] text-ink-2">
        <p className="font-bold text-ink">알아두세요</p>
        <ul className="mt-1.5 list-disc pl-4">
          <li>보상은 게임 설치 후 미션 조건을 달성하면 자동으로 적립돼요.</li>
          <li>한 계정당 게임별 1회 참여할 수 있어요.</li>
          <li>예산 소진 시 조기 종료될 수 있어요.</li>
        </ul>
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PCoin } from "@/components/icons";
import { Countdown } from "@/components/motion/Countdown";
import { NumberFlow } from "@/components/motion/NumberFlow";
import { useToast } from "@/components/motion/Toast";
import { fmt } from "@/hooks/useHome";
import type { RushMissionView, RushPayload } from "@/lib/rush/types";

/* eslint-disable @next/next/no-img-element */

/**
 * 비포인트 러쉬 — 마이비 bpointrush(주간 스탬프 미션 8개, 7/8개 보상) 구조.
 * 톤: 벤핏허브(헤더 48, bg #f8f9fc, 카드 r20, #427cff) + 러쉬 보라 그라디언트(홈 띠와 동일 계열).
 */
export default function RushPage() {
  const router = useRouter();
  const { show } = useToast();
  const [data, setData] = useState<RushPayload | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => fetch("/api/rush", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => {}), []);
  useEffect(() => {
    void load();
  }, [load]);

  async function claim(key: string) {
    if (busy) return;
    setBusy(key);
    try {
      const res = await fetch("/api/rush/claim", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ missionKey: key }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message ?? "보상을 받을 수 없어요");
      show(j.stampAdded ? `${fmt(j.points)}P와 스탬프 1개를 받았어요` : `${fmt(j.points)}P를 받았어요!`);
      await load();
    } catch (e) {
      show(e instanceof Error ? e.message : "보상을 받을 수 없어요", "info");
    } finally {
      setBusy(null);
    }
  }

  async function go(m: RushMissionView) {
    if (m.action === "attendance") {
      const res = await fetch("/api/attendance", { method: "POST" });
      const j = await res.json();
      show(j.already ? "오늘은 이미 출석했어요" : `출석 완료! ${fmt(j.points)}P와 스탬프 1개를 받았어요`, j.already ? "info" : undefined);
      await load();
      return;
    }
    router.push(m.href);
  }

  const stamps = data?.stamps ?? 0;
  const total = data?.total ?? 8;

  return (
    <div className="min-h-dvh bg-[#f8f9fc] pb-10 text-[#191f28]">
      <header className="fixed left-1/2 top-0 z-20 flex h-12 w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-[#6d4cf2] px-6">
        <button type="button" onClick={() => router.back()} aria-label="뒤로" className="flex h-7 w-7 items-center justify-center">
          <img src="/myb/shop/ic_left.png" width={28} height={28} alt="" className="h-7 w-7 brightness-0 invert" />
        </button>
        <h1 className="text-[18px] font-semibold text-white">비포인트 러쉬</h1>
        <Link href="/wallet" className="flex items-center gap-[6px]">
          <PCoin size={18} />
          <span className="text-[18px] font-semibold leading-[18px] text-white">{data ? <NumberFlow value={data.wallet.balance} /> : "—"}</span>
        </Link>
      </header>

      {/* 히어로 */}
      <section className="bg-gradient-to-b from-[#6d4cf2] via-[#8a5cf5] to-[#b56cf3] pt-12 text-white">
        <div className="flex items-center justify-between px-6 pb-2 pt-4">
          <div>
            <span className="inline-flex h-6 items-center rounded-full bg-white/20 px-2.5 text-[12px] font-bold">{data ? `${data.weekNo}주차` : "—"}</span>
            <h2 className="mt-2 text-[22px] font-extrabold leading-[30px]">미션 완료하고<br />스탬프 모으면 최대 <b className="text-[#ffe76a]">500P</b></h2>
            <p className="mt-1 text-[13px] text-white/80">매주 일요일 0시에 새로 시작해요</p>
          </div>
          <img src="/myb/bh/img_bpointrush_visual.webp" width={120} height={120} alt="" className="h-[120px] w-[120px] shrink-0" draggable={false} />
        </div>
        {data && <Countdown endsAt={data.endsAt} />}
      </section>

      <div className="flex flex-col gap-5 px-6 pt-5">
        {/* 스탬프 보드 */}
        <section className="rounded-[20px] bg-white p-5" style={{ boxShadow: "0 5px 16px 0 rgba(0, 43, 141, 0.1)" }}>
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[16px] font-semibold">
              <img src="/myb/bh/img_stamp.webp" width={24} height={24} alt="" className="h-6 w-6" />
              이번 주 스탬프
            </h3>
            <span className="text-[14px] font-medium text-[#5c6573]">
              <b className="text-[18px] font-bold text-[#6d4cf2]">{stamps}</b> / {total}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {Array.from({ length: total }).map((_, i) => {
              const filled = i < stamps;
              const reward = data?.stampRewards.find((r) => r.stamps === i + 1);
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className={`flex h-[58px] w-[58px] items-center justify-center rounded-full border ${filled ? "border-[#ffb3d9] bg-[#fff0f7]" : "border-dashed border-[#dee2e9] bg-[#f8f9fc]"}`}>
                    {filled ? <img src="/myb/bh/img_stamp.webp" width={34} height={34} alt="" className="myb-pop-in h-[34px] w-[34px]" /> : <span className="text-[13px] font-medium text-[#b0b8c1]">{i + 1}</span>}
                  </span>
                  {reward && (
                    reward.claimed ? (
                      <span className="text-[11px] font-bold text-[#8b94a0]">✓ {fmt(reward.points)}P</span>
                    ) : reward.reached ? (
                      <button type="button" onClick={() => void claim(reward.key)} disabled={busy !== null} className="myb-press rounded-full bg-[#ff3e9a] px-2 py-0.5 text-[11px] font-bold text-white">
                        {fmt(reward.points)}P 받기
                      </button>
                    ) : (
                      <span className="rounded-full bg-[#fff0f7] px-2 py-0.5 text-[11px] font-bold text-[#ff3e9a]">🎁 {fmt(reward.points)}P</span>
                    )
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-[13px] leading-[18px] text-[#5c6573]">미션 보상을 받을 때마다 스탬프 1개(룰렛 스탬프도 +1). 7개는 300P, 8개 전부 모으면 500P를 더 드려요.</p>
        </section>

        {/* 미션 목록 */}
        <section>
          <h3 className="flex items-center justify-between text-[16px] font-semibold">
            스탬프 미션
            {data && data.claimable > 0 && <span className="rounded-full bg-[#ff3939] px-2 py-0.5 text-[11px] font-bold text-white">받을 보상 {data.claimable}</span>}
          </h3>
          <ul className="mt-3 flex flex-col gap-3">
            {(data?.missions ?? []).map((m) => {
              const pct = Math.round((m.current / m.value) * 100);
              return (
                <li key={m.key} className="flex items-center gap-3 rounded-[16px] bg-white px-4 py-[14px]" style={{ boxShadow: "0 2px 10px 0 rgba(0, 43, 141, 0.06)" }}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f3f0ff]">
                    <img src={m.icon} width={30} height={30} alt="" className="h-[30px] w-[30px] object-contain" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold">{m.stepTitle}</p>
                    <p className="mt-0.5 text-[12px] text-[#8b94a0]">{m.hint} · <b className="font-semibold text-[#6d4cf2]">+{m.reward}P</b></p>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#eef0f4]">
                      <div className="myb-progress h-full rounded-full bg-[#6d4cf2]" style={{ width: `${m.claimed ? 100 : pct}%` }} />
                    </div>
                  </div>
                  {m.claimed ? (
                    <span className="flex h-8 w-[72px] shrink-0 items-center justify-center rounded-lg bg-[#f2f3f5] text-[13px] font-bold text-[#8b94a0]">완료</span>
                  ) : m.completed ? (
                    <button type="button" disabled={busy !== null} onClick={() => void claim(m.key)} className="myb-press flex h-8 w-[72px] shrink-0 items-center justify-center rounded-lg bg-[#427cff] text-[13px] font-bold text-white">
                      보상받기
                    </button>
                  ) : (
                    <button type="button" onClick={() => void go(m)} className="myb-press flex h-8 w-[72px] shrink-0 items-center justify-center rounded-lg border border-[#dee2e9] bg-white text-[13px] font-bold text-[#33363f]">
                      이동하기
                    </button>
                  )}
                </li>
              );
            })}
            {!data && [0, 1, 2, 3].map((i) => <li key={i} className="h-[76px] animate-pulse rounded-[16px] bg-white" />)}
          </ul>
        </section>

        <section className="rounded-[16px] bg-[#f2f3f5] p-4 text-[12px] leading-[18px] text-[#5c6573]">
          <p className="font-semibold text-[#33363f]">유의사항</p>
          <ul className="mt-1 list-disc pl-4">
            <li>주차는 일요일 0시부터 토요일 24시까지(KST)이며, 받지 않은 보상은 주차가 바뀌면 사라져요.</li>
            <li>미션 진행도는 이번 주에 한 활동만 집계돼요.</li>
            <li>부정 참여가 확인되면 보상이 회수될 수 있어요.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

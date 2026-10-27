"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/motion/Toast";
import { fmt } from "@/hooks/useHome";
import type { GameDetailPayload } from "@/lib/game/types";

/* eslint-disable @next/next/no-img-element */

function left(endsAt: string) {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  return { d: Math.floor(diff / 86400_000), h: Math.floor((diff % 86400_000) / 3600_000), m: Math.floor((diff % 3600_000) / 60_000) };
}

/** 게임 상세 — adjoe.myb.im 게임 디테일(당첨자 전용 보너스) DOM 복제. 상태바 55 제외, 헤더 46 */
export function GameDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { show } = useToast();
  const [data, setData] = useState<GameDetailPayload | null>(null);
  const [err, setErr] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    fetch(`/api/game/${id}`, { cache: "no-store" }).then(async (r) => { if (!r.ok) throw new Error(); setData(await r.json()); }).catch(() => setErr(true));
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, [id]);
  void now;

  if (err) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-bg)] px-6 text-center">
        <img src="/myb/adj/img_bridge_empty.webp" alt="" className="h-40 w-40 object-contain" />
        <p className="mt-4 text-[16px] font-medium text-[#33363f]">게임을 찾을 수 없어요</p>
        <Link href="/game" className="mt-4 rounded-lg bg-[var(--color-myb)] px-5 py-3 font-semibold text-white">게임적립으로</Link>
      </div>
    );
  }
  const g = data?.game;
  const t = data ? left(data.rushEndsAt) : null;

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] text-[#191f28]">
      <header className="sticky top-0 z-20 flex h-[46px] items-center bg-white/[0.94]">
        <button type="button" onClick={() => router.back()} aria-label="뒤로" className="absolute left-[14px] top-[9px] h-7 w-7">
          <img src="/myb/adj/ic_gd_arrow_left.svg" width={28} height={28} alt="" className="h-7 w-7" />
        </button>
      </header>

      <div className="flex flex-col bg-white pb-8">
        <section className="flex flex-col items-center px-6 pt-8">
          <div className="relative h-[90px] w-[90px] rounded-[14.4px] bg-[var(--color-bg-2)]">
            {g && <img src={g.icon} width={90} height={90} alt="" className="h-[90px] w-[90px] rounded-[14.4px] object-cover" />}
            <span className="absolute left-1/2 top-[-18px] flex h-6 -translate-x-1/2 items-center whitespace-nowrap rounded-[7px] border border-white/30 bg-[#7439ff] px-[7px] py-1 text-[12px] font-bold text-white">당첨자 전용</span>
          </div>
          <div className="mt-4 flex flex-col items-center gap-2">
            <h1 className="text-center text-[18px] font-semibold leading-[18px] text-[#191f28]">{g?.title ?? "…"}</h1>
            <div className="flex items-center gap-1">
              <span className="whitespace-nowrap text-[15px] leading-[15px] text-[#8b94a0]">{data?.daysLeft ?? 90}일 남음</span>
              <img src="/myb/adj/ic_gd_info.svg" width={16} height={16} alt="안내" className="h-4 w-4" />
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3 px-6 pt-8">
          <div className="flex items-center gap-[6px]">
            <h2 className="whitespace-nowrap text-[18px] font-semibold leading-[18px] text-[#33363f]">즉시 {fmt(g?.bonusPoint ?? 1000)}P 받는 미션</h2>
            <span className="flex items-center justify-center rounded bg-[#e5edff] px-[6px] py-1 text-[13px] font-semibold leading-[15px] text-[var(--color-myb)]">1분 소요!</span>
          </div>
          <div className="flex flex-col gap-6 rounded-xl border border-[var(--color-myb)] bg-[var(--color-myb-soft)] p-4">
            <p className="text-[16px] font-semibold leading-4 text-[#191f28]">{g?.missionText ?? ""}</p>
            <div className="flex h-11 items-center justify-center gap-1 rounded-xl bg-white px-6 py-3">
              <span className="flex items-center gap-1 whitespace-nowrap text-[14px] font-bold leading-5 text-[var(--color-myb)]">
                <img src="/myb/adj/ic_gd_token14.svg" width={14} height={14} alt="" className="h-[14px] w-[14px]" />{fmt(g?.missionPoint ?? 0)}
              </span>
              <span className="text-[14px] font-bold leading-[19.6px] tracking-[-0.14px] text-[#ced5e0]">+</span>
              <div className="relative flex items-center">
                <BonusBadge />
                <span className="flex items-center gap-1 whitespace-nowrap text-[14px] font-bold leading-5 text-[var(--color-myb)]">
                  <img src="/myb/adj/ic_gd_token14.svg" width={14} height={14} alt="" className="h-[14px] w-[14px]" />{fmt(g?.bonusPoint ?? 1000)}
                </span>
              </div>
              <span className="text-[14px] font-bold leading-[19.6px] tracking-[-0.14px] text-[#ced5e0]">+</span>
              <div className="relative flex items-center">
                <BonusBadge />
                <img src="/myb/adj/img_gd_freepass_word.svg" width={49} height={12} alt="프리패스" className="h-3 w-[49px]" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-[var(--color-bg-2)] px-4 py-3">
            <span className="flex items-center rounded-[40px] bg-white p-2"><img src="/myb/adj/img_gd_freepass_word.svg" width={45} height={11} alt="프리패스" className="h-[11px] w-[45px]" /></span>
            <p className="text-[14px] font-medium leading-[18.2px] tracking-[-0.14px] text-[#5c6573]">80회 퀴즈를 광고없이 바로 풀 수 있어요!</p>
          </div>
        </section>
      </div>

      <section className="flex flex-col gap-2 bg-[var(--color-bg)] px-4 pb-[190px] pt-20">
        <h2 className="flex h-6 items-center text-[18px] font-bold leading-[18px] text-[#191f28]">확인해 주세요</h2>
        <div className="mt-2 flex flex-col gap-[10px]">
          {(data?.notices ?? []).map((n, i) => (
            <div key={i} className="flex gap-2 text-[14px] leading-[20.3px] text-[#5c6573]">
              <span>∙</span>
              <p className="break-keep">{n}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 하단 고정: 종료 카운트 + CTA 52 */}
      <div className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[430px] -translate-x-1/2 flex-col items-center bg-white/30 pb-[34px] backdrop-blur-sm">
        <div className="h-px w-full bg-[#dee2e9]" />
        <div className="mt-4 flex items-center gap-1">
          <img src="/myb/adj/ic_gd_clock.webp" width={20} height={20} alt="" className="h-5 w-5" />
          <span className="whitespace-nowrap text-[16px] font-medium leading-[21.6px] tracking-[-0.16px] text-[#191f28]">{fmt(g?.bonusPoint ?? 1000)}P 혜택 종료까지</span>
          <div className="flex items-center gap-1 whitespace-nowrap text-[16px] font-bold leading-[21.6px] tracking-[-0.16px] text-[var(--color-myb)]">
            <span>{t?.d ?? 0}일</span><span>{t?.h ?? 0}시간</span><span>{t?.m ?? 0}분</span>
          </div>
        </div>
        <button type="button" onClick={() => show("게임 설치 페이지로 이동해요 (adjoe 연동 예정)", "info")} className="myb-press mx-4 mt-4 flex h-[52px] w-[calc(100%-32px)] items-center justify-center gap-1 rounded-lg bg-[var(--color-myb)] text-[16px] font-semibold text-white">
          <span className="flex items-center gap-1">
            <span className="flex items-center gap-1 whitespace-nowrap font-bold leading-5"><img src="/myb/adj/ic_gd_token14_white.svg" width={14} height={14} alt="" className="h-[14px] w-[14px]" />{fmt((g?.missionPoint ?? 0) + (g?.bonusPoint ?? 1000))}</span>
            <span className="text-[14px] font-bold leading-[19.6px] tracking-[-0.14px] opacity-60">+</span>
            <img src="/myb/adj/img_gd_freepass_word_white.svg" width={49} height={12} alt="프리패스" className="h-3 w-[49px]" />
          </span>
          <span>받기!</span>
        </button>
      </div>
    </div>
  );
}

function BonusBadge() {
  return (
    <span className="absolute left-1/2 top-[-22px] flex h-[22px] w-[51px] -translate-x-1/2 justify-center bg-contain bg-no-repeat pt-1 text-[11px] font-bold leading-[11px] text-white" style={{ backgroundImage: "url(/myb/adj/ic_gd_badge_bonus.svg)" }}>
      추가보상
    </span>
  );
}

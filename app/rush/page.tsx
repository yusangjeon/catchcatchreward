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

  const game = data?.missions.find((m) => m.key === "game3");
  const quiz = data?.missions.find((m) => m.key === "quiz5");
  const Pill = ({ children }: { children: React.ReactNode }) => <p className="mx-auto mt-6 flex h-9 w-fit items-center rounded-full bg-white/10 px-5 text-[14px] font-bold text-white">{children}</p>;
  const Steps = ({ tag, icon, title, href, points, labels, current }: { tag: string; icon: string; title: React.ReactNode; href: string; points: number[]; labels: string[]; current: number }) => (
    <Link href={href} className="relative mt-3 block rounded-[20px] bg-white px-5 pb-5 pt-6">
      <span className="absolute -top-0 left-0 rounded-br-[14px] rounded-tl-[20px] bg-[#efe6ff] px-3 py-1 text-[12px] font-bold text-[#8e5cf0]">{tag}</span>
      <p className="mt-2 flex items-center gap-2 text-[17px] font-bold"><span className="text-[22px]">{icon}</span>{title}<span className="ml-auto text-[#b0b8c1]">›</span></p>
      <div className="relative mt-4 flex items-center justify-between">
        <i className="absolute left-6 right-6 top-[18px] h-[3px] bg-[#e5ecff]" />
        {points.map((pt, k) => (
          <span key={k} className="relative flex flex-col items-center gap-1.5">
            <span className={`flex h-9 items-center gap-1 rounded-full px-3 text-[14px] font-bold ${k < current ? "bg-[#427cff] text-white" : "bg-[#e8f1ff] text-[#9fb6ff]"}`}><PCoin size={14} />{pt}</span>
            <span className="text-[11px] text-[#8b94a0]">{labels[k]}</span>
          </span>
        ))}
      </div>
    </Link>
  );

  return (
    <div className="min-h-dvh bg-[#191f28] pb-10 text-[#191f28]">
      <header className="fixed left-1/2 top-0 z-20 flex h-12 w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-[#191f28] px-6">
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
      <section className="mx-4 mt-14 overflow-hidden rounded-[24px] bg-gradient-to-br from-[#6d4cf2] via-[#9b4cf0] to-[#ff3e9a] text-white">
        <div className="flex items-center justify-between px-6 pb-3 pt-5">
          <div>
            <span className="inline-flex h-6 items-center rounded-full bg-white/20 px-2.5 text-[12px] font-bold">{data ? `${data.weekNo}주차` : "—"}</span>
            <h2 className="mt-2 text-[22px] font-extrabold leading-[30px]">미션 완료하고<br />스탬프 모으면 최대 <b className="text-[#ffe76a]">500P</b></h2>
            <p className="mt-1 text-[13px] text-white/80">매주 일요일 0시에 새로 시작해요</p>
          </div>
          <img src="/myb/bh/img_bpointrush_visual.webp" width={110} height={110} alt="" className="h-[110px] w-[110px] shrink-0" draggable={false} />
        </div>
        {data && <Countdown endsAt={data.endsAt} />}
      </section>

      <div className="px-4">
        <Pill>✨ 스페셜 미션 ✨</Pill>
        {/* 프리패스 배너 2종 */}
        {[{ title: "프리패스", sub: "게임", desc: "안 해본 미니게임 첫 보상 받기", href: "/games", icon: "🎮" }, { title: "프리패스", sub: "퀴즈", desc: quiz ? `퀴즈 ${quiz.current}/${quiz.value} 완료` : "퀴즈 풀고 포인트", href: "/quiz", icon: "📝", beta: true }].map((b) => (
          <Link key={b.sub} href={b.href} className="mt-3 flex items-center gap-3 rounded-[18px] px-4 py-4 text-white" style={{ background: "linear-gradient(90deg,#ff7a3d 0%,#ff3e9a 45%,#8e3cff 100%)" }}>
            <span className="text-[34px] leading-none">{b.icon}</span>
            <span className="min-w-0 flex-1">
              <p className="text-[20px] font-black leading-[24px]">{b.title} <span className="text-[15px] font-semibold">{b.sub}</span>{b.beta && <span className="ml-1 rounded-full bg-[#ffe9b0] px-2 py-0.5 text-[11px] font-bold italic text-[#b06a00]">Beta</span>}</p>
              <p className="mt-1 truncate text-[13px] text-white/90">{b.desc}</p>
            </span>
            <span className="rounded-[12px] bg-gradient-to-r from-[#ff3e9a] to-[#c23dff] px-5 py-3 text-[15px] font-bold shadow-md">이동</span>
          </Link>
        ))}
        <Steps tag="게임적립" icon="🕹️" title={<><span className="text-[#ff3e9a]">미니게임</span>&nbsp;3회 플레이하기</>} href="/games" points={[10, 10, 20]} labels={["플레이 1회", "플레이 2회", "플레이 3회"]} current={game?.current ?? 0} />
        <Steps tag="퀴즈 보상" icon="📝" title="퀴즈 참여하기" href="/quiz" points={[10, 10, 10]} labels={["오늘 1회", "오늘 2회", "오늘 3회"]} current={Math.min(3, quiz?.current ?? 0)} />
        <Link href="/missions" className="mt-3 flex items-center gap-3 rounded-[20px] bg-white px-5 py-5">
          <span className="text-[30px]">🏆</span>
          <span className="flex-1">
            <p className="text-[17px] font-bold">동네 매장 도전 과제</p>
            <p className="mt-0.5 text-[13px] text-[#5c6573]">매장 방문·저장·리뷰하면 스탬프 👀</p>
          </span>
          <span className="text-[#b0b8c1]">›</span>
        </Link>

        <Pill>🔥 스탬프 미션 🔥</Pill>
        {/* 스탬프 보드 */}
        <section className="mt-3 rounded-[20px] bg-white p-5">
          <p className="text-center text-[18px] font-bold">스탬프 7개를 채우면 <span className="inline-flex items-center gap-1 text-[#427cff]"><PCoin size={18} />300</span></p>
          <p className="mt-1 text-center text-[13px] text-[#8b94a0]">8개 전부 모으면 <b className="text-[#427cff]">+500P</b> · 이번 주 <b className="text-[#6d4cf2]">{stamps}</b>/{total}</p>
          <div className="mt-5 grid grid-cols-4 gap-x-3 gap-y-4">
            {Array.from({ length: total }).map((_, i) => {
              const filled = i < stamps;
              const m = data?.missions[i];
              const reward = data?.stampRewards.find((r) => r.stamps === i + 1);
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className={`relative flex h-[64px] w-[64px] items-center justify-center rounded-full ${filled ? "bg-[#fff0f7]" : "bg-[#f2f4f8]"}`} style={{ clipPath: "polygon(50% 0%, 61% 6%, 73% 3%, 81% 12%, 93% 15%, 96% 27%, 100% 38%, 97% 50%, 100% 62%, 96% 73%, 93% 85%, 81% 88%, 73% 97%, 61% 94%, 50% 100%, 39% 94%, 27% 97%, 19% 88%, 7% 85%, 4% 73%, 0% 62%, 3% 50%, 0% 38%, 4% 27%, 7% 15%, 19% 12%, 27% 3%, 39% 6%)" }}>
                    {filled ? <img src="/myb/bh/img_stamp.webp" width={36} height={36} alt="" className="myb-pop-in h-[36px] w-[36px]" /> : <span className="flex flex-col items-center text-[#b0b8c1]"><span className="text-[13px] font-bold">{i + 1}</span><span className="text-[9px]">{m?.title ?? ""}</span></span>}
                  </span>
                  {reward && (
                    reward.claimed ? (
                      <span className="text-[11px] font-bold text-[#8b94a0]">✓ {fmt(reward.points)}P</span>
                    ) : reward.reached ? (
                      <button type="button" onClick={() => void claim(reward.key)} disabled={busy !== null} className="myb-press rounded-full bg-[#ff3e9a] px-2 py-0.5 text-[11px] font-bold text-white">{fmt(reward.points)}P 받기</button>
                    ) : (
                      <span className="rounded-full bg-[#fff0f7] px-2 py-0.5 text-[11px] font-bold text-[#ff3e9a]">🎁 {fmt(reward.points)}P</span>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 미션 목록(번호) */}
        <section className="mt-3 rounded-[20px] bg-white p-3">
          {data && data.claimable > 0 && <p className="mx-2 mb-2 rounded-xl bg-[#fff1f1] px-3 py-2 text-[12px] font-bold text-[#ff3939]">받을 수 있는 보상 {data.claimable}개</p>}
          <ul className="flex flex-col gap-2">
            {(data?.missions ?? []).map((m, i) => (
              <li key={m.key} className="flex items-center gap-3 rounded-[16px] bg-[#f6f8fc] px-4 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-semibold">{i + 1}. {m.stepTitle}</p>
                  <p className="mt-1.5 flex items-center gap-1 text-[16px] font-bold text-[#427cff]"><PCoin size={16} />{m.reward}</p>
                  <p className="mt-1 text-[12px] font-medium text-[#e13cae]">{m.hint}</p>
                </div>
                {m.claimed ? (
                  <span className="flex h-11 w-[88px] shrink-0 items-center justify-center rounded-[12px] bg-[#e9ecf1] text-[14px] font-bold text-[#8b94a0]">완료</span>
                ) : m.completed ? (
                  <button type="button" disabled={busy !== null} onClick={() => void claim(m.key)} className="myb-press flex h-11 w-[88px] shrink-0 items-center justify-center rounded-[12px] bg-[#427cff] text-[14px] font-bold text-white">받기</button>
                ) : (
                  <button type="button" onClick={() => void go(m)} className="myb-press flex h-11 w-[88px] shrink-0 items-center justify-center rounded-[12px] bg-[#dfe9ff] text-[14px] font-bold text-[#427cff]">이동하기</button>
                )}
              </li>
            ))}
            {!data && [0, 1, 2, 3].map((i) => <li key={i} className="h-[92px] animate-pulse rounded-[16px] bg-[#f6f8fc]" />)}
          </ul>
        </section>

        <section className="mt-3 rounded-[16px] bg-white/5 p-4 text-[12px] leading-[18px] text-white/60">
          <p className="font-semibold text-white/80">유의사항</p>
          <ul className="mt-1 list-disc pl-4">
            <li>주차는 일요일 0시부터 토요일 24시까지(KST)이며, 받지 않은 보상은 주차가 바뀌면 사라져요.</li>
            <li>미션 진행도는 이번 주에 한 활동만 집계돼요. 보상을 받을 때마다 스탬프 1개(룰렛 스탬프 +1).</li>
            <li>부정 참여가 확인되면 보상이 회수될 수 있어요.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

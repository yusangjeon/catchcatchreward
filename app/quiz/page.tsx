"use client";

import { BadgeIcon, BadgeTile } from "@/components/icons/badge";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useHome, fmt } from "@/hooks/useHome";
import { SetGridCard } from "@/components/SetCard";
import { HeartIcon, PCoin } from "@/components/icons";

/* eslint-disable @next/next/no-img-element */

interface Group { code: string; name: string; emoji: string; earned: boolean; setIds: string[] }

/** 퀴즈 채널(마이비 영상 기준): 시작하기 좋은 퀴즈 2열 → 뱃지 컬렉션(칩 탭 + 리스트 카드) → 전체 퀴즈 */
export default function QuizTabPage() {
  const { data } = useHome();
  const sets = data?.sets ?? [];
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [tab, setTab] = useState<string>("");
  const [more, setMore] = useState(false);
  useEffect(() => {
    fetch("/api/quiz/channel", { cache: "no-store" }).then((r) => r.json()).then((j: { groups: Group[] }) => { setGroups(j.groups); if (j.groups[0]) setTab((t) => t || j.groups[0].code); }).catch(() => {});
  }, []);
  const fresh = sets.filter((s) => !s.done);
  const starters = (fresh.length >= 4 ? fresh : sets).slice(0, 4);
  const starterIds = new Set(starters.map((s) => s.id));
  const g = groups?.find((x) => x.code === tab);
  const gSets = g ? g.setIds.map((id) => sets.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => !!s) : [];
  const rest = sets.filter((s) => !starterIds.has(s.id));

  return (
    <div className="bg-white">
      <header className="flex h-[55px] items-center justify-between px-5">
        <h1 className="text-[22px] font-bold">퀴즈 <span className="font-medium text-[#b0b8c1]">채널</span></h1>
        <div className="flex items-center gap-4">
          <Link href="/history" aria-label="내역"><img src="/brand/ic_clock.svg" alt="" className="h-[26px] w-[26px] opacity-70" /></Link>
          <HeartIcon size={26} className="text-[#c5cbd3]" />
        </div>
      </header>

      <section className="px-5 pt-[30px]">
        <Link href="#all" className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold">시작하기 좋은 퀴즈</h2>
          <span className="text-[20px] text-[#8b94a0]">›</span>
        </Link>
        <p className="mt-1 text-[14px] text-ink-2">지금 바로 도전해보세요!</p>
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-7">
          {starters.length > 0 ? starters.map((s) => <SetGridCard key={s.id} s={s} />) : [0, 1, 2, 3].map((i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-bg-2" />)}
        </div>
      </section>

      {/* 뱃지 컬렉션 */}
      <section className="mt-[34px] pb-9 pt-7" style={{ background: "linear-gradient(180deg,#eef2fb 0%,#f6f8fd 100%)" }}>
        <div className="flex items-center justify-between px-5">
          <h2 className="text-[20px] font-bold">캐치 <span className="text-myb">뱃지</span> 컬렉션</h2>
          <Link href="/wallet" className="flex h-6 w-6 items-center justify-center rounded-full bg-[#dfe3ea] text-[13px] font-bold text-white">?</Link>
        </div>
        <ul className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-5">
          {(groups ?? []).map((x) => (
            <li key={x.code}>
              <button type="button" onClick={() => { setTab(x.code); setMore(false); }} className={`flex h-[42px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[15px] font-semibold ${tab === x.code ? "bg-myb text-white" : "bg-white text-ink"}`}>
                <BadgeIcon code={x.code} size={18} className={tab === x.code ? "text-white" : "text-ink-2"} />{x.name}{x.earned && <span className="text-[11px]">✓</span>}
              </button>
            </li>
          ))}
          {!groups && [0, 1, 2].map((i) => <li key={i} className="h-[42px] w-[120px] shrink-0 animate-pulse rounded-full bg-white" />)}
        </ul>
        <div className="mx-5 mt-4 rounded-[20px] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-[18px] font-bold">{g ? <><BadgeTile code={g.code} size={30} /> {g.name}</> : "…"}</p>
            <Link href="/wallet" className="flex h-8 items-center gap-0.5 rounded-full border border-[#dfe3ea] px-3 text-[12px] font-medium text-ink-2">{g?.earned ? "획득한 뱃지" : "뱃지 미획득"} ›</Link>
          </div>
          <ul className="mt-4 flex flex-col gap-4">
            {(more ? gSets : gSets.slice(0, 3)).map((s) => (
              <li key={s.id}>
                <Link href={`/quiz/${s.id}`} className="flex items-start gap-3">
                  <span className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[14px] bg-bg-2">
                    <img src={s.imageUrl} alt="" className={`h-full w-full object-cover ${s.done ? "opacity-50" : ""}`} loading="lazy" />
                    <span className="absolute left-1 top-1 rounded-full bg-[#ff8a5c] px-1.5 py-0.5 text-[9px] font-bold text-white">{g?.name.slice(0, 4)}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[15px] font-medium leading-[1.4]">{s.title}</p>
                    <p className="mt-1.5 flex items-center gap-1 text-[16px] font-extrabold"><PCoin size={16} />{fmt(s.rewardPoints)} <span className="ml-1 text-[12px] font-normal text-muted">| {fmt(s.participants)}명 참여</span></p>
                  </span>
                  <HeartIcon size={24} className="shrink-0 text-[#dfe3ea]" />
                </Link>
              </li>
            ))}
            {g && gSets.length === 0 && <li className="py-4 text-center text-[13px] text-muted">이 뱃지 퀴즈는 모두 풀었어요</li>}
          </ul>
          {gSets.length > 3 && (
            <button type="button" onClick={() => setMore((m) => !m)} className="myb-press mt-5 h-[52px] w-full rounded-[14px] bg-myb text-[16px] font-bold text-white">{more ? "접기" : `${g?.name} 퀴즈 더보기`}</button>
          )}
        </div>
      </section>

      <section id="all" className="px-5 pb-4 pt-8">
        <h2 className="text-[20px] font-bold"><span className="text-myb-dark">{data ? data.persona.title : "…"}</span>님을 위한 전체 퀴즈</h2>
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-7">
          {rest.map((s) => <SetGridCard key={s.id} s={s} />)}
        </div>
      </section>
    </div>
  );
}

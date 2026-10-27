"use client";

import { IconTile, type DuoName, type Tone } from "@/components/icons/duo";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { PCoin } from "@/components/icons";
import { useToast } from "@/components/motion/Toast";
import { useHome, fmt } from "@/hooks/useHome";

/* eslint-disable @next/next/no-img-element */

export default function MePage() {
  return (
    <Suspense fallback={null}>
      <MeView />
    </Suspense>
  );
}

const MENU = [
  { href: "/history", label: "포인트 내역", name: "coin", tone: "amber" },
  { href: "/exchange", label: "포인트 교환", name: "ticket", tone: "blue" },
  { href: "/gifts", label: "선물함", name: "gift", tone: "pink" },
  { href: "/attendance", label: "출석 달력", name: "calendar", tone: "green" },
  { href: "/invite", label: "친구초대", name: "people", tone: "pink" },
  { href: "/notifications", label: "알림", name: "bell", tone: "amber" },
  { href: "/notice", label: "공지사항", name: "megaphone", tone: "blue" },
  { href: "/support", label: "고객센터", name: "chat", tone: "teal" },
  { href: "/terms", label: "이용약관 · 개인정보", name: "doc", tone: "gray" },
];

/** MY — 계정 연결 상태, 잔액, 메뉴. 로그인은 카카오 */
function MeView() {
  const router = useRouter();
  const params = useSearchParams();
  const { data } = useHome();
  const { show } = useToast();
  useEffect(() => {
    if (params.get("login")) show(params.get("merged") ? "로그인 완료 · 기존 계정 기록과 합쳤어요" : "로그인 완료 · 기록이 계정에 연결됐어요");
  }, [params, show]);
  const me = data?.me;
  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-10 text-[#191f28]">
      <header className="fixed left-1/2 top-0 z-20 flex h-12 w-full max-w-[430px] -translate-x-1/2 items-center bg-[var(--color-bg)] px-6">
        <button type="button" onClick={() => router.back()} aria-label="뒤로" className="flex h-7 w-7 items-center justify-center"><img src="/brand/ic_left.svg" width={28} height={28} alt="" className="h-7 w-7" /></button>
        <h1 className="flex-1 text-center text-[18px] font-semibold">MY</h1>
        <span className="w-7" />
      </header>
      <div className="flex flex-col gap-4 px-6 pt-[64px]">
        <section className="flex items-center gap-4 rounded-[20px] bg-white p-5" style={{ boxShadow: "0 5px 16px 0 rgba(40, 24, 14, 0.09)" }}>
          {me?.avatarUrl ? <img src={me.avatarUrl} alt="" className="h-14 w-14 rounded-full object-cover" /> : <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#eaf2ff]"><img src="/brand/mascot_body.webp" alt="" className="mt-3 h-[72px] w-[72px] object-contain" draggable={false} /></span>}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[18px] font-bold">{me?.loggedIn ? me.nickname ?? "회원" : "게스트"}</p>
            <p className="mt-0.5 text-[12px] text-[#8b94a0]">{me?.loggedIn ? `${me.provider === "kakao" ? "카카오" : "테스트"} 계정 연결됨` : "로그인하면 폰을 바꿔도 포인트가 이어져요"}</p>
          </div>
          {me?.loggedIn ? (
            <form action="/api/auth/logout" method="post"><button type="submit" className="rounded-lg border border-[#dee2e9] px-3 py-2 text-[12px] font-semibold text-[#5c6573]">로그아웃</button></form>
          ) : (
            <Link href="/login" className="rounded-lg bg-[#FEE500] px-3 py-2 text-[12px] font-bold text-[#191600]">로그인</Link>
          )}
        </section>
        <section className="grid grid-cols-3 divide-x divide-[#eef0f4] rounded-[20px] bg-white p-4 text-center" style={{ boxShadow: "0 5px 16px 0 rgba(40, 24, 14, 0.09)" }}>
          <div><p className="text-[12px] text-[#8b94a0]">포인트</p><p className="mt-1 flex items-center justify-center gap-1 text-[18px] font-bold"><PCoin size={16} />{fmt(data?.wallet.balance ?? 0)}</p></div>
          <div><p className="text-[12px] text-[#8b94a0]">스탬프</p><p className="mt-1 text-[18px] font-bold">{data?.wallet.stamps ?? 0}</p></div>
          <div><p className="text-[12px] text-[#8b94a0]">배지</p><p className="mt-1 text-[18px] font-bold">{data?.badges.length ?? 0}</p></div>
        </section>
        <ul className="overflow-hidden rounded-[20px] bg-white" style={{ boxShadow: "0 5px 16px 0 rgba(40, 24, 14, 0.09)" }}>
          {MENU.map((m) => (
            <li key={m.href} className="border-b border-[var(--color-bg-2)] last:border-0">
              <Link href={m.href} className="flex h-[52px] items-center gap-3 px-5 text-[15px]"><IconTile name={m.name as DuoName} tone={m.tone as Tone} size={32} icon={18} /><span className="flex-1">{m.label}</span><span className="text-[#b0b8c1]">›</span></Link>
            </li>
          ))}
        </ul>
        <p className="text-center text-[11px] text-[#b0b8c1]">캐치캐치리워드 v0.1 · 엠플리파이</p>
      </div>
    </div>
  );
}

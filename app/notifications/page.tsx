"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Notice } from "@/lib/notifications";

/* eslint-disable @next/next/no-img-element */

const ICON: Record<Notice["kind"], string> = {
  rush: "/myb/bh/img_stamp.webp", redeem: "/myb/native/ic_gift_blue.png", referral: "/myb/native/qm_invite.png", honey: "/myb/native/ic_honey_jar.png", attendance: "/myb/native/qm_attend.png", roulette: "/myb/native/qm_minigame.png",
};

/** 알림 — 홈 종 아이콘. 상태에서 파생된 할 일·소식 */
export default function NotificationsPage() {
  const router = useRouter();
  const [data, setData] = useState<{ notices: Notice[] } | null>(null);
  useEffect(() => {
    fetch("/api/notifications", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => setData({ notices: [] }));
  }, []);
  return (
    <div className="min-h-dvh bg-[#f8f9fc] pb-10 text-[#191f28]">
      <header className="fixed left-1/2 top-0 z-20 flex h-12 w-full max-w-[430px] -translate-x-1/2 items-center bg-[#f8f9fc] px-6">
        <button type="button" onClick={() => router.back()} aria-label="뒤로" className="flex h-7 w-7 items-center justify-center">
          <img src="/myb/shop/ic_left.png" width={28} height={28} alt="" className="h-7 w-7" />
        </button>
        <h1 className="flex-1 text-center text-[18px] font-semibold">알림</h1>
        <span className="w-7" />
      </header>
      <ul className="flex flex-col gap-2 px-6 pt-[64px]">
        {(data?.notices ?? []).map((n) => (
          <li key={n.id}>
            <Link href={n.href} className="flex items-center gap-3 rounded-[16px] bg-white px-4 py-[14px]" style={{ boxShadow: "0 2px 10px 0 rgba(0, 43, 141, 0.06)" }}>
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f0f4ff]">
                <img src={ICON[n.kind]} width={28} height={28} alt="" className="h-7 w-7 object-contain" />
                {n.action && <i className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#ff3939] ring-2 ring-white" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold">{n.title}</p>
                <p className="mt-0.5 text-[12px] leading-[17px] text-[#8b94a0]">{n.body}</p>
              </div>
              <span className="shrink-0 text-[11px] text-[#b0b8c1]">{new Date(n.at).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}</span>
            </Link>
          </li>
        ))}
        {data && data.notices.length === 0 && <li className="py-16 text-center text-[14px] text-[#8b94a0]">새 알림이 없어요</li>}
        {!data && [0, 1, 2].map((i) => <li key={i} className="h-[72px] animate-pulse rounded-[16px] bg-white" />)}
      </ul>
    </div>
  );
}

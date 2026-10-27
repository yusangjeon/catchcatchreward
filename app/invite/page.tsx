"use client";

import { DuoIcon } from "@/components/icons/duo";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { PCoin } from "@/components/icons";
import { NumberFlow } from "@/components/motion/NumberFlow";
import { useToast } from "@/components/motion/Toast";
import { fmt } from "@/hooks/useHome";
import type { InvitePayload } from "@/lib/invite/service";

/* eslint-disable @next/next/no-img-element */

export default function InvitePage() {
  return (
    <Suspense fallback={null}>
      <InviteView />
    </Suspense>
  );
}

/** 친구초대 — 마이비 user/me.invitationCode 구조. 내 코드 공유 + 친구 코드 입력 */
function InviteView() {
  const router = useRouter();
  const params = useSearchParams();
  const { show } = useToast();
  const [data, setData] = useState<InvitePayload | null>(null);
  const [code, setCode] = useState(() => (params.get("code") ?? "").toUpperCase());
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => fetch("/api/invite", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => {}), []);
  useEffect(() => {
    void load();
  }, [load]);

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      show(`${label}를 복사했어요`);
    } catch {
      show("복사에 실패했어요. 길게 눌러 복사해 주세요", "info");
    }
  }

  async function share() {
    if (!data) return;
    const text = `캐치캐치리워드에서 퀴즈 풀고 포인트 받아요! 내 초대코드: ${data.code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "캐치캐치리워드 친구초대", text, url: data.link });
        return;
      } catch {
        /* 취소 */
      }
    }
    await copy(data.link, "초대 링크");
  }

  async function apply() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/invite/apply", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message ?? "초대코드를 적용할 수 없어요");
      show(`초대코드 적용! ${fmt(j.points)}P를 받았어요`);
      setCode("");
      await load();
    } catch (e) {
      show(e instanceof Error ? e.message : "초대코드를 적용할 수 없어요", "info");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-10 text-[#191f28]">
      <header className="fixed left-1/2 top-0 z-20 flex h-12 w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-[var(--color-bg)] px-6">
        <button type="button" onClick={() => router.back()} aria-label="뒤로" className="flex h-7 w-7 items-center justify-center">
          <img src="/brand/ic_left.svg" width={28} height={28} alt="" className="h-7 w-7" />
        </button>
        <h1 className="text-[18px] font-semibold">친구초대</h1>
        <Link href="/wallet" className="flex items-center gap-[6px]">
          <PCoin size={18} />
          <span className="text-[18px] font-semibold leading-[18px] text-[#33363f]">{data ? <NumberFlow value={data.wallet.balance} /> : "—"}</span>
        </Link>
      </header>

      <div className="flex flex-col gap-5 px-6 pt-[64px]">
        <section className="flex items-center gap-4 rounded-[20px] bg-gradient-to-r from-[#e23d7b] to-[#ff8fb8] p-5 text-white">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20"><DuoIcon name="people" size={32} /></span>
          <div>
            <p className="text-[18px] font-extrabold leading-[24px]">친구 초대하고<br />둘 다 포인트 받기</p>
            <p className="mt-1 text-[12px] text-white/85">친구는 바로 {fmt(data?.rewards.invitee ?? 300)}P, 나는 친구가 첫 퀴즈를 풀면 {fmt(data?.rewards.inviter ?? 500)}P</p>
          </div>
        </section>

        <section className="rounded-[20px] bg-white p-5" style={{ boxShadow: "0 5px 16px 0 rgba(40, 24, 14, 0.09)" }}>
          <p className="text-[13px] font-medium text-[#8b94a0]">내 초대코드</p>
          <p className="mt-1 text-[28px] font-extrabold tracking-[0.12em] tabular-nums">{data?.code ?? "────────"}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => data && void copy(data.code, "초대코드")} className="myb-press h-11 rounded-xl border border-[#dee2e9] text-[14px] font-bold">코드 복사</button>
            <button type="button" onClick={() => void share()} className="myb-press h-11 rounded-xl bg-[var(--color-myb)] text-[14px] font-bold text-white">링크 공유</button>
          </div>
        </section>

        <section className="rounded-[20px] bg-white p-5" style={{ boxShadow: "0 5px 16px 0 rgba(40, 24, 14, 0.09)" }}>
          <p className="text-[15px] font-semibold">친구 초대코드 입력</p>
          {data?.referred ? (
            <p className="mt-2 rounded-xl bg-[var(--color-myb-soft)] px-4 py-3 text-[13px] font-medium text-[var(--color-myb)]">✓ 초대코드를 이미 적용했어요</p>
          ) : (
            <div className="mt-3 flex gap-2">
              <input
                id="invite-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))}
                placeholder="8자리 코드"
                className="h-11 min-w-0 flex-1 rounded-xl border border-[#dee2e9] px-4 text-[16px] font-semibold tracking-[0.1em] uppercase outline-none focus:border-[var(--color-myb)]"
              />
              <button type="button" disabled={busy || code.length !== 8} onClick={() => void apply()} className="myb-press h-11 shrink-0 rounded-xl bg-[#191f28] px-5 text-[14px] font-bold text-white disabled:opacity-40">적용</button>
            </div>
          )}
          <p className="mt-2 text-[12px] text-[#8b94a0]">코드는 1회만 입력할 수 있고, 내 코드는 입력할 수 없어요.</p>
        </section>

        <section className="rounded-[20px] bg-white p-5" style={{ boxShadow: "0 5px 16px 0 rgba(40, 24, 14, 0.09)" }}>
          <div className="grid grid-cols-3 divide-x divide-[#eef0f4] text-center">
            <div><p className="text-[12px] text-[#8b94a0]">초대한 친구</p><p className="mt-1 text-[20px] font-bold">{data?.invitedCount ?? 0}<span className="text-[13px] font-medium">명</span></p></div>
            <div><p className="text-[12px] text-[#8b94a0]">보상 완료</p><p className="mt-1 text-[20px] font-bold">{data?.rewardedCount ?? 0}<span className="text-[13px] font-medium">명</span></p></div>
            <div><p className="text-[12px] text-[#8b94a0]">받은 포인트</p><p className="mt-1 text-[20px] font-bold text-[var(--color-myb)]">{fmt(data?.earned ?? 0)}<span className="text-[13px] font-medium">P</span></p></div>
          </div>
          {data && data.invites.length > 0 && (
            <ul className="mt-4 flex flex-col gap-2 border-t border-[#eef0f4] pt-3 text-[13px]">
              {data.invites.map((r, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="text-[#5c6573]">{new Date(r.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })} 초대</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${r.status === "rewarded" ? "bg-[#e9f7ef] text-[#1aa260]" : "bg-[#fff6e5] text-[#ff8a3d]"}`}>{r.status === "rewarded" ? "보상 완료" : "첫 퀴즈 대기"}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[16px] bg-[var(--color-bg-3)] p-4 text-[12px] leading-[18px] text-[#5c6573]">
          <p className="font-semibold text-[#33363f]">유의사항</p>
          <ul className="mt-1 list-disc pl-4">
            <li>초대 보상은 하루 {data?.rewards.dailyCap ?? 5}명까지 지급돼요.</li>
            <li>동일 기기·중복 계정 등 부정 참여가 확인되면 보상이 회수될 수 있어요.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

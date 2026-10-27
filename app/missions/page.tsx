"use client";

import { DuoIcon, IconTile } from "@/components/icons/duo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PCoin } from "@/components/icons";
import { NumberFlow } from "@/components/motion/NumberFlow";
import { useToast } from "@/components/motion/Toast";
import { fmt } from "@/hooks/useHome";
import type { MissionsPayload, PublicStoreMission } from "@/lib/missions/service";

/* eslint-disable @next/next/no-img-element */

const KIND_COLOR: Record<string, string> = { visit: "bg-[var(--color-myb-soft)] text-[var(--color-myb)]", save: "bg-[#e9f7ef] text-[#1aa260]", review: "bg-[var(--color-myb-soft)] text-[var(--color-myb)]" };

/** 매장 미션 — 캐치랭크 제휴 매장 방문·저장·리뷰. 인증코드 입력으로 완료 */
export default function MissionsPage() {
  const router = useRouter();
  const { show } = useToast();
  const [data, setData] = useState<MissionsPayload | null>(null);
  const [target, setTarget] = useState<PublicStoreMission | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => fetch("/api/missions", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => {}), []);
  useEffect(() => {
    void load();
  }, [load]);

  async function submit() {
    if (!target || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/missions/complete", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ missionId: target.id, code }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message ?? "인증에 실패했어요");
      show(`미션 완료! ${fmt(j.points)}P와 스탬프 1개를 받았어요`);
      setTarget(null);
      setCode("");
      await load();
    } catch (e) {
      show(e instanceof Error ? e.message : "인증에 실패했어요", "info");
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
        <h1 className="text-[18px] font-semibold">매장 미션</h1>
        <Link href="/wallet" className="flex items-center gap-[6px]">
          <PCoin size={18} />
          <span className="text-[18px] font-semibold leading-[18px] text-[#33363f]">{data ? <NumberFlow value={data.wallet.balance} /> : "—"}</span>
        </Link>
      </header>

      <div className="flex flex-col gap-4 px-6 pt-[64px]">
        <section className="relative overflow-hidden rounded-[20px] bg-[#e2f6f8] p-5 pr-[100px]">
          <DuoIcon name="store" size={96} className="pointer-events-none absolute -bottom-3 right-2 text-[#0f9bb0]/25" />
          <p className="text-[12px] font-semibold text-[#0f9bb0]">캐치랭크 제휴 매장</p>
          <p className="mt-1 text-[18px] font-bold leading-[24px]">동네 매장 방문·저장·리뷰하고<br />포인트와 스탬프 받기</p>
          <p className="mt-2 text-[12px] text-ink-2">완료한 미션 <b className="text-ink">{data?.doneCount ?? 0}</b>개 · 매장에서 받은 인증코드를 입력하면 바로 적립돼요</p>
        </section>

        <ul className="flex flex-col gap-3">
          {(data?.missions ?? []).map((m) => (
            <li key={m.id} className="rounded-[20px] bg-white p-5" style={{ boxShadow: "0 5px 16px 0 rgba(40, 24, 14, 0.09)" }}>
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${KIND_COLOR[m.kind]}`}>{m.kindLabel}</span>
                <span className="text-[12px] text-[#8b94a0]">{m.capacity > 0 ? `${Math.max(0, m.capacity - m.completedCount)}명 남음` : `${m.completedCount}명 참여`}</span>
              </div>
              <div className="mt-3 flex items-start gap-3">
                <IconTile name="pin" tone="teal" size={44} />
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-[#5c6573]">{m.storeName}</p>
                  <p className="mt-0.5 text-[16px] font-bold">{m.title}</p>
                  {m.description && <p className="mt-1 text-[12px] leading-[17px] text-[#8b94a0]">{m.description}</p>}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[16px] font-bold text-[var(--color-myb)]"><PCoin size={18} />{fmt(m.rewardPoints)}</span>
                {m.done ? (
                  <span className="flex h-9 items-center rounded-lg bg-[var(--color-bg-3)] px-4 text-[13px] font-bold text-[#8b94a0]">✓ 완료</span>
                ) : m.soldOut ? (
                  <span className="flex h-9 items-center rounded-lg bg-[var(--color-bg-3)] px-4 text-[13px] font-bold text-[#b0b8c1]">마감</span>
                ) : (
                  <button type="button" onClick={() => { setTarget(m); setCode(""); }} className="myb-press flex h-9 items-center rounded-lg bg-[var(--color-myb)] px-4 text-[13px] font-bold text-white">인증하기</button>
                )}
              </div>
            </li>
          ))}
          {!data && [0, 1, 2].map((i) => <li key={i} className="h-[150px] animate-pulse rounded-[20px] bg-white" />)}
          {data && data.missions.length === 0 && <li className="py-10 text-center text-[14px] text-[#8b94a0]">진행 중인 매장 미션이 없어요</li>}
        </ul>

        <section className="rounded-[16px] bg-[var(--color-bg-3)] p-4 text-[12px] leading-[18px] text-[#5c6573]">
          <p className="font-semibold text-[#33363f]">유의사항</p>
          <ul className="mt-1 list-disc pl-4">
            <li>미션은 매장당 1회만 참여할 수 있어요.</li>
            <li>인증코드는 매장 안내문 또는 직원에게 확인하세요. 코드 공유·무단 사용 시 보상이 회수돼요.</li>
          </ul>
        </section>
      </div>

      {target && (
        <>
          <div className="myb-fade-in fixed inset-0 z-[999] bg-black/60" onClick={() => setTarget(null)} />
          <div className="myb-modal-in fixed bottom-0 left-1/2 z-[1000] w-full max-w-[430px] -translate-x-1/2 rounded-t-[24px] bg-white px-6 pb-8 pt-6">
            <p className="text-[13px] font-medium text-[#8b94a0]">{target.storeName}</p>
            <p className="mt-0.5 text-[18px] font-bold">{target.title}</p>
            <input
              id="mission-code"
              inputMode="numeric"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\s/g, "").slice(0, 8))}
              placeholder="인증코드 입력"
              className="mt-4 h-14 w-full rounded-xl border border-[#dee2e9] text-center text-[24px] font-bold tracking-[0.3em] outline-none focus:border-[var(--color-myb)]"
            />
            <button type="button" disabled={busy || code.length < 4} onClick={() => void submit()} className="myb-press mt-4 h-[52px] w-full rounded-xl bg-[var(--color-myb)] text-[16px] font-bold text-white disabled:opacity-40">
              {busy ? "확인 중…" : `인증하고 ${fmt(target.rewardPoints)}P 받기`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

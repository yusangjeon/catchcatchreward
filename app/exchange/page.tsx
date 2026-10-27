"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PCoin } from "@/components/icons";
import { NumberFlow } from "@/components/motion/NumberFlow";
import { useToast } from "@/components/motion/Toast";
import { fmt } from "@/hooks/useHome";
import type { ExchangePayload } from "@/lib/exchange/service";
import type { Product } from "@/lib/exchange/products";

/* eslint-disable @next/next/no-img-element */

const STATUS: Record<string, { label: string; cls: string }> = {
  requested: { label: "신청 완료", cls: "bg-[var(--color-myb-soft)] text-[var(--color-myb)]" },
  processing: { label: "처리 중", cls: "bg-[#fff4e0] text-[#ff9500]" },
  done: { label: "발송 완료", cls: "bg-[#e7faf5] text-[#00b795]" },
  rejected: { label: "반려·환불", cls: "bg-[#ffecf1] text-[#ff3d71]" },
};

/** 포인트 교환 — 마이비 지갑 "상품 구매" 톤. 신청 즉시 포인트 차감, 발송은 운영자 수동(관리자 > 교환 신청) */
export default function ExchangePage() {
  const router = useRouter();
  const { show } = useToast();
  const [data, setData] = useState<ExchangePayload | null>(null);
  const [pick, setPick] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => fetch("/api/exchange", { cache: "no-store" }).then((r) => r.json()).then(setData).catch(() => {}), []);
  useEffect(() => {
    void load();
  }, [load]);

  const balance = data?.wallet.balance ?? 0;

  async function confirm() {
    if (!pick || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/exchange", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: pick.kind }) });
      const j = await res.json();
      if (!res.ok) {
        show(j.message ?? "교환에 실패했어요", "info");
        return;
      }
      show(`${pick.name} 교환을 신청했어요`);
      setPick(null);
      await load();
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
        <h1 className="text-[18px] font-semibold">포인트 교환</h1>
        <span className="flex items-center gap-[6px]"><PCoin size={18} /><span className="text-[18px] font-semibold leading-[18px] text-[#33363f]"><NumberFlow value={balance} /></span></span>
      </header>

      <div className="flex flex-col gap-6 px-6 pt-[64px]">
        <section className="rounded-[20px] bg-white p-5" style={{ boxShadow: "0 5px 16px 0 rgba(40, 24, 14, 0.09)" }}>
          <p className="text-[14px] text-[#5c6573]">교환 가능 포인트</p>
          <p className="mt-1 flex items-center gap-2 text-[26px] font-extrabold"><PCoin size={26} /><NumberFlow value={balance} /></p>
          <p className="mt-2 text-[12px] leading-[17px] text-[#8b94a0]">{fmt(data?.minRedeem ?? 1000)}P부터 교환할 수 있어요. 신청 즉시 포인트가 차감되고, 기프티콘은 영업일 3일 내 문자로 발송돼요.</p>
        </section>

        <section>
          <h2 className="text-[18px] font-bold">인기 상품</h2>
          <div className="mt-4 grid grid-cols-3 gap-x-[10px] gap-y-6">
            {(data?.products ?? []).map((p) => {
              const can = balance >= p.points;
              return (
                <button key={p.kind} type="button" onClick={() => setPick(p)} className="text-left">
                  <div className={`flex aspect-square items-center justify-center overflow-hidden rounded-xl text-[40px] ${can ? "" : "opacity-50 grayscale"}`} style={{ background: p.bg }} aria-hidden>{p.img ? <img src={p.img} alt="" className="h-full w-full object-cover" /> : p.emoji}</div>
                  <p className="mt-2.5 line-clamp-2 text-[12px] leading-snug">{p.name}</p>
                  <p className="mt-1.5 flex items-center gap-1 text-[13px] font-bold"><PCoin size={14} />{fmt(p.points)}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[20px] bg-white p-5">
          <h2 className="text-[16px] font-semibold">내 교환 내역</h2>
          {data && data.redemptions.length === 0 && <p className="mt-3 text-[14px] text-[#8b94a0]">아직 교환 신청이 없어요.</p>}
          <ul className="mt-3 flex flex-col divide-y divide-[var(--color-bg-2)]">
            {(data?.redemptions ?? []).map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium">{r.productName}</p>
                  <p className="text-[12px] text-[#b0b8c1]">{new Date(r.requestedAt).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })} · {fmt(r.amountPoints)}P</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[12px] font-medium ${STATUS[r.status]?.cls ?? ""}`}>{STATUS[r.status]?.label ?? r.status}</span>
              </li>
            ))}
          </ul>
        </section>
        <Link href="/history" className="text-center text-[14px] font-medium text-[var(--color-myb)]">포인트 전체 내역 보기 →</Link>
      </div>

      {pick && (
        <>
          <div className="myb-fade-in fixed inset-0 z-[999] bg-black/60" onClick={() => setPick(null)} />
          <div className="fixed bottom-0 left-1/2 z-[1000] w-full max-w-[430px] -translate-x-1/2 rounded-t-[20px] bg-white px-6 pb-8 pt-6 shadow-2xl" style={{ animation: "myb-modal-in 0.3s ease-out both" }}>
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-xl text-[32px]" style={{ background: pick.bg }} aria-hidden>{pick.emoji}</span>
              <div>
                <p className="text-[16px] font-semibold">{pick.name}</p>
                <p className="mt-1 flex items-center gap-1 text-[18px] font-extrabold"><PCoin size={18} />{fmt(pick.points)}</p>
              </div>
            </div>
            <div className="mt-5 rounded-xl bg-[var(--color-bg)] p-4 text-[13px] leading-[19px] text-[#5c6573]">
              <p className="flex justify-between"><span>보유 포인트</span><b className="text-[#191f28]">{fmt(balance)}P</b></p>
              <p className="mt-1 flex justify-between"><span>교환 후 잔액</span><b className={balance - pick.points < 0 ? "text-[#ff3939]" : "text-[#191f28]"}>{fmt(balance - pick.points)}P</b></p>
            </div>
            <button type="button" disabled={busy || balance < pick.points} onClick={() => void confirm()} className={`myb-press mt-5 h-[52px] w-full rounded-xl text-[16px] font-bold text-white ${balance < pick.points ? "bg-[#ced5e0]" : "bg-[var(--color-myb)]"}`}>
              {balance < pick.points ? `${fmt(pick.points - balance)}P 부족해요` : busy ? "신청 중…" : "교환 신청하기"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

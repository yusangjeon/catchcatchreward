"use client";

import { useToday } from "@/hooks/useToday";

export default function MyPage() {
  const { data } = useToday();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">MY</h1>

      <section className="rounded-2xl bg-surface p-4 shadow-sm">
        <p className="text-xs text-ink-muted">포인트 잔액</p>
        <p className="mt-1 text-3xl font-bold text-point">
          {data ? data.wallet.balance.toLocaleString() : "—"}
          <span className="ml-0.5 text-lg">P</span>
        </p>
        <button
          type="button"
          disabled
          className="mt-3 h-11 w-full rounded-xl bg-line text-sm font-semibold text-ink-muted"
          title="최소 교환 금액 도달 후 기프티콘 교환 (준비 중)"
        >
          기프티콘 교환 (준비 중)
        </button>
      </section>

      <section className="rounded-2xl bg-surface p-4 shadow-sm">
        <h2 className="font-semibold">내 취향 배지</h2>
        {data && data.badges.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-2">
            {data.badges.map((b) => (
              <li key={b.code} className="flex items-center gap-3 rounded-xl bg-bg p-3">
                <span aria-hidden className="text-2xl">
                  {b.emoji}
                </span>
                <div>
                  <p className="font-semibold">{b.name}</p>
                  <p className="text-xs text-ink-muted">{b.description}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink-muted">아직 배지가 없어요. 퀴즈에 답하면 쌓여요.</p>
        )}
      </section>

      <p className="text-center text-xs text-ink-muted">
        로그인 없이 기기 기반으로 저장돼요. 로그인 연동은 다음 업데이트에서.
      </p>
    </div>
  );
}

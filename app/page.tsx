"use client";

import Link from "next/link";
import { useToday } from "@/hooks/useToday";

export default function HomePage() {
  const { data, error } = useToday();

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          캐치캐치<span className="text-brand">리워드</span>
        </h1>
        <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-dark">베타</span>
      </header>

      {/* 지갑 요약 */}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-surface p-4 shadow-sm">
          <p className="text-xs text-ink-muted">내 포인트</p>
          <p className="mt-1 text-2xl font-bold text-point">
            {data ? data.wallet.balance.toLocaleString() : "—"}
            <span className="ml-0.5 text-base">P</span>
          </p>
        </div>
        <div className="rounded-2xl bg-surface p-4 shadow-sm">
          <p className="text-xs text-ink-muted">스탬프</p>
          <p className="mt-1 text-2xl font-bold text-stamp">
            {data ? data.wallet.stamps : "—"}
            <span className="ml-0.5 text-base text-ink-muted">/10</span>
          </p>
        </div>
      </section>

      {/* 오늘의 퀴즈 CTA */}
      <section className="rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-5 text-white shadow-md">
        <p className="text-sm opacity-90">오늘의 취향 퀴즈</p>
        <p className="mt-1 text-2xl font-bold">
          {data ? (data.remaining > 0 ? `${data.remaining}문제 남았어요` : "오늘 퀴즈 완료!") : "불러오는 중…"}
        </p>
        <p className="mt-1 text-sm opacity-90">
          {data
            ? data.remaining > 0
              ? `문제당 10P · ${data.limit}개 다 풀면 스탬프 1개`
              : "내일 다시 새로운 퀴즈가 열려요"
            : " "}
        </p>
        <Link
          href="/quiz"
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-white font-semibold text-brand-dark"
        >
          {data && data.remaining === 0 ? "내 배지 보기" : "퀴즈 풀러 가기"}
        </Link>
      </section>

      {/* 배지 */}
      <section className="rounded-2xl bg-surface p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">내 취향 배지</h2>
          <span className="text-xs text-ink-muted">{data?.badges.length ?? 0}개</span>
        </div>
        {data && data.badges.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {data.badges.map((b) => (
              <li
                key={b.code}
                className="flex items-center gap-1 rounded-full border border-line bg-bg px-3 py-1.5 text-sm"
              >
                <span aria-hidden>{b.emoji}</span>
                {b.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink-muted">퀴즈에 답하면 취향 배지가 쌓여요. 배지가 많을수록 맞춤 보상이 커져요.</p>
        )}
      </section>

      {/* 스탬프 → 룰렛 (2단계) */}
      <section className="rounded-2xl border border-dashed border-line p-4 text-sm text-ink-muted">
        <p className="font-semibold text-ink">스탬프 10개 = 룰렛 1회</p>
        <p className="mt-1">제휴 쇼핑·매장 미션 스탬프와 룰렛은 다음 업데이트에서 열려요.</p>
      </section>

      {error && <p className="text-center text-xs text-red-500">연결 오류: {error}</p>}
    </div>
  );
}

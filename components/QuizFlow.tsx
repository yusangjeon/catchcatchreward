"use client";

import Link from "next/link";
import { useState } from "react";
import { useToday } from "@/hooks/useToday";
import type { AnswerResult, PublicQuiz } from "@/lib/types";

type Phase = { kind: "ask" } | { kind: "result"; result: AnswerResult } | { kind: "busy"; picked: string };

export function QuizFlow() {
  const { data, error, setData, reload } = useToday();
  const [phase, setPhase] = useState<Phase>({ kind: "ask" });
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (error) {
    return (
      <Empty title="연결에 문제가 있어요" body={error}>
        <button onClick={() => void reload()} className="rounded-xl bg-brand px-5 font-semibold text-white">
          다시 시도
        </button>
      </Empty>
    );
  }
  if (!data) return <Skeleton />;

  const quiz = data.next;

  async function pick(q: PublicQuiz, optionId: string) {
    if (phase.kind !== "ask") return;
    setPhase({ kind: "busy", picked: optionId });
    setSubmitError(null);
    try {
      const res = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ quizId: q.id, optionId }),
      });
      const json = (await res.json()) as AnswerResult | { ok: false; message: string };
      if (!res.ok || !json.ok) {
        setSubmitError("message" in json ? json.message : "다시 시도해 주세요");
        setPhase({ kind: "ask" });
        await reload();
        return;
      }
      // 진행도·지갑·배지는 즉시 반영, 다음 문제는 "다음" 버튼에서 교체
      setData((prev) =>
        prev
          ? {
              ...prev,
              answeredToday: json.answeredToday,
              remaining: json.remaining,
              wallet: json.wallet,
              badges: [
                ...prev.badges,
                ...json.newBadges.map((b) => ({ ...b, earnedAt: new Date().toISOString() })),
              ],
            }
          : prev,
      );
      setPhase({ kind: "result", result: json });
    } catch {
      setSubmitError("네트워크 오류예요. 다시 시도해 주세요");
      setPhase({ kind: "ask" });
    }
  }

  function goNext(result: AnswerResult) {
    setData((prev) => (prev ? { ...prev, next: result.next } : prev));
    setPhase({ kind: "ask" });
  }

  return (
    <div className="flex flex-col gap-4">
      <Progress done={data.answeredToday} total={data.limit} balance={data.wallet.balance} />

      {phase.kind === "result" ? (
        <ResultCard result={phase.result} onNext={() => goNext(phase.result)} />
      ) : quiz ? (
        <QuestionCard
          quiz={quiz}
          busyOption={phase.kind === "busy" ? phase.picked : null}
          onPick={(optionId) => void pick(quiz, optionId)}
        />
      ) : (
        <Done remaining={data.remaining} badges={data.badges} stamps={data.wallet.stamps} />
      )}

      {submitError && <p className="text-center text-sm text-red-500">{submitError}</p>}
    </div>
  );
}

function Progress({ done, total, balance }: { done: number; total: number; balance: number }) {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">
          오늘의 퀴즈 <span className="text-brand">{Math.min(done, total)}</span>/{total}
        </span>
        <span className="text-ink-muted">
          보유 <b className="text-point">{balance.toLocaleString()}P</b>
        </span>
      </div>
      <div className="mt-2 flex gap-1" aria-hidden>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i < done ? "bg-brand" : "bg-line"}`} />
        ))}
      </div>
    </div>
  );
}

function QuestionCard({
  quiz,
  busyOption,
  onPick,
}: {
  quiz: PublicQuiz;
  busyOption: string | null;
  onPick: (optionId: string) => void;
}) {
  const twoCols = quiz.kind === 4;
  return (
    <section className="animate-pop rounded-2xl bg-surface p-5 shadow-sm" aria-live="polite">
      <p className="text-xs font-semibold text-brand">취향 퀴즈 · 정답은 없어요</p>
      <h2 className="mt-2 text-xl font-bold leading-snug">{quiz.question}</h2>
      <ul className={`mt-5 grid gap-3 ${twoCols ? "grid-cols-2" : "grid-cols-1"}`}>
        {quiz.options.map((o) => {
          const busy = busyOption !== null;
          const mine = busyOption === o.id;
          return (
            <li key={o.id}>
              <button
                type="button"
                disabled={busy}
                onClick={() => onPick(o.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left transition active:scale-[0.98] disabled:opacity-60 ${
                  mine ? "border-brand bg-brand-soft" : "border-line bg-bg hover:border-brand/50"
                } ${twoCols ? "min-h-24 flex-col items-start justify-center" : ""}`}
              >
                {o.emoji && (
                  <span aria-hidden className="text-2xl leading-none">
                    {o.emoji}
                  </span>
                )}
                <span className="font-semibold">{o.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-center text-xs text-ink-muted">선택하면 바로 10P 적립</p>
    </section>
  );
}

function ResultCard({ result, onNext }: { result: AnswerResult; onNext: () => void }) {
  return (
    <section className="animate-pop rounded-2xl bg-surface p-5 shadow-sm" aria-live="polite">
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold text-point">+{result.pointsEarned}P 적립!</p>
        <span className="text-xs text-ink-muted">다른 사람들의 선택</span>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {result.distribution.map((d) => {
          const mine = d.optionId === result.pickedOptionId;
          return (
            <li key={d.optionId} className="relative overflow-hidden rounded-xl border border-line bg-bg">
              <span
                aria-hidden
                className={`absolute inset-y-0 left-0 ${mine ? "bg-brand/20" : "bg-line/60"}`}
                style={{ width: `${d.percent}%` }}
              />
              <div className="relative flex items-center justify-between px-4 py-3 text-sm">
                <span className={mine ? "font-bold text-brand-dark" : ""}>
                  {d.label}
                  {mine && <span className="ml-1 text-xs">내 선택</span>}
                </span>
                <b>{d.percent}%</b>
              </div>
            </li>
          );
        })}
      </ul>

      {result.newBadges.length > 0 && (
        <div className="mt-4 rounded-xl bg-brand-soft p-3 text-sm">
          <p className="font-semibold text-brand-dark">새 배지 획득!</p>
          <ul className="mt-1 flex flex-wrap gap-2">
            {result.newBadges.map((b) => (
              <li key={b.code} className="rounded-full bg-white px-3 py-1">
                <span aria-hidden>{b.emoji}</span> {b.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.stampEarned && (
        <div className="mt-3 rounded-xl border border-stamp/50 bg-yellow-50 p-3 text-sm">
          <p className="font-semibold text-yellow-800">🎫 스탬프 1개 획득! (보유 {result.wallet.stamps}/10)</p>
          <p className="mt-0.5 text-yellow-700">오늘 퀴즈 세트를 모두 완료했어요.</p>
        </div>
      )}

      <button
        type="button"
        onClick={onNext}
        className="mt-5 h-12 w-full rounded-xl bg-brand font-semibold text-white active:bg-brand-dark"
      >
        {result.next ? `다음 문제 (${result.remaining}개 남음)` : "완료"}
      </button>
    </section>
  );
}

function Done({
  remaining,
  badges,
  stamps,
}: {
  remaining: number;
  badges: { code: string; emoji: string; name: string }[];
  stamps: number;
}) {
  const noMoreQuestions = remaining > 0;
  return (
    <Empty
      title={noMoreQuestions ? "준비된 퀴즈를 다 풀었어요" : "오늘 퀴즈 완료! 🎉"}
      body={
        noMoreQuestions
          ? "새 퀴즈가 곧 추가돼요."
          : `스탬프 ${stamps}/10 · 내일 새로운 퀴즈가 열려요.`
      }
    >
      {badges.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-2">
          {badges.map((b) => (
            <li key={b.code} className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm">
              <span aria-hidden>{b.emoji}</span> {b.name}
            </li>
          ))}
        </ul>
      )}
      <Link href="/" className="inline-flex h-11 items-center rounded-xl bg-brand px-5 font-semibold text-white">
        홈으로
      </Link>
    </Empty>
  );
}

function Empty({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <section className="flex flex-col items-center gap-4 rounded-2xl bg-surface p-8 text-center shadow-sm">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-ink-muted">{body}</p>
      {children}
    </section>
  );
}

function Skeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4" aria-busy>
      <div className="h-16 rounded-2xl bg-line/60" />
      <div className="h-72 rounded-2xl bg-line/60" />
    </div>
  );
}

import "server-only";
import { getRepo } from "@/lib/db";
import { kstDayKey } from "@/lib/time";
import type { AnswerResult, Badge, PublicQuiz, Quiz, TodayQuizPayload } from "@/lib/types";

/** 퀴즈 1문항 응답 포인트. 운영값은 추후 DB(settings)로 이동 */
export const POINTS_PER_ANSWER = 10;
/** 일일 퀴즈 세트 크기 = 스탬프 1개 조건 */
export const DAILY_LIMIT = Math.max(1, Number(process.env.QUIZ_DAILY_LIMIT ?? 5) || 5);

export class QuizError extends Error {
  constructor(
    public code: "LIMIT_REACHED" | "ALREADY_ANSWERED" | "NOT_FOUND" | "BAD_OPTION",
    message: string,
  ) {
    super(message);
  }
}

function toPublic(q: Quiz): PublicQuiz {
  return {
    id: q.id,
    question: q.question,
    kind: q.kind,
    options: q.options.map((o) => ({ id: o.id, label: o.label, emoji: o.emoji })),
  };
}

async function wallet(userId: string) {
  const repo = getRepo();
  const [balance, stamps] = await Promise.all([repo.getBalance(userId), repo.countUnconsumedStamps(userId)]);
  return { balance, stamps };
}

async function earnedBadges(userId: string): Promise<(Badge & { earnedAt: string })[]> {
  const repo = getRepo();
  const [all, mine] = await Promise.all([repo.listBadges(), repo.listUserBadges(userId)]);
  const byCode = new Map(all.map((b) => [b.code, b]));
  return mine
    .map((ub) => {
      const b = byCode.get(ub.badgeCode);
      return b ? { ...b, earnedAt: ub.earnedAt } : null;
    })
    .filter((x): x is Badge & { earnedAt: string } => x !== null);
}

/** 아직 답하지 않은 활성 퀴즈 중 첫 번째 */
async function nextQuiz(userId: string, answeredQuizIds: Set<string>): Promise<Quiz | null> {
  const quizzes = await getRepo().listActiveQuizzes();
  return quizzes.find((q) => !answeredQuizIds.has(q.id)) ?? null;
}

export async function getToday(userId: string): Promise<TodayQuizPayload> {
  const repo = getRepo();
  const dayKey = kstDayKey();
  const responses = await repo.listResponses(userId);
  const answeredToday = responses.filter((r) => r.dayKey === dayKey).length;
  const remaining = Math.max(0, DAILY_LIMIT - answeredToday);
  const answeredIds = new Set(responses.map((r) => r.quizId));
  const [next, w, badges] = await Promise.all([
    remaining > 0 ? nextQuiz(userId, answeredIds) : Promise.resolve(null),
    wallet(userId),
    earnedBadges(userId),
  ]);
  return {
    dayKey,
    limit: DAILY_LIMIT,
    answeredToday,
    remaining,
    next: next ? toPublic(next) : null,
    wallet: w,
    badges,
  };
}

export async function answer(userId: string, quizId: string, optionId: string): Promise<AnswerResult> {
  const repo = getRepo();
  const dayKey = kstDayKey();

  const quiz = await repo.getQuiz(quizId);
  if (!quiz || !quiz.active) throw new QuizError("NOT_FOUND", "퀴즈를 찾을 수 없어요");
  const option = quiz.options.find((o) => o.id === optionId);
  if (!option) throw new QuizError("BAD_OPTION", "선택지가 올바르지 않아요");

  const responses = await repo.listResponses(userId);
  if (responses.some((r) => r.quizId === quizId)) throw new QuizError("ALREADY_ANSWERED", "이미 답한 퀴즈예요");
  const answeredBefore = responses.filter((r) => r.dayKey === dayKey).length;
  if (answeredBefore >= DAILY_LIMIT) throw new QuizError("LIMIT_REACHED", "오늘 퀴즈를 모두 풀었어요");

  // 1) 응답 저장
  const saved = await repo.saveResponse({ userId, quizId, optionId, dayKey });

  // 2) 포인트 적립 (원장)
  await repo.addLedger({
    userId,
    delta: POINTS_PER_ANSWER,
    reason: "quiz_answer",
    refType: "quiz_response",
    refId: saved.id,
  });

  // 3) 태그 누적 → 배지 판정
  const scores = await repo.incrementTagScores(userId, option.tags);
  const [allBadges, mine] = await Promise.all([repo.listBadges(), repo.listUserBadges(userId)]);
  const owned = new Set(mine.map((b) => b.badgeCode));
  const newBadges: Badge[] = [];
  for (const b of allBadges) {
    if (owned.has(b.code)) continue;
    if ((scores[b.rule.tag] ?? 0) >= b.rule.min) {
      await repo.awardBadge(userId, b.code);
      newBadges.push(b);
    }
  }

  // 4) 일일 세트 완료 → 스탬프
  const answeredToday = answeredBefore + 1;
  let stampEarned = false;
  if (answeredToday === DAILY_LIMIT) {
    await repo.addStamp({ userId, sourceType: "mission", sourceId: undefined });
    stampEarned = true;
  }

  // 5) 선택 분포 (자기 응답 포함)
  const counts = await repo.countResponsesByOption(quizId);
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const distribution = quiz.options.map((o) => ({
    optionId: o.id,
    label: o.label,
    percent: Math.round(((counts[o.id] ?? 0) / total) * 100),
  }));

  const remaining = Math.max(0, DAILY_LIMIT - answeredToday);
  const answeredIds = new Set([...responses.map((r) => r.quizId), quizId]);
  const next = remaining > 0 ? await nextQuiz(userId, answeredIds) : null;

  return {
    ok: true,
    pointsEarned: POINTS_PER_ANSWER,
    distribution,
    pickedOptionId: optionId,
    newBadges,
    stampEarned,
    answeredToday,
    remaining,
    wallet: await wallet(userId),
    next: next ? toPublic(next) : null,
  };
}

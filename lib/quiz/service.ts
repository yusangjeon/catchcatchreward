import "server-only";
import { rushEndsAt } from "@/lib/benefit/service";
import { getRepo } from "@/lib/db";
import { kstDayKey } from "@/lib/time";
import { onFirstQuizCompletion } from "@/lib/invite/service";
import { rushSummary } from "@/lib/rush/service";
import type { Badge, HomePayload, Persona, PublicQuestion, Quiz, QuizSet, SetCard, SetPayload, SubmitResult, UserBadge, Wallet } from "@/lib/types";

/** 세트 완료 시 랜덤 보너스 후보(가중치 = 등장 횟수). 운영값은 추후 DB로. */
const RANDOM_BONUS = [0, 0, 0, 10, 10, 20, 30];

/** 꿀 = 하루 퀴즈 세트 참여 횟수(마이비 "보유 꿀 8"). KST 0시에 충전. 광고 시청 충전은 오퍼월 연동 후. */
export const HONEY_PER_DAY = 8;

/** 스타터팩(마이비 isEnableStarterPack · beginnerEndAt = 가입일+3일 23:59 KST): 기간 내 퀴즈 세트 보상 2배 */
export const SIGNUP_POINTS = 300; // 첫 방문 가입 보너스(마이비 welcomePopup 구조)
export const STARTER_DAYS = 3;
export const STARTER_MULTIPLIER = 2;
export function starterOf(createdAt: string): { active: boolean; endsAt: string; multiplier: number } {
  const KST = 9 * 3600_000;
  const k = new Date(new Date(createdAt).getTime() + KST);
  const end = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate() + STARTER_DAYS - 1, 23, 59, 59) - KST;
  return { active: Date.now() <= end, endsAt: new Date(end).toISOString(), multiplier: STARTER_MULTIPLIER };
}

export class QuizError extends Error {
  constructor(
    public code: "NOT_FOUND" | "ALREADY_DONE" | "INCOMPLETE" | "BAD_OPTION" | "NO_HONEY",
    message: string,
  ) {
    super(message);
  }
}

// ───────── 페르소나(취향 태그 → 라벨 + 의사 MBTI) ─────────
const PERSONA_TITLES: [tag: string, title: string, emojis: string][] = [
  ["spicy", "불꽃 미식가", "🌶️🔥👅"],
  ["cafe", "미학적인 스타일리스트", "🤔🖼️👇"],
  ["value", "계산 빠른 실속파", "🧮💸👍"],
  ["fitness", "독립적인 실용주의자", "💪⌚🏃"],
  ["home", "포근한 집콕러", "🛋️📺🌙"],
  ["late_night", "밤을 지배하는 올빼미", "🦉🍜🌃"],
  ["music", "플레이리스트 큐레이터", "🎧🎵✨"],
  ["game", "전략가 게이머", "🎮🧠⚔️"],
  ["travel", "길 위의 탐험가", "✈️🗺️📸"],
  ["pet", "다정한 집사", "🐶🐱💕"],
  ["beauty", "셀프케어 전문가", "💄✨🪞"],
  ["fashion", "트렌드 세터", "👗🧥👟"],
  ["saving", "미래를 사는 투자자", "📈💰🏦"],
  ["dining_out", "맛집 지도 제작자", "🍽️🗺️⭐"],
  ["car", "주말 드라이버", "🚗🌊🛣️"],
  ["health", "밸런스 지킴이", "🥗💧🧘"],
];

function persona(scores: Record<string, number>): Persona {
  const top = PERSONA_TITLES.map(([tag, title, emojis]) => ({ tag, title, emojis, s: scores[tag] ?? 0 }))
    .sort((a, b) => b.s - a.s)[0];
  const g = (a: string, b: string, A: string, B: string) => ((scores[a] ?? 0) >= (scores[b] ?? 0) ? A : B);
  const total = Object.values(scores).reduce((x, y) => x + y, 0);
  if (total === 0) return { title: "탐험을 시작한 뉴비", code: "????", emojis: "🔍✨👋" };
  const code = g("outdoor", "home", "E", "I") + g("challenge", "value", "N", "S") + g("tech", "cafe", "T", "F") + g("saving", "rest", "J", "P");
  return { title: top.title, code, emojis: top.emojis };
}

// ───────── 공용 조립 ─────────
async function wallet(userId: string): Promise<Wallet> {
  const repo = getRepo();
  const [balance, stamps] = await Promise.all([repo.getBalance(userId), repo.countUnconsumedStamps(userId)]);
  return { balance, stamps };
}

function toCard(s: QuizSet, counts: Record<string, number>, doneIds: Set<string>): SetCard {
  return {
    id: s.id,
    title: s.title,
    imageUrl: s.imageUrl,
    rewardPoints: s.rewardPoints,
    capacity: s.capacity,
    participants: s.baseParticipants + (counts[s.id] ?? 0),
    todayOnly: s.todayOnly,
    done: doneIds.has(s.id),
    targeted: !!s.targetBadges?.length,
  };
}

/** 세그먼트 타깃: targetBadges 가 있는 세트는 해당 배지를 가진 유저에게만. 타깃 세트가 앞으로 */
function visibleSets(sets: QuizSet[], mine: UserBadge[]): QuizSet[] {
  const owned = new Set(mine.map((b) => b.badgeCode));
  const ok = sets.filter((s) => !s.targetBadges?.length || s.targetBadges.some((code) => owned.has(code)));
  return [...ok.filter((s) => s.targetBadges?.length), ...ok.filter((s) => !s.targetBadges?.length)];
}

async function setCards(userId: string): Promise<SetCard[]> {
  const repo = getRepo();
  const [sets, counts, done, mine] = await Promise.all([repo.listActiveSets(), repo.countCompletionsBySet(), repo.listCompletions(userId), repo.listUserBadges(userId)]);
  const doneIds = new Set(done.map((d) => d.setId));
  return visibleSets(sets, mine).map((s) => toCard(s, counts, doneIds));
}

function honeyLeft(done: { dayKey: string }[]): number {
  const today = kstDayKey();
  return Math.max(0, HONEY_PER_DAY - done.filter((d) => d.dayKey === today).length);
}

async function earnedBadges(userId: string) {
  const repo = getRepo();
  const [all, mine] = await Promise.all([repo.listBadges(), repo.listUserBadges(userId)]);
  const byCode = new Map(all.map((b) => [b.code, b]));
  return mine.flatMap((ub) => {
    const b = byCode.get(ub.badgeCode);
    return b ? [{ ...b, earnedAt: ub.earnedAt }] : [];
  });
}

function toPublic(q: Quiz): PublicQuestion {
  return { id: q.id, question: q.question, kind: q.kind, options: q.options.map((o) => ({ id: o.id, label: o.label, imageUrl: o.imageUrl })) };
}

// ───────── 조회 ─────────
export async function getHome(userId: string): Promise<HomePayload> {
  const repo = getRepo();
  // 가입 보너스: 원장에 signup 이 없으면 1회 지급
  const ledger = await repo.listLedger(userId, 200);
  const justNow = !ledger.some((e) => e.reason === "signup");
  if (justNow) await repo.addLedger({ userId, delta: SIGNUP_POINTS, reason: "signup", refType: "signup", memo: "가입 보너스" });
  const [sets, w, badges, scores, done, rush, profile] = await Promise.all([setCards(userId), wallet(userId), earnedBadges(userId), repo.getTagScores(userId), repo.listCompletions(userId), rushSummary(userId), repo.findProfile(userId)]);
  const attendedToday = await repo.hasStamp(userId, "attendance", kstDayKey());
  const earned = new Set(badges.map((b) => b.code));
  const badgeProgress = (await repo.listBadges()).map((b) => ({
    code: b.code, name: b.name, emoji: b.emoji, description: b.description, current: Math.min(scores[b.rule.tag] ?? 0, b.rule.min), min: b.rule.min, earned: earned.has(b.code),
  }));
  return {
    wallet: w, honey: honeyLeft(done), honeyMax: HONEY_PER_DAY, rush, persona: persona(scores), badges, sets, rushEndsAt: rushEndsAt(), attendedToday,
    starter: starterOf(profile?.createdAt ?? new Date(0).toISOString()), badgeProgress, welcome: { justNow, points: SIGNUP_POINTS },
    me: { loggedIn: !!profile?.provider, nickname: profile?.nickname, avatarUrl: profile?.avatarUrl, provider: profile?.provider },
  };
}

export async function getSetPayload(userId: string, setId: string): Promise<SetPayload> {
  const repo = getRepo();
  const set = await repo.getSet(setId);
  if (!set || !set.active) throw new QuizError("NOT_FOUND", "퀴즈를 찾을 수 없어요");
  const [quizzes, counts, done, scores] = await Promise.all([
    repo.listQuizzesBySet(setId), repo.countCompletionsBySet(), repo.listCompletions(userId), repo.getTagScores(userId),
  ]);
  const doneIds = new Set(done.map((d) => d.setId));
  return { set: toCard(set, counts, doneIds), persona: persona(scores), questions: quizzes.map(toPublic) };
}

// ───────── 제출 ─────────
export async function submitSet(userId: string, setId: string, answers: { quizId: string; optionId: string }[]): Promise<SubmitResult> {
  const repo = getRepo();
  const dayKey = kstDayKey();

  const set = await repo.getSet(setId);
  if (!set || !set.active) throw new QuizError("NOT_FOUND", "퀴즈를 찾을 수 없어요");
  const done = await repo.listCompletions(userId);
  if (done.some((d) => d.setId === setId)) throw new QuizError("ALREADY_DONE", "이미 참여한 퀴즈예요");
  if (honeyLeft(done) <= 0) throw new QuizError("NO_HONEY", `꿀을 모두 썼어요. 내일 0시에 ${HONEY_PER_DAY}개 충전돼요`);
  if (set.targetBadges?.length) {
    const owned = new Set((await repo.listUserBadges(userId)).map((b) => b.badgeCode));
    if (!set.targetBadges.some((c) => owned.has(c))) throw new QuizError("NOT_FOUND", "참여 대상이 아닌 퀴즈예요");
  }

  const quizzes = await repo.listQuizzesBySet(setId);
  const byQuiz = new Map(answers.map((a) => [a.quizId, a.optionId]));
  const tags: string[] = [];
  for (const q of quizzes) {
    const optionId = byQuiz.get(q.id);
    if (!optionId) throw new QuizError("INCOMPLETE", "모든 질문에 답해 주세요");
    const opt = q.options.find((o) => o.id === optionId);
    if (!opt) throw new QuizError("BAD_OPTION", "선택지가 올바르지 않아요");
    tags.push(...opt.tags);
  }

  // 1) 응답 저장 (이미 답한 문항은 건너뜀)
  const prev = new Set((await repo.listResponses(userId)).map((r) => r.quizId));
  for (const q of quizzes) {
    if (prev.has(q.id)) continue;
    await repo.saveResponse({ userId, quizId: q.id, optionId: byQuiz.get(q.id)!, dayKey });
  }

  // 2) 세트 완료 기록 + 보상 원장 (+ 스타터팩 2배)
  const completion = await repo.saveCompletion({ userId, setId, dayKey });
  await repo.addLedger({ userId, delta: set.rewardPoints, reason: "quiz_answer", refType: "set_completion", refId: completion.id });
  const profile = await repo.findProfile(userId);
  const starter = starterOf(profile?.createdAt ?? new Date(0).toISOString());
  const starterBonus = starter.active ? set.rewardPoints * (STARTER_MULTIPLIER - 1) : 0;
  if (starterBonus > 0) await repo.addLedger({ userId, delta: starterBonus, reason: "quiz_bonus", refType: "set_completion", refId: completion.id, memo: "starter_pack" });
  const bonus = RANDOM_BONUS[Math.floor(Math.random() * RANDOM_BONUS.length)];
  if (bonus > 0) {
    await repo.addLedger({ userId, delta: bonus, reason: "quiz_bonus", refType: "set_completion", refId: completion.id, memo: "random_bonus" });
  }

  // 3) 태그 누적 → 배지 판정
  const scores = await repo.incrementTagScores(userId, tags);
  const [allBadges, mine] = await Promise.all([repo.listBadges(), repo.listUserBadges(userId)]);
  const owned = new Set(mine.map((b) => b.badgeCode));
  const newBadges: Badge[] = [];
  for (const b of allBadges) {
    if (!owned.has(b.code) && (scores[b.rule.tag] ?? 0) >= b.rule.min) {
      await repo.awardBadge(userId, b.code);
      newBadges.push(b);
    }
  }

  // 4) 스탬프 (룰렛 재료) — 세트 1개 = 스탬프 1개
  await repo.addStamp({ userId, sourceType: "quiz_set", sourceId: completion.id });

  // 5) 첫 세트 완료 → 초대한 친구에게 보상
  if (done.length === 0) await onFirstQuizCompletion(userId);

  // 6) 선택 분포(이번 응답 포함)
  const dist = await repo.countResponsesByOption(quizzes.map((q) => q.id));
  const stats = quizzes.map((q) => {
    const counts = dist[q.id] ?? {};
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return { question: q.question, options: q.options.map((o) => ({ label: o.label, pct: Math.round(((counts[o.id] ?? 0) / total) * 100), mine: byQuiz.get(q.id) === o.id })) };
  });

  const cards = await setCards(userId);
  return {
    ok: true,
    points: set.rewardPoints,
    bonus,
    starterBonus,
    wallet: await wallet(userId),
    newBadges,
    recommended: cards.filter((c) => !c.done).slice(0, 4),
    stats,
  };
}

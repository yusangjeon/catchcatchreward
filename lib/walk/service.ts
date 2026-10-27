import "server-only";
import { getRepo } from "@/lib/db";
import { kstDayKey } from "@/lib/time";

/**
 * 만보기 — 걸음 수는 클라이언트(DeviceMotion 보행 감지)가 보고하고 서버는 상한·단조 증가만 보장한다.
 * 보상: 1,000·3,000·5,000·7,000·10,000 걸음 도달 시 각각 10·20·30·50·100P(하루 최대 210P). 원장 reason=game, refType=walk, refId=날짜:목표(1회).
 */
export const WALK_GOALS: { steps: number; points: number }[] = [
  { steps: 1000, points: 10 }, { steps: 3000, points: 20 }, { steps: 5000, points: 30 }, { steps: 7000, points: 50 }, { steps: 10000, points: 100 },
];
export const WALK_MAX_STEPS = 30000;
export const WALK_MAX_DELTA = 6000; // 한 번의 동기화로 늘 수 있는 최대 걸음(비정상 보고 완화)

export class WalkError extends Error {
  constructor(public code: "NOT_REACHED" | "ALREADY_CLAIMED" | "BAD_GOAL", message: string) { super(message); }
}

export interface WalkGoal { steps: number; points: number; reached: boolean; claimed: boolean }
export interface WalkPayload {
  dayKey: string;
  steps: number;
  goals: WalkGoal[];
  todayPoints: number;
  claimable: number; // 받을 수 있는 포인트 합
  nextGoal: WalkGoal | null;
  history: { dayKey: string; steps: number }[]; // 최근 7일(오늘 포함, 오래된 날부터)
  balance: number;
  stamps: number;
}

async function claimedGoals(userId: string, dayKey: string) {
  const plays = await getRepo().listGamePlays(userId);
  return new Set(plays.filter((p) => p.game === "walk" && p.dayKey === dayKey).map((p) => Number(p.result.replace("goal:", ""))));
}

export async function getWalk(userId: string): Promise<WalkPayload> {
  const repo = getRepo();
  const dayKey = kstDayKey();
  const [day, days, claimed, balance, stamps] = await Promise.all([repo.getWalkDay(userId, dayKey), repo.listWalkDays(userId, 7), claimedGoals(userId, dayKey), repo.getBalance(userId), repo.countUnconsumedStamps(userId)]);
  const steps = day?.steps ?? 0;
  const goals = WALK_GOALS.map((g) => ({ ...g, reached: steps >= g.steps, claimed: claimed.has(g.steps) }));
  // 최근 7일: 날짜 축을 채워서(없는 날 0)
  const history: { dayKey: string; steps: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400_000); const k = kstDayKey(d);
    history.push({ dayKey: k, steps: k === dayKey ? steps : (days.find((x) => x.dayKey === k)?.steps ?? 0) });
  }
  return {
    dayKey, steps, goals,
    todayPoints: goals.filter((g) => g.claimed).reduce((s, g) => s + g.points, 0),
    claimable: goals.filter((g) => g.reached && !g.claimed).reduce((s, g) => s + g.points, 0),
    nextGoal: goals.find((g) => !g.reached) ?? null,
    history, balance, stamps,
  };
}

/** 걸음 수 동기화: 서버값보다 큰 값만 반영, 1회 증가분·일일 상한 적용 */
export async function syncSteps(userId: string, reported: number): Promise<WalkPayload> {
  const repo = getRepo();
  const dayKey = kstDayKey();
  const cur = (await repo.getWalkDay(userId, dayKey))?.steps ?? 0;
  const next = Math.min(WALK_MAX_STEPS, Math.max(cur, Math.min(reported, cur + WALK_MAX_DELTA)));
  if (next !== cur) await repo.setWalkSteps(userId, dayKey, next);
  return getWalk(userId);
}

export async function claimGoal(userId: string, goalSteps: number): Promise<{ ok: true; points: number; payload: WalkPayload }> {
  const repo = getRepo();
  const goal = WALK_GOALS.find((g) => g.steps === goalSteps);
  if (!goal) throw new WalkError("BAD_GOAL", "없는 목표예요");
  const dayKey = kstDayKey();
  const steps = (await repo.getWalkDay(userId, dayKey))?.steps ?? 0;
  if (steps < goal.steps) throw new WalkError("NOT_REACHED", `${goal.steps.toLocaleString()}걸음을 아직 못 채웠어요`);
  if ((await claimedGoals(userId, dayKey)).has(goal.steps)) throw new WalkError("ALREADY_CLAIMED", "이미 받은 보상이에요");
  await repo.addGamePlay({ userId, game: "walk", dayKey, result: `goal:${goal.steps}`, points: goal.points });
  await repo.addLedger({ userId, delta: goal.points, reason: "game", refType: "walk", refId: `${dayKey}:${goal.steps}`, memo: `만보기 ${goal.steps.toLocaleString()}걸음 달성` });
  return { ok: true, points: goal.points, payload: await getWalk(userId) };
}

import "server-only";
import { getRepo } from "@/lib/db";
import { kstDayKey } from "@/lib/time";

/**
 * 3일 혜택(마이비 "3일 혜택 · 최대 1,500P"): 가입 후 3일 동안 매일 퀴즈 세트 3개를 완료하면 일차별 보상.
 * 1일차 300P · 2일차 500P · 3일차 700P = 1,500P. 보상은 원장 reason=newbie, refId=day{n} 로 1회만.
 */
const STARTER_DAYS = 3;
export const NEWBIE_GOAL = 3;
export const NEWBIE_REWARDS = [300, 500, 700] as const;

export interface NewbieDay { day: number; dayKey: string; done: number; goal: number; reward: number; completed: boolean; claimed: boolean; claimable: boolean; today: boolean; past: boolean }
export interface NewbiePayload { active: boolean; dayNo: number; days: NewbieDay[]; totalMax: number; claimedTotal: number; claimableCount: number }

function dayKeyOffset(createdAt: string, offset: number) {
  return kstDayKey(new Date(new Date(createdAt).getTime() + offset * 86400_000));
}

export async function getNewbie(userId: string): Promise<NewbiePayload> {
  const repo = getRepo();
  const [profile, done, ledger] = await Promise.all([repo.findProfile(userId), repo.listCompletions(userId), repo.listLedger(userId, 300)]);
  const createdAt = profile?.createdAt ?? new Date().toISOString();
  const today = kstDayKey();
  const claimed = new Set(ledger.filter((e) => e.reason === "newbie").map((e) => e.refId));
  const days: NewbieDay[] = NEWBIE_REWARDS.map((reward, i) => {
    const dayKey = dayKeyOffset(createdAt, i);
    const n = done.filter((d) => d.dayKey === dayKey).length;
    const completed = n >= NEWBIE_GOAL;
    const isClaimed = claimed.has(`day${i + 1}`);
    return { day: i + 1, dayKey, done: Math.min(n, NEWBIE_GOAL), goal: NEWBIE_GOAL, reward, completed, claimed: isClaimed, claimable: completed && !isClaimed, today: dayKey === today, past: dayKey < today };
  });
  const dayNo = Math.min(STARTER_DAYS, Math.max(1, days.findIndex((d) => d.today) + 1 || (days[STARTER_DAYS - 1].past ? STARTER_DAYS : 1)));
  const active = days.some((d) => d.today) || days.some((d) => d.claimable);
  return { active, dayNo, days, totalMax: NEWBIE_REWARDS.reduce((a, b) => a + b, 0), claimedTotal: days.filter((d) => d.claimed).reduce((a, d) => a + d.reward, 0), claimableCount: days.filter((d) => d.claimable).length };
}

export async function claimNewbie(userId: string, day: number): Promise<{ ok: true; points: number; day: number }> {
  const state = await getNewbie(userId);
  const d = state.days.find((x) => x.day === day);
  if (!d) throw new Error("NOT_FOUND");
  if (d.claimed) throw new Error("ALREADY_CLAIMED");
  if (!d.completed) throw new Error("NOT_COMPLETED");
  await getRepo().addLedger({ userId, delta: d.reward, reason: "newbie", refType: "newbie", refId: `day${day}`, memo: `3일 혜택 ${day}일차 보상` });
  return { ok: true, points: d.reward, day };
}

import "server-only";
import { getRepo } from "@/lib/db";
import type { Wallet } from "@/lib/types";

/**
 * 월간 도전 과제(마이비 "월간 도전 과제 — 달성할 때마다 엄청난 혜택"). KST 월 단위로 원천 지표를 집계, 달성 시 보상.
 * 보상은 원장 reason=monthly, refId=`${YYYY-MM}:${key}` 로 1회. 매달 1일 0시 KST 리셋.
 */
export type MonthlyMetric = "quiz" | "attendance" | "game" | "roulette" | "invite" | "store" | "spot";
export interface MonthlyDef { key: string; metric: MonthlyMetric; title: string; desc: string; value: number; reward: number; href: string; emoji: string }
export const MONTHLY_MISSIONS: MonthlyDef[] = [
  { key: "quiz30", metric: "quiz", title: "퀴즈 30개 완료", desc: "이번 달 취향 퀴즈 세트 30개", value: 30, reward: 300, href: "/quiz", emoji: "📝" },
  { key: "attend15", metric: "attendance", title: "출석 15일", desc: "이번 달 15일 이상 출석체크", value: 15, reward: 500, href: "/attendance", emoji: "📅" },
  { key: "game30", metric: "game", title: "미니게임 30회", desc: "틀린그림·2048·복권·가위바위보·카드", value: 30, reward: 300, href: "/games", emoji: "🎮" },
  { key: "spot10", metric: "spot", title: "틀린그림 10레벨 완주", desc: "5개 전부 찾은 레벨 10번", value: 10, reward: 500, href: "/games/spot", emoji: "🔍" },
  { key: "roulette3", metric: "roulette", title: "룰렛 3회", desc: "스탬프 모아 무료 룰렛 3번", value: 3, reward: 200, href: "/roulette", emoji: "🎡" },
  { key: "store3", metric: "store", title: "플레이스 방문 3회", desc: "동네 매장 방문·저장·리뷰", value: 3, reward: 500, href: "/missions", emoji: "📍" },
  { key: "invite3", metric: "invite", title: "친구 3명 초대", desc: "초대 코드로 가입한 친구 3명", value: 3, reward: 1000, href: "/invite", emoji: "🤝" },
];

export interface MonthlyMissionView extends MonthlyDef { current: number; completed: boolean; claimed: boolean }
export interface MonthlyPayload { monthKey: string; monthLabel: string; endsAt: string; missions: MonthlyMissionView[]; claimable: number; totalMax: number; earned: number; wallet: Wallet }

export class MonthlyError extends Error {
  constructor(public code: "NOT_FOUND" | "NOT_COMPLETED" | "ALREADY_CLAIMED", message: string) { super(message); }
}

function monthOf(now = new Date()) {
  const KST = 9 * 3600_000;
  const k = new Date(now.getTime() + KST);
  const y = k.getUTCFullYear(), m = k.getUTCMonth();
  const startsAt = new Date(Date.UTC(y, m, 1) - KST).toISOString();
  const endsAt = new Date(Date.UTC(y, m + 1, 1) - KST - 1).toISOString();
  return { monthKey: `${y}-${String(m + 1).padStart(2, "0")}`, monthLabel: `${m + 1}월`, startsAt, endsAt };
}

async function metrics(userId: string, startsAt: string, endsAt: string): Promise<Record<MonthlyMetric, number>> {
  const repo = getRepo();
  const [stamps, completions, spins, games, store, invites] = await Promise.all([
    repo.listStamps(userId), repo.listCompletions(userId), repo.listSpins(userId), repo.listGamePlays(userId), repo.listStoreCompletions(userId), repo.listReferralsByInviter(userId),
  ]);
  const inRange = (iso: string) => iso >= startsAt && iso <= endsAt;
  const prefix = monthOf(new Date(startsAt)).monthKey;
  return {
    attendance: stamps.filter((s) => s.sourceType === "attendance" && s.sourceId?.startsWith(prefix)).length,
    quiz: completions.filter((c) => inRange(c.completedAt)).length,
    roulette: spins.filter((s) => inRange(s.spunAt)).length,
    game: games.filter((g) => g.game !== "walk" && g.game !== "roulette" && g.game !== "lotto" && inRange(g.createdAt)).length,
    spot: games.filter((g) => g.game === "spot" && inRange(g.createdAt) && /:5\/5:/.test(g.result)).length,
    store: store.filter((c) => inRange(c.completedAt)).length,
    invite: invites.filter((r) => inRange(r.createdAt)).length,
  };
}

export async function getMonthly(userId: string, now = new Date()): Promise<MonthlyPayload> {
  const repo = getRepo();
  const mo = monthOf(now);
  const [m, ledger, balance, stampsLeft] = await Promise.all([metrics(userId, mo.startsAt, mo.endsAt), repo.listLedger(userId, 500), repo.getBalance(userId), repo.countUnconsumedStamps(userId)]);
  const claimed = new Set(ledger.filter((e) => e.reason === "monthly" && e.refId?.startsWith(`${mo.monthKey}:`)).map((e) => e.refId!.split(":")[1]));
  const missions = MONTHLY_MISSIONS.map((d) => ({ ...d, current: Math.min(m[d.metric], d.value), completed: m[d.metric] >= d.value, claimed: claimed.has(d.key) }));
  return {
    monthKey: mo.monthKey, monthLabel: mo.monthLabel, endsAt: mo.endsAt, missions,
    claimable: missions.filter((x) => x.completed && !x.claimed).length,
    totalMax: MONTHLY_MISSIONS.reduce((a, d) => a + d.reward, 0),
    earned: missions.filter((x) => x.claimed).reduce((a, d) => a + d.reward, 0),
    wallet: { balance, stamps: stampsLeft },
  };
}

export async function claimMonthly(userId: string, key: string) {
  const state = await getMonthly(userId);
  const m = state.missions.find((x) => x.key === key);
  if (!m) throw new MonthlyError("NOT_FOUND", "없는 과제예요");
  if (m.claimed) throw new MonthlyError("ALREADY_CLAIMED", "이미 받은 보상이에요");
  if (!m.completed) throw new MonthlyError("NOT_COMPLETED", "아직 달성하지 못했어요");
  await getRepo().addLedger({ userId, delta: m.reward, reason: "monthly", refType: "monthly", refId: `${state.monthKey}:${key}`, memo: `${state.monthLabel} 도전 과제 · ${m.title}` });
  const repo = getRepo();
  return { ok: true as const, points: m.reward, wallet: { balance: await repo.getBalance(userId), stamps: await repo.countUnconsumedStamps(userId) } };
}

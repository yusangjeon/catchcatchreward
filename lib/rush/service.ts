import "server-only";
import { getRepo } from "@/lib/db";
import { kstWeek, type KstWeek } from "@/lib/time";
import type { Wallet } from "@/lib/types";
import type { RushAction, RushClaimResult, RushMissionView, RushPayload } from "./types";

/**
 * 비포인트 러쉬 — 마이비 bpointrush/stamp 구조(주간 스탬프 미션 8개 + 7/8개 달성 보상)를 우리 미션으로 치환.
 * 미션 완료 → "보상받기" → 포인트(원장 rush) + 룰렛 스탬프 1개. 7개/8개 모으면 300P/500P.
 * 진행도는 저장하지 않고 원천 데이터(출석 스탬프·세트 완료·스핀·배지·매장 미션·초대)에서 주 단위로 집계한다.
 */
export const RUSH_TOTAL = 8;
export const STAMP_REWARDS = [
  { key: "stamp7", stamps: 7, points: 300 },
  { key: "stamp8", stamps: 8, points: 500 },
] as const;

type Metric = "attendance" | "quiz" | "roulette" | "game" | "store" | "invite";

interface MissionDef {
  key: string;
  metric: Metric;
  title: string;
  stepTitle: string;
  hintLabel: string;
  value: number;
  reward: number;
  action: RushAction;
  href: string;
  icon: string;
}

/** 마이비 원본 보상값(출석 10/20 · 퀴즈 10/20)을 유지하고, 만보기·로또·설문·게임 자리는 우리 기능(룰렛·배지·매장·초대)으로 */
export const RUSH_MISSIONS: MissionDef[] = [
  { key: "attend1", metric: "attendance", title: "출석체크", stepTitle: "출석체크 완료하기", hintLabel: "출석 일수", value: 1, reward: 10, action: "attendance", href: "/", icon: "/myb/native/qm_attend.png" },
  { key: "attend3", metric: "attendance", title: "출석체크", stepTitle: "출석체크 3일 하기", hintLabel: "출석 일수", value: 3, reward: 20, action: "attendance", href: "/", icon: "/myb/native/qm_attend.png" },
  { key: "quiz5", metric: "quiz", title: "퀴즈", stepTitle: "퀴즈 5개 완료하기", hintLabel: "퀴즈 완료", value: 5, reward: 10, action: "link", href: "/quiz", icon: "/myb/bh/ic_bpointrush_cpx.webp" },
  { key: "quiz10", metric: "quiz", title: "퀴즈", stepTitle: "퀴즈 10개 완료하기", hintLabel: "퀴즈 완료", value: 10, reward: 20, action: "link", href: "/quiz", icon: "/myb/bh/ic_bpointrush_cpx.webp" },
  { key: "roulette1", metric: "roulette", title: "룰렛", stepTitle: "무료 룰렛 돌리기", hintLabel: "룰렛 참여", value: 1, reward: 20, action: "link", href: "/roulette", icon: "/myb/native/qm_minigame.png" },
  { key: "game3", metric: "game", title: "미니게임", stepTitle: "미니게임 3회 하기", hintLabel: "게임 플레이", value: 3, reward: 20, action: "link", href: "/games", icon: "/myb/native/qm_minigame.png" },
  { key: "store1", metric: "store", title: "매장미션", stepTitle: "매장 미션 완료하기", hintLabel: "매장 미션", value: 1, reward: 30, action: "link", href: "/missions", icon: "/myb/bh/ic_bpointrush_cpa.webp" },
  { key: "invite1", metric: "invite", title: "친구초대", stepTitle: "친구 1명 초대하기", hintLabel: "초대 완료", value: 1, reward: 50, action: "link", href: "/invite", icon: "/myb/native/qm_invite.png" },
];

export class RushError extends Error {
  constructor(public code: "NOT_FOUND" | "NOT_COMPLETED" | "ALREADY_CLAIMED", message: string) {
    super(message);
  }
}

async function wallet(userId: string): Promise<Wallet> {
  const repo = getRepo();
  const [balance, stamps] = await Promise.all([repo.getBalance(userId), repo.countUnconsumedStamps(userId)]);
  return { balance, stamps };
}

const inRange = (iso: string, w: KstWeek) => iso >= w.startsAt && iso <= w.endsAt;

/** 이번 주 원천 지표 집계 */
async function metrics(userId: string, w: KstWeek): Promise<Record<Metric, number>> {
  const repo = getRepo();
  const [stamps, completions, spins, games, store, invites] = await Promise.all([
    repo.listStamps(userId), repo.listCompletions(userId), repo.listSpins(userId), repo.listGamePlays(userId), repo.listStoreCompletions(userId), repo.listReferralsByInviter(userId),
  ]);
  const days = new Set(w.dayKeys);
  return {
    attendance: stamps.filter((s) => s.sourceType === "attendance" && s.sourceId && days.has(s.sourceId)).length,
    quiz: completions.filter((c) => inRange(c.completedAt, w)).length,
    roulette: spins.filter((s) => inRange(s.spunAt, w)).length,
    game: games.filter((g) => inRange(g.createdAt, w)).length,
    store: store.filter((c) => inRange(c.completedAt, w)).length,
    invite: invites.filter((r) => inRange(r.createdAt, w)).length,
  };
}

export async function getRush(userId: string, now = new Date()): Promise<RushPayload> {
  const repo = getRepo();
  const w = kstWeek(now);
  const [m, claims, wal] = await Promise.all([metrics(userId, w), repo.listRushClaims(userId, w.weekKey), wallet(userId)]);
  const claimed = new Set(claims.map((c) => c.missionKey));
  const missions: RushMissionView[] = RUSH_MISSIONS.map((d) => {
    const current = Math.min(m[d.metric], d.value);
    return {
      key: d.key, title: d.title, stepTitle: d.stepTitle, hint: `${d.hintLabel} : ${current}/${d.value}`, current, value: d.value, reward: d.reward,
      completed: m[d.metric] >= d.value, claimed: claimed.has(d.key), action: d.action, href: d.href, icon: d.icon,
    };
  });
  const stamps = missions.filter((x) => x.claimed).length;
  const stampRewards = STAMP_REWARDS.map((r) => ({ key: r.key, stamps: r.stamps, points: r.points, reached: stamps >= r.stamps, claimed: claimed.has(r.key) }));
  const claimable = missions.filter((x) => x.completed && !x.claimed).length + stampRewards.filter((r) => r.reached && !r.claimed).length;
  return { weekNo: w.weekNo, weekKey: w.weekKey, startsAt: w.startsAt, endsAt: w.endsAt, stamps, total: RUSH_TOTAL, claimable, stampRewards, missions, wallet: wal };
}

/** 홈 상단용 요약 */
export async function rushSummary(userId: string): Promise<{ stamps: number; total: number; claimable: number }> {
  const r = await getRush(userId);
  return { stamps: r.stamps, total: r.total, claimable: r.claimable };
}

/** 미션 보상 또는 스탬프 보상(stamp7/stamp8) 수령 */
export async function claimRush(userId: string, missionKey: string): Promise<RushClaimResult> {
  const repo = getRepo();
  const r = await getRush(userId);
  const stampReward = r.stampRewards.find((x) => x.key === missionKey);
  const mission = r.missions.find((x) => x.key === missionKey);
  if (!stampReward && !mission) throw new RushError("NOT_FOUND", "미션을 찾을 수 없어요");
  const target = stampReward ? { done: stampReward.reached, claimed: stampReward.claimed, points: stampReward.points } : { done: mission!.completed, claimed: mission!.claimed, points: mission!.reward };
  if (target.claimed) throw new RushError("ALREADY_CLAIMED", "이미 받은 보상이에요");
  if (!target.done) throw new RushError("NOT_COMPLETED", "아직 미션을 완료하지 않았어요");
  await repo.addRushClaim({ userId, weekKey: r.weekKey, missionKey, points: target.points });
  await repo.addLedger({ userId, delta: target.points, reason: "rush", refType: "rush", refId: `${r.weekKey}:${missionKey}`, memo: stampReward ? `러쉬 스탬프 ${stampReward.stamps}개 보상` : `러쉬 미션 · ${mission!.stepTitle}` });
  const stampAdded = !stampReward; // 미션 보상 1건 = 룰렛 스탬프 1개(MVP ③ 미션 → 스탬프)
  if (stampAdded) await repo.addStamp({ userId, sourceType: "rush", sourceId: `${r.weekKey}:${missionKey}` });
  return { ok: true, points: target.points, stampAdded, wallet: await wallet(userId) };
}

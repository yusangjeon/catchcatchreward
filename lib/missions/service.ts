import "server-only";
import { getRepo } from "@/lib/db";
import type { StoreMissionKind, Wallet } from "@/lib/types";
import { getCatchMissions, type CatchSummary } from "./catchmission";

/**
 * 매장 미션(캐치랭크 Axis A 연결) — 매장 인증코드 입력으로 완료.
 * 완료 = 포인트(원장 store_mission) + 룰렛 스탬프 1개 + 러쉬 "매장미션" 지표.
 */
export const KIND_LABEL: Record<StoreMissionKind, string> = { visit: "방문", save: "플레이스 저장", review: "리뷰" };

export class MissionError extends Error {
  constructor(public code: "NOT_FOUND" | "ALREADY_DONE" | "BAD_CODE" | "SOLD_OUT", message: string) {
    super(message);
  }
}

export interface PublicStoreMission {
  id: string;
  storeName: string;
  kind: StoreMissionKind;
  kindLabel: string;
  title: string;
  description?: string;
  rewardPoints: number;
  capacity: number;
  completedCount: number;
  done: boolean;
  soldOut: boolean;
}

export interface MissionsPayload {
  missions: PublicStoreMission[];
  doneCount: number;
  catch: CatchSummary; // 캐치미션(파트너 앱 송출 미션 + 포스트백 적립)
  wallet: Wallet;
}

async function wallet(userId: string): Promise<Wallet> {
  const repo = getRepo();
  const [balance, stamps] = await Promise.all([repo.getBalance(userId), repo.countUnconsumedStamps(userId)]);
  return { balance, stamps };
}

export async function getMissions(userId: string): Promise<MissionsPayload> {
  const repo = getRepo();
  const [list, counts, mine, wal, catchSummary] = await Promise.all([repo.listStoreMissions(true), repo.countStoreCompletionsByMission(), repo.listStoreCompletions(userId), wallet(userId), getCatchMissions(userId)]);
  const doneIds = new Set(mine.map((c) => c.missionId));
  const missions = list.map((m) => {
    const completedCount = counts[m.id] ?? 0;
    return {
      id: m.id, storeName: m.storeName, kind: m.kind, kindLabel: KIND_LABEL[m.kind], title: m.title, description: m.description, rewardPoints: m.rewardPoints,
      capacity: m.capacity, completedCount, done: doneIds.has(m.id), soldOut: m.capacity > 0 && completedCount >= m.capacity,
    };
  });
  return { missions, doneCount: doneIds.size, catch: catchSummary, wallet: wal };
}

export async function completeMission(userId: string, missionId: string, code: string): Promise<{ ok: true; points: number; wallet: Wallet }> {
  const repo = getRepo();
  const m = await repo.getStoreMission(missionId);
  if (!m || !m.active) throw new MissionError("NOT_FOUND", "미션을 찾을 수 없어요");
  const mine = await repo.listStoreCompletions(userId);
  if (mine.some((c) => c.missionId === missionId)) throw new MissionError("ALREADY_DONE", "이미 완료한 미션이에요");
  if (m.capacity > 0 && ((await repo.countStoreCompletionsByMission())[m.id] ?? 0) >= m.capacity) throw new MissionError("SOLD_OUT", "선착순 정원이 마감됐어요");
  if (code.trim() !== m.code) throw new MissionError("BAD_CODE", "인증코드가 올바르지 않아요");
  const c = await repo.addStoreCompletion({ userId, missionId });
  await repo.addLedger({ userId, delta: m.rewardPoints, reason: "store_mission", refType: "store_mission", refId: c.id, memo: `${m.storeName} · ${KIND_LABEL[m.kind]}` });
  await repo.addStamp({ userId, sourceType: "store_mission", sourceId: c.id });
  return { ok: true, points: m.rewardPoints, wallet: await wallet(userId) };
}

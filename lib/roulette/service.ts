import "server-only";
import { randomInt, randomUUID } from "node:crypto";
import { getRepo } from "@/lib/db";
import { kstDayKey } from "@/lib/time";
import type { RoulettePrize, Wallet } from "@/lib/types";
import { STAMPS_PER_SPIN, type AttendanceResult, type PublicPrize, type RoulettePayload, type SpinResult } from "./types";

export class RouletteError extends Error {
  constructor(public code: "NOT_ENOUGH_STAMPS" | "NO_PRIZES", message: string) {
    super(message);
  }
}

const ATTENDANCE_POINTS = 10; // 마이비 러쉬 스탬프 미션 "출석체크 완료하기" 보상 10P 와 동일

async function wallet(userId: string): Promise<Wallet> {
  const repo = getRepo();
  const [balance, stamps] = await Promise.all([repo.getBalance(userId), repo.countUnconsumedStamps(userId)]);
  return { balance, stamps };
}

function toPublic(prizes: RoulettePrize[]): PublicPrize[] {
  const total = prizes.reduce((s, p) => s + p.weight, 0) || 1;
  return prizes.map((p) => ({ id: p.id, name: p.name, kind: p.kind, value: p.value, probability: Math.round((p.weight / total) * 1000) / 10 }));
}

export async function getRoulette(userId: string): Promise<RoulettePayload> {
  const repo = getRepo();
  const [prizes, spins, w] = await Promise.all([repo.listPrizes(), repo.listSpins(userId), wallet(userId)]);
  const byId = new Map(prizes.map((p) => [p.id, p]));
  return {
    stamps: w.stamps,
    needed: STAMPS_PER_SPIN,
    canSpin: w.stamps >= STAMPS_PER_SPIN,
    prizes: toPublic(prizes),
    history: spins.slice(0, 20).map((s) => {
      const p = byId.get(s.prizeId);
      return { id: s.id, prizeName: p?.name ?? "?", kind: p?.kind ?? "none", value: p?.value ?? 0, spunAt: s.spunAt };
    }),
    wallet: w,
  };
}

/**
 * 룰렛 1회: 서버 난수로 가중치 추첨 → 스탬프 10개 소비 → 당첨 기록 → 포인트는 원장 적립.
 * 확률·결과는 서버에서만 결정하고 클라이언트는 연출만 한다.
 */
export async function spin(userId: string): Promise<SpinResult> {
  const repo = getRepo();
  const prizes = await repo.listPrizes();
  if (prizes.length === 0) throw new RouletteError("NO_PRIZES", "경품이 준비되지 않았어요");
  const stamps = await repo.countUnconsumedStamps(userId);
  if (stamps < STAMPS_PER_SPIN) throw new RouletteError("NOT_ENOUGH_STAMPS", `스탬프가 ${STAMPS_PER_SPIN - stamps}개 더 필요해요`);

  const total = prizes.reduce((s, p) => s + p.weight, 0);
  const roll = randomInt(0, total); // [0, total)
  let acc = 0;
  let index = prizes.length - 1;
  for (let i = 0; i < prizes.length; i++) {
    acc += prizes[i].weight;
    if (roll < acc) {
      index = i;
      break;
    }
  }
  const prize = prizes[index];
  const spinId = randomUUID();
  const consumed = await repo.consumeStamps(userId, STAMPS_PER_SPIN, spinId);
  if (consumed < STAMPS_PER_SPIN) throw new RouletteError("NOT_ENOUGH_STAMPS", "스탬프가 부족해요");
  await repo.saveSpin({ id: spinId, userId, prizeId: prize.id, roll: roll / total, spunAt: new Date().toISOString() });
  if (prize.kind === "points" && prize.value > 0) {
    await repo.addLedger({ userId, delta: prize.value, reason: "roulette", refType: "roulette_spin", refId: spinId, memo: prize.name });
  }
  // gifticon 은 1차 수동 처리: 당첨 기록(roulette_spins)만 남기고 운영에서 발송
  return { ok: true, spinId, prize: toPublic(prizes)[index], index, wallet: await wallet(userId) };
}

/** 출석체크: KST 1일 1회. 10P 적립 + 스탬프 1개(sourceType=attendance, sourceId=날짜) */
export async function checkIn(userId: string): Promise<AttendanceResult> {
  const repo = getRepo();
  const day = kstDayKey();
  if (await repo.hasStamp(userId, "attendance", day)) return { ok: true, already: true, points: 0, wallet: await wallet(userId) };
  await repo.addStamp({ userId, sourceType: "attendance", sourceId: day });
  await repo.addLedger({ userId, delta: ATTENDANCE_POINTS, reason: "mission", refType: "attendance", refId: day, memo: "출석체크" });
  return { ok: true, already: false, points: ATTENDANCE_POINTS, wallet: await wallet(userId) };
}

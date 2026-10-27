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
const STREAK_DAYS = 7; // 연속 7일마다 보너스(마이비 dailyAttendanceClaimCreditIndex 구조 참고)
const STREAK_BONUS = 50;

/** 오늘 포함 연속 출석 일수(KST). stamps 의 attendance sourceId = 날짜 키 */
function streakOf(days: Set<string>, today: string): number {
  let n = 0;
  const d = new Date(`${today}T00:00:00Z`);
  while (days.has(d.toISOString().slice(0, 10))) {
    n++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return n;
}

async function wallet(userId: string): Promise<Wallet> {
  const repo = getRepo();
  const [balance, stamps] = await Promise.all([repo.getBalance(userId), repo.countUnconsumedStamps(userId)]);
  return { balance, stamps };
}

/** 오늘(KST) 무료 스핀을 아직 안 썼는지 — 무료 스핀은 game_plays(game=roulette) 에 기록 */
async function hasFreeSpin(userId: string, day = kstDayKey()): Promise<boolean> {
  const plays = await getRepo().listGamePlays(userId);
  return !plays.some((p) => p.game === "roulette" && p.dayKey === day);
}

function toPublic(prizes: RoulettePrize[]): PublicPrize[] {
  const total = prizes.reduce((s, p) => s + p.weight, 0) || 1;
  return prizes.map((p) => ({ id: p.id, name: p.name, kind: p.kind, value: p.value, probability: Math.round((p.weight / total) * 1000) / 10 }));
}

export async function getRoulette(userId: string): Promise<RoulettePayload> {
  const repo = getRepo();
  const [prizes, spins, w, freeSpin] = await Promise.all([repo.listPrizes(), repo.listSpins(userId), wallet(userId), hasFreeSpin(userId)]);
  const byId = new Map(prizes.map((p) => [p.id, p]));
  return {
    stamps: w.stamps,
    needed: STAMPS_PER_SPIN,
    canSpin: freeSpin || w.stamps >= STAMPS_PER_SPIN,
    freeSpin,
    prizes: toPublic(prizes),
    history: spins.slice(0, 20).map((s) => {
      const p = byId.get(s.prizeId);
      return { id: s.id, prizeName: p?.name ?? "?", kind: p?.kind ?? "none", value: p?.value ?? 0, spunAt: s.spunAt };
    }),
    wallet: w,
  };
}

/**
 * 룰렛 1회: 하루 1회 무료, 이후 서버 난수로 가중치 추첨 → 스탬프 10개 소비 → 당첨 기록 → 포인트는 원장 적립.
 * 확률·결과는 서버에서만 결정하고 클라이언트는 연출만 한다.
 */
export async function spin(userId: string): Promise<SpinResult> {
  const repo = getRepo();
  const prizes = await repo.listPrizes();
  if (prizes.length === 0) throw new RouletteError("NO_PRIZES", "경품이 준비되지 않았어요");
  // 하루 1회 무료(KST). 그 뒤로는 스탬프 10개 = 1회.
  const day = kstDayKey();
  const free = await hasFreeSpin(userId, day);
  const stamps = free ? 0 : await repo.countUnconsumedStamps(userId);
  if (!free && stamps < STAMPS_PER_SPIN) throw new RouletteError("NOT_ENOUGH_STAMPS", `스탬프가 ${STAMPS_PER_SPIN - stamps}개 더 필요해요`);

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
  if (!free) {
    const consumed = await repo.consumeStamps(userId, STAMPS_PER_SPIN, spinId);
    if (consumed < STAMPS_PER_SPIN) throw new RouletteError("NOT_ENOUGH_STAMPS", "스탬프가 부족해요");
  }
  await repo.saveSpin({ id: spinId, userId, prizeId: prize.id, roll: roll / total, spunAt: new Date().toISOString() });
  if (free) await repo.addGamePlay({ userId, game: "roulette", dayKey: day, result: `free:${prize.id}`, points: prize.kind === "points" ? prize.value : 0 });
  if (prize.kind === "points" && prize.value > 0) {
    await repo.addLedger({ userId, delta: prize.value, reason: "roulette", refType: "roulette_spin", refId: spinId, memo: prize.name });
  }
  // gifticon 은 1차 수동 처리: 당첨 기록(roulette_spins)만 남기고 운영에서 발송
  return { ok: true, spinId, prize: toPublic(prizes)[index], index, free, wallet: await wallet(userId) };
}

/** 출석체크: KST 1일 1회. 10P 적립 + 스탬프 1개(sourceType=attendance, sourceId=날짜) */
export async function checkIn(userId: string): Promise<AttendanceResult> {
  const repo = getRepo();
  const day = kstDayKey();
  const days = new Set((await repo.listStamps(userId)).filter((s) => s.sourceType === "attendance" && s.sourceId).map((s) => s.sourceId!));
  if (days.has(day)) return { ok: true, already: true, points: 0, streak: streakOf(days, day), bonus: 0, wallet: await wallet(userId) };
  await repo.addStamp({ userId, sourceType: "attendance", sourceId: day });
  await repo.addLedger({ userId, delta: ATTENDANCE_POINTS, reason: "mission", refType: "attendance", refId: day, memo: "출석체크" });
  days.add(day);
  const streak = streakOf(days, day);
  let bonus = 0;
  if (streak % STREAK_DAYS === 0) {
    bonus = STREAK_BONUS;
    await repo.addLedger({ userId, delta: bonus, reason: "mission", refType: "attendance_streak", refId: `${day}:${streak}`, memo: `${streak}일 연속 출석 보너스` });
  }
  return { ok: true, already: false, points: ATTENDANCE_POINTS, streak, bonus, wallet: await wallet(userId) };
}

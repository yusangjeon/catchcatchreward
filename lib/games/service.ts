import "server-only";
import { createHash, randomInt } from "node:crypto";
import { getRepo } from "@/lib/db";
import { kstDayKey } from "@/lib/time";
import type { GamePlay, Wallet } from "@/lib/types";

/**
 * 미니게임 — 리텐션용 일일 콘텐츠. 결과·보상은 서버에서만 결정(원장 reason=game), 플레이는 game_plays 에 기록해 일일 한도·러쉬 집계.
 *  - spot(틀린그림 찾기): 날짜 시드로 모두 같은 퍼즐. 6×8 이모지 보드에서 5칸이 다름. 찾은 개수 × 5P, 전부 찾으면 +10P. 하루 1회
 *  - rsp(가위바위보): 하루 3판. 승 10P · 무 3P · 패 0P
 *  - scratch(복권 긁기): 하루 1장. 0P 50% · 5P 25% · 10P 15% · 50P 8% · 500P 2% (기대값 ≈16.8P)
 */
export const GAME_LIMITS: Record<GamePlay["game"], number> = { spot: 1, rsp: 3, scratch: 1, memory: 1 };
export const SPOT_ROWS = 8;
export const SPOT_COLS = 6;
export const SPOT_DIFFS = 5;
const SPOT_POOL = ["🍎", "🍊", "🍋", "🍇", "🍓", "🥝", "🍑", "🍒", "🥐", "🍩", "🍪", "🧁", "🍦", "🍫", "🍭", "🥨", "🌸", "🌻", "🌵", "🍀", "🐶", "🐱", "🐰", "🐼", "🦊", "🐸", "🐥", "🦋", "⭐", "🌙", "☂️", "🎈", "🎁", "🧸", "🎲", "🚗"];
const SCRATCH_PRIZES: [points: number, weight: number][] = [[0, 50], [5, 25], [10, 15], [50, 8], [500, 2]];

export class GameError extends Error {
  constructor(public code: "LIMIT" | "BAD_INPUT", message: string) {
    super(message);
  }
}

/** mulberry32 — 날짜 시드로 모두 같은 퍼즐 */
function rng(seed: string) {
  let a = createHash("sha256").update(seed).digest().readUInt32LE(0);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function spotPuzzle(dayKey: string) {
  const r = rng(`spot:${dayKey}`);
  const n = SPOT_ROWS * SPOT_COLS;
  const pool = [...SPOT_POOL].sort(() => r() - 0.5).slice(0, 12);
  const left = Array.from({ length: n }, () => pool[Math.floor(r() * pool.length)]);
  const right = [...left];
  const diffs = new Set<number>();
  while (diffs.size < SPOT_DIFFS) diffs.add(Math.floor(r() * n));
  for (const i of diffs) {
    let e = right[i];
    while (e === right[i]) e = pool[Math.floor(r() * pool.length)];
    right[i] = e;
  }
  return { left, right, diffs: [...diffs].sort((a, b) => a - b), rows: SPOT_ROWS, cols: SPOT_COLS };
}

async function wallet(userId: string): Promise<Wallet> {
  const repo = getRepo();
  const [balance, stamps] = await Promise.all([repo.getBalance(userId), repo.countUnconsumedStamps(userId)]);
  return { balance, stamps };
}

export interface GamesPayload {
  dayKey: string;
  games: { key: GamePlay["game"]; title: string; desc: string; icon: string; href: string; limit: number; played: number; left: number; todayPoints: number }[];
  weekPlays: number;
  recent: { game: string; result: string; points: number; createdAt: string }[];
  wallet: Wallet;
}

const META: Record<Exclude<GamePlay["game"], "memory">, { title: string; desc: string; icon: string }> = {
  spot: { title: "틀린그림 찾기", desc: "두 그림에서 다른 5곳을 60초 안에!", icon: "🔍" },
  rsp: { title: "가위바위보", desc: "이기면 10P, 비기면 3P · 하루 3판", icon: "✌️" },
  scratch: { title: "복권 긁기", desc: "하루 한 장, 최대 500P", icon: "🎟️" },
};

export async function getGames(userId: string): Promise<GamesPayload> {
  const repo = getRepo();
  const day = kstDayKey();
  const [plays, w] = await Promise.all([repo.listGamePlays(userId), wallet(userId)]);
  const today = plays.filter((p) => p.dayKey === day);
  const weekStart = new Date(Date.now() - 7 * 86400_000).toISOString();
  const games = (Object.keys(META) as (keyof typeof META)[]).map((key) => {
    const mine = today.filter((p) => p.game === key);
    return { key, ...META[key], href: `/games/${key}`, limit: GAME_LIMITS[key], played: mine.length, left: Math.max(0, GAME_LIMITS[key] - mine.length), todayPoints: mine.reduce((a, p) => a + p.points, 0) };
  });
  return { dayKey: day, games, weekPlays: plays.filter((p) => p.createdAt >= weekStart).length, recent: plays.slice(0, 10).map((p) => ({ game: META[p.game as keyof typeof META]?.title ?? p.game, result: p.result, points: p.points, createdAt: p.createdAt })), wallet: w };
}

async function assertLimit(userId: string, game: GamePlay["game"], day: string) {
  const plays = await getRepo().listGamePlays(userId);
  const n = plays.filter((p) => p.game === game && p.dayKey === day).length;
  if (n >= GAME_LIMITS[game]) throw new GameError("LIMIT", "오늘은 다 했어요. 내일 또 만나요!");
  return n;
}

async function record(userId: string, game: GamePlay["game"], day: string, result: string, points: number, memo: string) {
  const repo = getRepo();
  const play = await repo.addGamePlay({ userId, game, dayKey: day, result, points });
  if (points > 0) await repo.addLedger({ userId, delta: points, reason: "game", refType: "game_play", refId: play.id, memo });
  return play;
}

/** 틀린그림: 공개 퍼즐(정답 제외) */
export async function getSpot(userId: string) {
  const day = kstDayKey();
  const p = spotPuzzle(day);
  const plays = (await getRepo().listGamePlays(userId)).filter((x) => x.game === "spot" && x.dayKey === day);
  return { dayKey: day, left: p.left, right: p.right, rows: p.rows, cols: p.cols, diffs: SPOT_DIFFS, played: plays.length > 0, lastResult: plays[0]?.result, limitSec: 60 };
}

export async function submitSpot(userId: string, picks: number[]) {
  const day = kstDayKey();
  await assertLimit(userId, "spot", day);
  const p = spotPuzzle(day);
  const set = new Set(p.diffs);
  const found = [...new Set(picks)].filter((i) => set.has(i));
  const all = found.length === SPOT_DIFFS;
  const points = found.length * 5 + (all ? 10 : 0);
  await record(userId, "spot", day, `found:${found.length}/${SPOT_DIFFS}`, points, `틀린그림 찾기 ${found.length}/${SPOT_DIFFS}`);
  return { ok: true as const, found: found.length, total: SPOT_DIFFS, diffs: p.diffs, points, wallet: await wallet(userId) };
}

export async function playRsp(userId: string, choice: "rock" | "paper" | "scissors") {
  const day = kstDayKey();
  const n = await assertLimit(userId, "rsp", day);
  const opts = ["rock", "paper", "scissors"] as const;
  const cpu = opts[randomInt(0, 3)];
  const beats: Record<string, string> = { rock: "scissors", paper: "rock", scissors: "paper" };
  const result = cpu === choice ? "draw" : beats[choice] === cpu ? "win" : "lose";
  const points = result === "win" ? 10 : result === "draw" ? 3 : 0;
  await record(userId, "rsp", day, result, points, `가위바위보 ${result === "win" ? "승" : result === "draw" ? "무" : "패"}`);
  return { ok: true as const, choice, cpu, result, points, left: GAME_LIMITS.rsp - n - 1, wallet: await wallet(userId) };
}

export async function playScratch(userId: string) {
  const day = kstDayKey();
  await assertLimit(userId, "scratch", day);
  const total = SCRATCH_PRIZES.reduce((a, [, w]) => a + w, 0);
  let roll = randomInt(0, total);
  let points = 0;
  for (const [p, w] of SCRATCH_PRIZES) {
    if (roll < w) {
      points = p;
      break;
    }
    roll -= w;
  }
  await record(userId, "scratch", day, `prize:${points}`, points, `복권 긁기 ${points}P`);
  return { ok: true as const, points, wallet: await wallet(userId) };
}

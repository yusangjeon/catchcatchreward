import "server-only";
import { createHash, randomInt } from "node:crypto";
import { getRepo } from "@/lib/db";
import { kstDayKey } from "@/lib/time";
import type { GamePlay, Wallet } from "@/lib/types";
import { SCENES } from "./spotScenes";

/**
 * 미니게임 — 리텐션용 일일 콘텐츠. 결과·보상은 서버에서만 결정(원장 reason=game), 플레이는 game_plays 에 기록해 일일 한도·러쉬 집계.
 *  - spot(틀린그림 찾기): 날짜 시드로 모두 같은 퍼즐. 6×8 이모지 보드에서 5칸이 다름. 찾은 개수 × 5P, 전부 찾으면 +10P. 하루 1회
 *  - rsp(가위바위보): 하루 3판. 승 10P · 무 3P · 패 0P
 *  - scratch(복권 긁기): 하루 1장. 0P 50% · 5P 25% · 10P 15% · 50P 8% · 500P 2% (기대값 ≈16.8P)
 *  - memory(카드 뒤집기): 4×4 8쌍. 클라이언트 플레이, 완료 시 시도 수로 보상(≤16회 15P · ≤24회 10P · 그 외 5P). 하루 1회, 서버는 타당성(시도≥8·시간≥5s)만 검사
 */
export const GAME_LIMITS: Record<GamePlay["game"], number> = { spot: 1, rsp: 3, scratch: 1, memory: 1, slide: 1 };
export const SPOT_DIFFS = 5;
export const SPOT_LIMIT_SEC = 75;
const SCRATCH_PRIZES: [points: number, weight: number][] = [[0, 50], [5, 25], [10, 15], [50, 8], [500, 2]];
const SCRATCH_SYMBOL: Record<number, string> = { 5: "🍒", 10: "🔔", 50: "⭐", 500: "💎" };
const SCRATCH_POOL = ["🍀", "🍒", "🔔", "⭐", "💎", "🎁"];
export const RSP_STREAK_BONUS = 20; // 3연승마다

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

/** 날짜 시드 → 장면 1개 + 차이 5개(전원 동일) */
export function spotPuzzle(dayKey: string) {
  const r = rng(`spot:${dayKey}`);
  const scene = SCENES[Math.floor(r() * SCENES.length)];
  const ids = [...scene.diffs.map((d) => d.id)].sort(() => r() - 0.5).slice(0, SPOT_DIFFS);
  return { scene, diffIds: ids };
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

const META: Record<GamePlay["game"], { title: string; desc: string; icon: string }> = {
  spot: { title: "틀린그림 찾기", desc: "두 그림에서 다른 5곳을 75초 안에", icon: "spot" },
  slide: { title: "2048 퍼즐", desc: "타일을 합쳐 2048에 도전, 최대 50P", icon: "slide" },
  scratch: { title: "복권 긁기", desc: "같은 그림 3개면 당첨, 최대 500P", icon: "scratch" },
  rsp: { title: "가위바위보", desc: "승 10P · 3연승 보너스 +20P · 하루 3판", icon: "rsp" },
  memory: { title: "브랜드 짝 맞추기", desc: "8쌍을 적은 시도로 맞추면 최대 15P", icon: "memory" },
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
  return { dayKey: day, games, weekPlays: plays.filter((p) => p.createdAt >= weekStart).length, recent: plays.slice(0, 10).map((p) => ({ game: META[p.game]?.title ?? p.game, result: p.result, points: p.points, createdAt: p.createdAt })), wallet: w };
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

/** 틀린그림: 장면 + 적용된 차이(판정 중심 포함 — 즉시 피드백용, 보상이 작아 허용) */
export async function getSpot(userId: string) {
  const day = kstDayKey();
  const { scene, diffIds } = spotPuzzle(day);
  const plays = (await getRepo().listGamePlays(userId)).filter((x) => x.game === "spot" && x.dayKey === day);
  return { dayKey: day, sceneId: scene.id, sceneName: scene.name, diffIds, total: SPOT_DIFFS, played: plays.length > 0, lastResult: plays[0]?.result, limitSec: SPOT_LIMIT_SEC };
}

export async function submitSpot(userId: string, foundIds: string[]) {
  const day = kstDayKey();
  await assertLimit(userId, "spot", day);
  const { diffIds } = spotPuzzle(day);
  const set = new Set(diffIds);
  const found = [...new Set(foundIds)].filter((i) => set.has(i));
  const all = found.length === SPOT_DIFFS;
  const points = found.length * 5 + (all ? 10 : 0);
  await record(userId, "spot", day, `found:${found.length}/${SPOT_DIFFS}`, points, `틀린그림 찾기 ${found.length}/${SPOT_DIFFS}`);
  return { ok: true as const, found: found.length, total: SPOT_DIFFS, diffIds, points, wallet: await wallet(userId) };
}

/** 2048: 클라이언트 플레이 후 점수 제출(일 1회). 최고 타일/점수 구간별 보상 */
export async function playSlide(userId: string, score: number, maxTile: number) {
  const day = kstDayKey();
  await assertLimit(userId, "slide", day);
  if (score < 0 || score > 200000 || maxTile < 2 || maxTile > 65536) throw new GameError("BAD_INPUT", "기록이 올바르지 않아요");
  const points = maxTile >= 1024 || score >= 10000 ? 50 : maxTile >= 512 || score >= 5000 ? 30 : maxTile >= 256 || score >= 2000 ? 15 : 5;
  await record(userId, "slide", day, `score:${score}/tile:${maxTile}`, points, `2048 ${score}점 (최고 ${maxTile})`);
  return { ok: true as const, score, maxTile, points, wallet: await wallet(userId) };
}

export async function playRsp(userId: string, choice: "rock" | "paper" | "scissors") {
  const day = kstDayKey();
  const n = await assertLimit(userId, "rsp", day);
  const opts = ["rock", "paper", "scissors"] as const;
  const cpu = opts[randomInt(0, 3)];
  const beats: Record<string, string> = { rock: "scissors", paper: "rock", scissors: "paper" };
  const result = cpu === choice ? "draw" : beats[choice] === cpu ? "win" : "lose";
  // 연승: 최근 플레이(최신순)에서 연속 win 수
  const recent = (await getRepo().listGamePlays(userId)).filter((p) => p.game === "rsp");
  let streak = 0;
  for (const p of recent) { if (p.result === "win") streak++; else break; }
  streak = result === "win" ? streak + 1 : 0;
  const bonus = result === "win" && streak % 3 === 0 ? RSP_STREAK_BONUS : 0;
  const points = (result === "win" ? 10 : result === "draw" ? 3 : 0) + bonus;
  await record(userId, "rsp", day, result, points, `가위바위보 ${result === "win" ? "승" : result === "draw" ? "무" : "패"}${bonus ? ` · ${streak}연승 보너스` : ""}`);
  return { ok: true as const, choice, cpu, result, points, bonus, streak, left: GAME_LIMITS.rsp - n - 1, wallet: await wallet(userId) };
}

export const MEMORY_PAIRS = 8;
export async function playMemory(userId: string, moves: number, seconds: number) {
  const day = kstDayKey();
  await assertLimit(userId, "memory", day);
  if (moves < MEMORY_PAIRS || seconds < 5) throw new GameError("BAD_INPUT", "기록이 올바르지 않아요");
  const points = moves <= 16 ? 15 : moves <= 24 ? 10 : 5;
  await record(userId, "memory", day, `moves:${moves}/${seconds}s`, points, `카드 뒤집기 ${moves}회 ${seconds}초`);
  return { ok: true as const, moves, seconds, points, wallet: await wallet(userId) };
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
  // 3×3 그리드: 당첨이면 당첨 심볼 3개, 아니면 어떤 심볼도 3개 미만
  const grid: string[] = Array(9).fill("");
  const sym = SCRATCH_SYMBOL[points];
  const pos = new Set<number>();
  if (sym) while (pos.size < 3) pos.add(randomInt(0, 9));
  for (let i = 0; i < 9; i++) {
    if (pos.has(i)) { grid[i] = sym; continue; }
    const others = SCRATCH_POOL.filter((x) => x !== sym);
    let pick = others[randomInt(0, others.length)];
    while (grid.filter((g) => g === pick).length >= 2) pick = others[randomInt(0, others.length)];
    grid[i] = pick;
  }
  await record(userId, "scratch", day, `prize:${points}`, points, `복권 긁기 ${points}P`);
  return { ok: true as const, points, grid, symbol: sym ?? null, wallet: await wallet(userId) };
}

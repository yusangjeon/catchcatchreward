import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { getRepo } from "@/lib/db";
import { kstDayKey } from "@/lib/time";
import type { GamePlay, Wallet } from "@/lib/types";
import { SPOT_LEVELS, type SpotDiff } from "./spotLevels";

/**
 * 미니게임 — 리텐션용 일일 콘텐츠. 결과·보상은 서버에서만 결정(원장 reason=game), 플레이는 game_plays 에 기록해 일일 한도·러쉬 집계.
 *  - spot(틀린그림 찾기): 일러스트 8장면(public/games/spot). 하루 3레벨, 날짜×회차로 장면 순환. 탭 판정은 서버(좌표 비노출) → 맞춘 차이마다 HMAC 토큰 발급, 제출 시 토큰 검증. 차이당 3P + 전부 찾으면 +10P, 60초
 *  - rsp(가위바위보): 하루 3판. 승 10P · 무 3P · 패 0P
 *  - scratch(복권 긁기): 하루 1장. 0P 50% · 5P 25% · 10P 15% · 50P 8% · 500P 2% (기대값 ≈16.8P)
 *  - memory(카드 뒤집기): 4×4 8쌍. 클라이언트 플레이, 완료 시 시도 수로 보상(≤16회 15P · ≤24회 10P · 그 외 5P). 하루 1회, 서버는 타당성(시도≥8·시간≥5s)만 검사
 */
export type MiniGame = Exclude<GamePlay["game"], "walk" | "roulette" | "lotto">;
export const GAME_LIMITS: Record<MiniGame, number> = { spot: 3, rsp: 3, scratch: 1, memory: 1, slide: 1 };
export const SPOT_DIFFS = 5;
/** 레벨(오늘 n번째 판)별 난이도: 시간은 줄고 감점·보상은 커진다. 장면도 차이 크기(r) 기준으로 쉬운 것부터 배치 */
export const SPOT_STAGES = [
  { limitSec: 60, missPenalty: 5, pointPerDiff: 3, completeBonus: 10, speedBonus: 5 },
  { limitSec: 50, missPenalty: 7, pointPerDiff: 4, completeBonus: 15, speedBonus: 8 },
  { limitSec: 40, missPenalty: 10, pointPerDiff: 5, completeBonus: 20, speedBonus: 12 },
] as const;
export const spotStage = (playIndex: number) => SPOT_STAGES[Math.min(Math.max(0, playIndex), SPOT_STAGES.length - 1)];
export const SPOT_LIMIT_SEC = SPOT_STAGES[0].limitSec;
export const SPOT_POINT_PER_DIFF = SPOT_STAGES[0].pointPerDiff;
export const SPOT_COMPLETE_BONUS = SPOT_STAGES[0].completeBonus;
export const SPOT_SPEED_BONUS = SPOT_STAGES[0].speedBonus;
const SCRATCH_PRIZES: [points: number, weight: number][] = [[0, 50], [5, 25], [10, 15], [50, 8], [500, 2]];
const SCRATCH_SYMBOL: Record<number, string> = { 5: "🍒", 10: "🔔", 50: "⭐", 500: "💎" };
const SCRATCH_POOL = ["🍀", "🍒", "🔔", "⭐", "💎", "🎁"];
export const RSP_STREAK_BONUS = 20; // 3연승마다

export class GameError extends Error {
  constructor(public code: "LIMIT" | "BAD_INPUT", message: string) {
    super(message);
  }
}

async function wallet(userId: string): Promise<Wallet> {
  const repo = getRepo();
  const [balance, stamps] = await Promise.all([repo.getBalance(userId), repo.countUnconsumedStamps(userId)]);
  return { balance, stamps };
}

export interface GamesPayload {
  dayKey: string;
  games: { key: MiniGame; title: string; desc: string; icon: string; href: string; limit: number; played: number; left: number; todayPoints: number }[];
  weekPlays: number;
  recent: { game: string; result: string; points: number; createdAt: string }[];
  wallet: Wallet;
}

const META: Record<MiniGame, { title: string; desc: string; icon: string }> = {
  spot: { title: "틀린그림 찾기", desc: "실사·일러스트 16장면, 하루 3레벨 · 최대 75P", icon: "spot" },
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
  return { dayKey: day, games, weekPlays: plays.filter((p) => p.createdAt >= weekStart).length, recent: plays.filter((p): p is GamePlay & { game: MiniGame | "walk" } => p.game !== "roulette" && p.game !== "lotto").slice(0, 10).map((p) => ({ game: p.game === "walk" ? "만보기" : META[p.game].title, result: p.result, points: p.points, createdAt: p.createdAt })), wallet: w };
}

async function assertLimit(userId: string, game: MiniGame, day: string) {
  const plays = await getRepo().listGamePlays(userId);
  const n = plays.filter((p) => p.game === game && p.dayKey === day).length;
  if (n >= GAME_LIMITS[game]) throw new GameError("LIMIT", "오늘은 다 했어요. 내일 또 만나요!");
  return n;
}

async function record(userId: string, game: MiniGame, day: string, result: string, points: number, memo: string) {
  const repo = getRepo();
  const play = await repo.addGamePlay({ userId, game, dayKey: day, result, points });
  if (points > 0) await repo.addLedger({ userId, delta: points, reason: "game", refType: "game_play", refId: play.id, memo });
  return play;
}

/** 날짜 × 회차 → 레벨. 하루 3레벨이 모두 다른 장면이 되도록 순환 */
/** 장면 난이도 = 차이 영역 평균 반지름(작을수록 어려움). 오늘의 3장을 쉬운 순으로 정렬해 LV1→3 */
const easeOf = (l: { diffs: { r: number }[] }) => l.diffs.reduce((a, d) => a + d.r, 0) / Math.max(1, l.diffs.length);
export function spotLevelFor(dayKey: string, playIndex: number) {
  const dayNo = Math.floor(Date.parse(`${dayKey}T00:00:00Z`) / 86400_000);
  const n = SPOT_LEVELS.length;
  const picks = Array.from({ length: GAME_LIMITS.spot }, (_, i) => SPOT_LEVELS[(dayNo * GAME_LIMITS.spot + i) % n]);
  picks.sort((a, b) => easeOf(b) - easeOf(a));
  return picks[Math.min(Math.max(0, playIndex), picks.length - 1)];
}

const spotSecret = () => process.env.ADMIN_KEY || process.env.SPOT_SECRET || "ccr-dev-spot-secret";
function spotToken(userId: string, day: string, levelId: string, diffId: string) {
  return createHmac("sha256", spotSecret()).update(`${userId}|${day}|${levelId}|${diffId}`).digest("base64url");
}
function verifyToken(userId: string, day: string, levelId: string, diffId: string, token: string) {
  const expect = Buffer.from(spotToken(userId, day, levelId, diffId));
  const got = Buffer.from(token);
  return expect.length === got.length && timingSafeEqual(expect, got);
}
/** 제출된 토큰 중 유효한 차이 id 집합 */
function validFound(userId: string, day: string, levelId: string, tokens: { id: string; token: string }[]) {
  const level = SPOT_LEVELS.find((l) => l.id === levelId);
  if (!level) return new Set<string>();
  const ok = new Set<string>();
  for (const t of tokens) if (level.diffs.some((d) => d.id === t.id) && verifyToken(userId, day, levelId, t.id, t.token)) ok.add(t.id);
  return ok;
}

export interface SpotPayload {
  dayKey: string; level: { id: string; name: string; a: string; b: string; index: number }; total: number; limitSec: number; missPenalty: number;
  played: number; left: number; pointPerDiff: number; completeBonus: number; speedBonus: number; recent: { level: string; result: string; points: number }[];
  today: { index: number; id: string; name: string; thumb: string; status: "done" | "current" | "locked"; found?: number; points?: number; seconds?: number }[];
  todayPoints: number;
  best: { seconds: number; level: string } | null; // 완주 최단 기록(전체 기간)
}
/** 오늘 다음 레벨(좌표는 내려주지 않음) */
export async function getSpot(userId: string): Promise<SpotPayload> {
  const day = kstDayKey();
  const plays = (await getRepo().listGamePlays(userId)).filter((x) => x.game === "spot" && x.dayKey === day);
  const idx = Math.min(plays.length, GAME_LIMITS.spot - 1);
  const lv = spotLevelFor(day, idx);
  const ordered = [...plays].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const today = Array.from({ length: GAME_LIMITS.spot }, (_, i) => {
    const l = spotLevelFor(day, i);
    const p = ordered[i];
    const m = p ? /^[^:]+:(\d+)\/\d+:(\d+)s/.exec(p.result) : null;
    return { index: i, id: l.id, name: l.name, thumb: `/games/spot/${l.id}/a.webp`, status: p ? ("done" as const) : i === plays.length ? ("current" as const) : ("locked" as const), found: m ? Number(m[1]) : undefined, points: p?.points, seconds: m ? Number(m[2]) : undefined };
  });
  const all = (await getRepo().listGamePlays(userId)).filter((x) => x.game === "spot");
  let best: { seconds: number; level: string } | null = null;
  for (const p of all) {
    const m = /^([^:]+):(\d+)\/(\d+):(\d+)s/.exec(p.result);
    if (m && m[2] === m[3] && (!best || Number(m[4]) < best.seconds)) best = { seconds: Number(m[4]), level: SPOT_LEVELS.find((x) => x.id === m[1])?.name ?? m[1] };
  }
  return {
    today, todayPoints: plays.reduce((a, p) => a + p.points, 0), best,
    dayKey: day, level: { id: lv.id, name: lv.name, a: `/games/spot/${lv.id}/a.webp`, b: `/games/spot/${lv.id}/b.webp`, index: idx },
    total: SPOT_DIFFS, limitSec: spotStage(idx).limitSec, missPenalty: spotStage(idx).missPenalty, played: plays.length, left: Math.max(0, GAME_LIMITS.spot - plays.length),
    pointPerDiff: spotStage(idx).pointPerDiff, completeBonus: spotStage(idx).completeBonus, speedBonus: spotStage(idx).speedBonus,
    recent: plays.map((p) => ({ level: p.result.split(":")[0], result: p.result, points: p.points })),
  };
}

async function assertSpotLevel(userId: string, levelId: string) {
  const day = kstDayKey();
  const n = await assertLimit(userId, "spot", day);
  const lv = spotLevelFor(day, n);
  if (lv.id !== levelId) throw new GameError("BAD_INPUT", "레벨이 바뀌었어요. 다시 불러올게요");
  return { day, lv, n };
}

/** 탭 판정: 정규화 좌표(0~1). 맞으면 원 + 토큰. 이미 찾은 차이는 무시 */
export async function spotTap(userId: string, levelId: string, x: number, y: number, tokens: { id: string; token: string }[]) {
  const { day, lv } = await assertSpotLevel(userId, levelId);
  const found = validFound(userId, day, levelId, tokens);
  const hit = lv.diffs.find((d) => !found.has(d.id) && Math.hypot((d.x - x) * 1024, (d.y - y) * 688) <= d.r * 1024 + 14);
  if (!hit) return { hit: false as const, found: found.size, total: SPOT_DIFFS };
  return { hit: true as const, diff: circle(hit), token: spotToken(userId, day, levelId, hit.id), found: found.size + 1, total: SPOT_DIFFS };
}

/** 힌트: 아직 못 찾은 차이 하나의 위치(토큰은 안 줌 — 직접 탭해야 적립) */
export async function spotHint(userId: string, levelId: string, tokens: { id: string; token: string }[]) {
  const { day, lv } = await assertSpotLevel(userId, levelId);
  const found = validFound(userId, day, levelId, tokens);
  const rest = lv.diffs.filter((d) => !found.has(d.id));
  if (!rest.length) return { diff: null };
  return { diff: circle(rest[randomInt(0, rest.length)]) };
}

const circle = (d: SpotDiff) => ({ id: d.id, x: d.x, y: d.y, r: d.r });

export async function submitSpot(userId: string, levelId: string, tokens: { id: string; token: string }[], seconds: number) {
  const { day, lv } = await assertSpotLevel(userId, levelId);
  const found = validFound(userId, day, levelId, tokens);
  const all = found.size === SPOT_DIFFS;
  const before = (await getRepo().listGamePlays(userId)).filter((x) => x.game === "spot" && x.dayKey === day).length;
  const st = spotStage(before);
  const speedBonus = all && seconds <= st.limitSec / 2 ? st.speedBonus : 0;
  const points = found.size * st.pointPerDiff + (all ? st.completeBonus : 0) + speedBonus;
  await record(userId, "spot", day, `${lv.id}:${found.size}/${SPOT_DIFFS}:${Math.max(0, Math.round(seconds))}s`, points, `틀린그림 ${lv.name} ${found.size}/${SPOT_DIFFS}${speedBonus ? " · 스피드" : ""}`);
  const plays = (await getRepo().listGamePlays(userId)).filter((x) => x.game === "spot" && x.dayKey === day);
  return { ok: true as const, found: found.size, total: SPOT_DIFFS, points, all, speedBonus, seconds: Math.round(seconds), missed: lv.diffs.filter((d) => !found.has(d.id)).map(circle), left: Math.max(0, GAME_LIMITS.spot - plays.length), wallet: await wallet(userId) };
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

import "server-only";
import { createHmac } from "node:crypto";
import { getRepo } from "@/lib/db";
import { kstDayKey } from "@/lib/time";
import type { GamePlay, Wallet } from "@/lib/types";

/**
 * 캐치 로또(마이비 비플레이 로또 대응) — 매일 1~45 중 6개 응모, 21:00 KST 추첨.
 *  - 하루 무료 1장 + 추가 응모 2장(장당 LOTTO_TICKET_COST P, 원장 game 음수).
 *  - 추첨 번호 = HMAC(secret, dayKey) 시드 → 21:00 이후에만 공개. 서버만 계산하므로 미리 알 수 없다.
 *  - 당첨 = 맞춘 개수 3/4/5/6 → 30/300/3,000/50,000P. 수령은 `game_plays(game=lotto, result=claim:<day>)` 1회 + 원장 game/lotto.
 */
export const LOTTO_MAX = 45;
export const LOTTO_PICK = 6;
export const LOTTO_FREE = 1;
export const LOTTO_EXTRA = 2;
export const LOTTO_TICKET_COST = 50;
export const LOTTO_DRAW_HOUR = 21; // KST
export const LOTTO_PRIZES: Record<number, number> = { 3: 30, 4: 300, 5: 3000, 6: 50000 };

export class LottoError extends Error {
  constructor(public code: "BAD_PICK" | "LIMIT" | "NO_POINTS" | "NOT_DRAWN" | "ALREADY" | "NO_TICKET", message: string) { super(message); }
}

function secret() { return process.env.LOTTO_SECRET || process.env.ADMIN_KEY || "dev-lotto"; }
/** 날짜별 추첨 번호(결정적). */
export function drawNumbers(dayKey: string): number[] {
  const h = createHmac("sha256", secret()).update(`lotto:${dayKey}`).digest();
  const pool = Array.from({ length: LOTTO_MAX }, (_, i) => i + 1);
  const out: number[] = [];
  for (let i = 0; i < LOTTO_PICK; i++) {
    const r = (h[i * 2] << 8 | h[i * 2 + 1]) % pool.length;
    out.push(pool.splice(r, 1)[0]);
  }
  return out.sort((a, b) => a - b);
}
/** 해당 날짜의 추첨 시각(KST 21:00) ISO */
export function drawAt(dayKey: string): string { return new Date(`${dayKey}T${String(LOTTO_DRAW_HOUR).padStart(2, "0")}:00:00+09:00`).toISOString(); }
export function isDrawn(dayKey: string, now = Date.now()): boolean { return now >= new Date(drawAt(dayKey)).getTime(); }

const parsePick = (r: string) => r.startsWith("pick:") ? r.slice(5).split(",").map(Number) : null;
const matchCount = (pick: number[], drawn: number[]) => pick.filter((n) => drawn.includes(n)).length;

export interface LottoTicket { numbers: number[]; matches: number | null; prize: number }
export interface LottoDay { dayKey: string; drawAt: string; drawn: number[] | null; tickets: LottoTicket[]; totalPrize: number; claimed: boolean; claimable: boolean }
export interface LottoPayload {
  today: LottoDay;
  history: LottoDay[]; // 어제~7일 전
  ticketsLeft: number; freeLeft: number; extraLeft: number; ticketCost: number; prizes: Record<number, number>;
  pending: LottoDay | null; // 추첨 끝났는데 아직 안 받은 가장 최근 날
  wallet: Wallet;
}

async function wallet(userId: string): Promise<Wallet> {
  const repo = getRepo();
  const [balance, stamps] = await Promise.all([repo.getBalance(userId), repo.countUnconsumedStamps(userId)]);
  return { balance, stamps };
}
function dayOf(plays: GamePlay[], dayKey: string, now: number): LottoDay {
  const picks = plays.filter((p) => p.game === "lotto" && p.dayKey === dayKey && p.result.startsWith("pick:")).map((p) => parsePick(p.result)!);
  const drawn = isDrawn(dayKey, now) ? drawNumbers(dayKey) : null;
  const tickets = picks.map((n) => { const m = drawn ? matchCount(n, drawn) : null; return { numbers: n, matches: m, prize: m !== null ? (LOTTO_PRIZES[m] ?? 0) : 0 }; });
  const totalPrize = tickets.reduce((s, t) => s + t.prize, 0);
  const claimed = plays.some((p) => p.game === "lotto" && p.result === `claim:${dayKey}`);
  return { dayKey, drawAt: drawAt(dayKey), drawn, tickets, totalPrize, claimed, claimable: !!drawn && totalPrize > 0 && !claimed };
}
function shiftDay(dayKey: string, d: number): string { const t = new Date(`${dayKey}T00:00:00+09:00`); t.setUTCDate(t.getUTCDate() + d); return kstDayKey(t); }

export async function getLotto(userId: string, now = Date.now()): Promise<LottoPayload> {
  const repo = getRepo();
  const [plays, w] = await Promise.all([repo.listGamePlays(userId), wallet(userId)]);
  const today = kstDayKey(new Date(now));
  const td = dayOf(plays, today, now);
  const history = Array.from({ length: 7 }, (_, i) => dayOf(plays, shiftDay(today, -(i + 1)), now)).filter((d) => d.tickets.length > 0);
  const used = td.tickets.length;
  const pending = [td, ...history].find((d) => d.claimable) ?? null;
  return { today: td, history, ticketsLeft: Math.max(0, LOTTO_FREE + LOTTO_EXTRA - used), freeLeft: Math.max(0, LOTTO_FREE - used), extraLeft: Math.max(0, LOTTO_EXTRA - Math.max(0, used - LOTTO_FREE)), ticketCost: LOTTO_TICKET_COST, prizes: LOTTO_PRIZES, pending, wallet: w };
}

export async function pickLotto(userId: string, numbers: number[]): Promise<LottoPayload> {
  const repo = getRepo();
  const uniq = Array.from(new Set(numbers)).sort((a, b) => a - b);
  if (uniq.length !== LOTTO_PICK || uniq.some((n) => !Number.isInteger(n) || n < 1 || n > LOTTO_MAX)) throw new LottoError("BAD_PICK", `1~${LOTTO_MAX} 중 서로 다른 ${LOTTO_PICK}개를 골라 주세요`);
  const now = Date.now(); const today = kstDayKey(new Date(now));
  if (isDrawn(today, now)) throw new LottoError("LIMIT", "오늘 추첨이 끝났어요. 내일 다시 응모해 주세요");
  const plays = await repo.listGamePlays(userId);
  const used = plays.filter((p) => p.game === "lotto" && p.dayKey === today && p.result.startsWith("pick:")).length;
  if (used >= LOTTO_FREE + LOTTO_EXTRA) throw new LottoError("LIMIT", "오늘 응모는 다 했어요");
  if (used >= LOTTO_FREE) {
    const bal = await repo.getBalance(userId);
    if (bal < LOTTO_TICKET_COST) throw new LottoError("NO_POINTS", `추가 응모는 ${LOTTO_TICKET_COST}P가 필요해요`);
    await repo.addLedger({ userId, delta: -LOTTO_TICKET_COST, reason: "game", refType: "lotto_ticket", refId: `${today}:${used + 1}`, memo: "캐치 로또 추가 응모" });
  }
  await repo.addGamePlay({ userId, game: "lotto", dayKey: today, result: `pick:${uniq.join(",")}`, points: 0 });
  return getLotto(userId, now);
}

export async function claimLotto(userId: string, dayKey: string): Promise<{ ok: true; points: number; matchesBest: number; payload: LottoPayload }> {
  const repo = getRepo();
  const now = Date.now();
  const plays = await repo.listGamePlays(userId);
  const d = dayOf(plays, dayKey, now);
  if (!d.drawn) throw new LottoError("NOT_DRAWN", "아직 추첨 전이에요");
  if (d.claimed) throw new LottoError("ALREADY", "이미 받은 당첨금이에요");
  if (d.totalPrize <= 0) throw new LottoError("NO_TICKET", "당첨된 응모가 없어요");
  await repo.addGamePlay({ userId, game: "lotto", dayKey, result: `claim:${dayKey}`, points: d.totalPrize });
  await repo.addLedger({ userId, delta: d.totalPrize, reason: "game", refType: "lotto", refId: dayKey, memo: `캐치 로또 당첨(${Math.max(...d.tickets.map((t) => t.matches ?? 0))}개 일치)` });
  return { ok: true, points: d.totalPrize, matchesBest: Math.max(...d.tickets.map((t) => t.matches ?? 0)), payload: await getLotto(userId, now) };
}

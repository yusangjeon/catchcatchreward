import "server-only";
import { rushEndsAt } from "@/lib/benefit/service";
import { GAMES } from "@/lib/benefit/seed";
import notices from "./notices.json";
import type { GameDetailPayload, GamePayload } from "./types";

/** 게임적립(adjoe.myb.im 브릿지) — 캡처 당시 game-recommendations/game-bridge 와 동일 게임 목록 */
export function getGame(): GamePayload {
  const [hero, ...games] = GAMES;
  return { rushEndsAt: rushEndsAt(), lottoPrize: "500만P", hero, games: games.slice(0, 4), gameKing: { level: 1, progress: 0, goal: 3, maxReward: 1500 } };
}

export function getGameDetail(id: string): GameDetailPayload | null {
  const game = GAMES.find((g) => g.id === id);
  if (!game) return null;
  return { game, daysLeft: 90, rushEndsAt: rushEndsAt(), notices };
}

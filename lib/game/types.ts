import type { BenefitGame } from "@/lib/benefit/types";

export interface GamePayload {
  rushEndsAt: string;
  lottoPrize: string; // "500만P"
  hero: BenefitGame;
  games: BenefitGame[];
  gameKing: { level: number; progress: number; goal: number; maxReward: number };
}
export interface GameDetailPayload {
  game: BenefitGame;
  daysLeft: number;
  rushEndsAt: string;
  notices: string[];
}

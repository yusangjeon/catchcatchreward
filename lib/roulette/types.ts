import type { PrizeKind, Wallet } from "@/lib/types";

export const STAMPS_PER_SPIN = 10;

/** 클라이언트에 내려주는 경품(가중치 대신 확률 %만 노출) */
export interface PublicPrize {
  id: string;
  name: string;
  kind: PrizeKind;
  value: number;
  probability: number; // %
}

export interface RoulettePayload {
  stamps: number;
  needed: number;
  canSpin: boolean;
  prizes: PublicPrize[];
  history: { id: string; prizeName: string; kind: PrizeKind; value: number; spunAt: string }[];
  wallet: Wallet;
}

export interface SpinResult {
  ok: true;
  spinId: string;
  prize: PublicPrize;
  index: number; // 룰렛 조각 인덱스(prizes 배열 순서)
  wallet: Wallet;
}

export interface AttendanceResult {
  ok: true;
  already: boolean;
  points: number;
  wallet: Wallet;
}

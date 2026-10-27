import type { Wallet } from "@/lib/types";

export type RushAction = "attendance" | "link";

export interface RushMissionView {
  key: string;
  title: string; // 스탬프 라벨(출석체크·퀴즈·룰렛…)
  stepTitle: string; // "출석체크 완료하기"
  hint: string; // "출석 일수 : 1/3"
  current: number;
  value: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
  action: RushAction;
  href: string;
  icon: string;
}

export interface RushPayload {
  weekNo: number;
  weekKey: string;
  startsAt: string;
  endsAt: string;
  stamps: number; // 이번 주 보상 수령(=스탬프) 수
  total: number;
  claimable: number; // 지금 받을 수 있는 보상 수(미션 + 스탬프 보상)
  stampRewards: { key: string; stamps: number; points: number; reached: boolean; claimed: boolean }[];
  missions: RushMissionView[];
  wallet: Wallet;
}

export interface RushClaimResult {
  ok: true;
  points: number;
  stampAdded: boolean;
  wallet: Wallet;
}

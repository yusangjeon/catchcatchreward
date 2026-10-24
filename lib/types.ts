export type QuizKind = 2 | 4;

export interface QuizOption {
  id: string;
  label: string;
  emoji?: string;
  tags: string[];
  sort: number;
}

export interface Quiz {
  id: string;
  question: string;
  kind: QuizKind;
  active: boolean;
  sort: number;
  options: QuizOption[];
}

export interface QuizResponse {
  id: string;
  userId: string;
  quizId: string;
  optionId: string;
  dayKey: string; // YYYY-MM-DD (KST)
  answeredAt: string;
}

export interface Badge {
  code: string;
  name: string;
  description: string;
  emoji: string;
  rule: { tag: string; min: number };
}

export interface UserBadge {
  badgeCode: string;
  earnedAt: string;
}

export type LedgerReason =
  | "quiz_answer"
  | "mission"
  | "roulette"
  | "redeem"
  | "admin_adjust"
  | "referral";

export interface LedgerEntry {
  id: string;
  userId: string;
  delta: number;
  reason: LedgerReason;
  refType?: string;
  refId?: string;
  memo?: string;
  createdAt: string;
}

export interface Stamp {
  id: string;
  userId: string;
  sourceType: string;
  sourceId?: string;
  createdAt: string;
  consumedBy?: string;
}

export interface Profile {
  id: string;
  anonKey: string;
  nickname?: string;
  createdAt: string;
}

/** 클라이언트에 내려주는 퀴즈(태그는 숨긴다 — 선택 유도 방지) */
export interface PublicQuiz {
  id: string;
  question: string;
  kind: QuizKind;
  options: { id: string; label: string; emoji?: string }[];
}

export interface TodayQuizPayload {
  dayKey: string;
  limit: number;
  answeredToday: number;
  remaining: number;
  next: PublicQuiz | null;
  wallet: { balance: number; stamps: number };
  badges: (Badge & { earnedAt: string })[];
}

export interface AnswerResult {
  ok: true;
  pointsEarned: number;
  /** 각 선택지별 응답 비율(%). 자신의 응답 포함 */
  distribution: { optionId: string; label: string; percent: number }[];
  pickedOptionId: string;
  newBadges: Badge[];
  stampEarned: boolean;
  answeredToday: number;
  remaining: number;
  wallet: { balance: number; stamps: number };
  next: PublicQuiz | null;
}

export type QuizKind = 2 | 4;

export interface QuizOption {
  id: string;
  label: string;
  imageUrl?: string; // 이미지형 선택지(2지선다 카드)
  tags: string[];
  sort: number;
}

export interface Quiz {
  id: string;
  setId: string;
  question: string;
  kind: QuizKind;
  active: boolean;
  sort: number;
  options: QuizOption[];
}

/** 마이비식 "퀴즈 1개" = 여러 문항 세트. 홈/퀴즈 탭 카드 단위 */
export interface QuizSet {
  id: string;
  title: string;
  imageUrl: string;
  rewardPoints: number;
  capacity: number; // "N명 가능"
  baseParticipants: number; // 표시용 기본 참여 수(실 완료 수와 합산)
  todayOnly: boolean; // "오늘만" 배지
  active: boolean;
  sort: number;
}

export interface QuizResponse {
  id: string;
  userId: string;
  quizId: string;
  optionId: string;
  dayKey: string;
  answeredAt: string;
}

export interface SetCompletion {
  id: string;
  userId: string;
  setId: string;
  dayKey: string;
  completedAt: string;
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

export type LedgerReason = "quiz_answer" | "quiz_bonus" | "mission" | "roulette" | "redeem" | "admin_adjust" | "referral";

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

// ───────── 클라이언트 페이로드 ─────────

export interface SetCard {
  id: string;
  title: string;
  imageUrl: string;
  rewardPoints: number;
  capacity: number;
  participants: number;
  todayOnly: boolean;
  done: boolean;
}

export interface Persona {
  title: string; // 예: 미학적인 스타일리스트
  code: string; // 예: INTJ
  emojis: string; // 예: 🤔🖼️👇
}

export interface Wallet {
  balance: number; // B포인트
  stamps: number;
}

export interface HomePayload {
  wallet: Wallet;
  honey: number; // 보유 꿀 = 오늘 남은 세트 수
  persona: Persona;
  badges: (Badge & { earnedAt: string })[];
  sets: SetCard[];
}

export interface PublicQuestion {
  id: string;
  question: string;
  kind: QuizKind;
  options: { id: string; label: string; imageUrl?: string }[];
}

export interface SetPayload {
  set: SetCard;
  persona: Persona;
  questions: PublicQuestion[];
}

export interface SubmitResult {
  ok: true;
  points: number;
  bonus: number;
  wallet: Wallet;
  newBadges: Badge[];
  recommended: SetCard[];
}

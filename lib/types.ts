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
  /** 타깃 배지 코드. 비어 있으면 전체 노출, 있으면 해당 배지를 하나라도 가진 유저에게만 노출(세그먼트 타깃) */
  targetBadges?: string[];
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

export type LedgerReason = "signup" | "newbie" | "monthly" | "game" | "quiz_answer" | "quiz_bonus" | "mission" | "rush" | "store_mission" | "roulette" | "redeem" | "admin_adjust" | "referral";

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
  sourceType: string; // quiz_set | attendance | mission | admin
  sourceId?: string;
  createdAt: string;
  consumedBy?: string; // roulette_spins.id
}

export type PrizeKind = "points" | "gifticon" | "none";

export interface RoulettePrize {
  id: string;
  name: string;
  kind: PrizeKind;
  value: number; // points: 포인트 / gifticon: 액면가(원) / none: 0
  weight: number; // 확률 가중치(서버 전용)
  active: boolean;
  sort: number;
}

export interface RouletteSpin {
  id: string;
  userId: string;
  prizeId: string;
  roll: number;
  spunAt: string;
}

export interface Profile {
  id: string;
  anonKey: string;
  nickname?: string;
  inviteCode: string; // 친구초대 코드(8자)
  referredBy?: string; // 나를 초대한 유저 id
  provider?: "kakao" | "dev"; // 소셜 로그인 연결(없으면 익명)
  providerId?: string;
  avatarUrl?: string;
  createdAt: string;
}

/** 친구초대: 초대받은 유저가 코드 입력 시 생성, 첫 퀴즈 완료 시 초대한 유저에게 보상 */
export interface Referral {
  id: string;
  inviterId: string;
  inviteeId: string;
  code: string;
  status: "pending" | "rewarded";
  createdAt: string;
  rewardedAt?: string;
}

export type StoreMissionKind = "visit" | "save" | "review";

/** 캐치랭크 매장 미션(방문·저장·리뷰). 매장에서 받은 인증코드 입력으로 완료 */
export interface StoreMission {
  id: string;
  storeName: string;
  kind: StoreMissionKind;
  title: string;
  description?: string;
  rewardPoints: number;
  code: string; // 인증코드(서버 전용, 클라이언트 비노출)
  capacity: number; // 선착순 정원(0 = 무제한)
  active: boolean;
  sort: number;
  createdAt: string;
}

export interface StoreMissionCompletion {
  id: string;
  userId: string;
  missionId: string;
  completedAt: string;
}

/** 미니게임 플레이 기록(일일 한도·러쉬 집계·보상 감사) */
export interface GamePlay {
  id: string;
  userId: string;
  game: "spot" | "rsp" | "scratch" | "memory" | "slide" | "walk" | "roulette"; // roulette = 일일 무료 스핀 사용 기록
  dayKey: string;
  result: string; // win/draw/lose, found:5, prize:50 …
  points: number;
  createdAt: string;
}

/** 주간 러쉬 미션/스탬프 보상 수령 기록 */
export interface RushClaim {
  id: string;
  userId: string;
  weekKey: string; // 주 시작(일요일) KST 날짜
  missionKey: string; // 미션 키 또는 stamp7/stamp8
  points: number;
  claimedAt: string;
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
  targeted: boolean; // 내 배지 세그먼트 타깃 세트
}

export interface Persona {
  title: string; // 예: 미학적인 스타일리스트
  code: string; // 예: INTJ
  emojis: string; // 예: 🤔🖼️👇 (레거시, 화면 미사용)
  tag: string; // 최상위 취향 태그(아이콘 매핑용). 응답 없으면 ""
}

export interface Wallet {
  balance: number; // 포인트
  stamps: number;
}

export interface HomePayload {
  wallet: Wallet;
  honey: number; // 보유 꿀 = 오늘 남은 퀴즈 횟수(일 HONEY_PER_DAY, KST 0시 충전)
  honeyMax: number;
  honeyTopups: { used: number; max: number }; // 광고 시청 충전
  rush: { stamps: number; total: number; claimable: number }; // 주간 러쉬 요약
  persona: Persona;
  badges: (Badge & { earnedAt: string })[];
  sets: SetCard[];
  rushEndsAt: string; // 캐치 러쉬 주차 종료(ISO)
  attendedToday: boolean; // 오늘 출석체크 완료 여부(KST)
  rouletteFree: boolean; // 오늘 무료 룰렛 남음(KST 일 1회)
  starter: { active: boolean; endsAt: string; multiplier: number }; // 뉴비 스타터팩(가입 후 3일 퀴즈 보상 2배)
  badgeProgress: { code: string; name: string; emoji: string; description: string; current: number; min: number; earned: boolean }[]; // 전체 배지 진행도
  welcome: { justNow: boolean; points: number }; // 가입 보너스(첫 방문 시 1회)
  me: { loggedIn: boolean; nickname?: string; avatarUrl?: string; provider?: string }; // 로그인 상태
  newbie: { active: boolean; dayNo: number; doneToday: number; goal: number; claimableCount: number; totalMax: number }; // 3일 혜택 요약
  todayDone: number; // 오늘 완료한 퀴즈 세트 수(KST)
  tier: TierSummary; // 내 등급(누적 적립·월간 과제 달성으로 승격)
  recentWins: RecentWin[]; // 실시간 적립 티커(다른 유저, 마스킹)
}

export interface TierSummary {
  name: string; // 베이직 · 플러스 · 골드 · 다이아
  next: string | null;
  earned: number; // 누적 적립(양수 합)
  needEarned: number;
  monthlyDone: number; // 월간 도전 과제 달성 횟수(누적)
  needMonthly: number;
  perk: string; // 다음 등급 혜택 문구
}

export interface RecentWin {
  who: string; // "AB12****"
  text: string; // "퀴즈 풀고"
  points: number;
  at: string;
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
  starterBonus: number; // 스타터팩 추가분
  wallet: Wallet;
  newBadges: Badge[];
  recommended: SetCard[];
  /** 문항별 선택 분포(이번 응답 포함) — "다른 사람들은?" */
  stats: { question: string; options: { label: string; pct: number; mine: boolean }[] }[];
}

export type RedemptionStatus = "requested" | "processing" | "done" | "rejected";

export interface Redemption {
  id: string;
  userId: string;
  kind: string; // 상품 코드(lib/exchange/products.ts)
  amountPoints: number;
  status: RedemptionStatus;
  requestedAt: string;
  processedAt?: string;
  memo?: string;
}

export interface AdminStats {
  users: number;
  completionsToday: number;
  pointsIssued: number; // 원장 + 합
  pointsRedeemed: number; // 원장 - 합(절대값)
  freeStamps: number;
  spins: number;
  redemptionsRequested: number;
  storeCompletions: number;
  referrals: number;
  rushClaims: number;
}

export interface PushSubscriptionRow {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
  createdAt: string;
}

/** 만보기 — 유저·날짜별 걸음 수(클라이언트 보고값, 상한 적용) */
export interface WalkDay {
  userId: string;
  dayKey: string;
  steps: number;
  updatedAt: string;
}

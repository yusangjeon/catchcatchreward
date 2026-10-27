import type {
  AdminStats,
  Badge,
  LedgerEntry,
  Profile,
  Quiz,
  QuizResponse,
  QuizSet,
  Redemption,
  Referral,
  RoulettePrize,
  RouletteSpin,
  RushClaim,
  SetCompletion,
  Stamp,
  StoreMission,
  StoreMissionCompletion,
  UserBadge,
} from "@/lib/types";

/**
 * 저장소 인터페이스. 구현체: memory(기본, env 없음) / supabase(SUPABASE_URL 설정 시).
 * 비즈니스 규칙(보상, 배지 판정, 페르소나)은 lib/quiz/service.ts 에 둔다. 여기는 CRUD만.
 */
export interface Repo {
  getOrCreateProfile(anonKey: string): Promise<Profile>;

  listActiveSets(): Promise<QuizSet[]>;
  getSet(setId: string): Promise<QuizSet | null>;
  listQuizzesBySet(setId: string): Promise<Quiz[]>;

  listResponses(userId: string): Promise<QuizResponse[]>;
  saveResponse(input: Omit<QuizResponse, "id" | "answeredAt">): Promise<QuizResponse>;

  listCompletions(userId: string): Promise<SetCompletion[]>;
  saveCompletion(input: Omit<SetCompletion, "id" | "completedAt">): Promise<SetCompletion>;
  /** setId → 완료 수 */
  countCompletionsBySet(): Promise<Record<string, number>>;

  incrementTagScores(userId: string, tags: string[]): Promise<Record<string, number>>;
  getTagScores(userId: string): Promise<Record<string, number>>;

  listBadges(): Promise<Badge[]>;
  listUserBadges(userId: string): Promise<UserBadge[]>;
  awardBadge(userId: string, badgeCode: string): Promise<void>;

  addLedger(entry: Omit<LedgerEntry, "id" | "createdAt">): Promise<LedgerEntry>;
  getBalance(userId: string): Promise<number>;

  addStamp(input: Omit<Stamp, "id" | "createdAt" | "consumedBy">): Promise<Stamp>;
  countUnconsumedStamps(userId: string): Promise<number>;
  /** 같은 출처(sourceType+sourceId)의 스탬프가 이미 있는지 — 출석체크 1일 1회 등 */
  hasStamp(userId: string, sourceType: string, sourceId: string): Promise<boolean>;
  /** 미사용 스탬프 n개를 spinId 로 소비. 실제 소비한 개수 반환(부족하면 0, 소비 안 함) */
  consumeStamps(userId: string, n: number, spinId: string): Promise<number>;

  listPrizes(): Promise<RoulettePrize[]>;
  saveSpin(input: RouletteSpin): Promise<RouletteSpin>;
  listSpins(userId: string): Promise<RouletteSpin[]>;
  /** 유저의 전체 스탬프(소비 포함) — 주간 출석 일수 집계용 */
  listStamps(userId: string): Promise<Stamp[]>;

  // ── 친구초대 ──
  findProfileByInviteCode(code: string): Promise<Profile | null>;
  setReferredBy(userId: string, inviterId: string): Promise<void>;
  addReferral(input: Omit<Referral, "id" | "createdAt" | "status" | "rewardedAt">): Promise<Referral>;
  findReferralByInvitee(inviteeId: string): Promise<Referral | null>;
  listReferralsByInviter(inviterId: string): Promise<Referral[]>;
  markReferralRewarded(id: string): Promise<void>;

  // ── 매장 미션 ──
  listStoreMissions(activeOnly: boolean): Promise<StoreMission[]>;
  getStoreMission(id: string): Promise<StoreMission | null>;
  createStoreMission(m: StoreMission): Promise<StoreMission>;
  updateStoreMission(id: string, patch: Partial<Pick<StoreMission, "active" | "rewardPoints" | "capacity" | "code" | "sort">>): Promise<StoreMission | null>;
  listStoreCompletions(userId?: string): Promise<StoreMissionCompletion[]>;
  addStoreCompletion(input: Omit<StoreMissionCompletion, "id" | "completedAt">): Promise<StoreMissionCompletion>;
  countStoreCompletionsByMission(): Promise<Record<string, number>>;

  // ── 주간 러쉬 ──
  listRushClaims(userId: string, weekKey: string): Promise<RushClaim[]>;
  addRushClaim(input: Omit<RushClaim, "id" | "claimedAt">): Promise<RushClaim>;

  listLedger(userId: string, limit?: number): Promise<LedgerEntry[]>;

  addRedemption(input: Omit<Redemption, "id" | "requestedAt" | "status">): Promise<Redemption>;
  listRedemptions(userId?: string): Promise<Redemption[]>;
  updateRedemption(id: string, patch: { status: Redemption["status"]; memo?: string }): Promise<Redemption | null>;

  // ── 관리자 ──
  listAllSets(): Promise<QuizSet[]>;
  createSet(set: QuizSet): Promise<QuizSet>;
  updateSet(id: string, patch: Partial<Pick<QuizSet, "title" | "imageUrl" | "rewardPoints" | "capacity" | "todayOnly" | "active" | "sort" | "targetBadges">>): Promise<QuizSet | null>;
  createQuiz(quiz: Quiz): Promise<Quiz>;
  listAllPrizes(): Promise<RoulettePrize[]>;
  createPrize(p: RoulettePrize): Promise<RoulettePrize>;
  updatePrize(id: string, patch: Partial<Pick<RoulettePrize, "name" | "kind" | "value" | "weight" | "active" | "sort">>): Promise<RoulettePrize | null>;
  countUserBadges(): Promise<Record<string, number>>;
  findProfile(idOrAnonKey: string): Promise<Profile | null>;
  adminStats(dayKey: string): Promise<AdminStats>;
}

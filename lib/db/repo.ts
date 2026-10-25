import type {
  Badge,
  LedgerEntry,
  Profile,
  Quiz,
  QuizResponse,
  QuizSet,
  RoulettePrize,
  RouletteSpin,
  SetCompletion,
  Stamp,
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
}

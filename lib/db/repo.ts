import type {
  Badge,
  LedgerEntry,
  Profile,
  Quiz,
  QuizResponse,
  QuizSet,
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
}

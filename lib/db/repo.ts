import type {
  Badge,
  LedgerEntry,
  Profile,
  Quiz,
  QuizResponse,
  Stamp,
  UserBadge,
} from "@/lib/types";

/**
 * 저장소 인터페이스. 구현체: memory(기본, env 없음) / supabase(SUPABASE_URL 설정 시).
 * 비즈니스 규칙(일일 한도, 포인트, 배지 판정)은 lib/quiz/service.ts 에 둔다. 여기는 CRUD만.
 */
export interface Repo {
  getOrCreateProfile(anonKey: string): Promise<Profile>;

  listActiveQuizzes(): Promise<Quiz[]>;
  getQuiz(quizId: string): Promise<Quiz | null>;

  listResponses(userId: string): Promise<QuizResponse[]>;
  saveResponse(input: Omit<QuizResponse, "id" | "answeredAt">): Promise<QuizResponse>;
  /** quizId 의 선택지별 응답 수 */
  countResponsesByOption(quizId: string): Promise<Record<string, number>>;

  /** 태그 점수를 +1 씩 누적하고, 갱신 후 유저의 전체 태그 점수를 반환 */
  incrementTagScores(userId: string, tags: string[]): Promise<Record<string, number>>;

  listBadges(): Promise<Badge[]>;
  listUserBadges(userId: string): Promise<UserBadge[]>;
  awardBadge(userId: string, badgeCode: string): Promise<void>;

  addLedger(entry: Omit<LedgerEntry, "id" | "createdAt">): Promise<LedgerEntry>;
  getBalance(userId: string): Promise<number>;

  addStamp(input: Omit<Stamp, "id" | "createdAt" | "consumedBy">): Promise<Stamp>;
  countUnconsumedStamps(userId: string): Promise<number>;
}

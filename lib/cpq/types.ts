export interface CpqItem {
  id: string;
  idx: number;
  type: string; // 퀴즈맞히기 · 선착순퀴즈 · 플레이스저장 · 플레이스검색 · 퀴즈맞추기
  title: string;
  description: string;
  participation: string;
  price: number;
  icon: string;
  provider: string;
}
export interface CpqPayload {
  totalAvailable: number; // "13,663 P 적립 가능"
  balance: number;
  mission: { level: number; currentCount: number; goalCount: number; maxRewardAmount: number };
  filters: string[];
  list: CpqItem[];
}

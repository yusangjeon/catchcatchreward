import "server-only";
import { getRepo } from "@/lib/db";
import { CPQ_LIST, CPQ_MISSION } from "./seed";
import type { CpqPayload } from "./types";

const FILTERS = ["전체", "퀴즈맞히기", "선착순퀴즈", "플레이스저장", "플레이스검색"];

export async function getCpq(userId: string): Promise<CpqPayload> {
  const balance = await getRepo().getBalance(userId);
  // 캡처 당시 "13,663 P 적립 가능" = 서버 집계 표시값
  return { totalAvailable: 13663, balance, mission: CPQ_MISSION, filters: FILTERS, list: CPQ_LIST };
}

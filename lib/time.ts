/** KST(Asia/Seoul) 기준 날짜 키 YYYY-MM-DD. 일일 한도·미션 집계 기준. */
export function kstDayKey(date: Date = new Date()): string {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

/** 러쉬 1주차 시작(일요일 00:00 KST). 마이비는 일요일 00:00 ~ 토요일 23:59 KST 단위로 "N주차"를 센다. */
export const RUSH_EPOCH_KST = "2026-10-25";

export interface KstWeek {
  weekKey: string; // 주 시작(일요일) YYYY-MM-DD
  weekNo: number; // N주차
  startsAt: string; // ISO(UTC)
  endsAt: string; // ISO(UTC) — 토요일 23:59:59 KST
  dayKeys: string[]; // 일~토 7일
}

/** KST 기준 현재 주(일~토) */
export function kstWeek(now: Date = new Date()): KstWeek {
  const KST = 9 * 3600_000;
  const kst = new Date(now.getTime() + KST);
  const sundayUtcMs = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate() - kst.getUTCDay());
  const startsAt = new Date(sundayUtcMs - KST);
  const endsAt = new Date(sundayUtcMs - KST + 7 * 86400_000 - 1000);
  const weekKey = new Date(sundayUtcMs).toISOString().slice(0, 10);
  const epoch = Date.UTC(+RUSH_EPOCH_KST.slice(0, 4), +RUSH_EPOCH_KST.slice(5, 7) - 1, +RUSH_EPOCH_KST.slice(8, 10));
  const weekNo = Math.floor((sundayUtcMs - epoch) / (7 * 86400_000)) + 1;
  const dayKeys = Array.from({ length: 7 }, (_, i) => new Date(sundayUtcMs + i * 86400_000).toISOString().slice(0, 10));
  return { weekKey, weekNo, startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString(), dayKeys };
}

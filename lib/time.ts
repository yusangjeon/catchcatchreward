/** KST(Asia/Seoul) 기준 날짜 키 YYYY-MM-DD. 일일 한도·미션 집계 기준. */
export function kstDayKey(date: Date = new Date()): string {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

import "server-only";
import { getRepo } from "@/lib/db";
import { getRush } from "@/lib/rush/service";
import { getMonthly } from "@/lib/monthly/service";
import { getNewbie } from "@/lib/quiz/newbie";
import { HONEY_PER_DAY } from "@/lib/quiz/service";
import { kstDayKey } from "@/lib/time";
import { PRODUCTS } from "@/lib/exchange/products";

export interface Notice {
  id: string;
  kind: "rush" | "redeem" | "referral" | "honey" | "attendance" | "roulette";
  title: string;
  body: string;
  href: string;
  at: string;
  action?: boolean; // 지금 할 일(빨간 점)
}

/** 알림 — 별도 저장 없이 현재 상태에서 파생(받을 보상·교환 진행·초대 보상·출석·룰렛) */
export async function getNotifications(userId: string): Promise<{ notices: Notice[]; actionCount: number }> {
  const repo = getRepo();
  const today = kstDayKey();
  const [rush, redemptions, invites, attended, stamps, completions, monthly, newbie, plays] = await Promise.all([
    getRush(userId), repo.listRedemptions(userId), repo.listReferralsByInviter(userId), repo.hasStamp(userId, "attendance", today), repo.countUnconsumedStamps(userId), repo.listCompletions(userId), getMonthly(userId), getNewbie(userId), repo.listGamePlays(userId),
  ]);
  const freeSpin = !plays.some((p) => p.game === "roulette" && p.dayKey === today);
  const now = new Date().toISOString();
  const notices: Notice[] = [];
  if (rush.claimable > 0) notices.push({ id: "rush", kind: "rush", title: `러쉬 보상 ${rush.claimable}개를 받을 수 있어요`, body: "캐치 러쉬에서 보상받기를 누르면 포인트와 스탬프가 적립돼요", href: "/rush", at: now, action: true });
  if (monthly.claimable > 0) notices.push({ id: "monthly", kind: "rush", title: `월간 도전 과제 보상 ${monthly.claimable}개 달성!`, body: "월간 도전 과제에서 받기를 누르면 포인트가 적립돼요", href: "/monthly", at: now, action: true });
  if (newbie.claimableCount > 0) notices.push({ id: "newbie", kind: "rush", title: "3일 혜택 보상을 받을 수 있어요", body: "오늘 퀴즈 3개를 다 풀었어요. 일차 보상을 받아가세요", href: "/newbie", at: now, action: true });
  if (!attended) notices.push({ id: "attend", kind: "attendance", title: "오늘 출석체크를 아직 안 했어요", body: "10P와 스탬프 1개를 바로 받을 수 있어요", href: "/", at: now, action: true });
  if (freeSpin) notices.push({ id: "roulette", kind: "roulette", title: "오늘의 무료 룰렛이 기다려요", body: "하루 1회 무료 · 최대 1,000P와 편의점 상품권", href: "/roulette", at: now, action: true });
  else if (stamps >= 10) notices.push({ id: "roulette", kind: "roulette", title: "룰렛을 한 번 더 돌릴 수 있어요", body: `스탬프 ${stamps}개 보유 · 10개마다 1회`, href: "/roulette", at: now, action: true });
  const honey = Math.max(0, HONEY_PER_DAY - completions.filter((c) => c.dayKey === today).length);
  if (honey > 0) notices.push({ id: "honey", kind: "honey", title: `오늘 풀 수 있는 퀴즈가 ${honey}개 남았어요`, body: "취향 퀴즈 풀고 포인트·배지 받기", href: "/quiz", at: now });
  for (const r of redemptions.slice(0, 5)) {
    const name = PRODUCTS.find((p) => p.kind === r.kind)?.name ?? r.kind;
    const label = { requested: "신청 접수", processing: "처리 중", done: "발송 완료", rejected: "반려·환불" }[r.status];
    notices.push({ id: `rd-${r.id}`, kind: "redeem", title: `${name} 교환 ${label}`, body: `${r.amountPoints.toLocaleString("ko-KR")}P · ${r.status === "done" ? "기프티콘을 확인하세요" : r.status === "rejected" ? "포인트가 환불됐어요" : "영업일 기준 1~3일 걸려요"}`, href: "/exchange", at: r.processedAt ?? r.requestedAt });
  }
  for (const r of invites.filter((x) => x.status === "rewarded").slice(0, 5)) {
    notices.push({ id: `rf-${r.id}`, kind: "referral", title: "초대한 친구가 첫 퀴즈를 완료했어요", body: "친구초대 보상 500P가 적립됐어요", href: "/invite", at: r.rewardedAt ?? r.createdAt });
  }
  return { notices, actionCount: notices.filter((n) => n.action).length };
}

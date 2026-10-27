import "server-only";
import { getRepo } from "@/lib/db";
import { kstWeek } from "@/lib/time";
import { GAMES, SURVEYS } from "./seed";
import type { BenefitPayload, EarnMenu } from "./types";

/** 마이비 benefit-hub "내게 맞는 적립 찾기"(BEGINNER 세그먼트) 4항목 */
const EARN_MENU: EarnMenu[] = [
  { key: "bpr", icon: "/myb/bh/ic_beginner_earn_bpr.webp", title: "비포인트 러쉬", sub: "가장 많은 혜택은 여기서!", hot: true, href: "/rush" },
  { key: "cpa", icon: "/myb/bh/ic_beginner_earn_cpa.webp", title: "초간단적립", sub: "1분만에 미션하고 적립받기", href: "/cpq" },
  { key: "cps", icon: "/myb/bh/ic_beginner_earn_cps.webp", title: "쇼핑적립", sub: "하던 쇼핑하고 웰컴 2배 혜택 받기", href: "/shop" },
  { key: "store", icon: "/myb/bh/ic_bpointrush_cpa.webp", title: "플레이스 방문하기", sub: "동네 매장 방문·저장·리뷰하고 적립", href: "/missions" },
];

/** 비포인트 러쉬 주차 종료 = 이번 주 토요일 23:59:59 KST (캡처 bpointrush/stamp endDate 2026-10-25T14:59Z 규칙) */
export function rushEndsAt(now = new Date()): string {
  return kstWeek(now).endsAt;
}

export async function getBenefit(userId: string): Promise<BenefitPayload> {
  const repo = getRepo();
  const balance = await repo.getBalance(userId);
  const [hero, ...games] = GAMES;
  return { balance, rushEndsAt: rushEndsAt(), hero, games, surveys: SURVEYS, earnMenu: EARN_MENU };
}

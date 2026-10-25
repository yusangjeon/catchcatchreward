import "server-only";
import { getRepo } from "@/lib/db";
import { GAMES, SURVEYS } from "./seed";
import type { BenefitPayload, EarnMenu } from "./types";

/** 마이비 benefit-hub "내게 맞는 적립 찾기"(BEGINNER 세그먼트) 4항목 */
const EARN_MENU: EarnMenu[] = [
  { key: "bpr", icon: "/myb/bh/ic_beginner_earn_bpr.webp", title: "비포인트 러쉬", sub: "가장 많은 혜택은 여기서!", hot: true, href: "/" },
  { key: "cpa", icon: "/myb/bh/ic_beginner_earn_cpa.webp", title: "초간단적립", sub: "1분만에 미션하고 적립받기", href: "/cpq" },
  { key: "cps", icon: "/myb/bh/ic_beginner_earn_cps.webp", title: "쇼핑적립", sub: "하던 쇼핑하고 웰컴 2배 혜택 받기", href: "/shop" },
  { key: "music", icon: "/myb/bh/ic_beginner_earn_music.webp", title: "음악적립", sub: "음악 잠깐 듣고 포인트 받기", href: "/benefits" },
];

/** 비포인트 러쉬 주차 종료 = 다음 일요일 23:59:00 KST (캡처값 2026-10-25T14:59Z 와 동일 규칙) */
export function rushEndsAt(now = new Date()): string {
  const kst = new Date(now.getTime() + 9 * 3600_000);
  const dow = kst.getUTCDay(); // 0=일
  const daysToSunday = (7 - dow) % 7;
  const end = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate() + daysToSunday, 23, 59, 0) - 9 * 3600_000;
  // 이미 지난 일요일 23:59 이면 다음 주
  return new Date(end <= now.getTime() ? end + 7 * 86400_000 : end).toISOString();
}

export async function getBenefit(userId: string): Promise<BenefitPayload> {
  const repo = getRepo();
  const balance = await repo.getBalance(userId);
  const [hero, ...games] = GAMES;
  return { balance, rushEndsAt: rushEndsAt(), hero, games, surveys: SURVEYS, earnMenu: EARN_MENU };
}

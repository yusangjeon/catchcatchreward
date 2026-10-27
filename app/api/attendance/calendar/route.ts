import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/user";
import { getRepo } from "@/lib/db";
import { kstDayKey } from "@/lib/time";
export const dynamic = "force-dynamic";
/** 출석 달력: 이번 달 출석일, 연속 일수, 다음 보너스까지 */
export async function GET() {
  const profile = await getCurrentProfile();
  const stamps = await getRepo().listStamps(profile.id);
  const days = [...new Set(stamps.filter((s) => s.sourceType === "attendance" && s.sourceId).map((s) => s.sourceId!))].sort();
  const today = kstDayKey();
  const set = new Set(days);
  let streak = 0;
  const d = new Date(`${today}T00:00:00Z`);
  if (!set.has(today)) d.setUTCDate(d.getUTCDate() - 1);
  while (set.has(d.toISOString().slice(0, 10))) { streak++; d.setUTCDate(d.getUTCDate() - 1); }
  return NextResponse.json({ today, days, total: days.length, streak, attendedToday: set.has(today), nextBonusIn: 7 - (streak % 7 || 7) + (streak % 7 === 0 && streak > 0 ? 7 : 0) || 7 });
}

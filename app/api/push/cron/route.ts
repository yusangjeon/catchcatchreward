import { NextResponse } from "next/server";
import { dailyReminder, pushEnabled } from "@/lib/push/service";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
/**
 * 일일 리마인드 크론(vercel.json: 매일 00:00 UTC = 09:00 KST).
 * Vercel Cron 은 Authorization: Bearer <CRON_SECRET> 을 붙여 호출한다. CRON_SECRET 이 없으면 CCR_DEV_TOOLS=1 에서만 열림.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret ? auth !== `Bearer ${secret}` : process.env.CCR_DEV_TOOLS !== "1") return NextResponse.json({ ok: false }, { status: 401 });
  if (!pushEnabled()) return NextResponse.json({ ok: true, skipped: "push disabled" });
  return NextResponse.json({ ok: true, ...(await dailyReminder()) });
}

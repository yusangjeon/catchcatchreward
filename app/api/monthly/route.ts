import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/user";
import { MonthlyError, claimMonthly, getMonthly } from "@/lib/monthly/service";
export const dynamic = "force-dynamic";
export async function GET() {
  const profile = await getCurrentProfile();
  return NextResponse.json(await getMonthly(profile.id));
}
export async function POST(req: Request) {
  const parsed = z.object({ key: z.string().min(1).max(32) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, code: "BAD_REQUEST", message: "요청이 올바르지 않아요" }, { status: 400 });
  const profile = await getCurrentProfile();
  try {
    return NextResponse.json(await claimMonthly(profile.id, parsed.data.key));
  } catch (e) {
    if (e instanceof MonthlyError) return NextResponse.json({ ok: false, code: e.code, message: e.message }, { status: e.code === "NOT_FOUND" ? 404 : 409 });
    throw e;
  }
}

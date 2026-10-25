import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/user";
import { ExchangeError, getExchange, requestRedemption } from "@/lib/exchange/service";
export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await getCurrentProfile();
  return NextResponse.json(await getExchange(profile.id));
}

const Body = z.object({ kind: z.string().min(1).max(64) });

export async function POST(req: Request) {
  const profile = await getCurrentProfile();
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, code: "BAD_REQUEST", message: "요청이 올바르지 않아요" }, { status: 400 });
  try {
    return NextResponse.json(await requestRedemption(profile.id, parsed.data.kind));
  } catch (e) {
    if (e instanceof ExchangeError) return NextResponse.json({ ok: false, code: e.code, message: e.message }, { status: 409 });
    throw e;
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { creditCatchMission, PostbackError } from "@/lib/missions/catchmission";
export const dynamic = "force-dynamic";

/**
 * 캐치미션 포스트백 — 미션 서버가 성공 시 호출.
 *   POST /api/postback/mission  (JSON 또는 form)  { uid, mid, tx, points? }
 *   GET  /api/postback/mission?uid=&mid=&tx=&points=
 * 인증: Authorization: Bearer <POSTBACK_SECRET> 또는 ?key=<POSTBACK_SECRET>. 시크릿이 없으면 CCR_DEV_TOOLS=1 에서만 열림.
 * 같은 tx 는 한 번만 적립(멱등) → { ok:true, duplicate:true }.
 */
const Params = z.object({
  uid: z.string().min(1).max(64),
  mid: z.string().min(1).max(64),
  tx: z.string().min(1).max(128),
  points: z.coerce.number().int().min(0).max(100000).optional(),
});

function authorized(req: Request, url: URL): boolean {
  const secret = process.env.POSTBACK_SECRET?.trim();
  if (!secret) return process.env.CCR_DEV_TOOLS === "1";
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  return bearer === secret || url.searchParams.get("key") === secret;
}

async function handle(req: Request, raw: Record<string, unknown>) {
  const url = new URL(req.url);
  if (!process.env.POSTBACK_SECRET?.trim() && process.env.CCR_DEV_TOOLS !== "1") return NextResponse.json({ ok: false, code: "NOT_CONFIGURED", message: "POSTBACK_SECRET 이 설정되지 않았어요" }, { status: 503 });
  if (!authorized(req, url)) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });
  const parsed = Params.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ ok: false, code: "BAD_REQUEST", message: "uid·mid·tx 가 필요해요" }, { status: 400 });
  try {
    const r = await creditCatchMission({ uid: parsed.data.uid, mid: parsed.data.mid, txId: parsed.data.tx, points: parsed.data.points });
    return NextResponse.json(r, { status: r.duplicate ? 200 : 201 });
  } catch (e) {
    if (e instanceof PostbackError) return NextResponse.json({ ok: false, code: e.code, message: e.message }, { status: e.code === "LIMIT" ? 409 : 404 });
    throw e;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  return handle(req, Object.fromEntries(url.searchParams.entries()));
}

export async function POST(req: Request) {
  const ct = req.headers.get("content-type") ?? "";
  let raw: Record<string, unknown> = {};
  if (ct.includes("application/json")) raw = ((await req.json().catch(() => null)) as Record<string, unknown>) ?? {};
  else if (ct.includes("form")) raw = Object.fromEntries((await req.formData()).entries());
  const url = new URL(req.url);
  // 쿼리에도 실어 보내는 파트너를 위해 쿼리 → 본문 순으로 합친다
  return handle(req, { ...Object.fromEntries(url.searchParams.entries()), ...raw });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/user";
import { getRepo } from "@/lib/db";
import { publicKey, pushEnabled } from "@/lib/push/service";
export const dynamic = "force-dynamic";

/** 상태: 활성 여부·공개키·내 구독 수 */
export async function GET() {
  const profile = await getCurrentProfile();
  const mine = await getRepo().listPushSubscriptions(profile.id);
  return NextResponse.json({ enabled: pushEnabled(), publicKey: publicKey(), subscriptions: mine.map((s) => s.endpoint) });
}
const Sub = z.object({ endpoint: z.string().url().max(2048), keys: z.object({ p256dh: z.string().min(1).max(512), auth: z.string().min(1).max(256) }) });
/** 구독 저장(브라우저 PushSubscription.toJSON()) */
export async function POST(req: Request) {
  const parsed = Sub.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, code: "BAD_REQUEST", message: "구독 정보가 올바르지 않아요" }, { status: 400 });
  if (!pushEnabled()) return NextResponse.json({ ok: false, code: "DISABLED", message: "푸시가 아직 설정되지 않았어요" }, { status: 409 });
  const profile = await getCurrentProfile();
  const { endpoint, keys } = parsed.data;
  await getRepo().addPushSubscription({ userId: profile.id, endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent: req.headers.get("user-agent")?.slice(0, 200) ?? undefined });
  return NextResponse.json({ ok: true });
}
/** 구독 해제 */
export async function DELETE(req: Request) {
  const parsed = z.object({ endpoint: z.string().min(1) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, code: "BAD_REQUEST" }, { status: 400 });
  const profile = await getCurrentProfile();
  const mine = await getRepo().listPushSubscriptions(profile.id);
  if (mine.some((s) => s.endpoint === parsed.data.endpoint)) await getRepo().removePushSubscription(parsed.data.endpoint);
  return NextResponse.json({ ok: true });
}

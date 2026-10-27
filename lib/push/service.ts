import "server-only";
import webpush from "web-push";
import { getRepo } from "@/lib/db";
import { getNotifications } from "@/lib/notifications";

/**
 * 웹푸시(VAPID). 환경변수 VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY (+ VAPID_SUBJECT) 가 있을 때만 활성.
 * 키 생성: pnpm push:keys. 구독은 push_subscriptions, 만료(404/410) 구독은 발송 시 자동 삭제.
 */
export interface PushPayload { title: string; body: string; url?: string; tag?: string }

export function pushEnabled() {
  return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}
export function publicKey() {
  return process.env.VAPID_PUBLIC_KEY ?? "";
}
let configured = false;
function ensure() {
  if (configured || !pushEnabled()) return;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:amplify15813@gmail.com", process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  configured = true;
}

/** 구독 목록에 발송. 실패한 endpoint 중 만료(404/410)는 삭제. 반환: 성공/실패/삭제 수 */
export async function sendTo(subs: { endpoint: string; p256dh: string; auth: string }[], payload: PushPayload) {
  if (!pushEnabled()) return { sent: 0, failed: 0, removed: 0 };
  ensure();
  const repo = getRepo();
  let sent = 0, failed = 0, removed = 0;
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 60 * 60 * 12 });
      sent++;
    } catch (e) {
      failed++;
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) { await repo.removePushSubscription(s.endpoint); removed++; }
    }
  }));
  return { sent, failed, removed };
}

export async function sendToUser(userId: string, payload: PushPayload) {
  return sendTo(await getRepo().listPushSubscriptions(userId), payload);
}

export async function broadcast(payload: PushPayload) {
  return sendTo(await getRepo().listPushSubscriptions(), payload);
}

/** 일일 리마인드(크론): 구독 유저마다 지금 할 일 1건(알림 파생) 또는 기본 문구 */
export async function dailyReminder() {
  const repo = getRepo();
  const subs = await repo.listPushSubscriptions();
  const byUser = new Map<string, typeof subs>();
  for (const s of subs) byUser.set(s.userId, [...(byUser.get(s.userId) ?? []), s]);
  let users = 0, sent = 0, failed = 0, removed = 0;
  for (const [userId, list] of byUser) {
    const { notices } = await getNotifications(userId);
    const top = notices.find((n) => n.action);
    const payload: PushPayload = top
      ? { title: top.title, body: top.body, url: top.href, tag: `daily-${top.kind}` }
      : { title: "오늘의 퀴즈 3개가 열렸어요", body: "새 틀린그림 3장과 출석 10P도 기다리고 있어요", url: "/", tag: "daily" };
    const r = await sendTo(list, payload);
    users++; sent += r.sent; failed += r.failed; removed += r.removed;
  }
  return { users, sent, failed, removed };
}

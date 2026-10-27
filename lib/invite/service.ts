import "server-only";
import { getRepo } from "@/lib/db";
import { kstDayKey } from "@/lib/time";
import type { Wallet } from "@/lib/types";
import { normalizeInviteCode } from "./code";

/**
 * 친구초대(마이비 user/me.invitationCode 구조). 1차 규칙:
 *  - 초대받은 사람: 코드 입력 즉시 INVITEE_POINTS
 *  - 초대한 사람: 초대받은 사람이 첫 퀴즈 세트를 완료할 때 INVITER_POINTS (어뷰징 완화), 하루 INVITER_DAILY_CAP 명까지
 *  - 코드는 1회만 입력 가능, 자기 코드 불가. 로그인 도입 전까지는 익명 쿠키 기준이라 2차에서 CI/전화번호 검증으로 강화.
 */
export const INVITEE_POINTS = 300;
export const INVITER_POINTS = 500;
export const INVITER_DAILY_CAP = 5;

export class InviteError extends Error {
  constructor(public code: "INVALID" | "SELF" | "ALREADY", message: string) {
    super(message);
  }
}

export interface InvitePayload {
  code: string;
  link: string;
  referred: boolean; // 내가 이미 코드를 입력했는지
  invitedCount: number;
  rewardedCount: number;
  earned: number; // 초대로 받은 누적 P
  invites: { createdAt: string; status: "pending" | "rewarded" }[];
  rewards: { invitee: number; inviter: number; dailyCap: number };
  wallet: Wallet;
}

async function wallet(userId: string): Promise<Wallet> {
  const repo = getRepo();
  const [balance, stamps] = await Promise.all([repo.getBalance(userId), repo.countUnconsumedStamps(userId)]);
  return { balance, stamps };
}

export async function getInvite(userId: string, origin: string): Promise<InvitePayload> {
  const repo = getRepo();
  const [profile, mine, invites, wal] = await Promise.all([repo.findProfile(userId), repo.findReferralByInvitee(userId), repo.listReferralsByInviter(userId), wallet(userId)]);
  const code = profile?.inviteCode ?? "";
  const rewardedCount = invites.filter((r) => r.status === "rewarded").length;
  return {
    code,
    link: `${origin}/invite?code=${code}`,
    referred: !!mine,
    invitedCount: invites.length,
    rewardedCount,
    earned: rewardedCount * INVITER_POINTS,
    invites: invites.slice(0, 20).map((r) => ({ createdAt: r.createdAt, status: r.status })),
    rewards: { invitee: INVITEE_POINTS, inviter: INVITER_POINTS, dailyCap: INVITER_DAILY_CAP },
    wallet: wal,
  };
}

export async function applyInviteCode(userId: string, raw: string): Promise<{ ok: true; points: number; wallet: Wallet }> {
  const repo = getRepo();
  const code = normalizeInviteCode(raw);
  if (code.length !== 8) throw new InviteError("INVALID", "초대코드 8자리를 입력해 주세요");
  if (await repo.findReferralByInvitee(userId)) throw new InviteError("ALREADY", "이미 초대코드를 입력했어요");
  const inviter = await repo.findProfileByInviteCode(code);
  if (!inviter) throw new InviteError("INVALID", "존재하지 않는 초대코드예요");
  if (inviter.id === userId) throw new InviteError("SELF", "내 초대코드는 입력할 수 없어요");
  const ref = await repo.addReferral({ inviterId: inviter.id, inviteeId: userId, code });
  await repo.setReferredBy(userId, inviter.id);
  await repo.addLedger({ userId, delta: INVITEE_POINTS, reason: "referral", refType: "referral", refId: ref.id, memo: "친구초대 코드 입력" });
  return { ok: true, points: INVITEE_POINTS, wallet: await wallet(userId) };
}

/** 초대받은 유저의 첫 퀴즈 세트 완료 시 호출 — 초대한 유저에게 보상 */
export async function onFirstQuizCompletion(inviteeId: string): Promise<void> {
  const repo = getRepo();
  const ref = await repo.findReferralByInvitee(inviteeId);
  if (!ref || ref.status !== "pending") return;
  const today = kstDayKey();
  const rewardedToday = (await repo.listReferralsByInviter(ref.inviterId)).filter((r) => r.status === "rewarded" && r.rewardedAt && kstDayKey(new Date(r.rewardedAt)) === today).length;
  if (rewardedToday >= INVITER_DAILY_CAP) return; // 한도 초과분은 pending 유지(다음 날 다시 완료 시점이 없으므로 운영 수동 처리)
  await repo.markReferralRewarded(ref.id);
  await repo.addLedger({ userId: ref.inviterId, delta: INVITER_POINTS, reason: "referral", refType: "referral", refId: ref.id, memo: "초대한 친구의 첫 퀴즈 완료" });
}

import "server-only";
import { getRepo } from "@/lib/db";
import { kstDayKey } from "@/lib/time";
import type { Tone, DuoName } from "@/components/icons/duo";

/**
 * 캐치미션(엠플리파이 팀 캐치미션 앱에 송출 중인 플레이스 미션)을 이 앱에서 참여시키고,
 * 미션 서버의 포스트백(POST /api/postback/mission)으로 포인트를 적립한다.
 *
 * - 미션 목록은 캐치미션 앱(`yusangjeon/catchreward` data/cm.json)에 송출 중인 8종을 시드로 둔다(보상 8P/7P, 일 60/120회).
 * - 참여 링크: `MISSION_PARTNER_URL` + `?uid=<유저 id>&mid=<미션 id>` (없으면 미리보기 — 참여 버튼이 안내 토스트).
 * - 적립: 원장 reason=mission, refType=catchmission, refId=`<mid>:<txId>` (txId 로 멱등) + 룰렛 스탬프 1.
 */
export interface CatchMission {
  id: string;
  title: string;
  sub: string;
  points: number;
  dailyLimit: number;
  icon: DuoName;
  tone: Tone;
  group: "place" | "bonus";
}

export const CATCH_MISSIONS: CatchMission[] = [
  { id: "nav_capture", title: "길찾고 캡처하기", sub: "내비게이션 캡처하기", points: 8, dailyLimit: 60, icon: "car", tone: "blue", group: "place" },
  { id: "phone_quiz", title: "전화번호 퀴즈", sub: "전화번호 끝 4자리 찾기", points: 8, dailyLimit: 60, icon: "chat", tone: "violet", group: "place" },
  { id: "landmark_quiz", title: "명소 찾기 퀴즈", sub: "주변 명소 초성 찾기", points: 8, dailyLimit: 60, icon: "pin", tone: "teal", group: "place" },
  { id: "steps_find", title: "걸음 수 찾기", sub: "가장 빠른 경로의 걸음 수 찾기", points: 8, dailyLimit: 60, icon: "bolt", tone: "green", group: "place" },
  { id: "walk_distance", title: "도보 거리 입력하기", sub: "명소까지 도보 거리 찾기", points: 8, dailyLimit: 60, icon: "search", tone: "amber", group: "place" },
  { id: "parking_find", title: "주차장 찾기", sub: "목적지와 가까운 주차장 찾기", points: 8, dailyLimit: 60, icon: "store", tone: "navy", group: "place" },
  { id: "ai_quiz", title: "AI 추천 퀴즈", sub: "내게 꼭 맞는 퀴즈", points: 8, dailyLimit: 60, icon: "sparkle", tone: "pink", group: "place" },
  { id: "tag_find", title: "상품 태그 찾기", sub: "태그 URL 찾기", points: 7, dailyLimit: 120, icon: "ticket", tone: "orange", group: "bonus" },
];

export const CATCH_REF_TYPE = "catchmission";

export function findCatchMission(id: string): CatchMission | undefined {
  return CATCH_MISSIONS.find((m) => m.id === id);
}

/** 참여 링크(파트너 미션 앱). env 없으면 null → 화면은 미리보기 */
export function catchMissionHref(userId: string, missionId: string): string | null {
  const base = process.env.MISSION_PARTNER_URL?.trim();
  if (!base) return null;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}uid=${encodeURIComponent(userId)}&mid=${encodeURIComponent(missionId)}`;
}

export interface PublicCatchMission extends CatchMission {
  todayDone: number;
  totalDone: number;
  href: string | null;
}

export interface CatchSummary {
  partnerReady: boolean;
  items: PublicCatchMission[];
  todayPoints: number;
  totalDone: number;
}

export async function getCatchMissions(userId: string): Promise<CatchSummary> {
  const repo = getRepo();
  const today = kstDayKey();
  const entries = (await repo.listLedger(userId, 1000)).filter((e) => e.refType === CATCH_REF_TYPE && e.refId);
  const items = CATCH_MISSIONS.map((m) => {
    const mine = entries.filter((e) => e.refId!.startsWith(`${m.id}:`));
    return { ...m, totalDone: mine.length, todayDone: mine.filter((e) => kstDayKey(new Date(e.createdAt)) === today).length, href: catchMissionHref(userId, m.id) };
  });
  return {
    partnerReady: !!process.env.MISSION_PARTNER_URL?.trim(),
    items,
    todayPoints: entries.filter((e) => kstDayKey(new Date(e.createdAt)) === today).reduce((s, e) => s + e.delta, 0),
    totalDone: entries.length,
  };
}

export class PostbackError extends Error {
  constructor(public code: "USER_NOT_FOUND" | "MISSION_NOT_FOUND" | "LIMIT", message: string) {
    super(message);
  }
}

/**
 * 포스트백 적립 — 미션 서버가 성공 시 호출. txId 로 멱등(같은 txId 는 한 번만 적립).
 * points 는 미션 보상값을 기본으로 하되, 파트너가 보낸 값이 있으면 미션 보상 이하로만 인정.
 */
export async function creditCatchMission(input: { uid: string; mid: string; txId: string; points?: number }): Promise<{ ok: true; duplicate: boolean; points: number; balance: number; userId: string }> {
  const repo = getRepo();
  const profile = await repo.findProfile(input.uid);
  if (!profile) throw new PostbackError("USER_NOT_FOUND", "유저를 찾을 수 없어요");
  const m = findCatchMission(input.mid);
  if (!m) throw new PostbackError("MISSION_NOT_FOUND", "미션을 찾을 수 없어요");
  const refId = `${m.id}:${input.txId}`;
  const entries = (await repo.listLedger(profile.id, 1000)).filter((e) => e.refType === CATCH_REF_TYPE);
  const dup = entries.find((e) => e.refId === refId);
  if (dup) return { ok: true, duplicate: true, points: dup.delta, balance: await repo.getBalance(profile.id), userId: profile.id };
  const today = kstDayKey();
  const todayDone = entries.filter((e) => e.refId?.startsWith(`${m.id}:`) && kstDayKey(new Date(e.createdAt)) === today).length;
  if (todayDone >= m.dailyLimit) throw new PostbackError("LIMIT", "오늘 참여 한도를 넘었어요");
  const points = Math.max(1, Math.min(m.points, Math.floor(input.points ?? m.points)));
  await repo.addLedger({ userId: profile.id, delta: points, reason: "mission", refType: CATCH_REF_TYPE, refId, memo: `캐치미션 · ${m.title}` });
  await repo.addStamp({ userId: profile.id, sourceType: CATCH_REF_TYPE, sourceId: refId });
  return { ok: true, duplicate: false, points, balance: await repo.getBalance(profile.id), userId: profile.id };
}

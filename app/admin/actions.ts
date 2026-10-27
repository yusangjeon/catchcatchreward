"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkKey, clearAdminCookie, requireAdmin, setAdminCookie } from "@/lib/admin/auth";
import { getRepo } from "@/lib/db";
import type { Quiz, QuizSet, RoulettePrize, StoreMission } from "@/lib/types";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string, d = 0) => {
  const n = Number(fd.get(k));
  return Number.isFinite(n) ? n : d;
};

export async function loginAction(fd: FormData) {
  const key = str(fd, "key");
  if (!checkKey(key)) redirect("/admin/login?error=1");
  await setAdminCookie(key);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminCookie();
  redirect("/admin/login");
}

export async function toggleSetAction(fd: FormData) {
  await requireAdmin();
  await getRepo().updateSet(str(fd, "id"), { active: fd.get("active") === "1" });
  revalidatePath("/admin/quizzes");
}

export async function createSetAction(fd: FormData) {
  await requireAdmin();
  const title = str(fd, "title");
  if (!title) return;
  const set: QuizSet = {
    id: `s-${randomUUID().slice(0, 8)}`,
    title,
    imageUrl: str(fd, "imageUrl") || `https://picsum.photos/seed/${encodeURIComponent(title)}/600/600`,
    rewardPoints: num(fd, "rewardPoints", 100),
    capacity: num(fd, "capacity", 5000),
    baseParticipants: num(fd, "baseParticipants", 0),
    todayOnly: fd.get("todayOnly") === "on",
    active: true,
    sort: num(fd, "sort", 99),
    targetBadges: fd.getAll("targetBadges").map(String).filter(Boolean),
  };
  await getRepo().createSet(set);
  revalidatePath("/admin/quizzes");
}

/** 문항 등록: 선택지는 줄당 "라벨 | 태그1,태그2 | 이미지URL(선택)" */
export async function createQuizAction(fd: FormData) {
  await requireAdmin();
  const setId = str(fd, "setId");
  const question = str(fd, "question");
  const lines = str(fd, "options").split("\n").map((l) => l.trim()).filter(Boolean);
  if (!setId || !question || lines.length < 2) return;
  const repo = getRepo();
  const existing = await repo.listQuizzesBySet(setId);
  const id = `${setId}-q${existing.length + 1}-${randomUUID().slice(0, 4)}`;
  const quiz: Quiz = {
    id,
    setId,
    question,
    kind: lines.length === 2 ? 2 : 4,
    active: true,
    sort: existing.length + 1,
    options: lines.slice(0, 4).map((l, i) => {
      const [label, tags = "", imageUrl = ""] = l.split("|").map((x) => x.trim());
      return { id: `${id}-${String.fromCharCode(97 + i)}`, label, tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [], imageUrl: imageUrl || undefined, sort: i + 1 };
    }),
  };
  await repo.createQuiz(quiz);
  revalidatePath("/admin/quizzes");
}

export async function updatePrizeAction(fd: FormData) {
  await requireAdmin();
  await getRepo().updatePrize(str(fd, "id"), { name: str(fd, "name"), value: num(fd, "value"), weight: Math.max(0, num(fd, "weight")), active: fd.get("active") === "on", sort: num(fd, "sort") });
  revalidatePath("/admin/roulette");
}

export async function createPrizeAction(fd: FormData) {
  await requireAdmin();
  const name = str(fd, "name");
  if (!name) return;
  const kind = str(fd, "kind") as RoulettePrize["kind"];
  const p: RoulettePrize = { id: `pz-${randomUUID().slice(0, 8)}`, name, kind: ["points", "gifticon", "none"].includes(kind) ? kind : "points", value: num(fd, "value"), weight: Math.max(0, num(fd, "weight", 1)), active: true, sort: num(fd, "sort", 99) };
  await getRepo().createPrize(p);
  revalidatePath("/admin/roulette");
}

/** 버튼별 bind(id, status) 로 호출 — submitter name/value 에 의존하지 않는다 */
export async function updateRedemptionAction(id: string, status: "processing" | "done" | "rejected", fd: FormData) {
  await requireAdmin();
  const repo = getRepo();
  const current = (await repo.listRedemptions()).find((r) => r.id === id);
  if (!current) return;
  const prevStatus = current.status; // 인메모리 저장소는 같은 객체를 돌려주므로 갱신 전에 보관
  const updated = await repo.updateRedemption(id, { status, memo: str(fd, "memo") || undefined });
  // 반려 시 포인트 환불(원장 +). 이미 반려된 건 중복 환불 금지
  if (updated && status === "rejected" && prevStatus !== "rejected") {
    await repo.addLedger({ userId: current.userId, delta: current.amountPoints, reason: "admin_adjust", refType: "redemption_refund", refId: id, memo: "교환 반려 환불" });
  }
  revalidatePath("/admin/redemptions");
  revalidatePath("/admin");
}

/** 수동 지급: 유저 id 또는 anonKey 로 포인트(±)·스탬프(+) 지급. 원장 reason=admin_adjust */
export async function grantAction(fd: FormData): Promise<void> {
  await requireAdmin();
  const repo = getRepo();
  const target = str(fd, "target");
  const profile = await repo.findProfile(target);
  if (!profile) redirect("/admin/grant?error=notfound");
  const points = num(fd, "points");
  const stamps = Math.max(0, Math.min(100, num(fd, "stamps")));
  const memo = str(fd, "memo") || "운영 지급";
  if (points !== 0) await repo.addLedger({ userId: profile.id, delta: points, reason: "admin_adjust", refType: "admin", memo });
  for (let i = 0; i < stamps; i++) await repo.addStamp({ userId: profile.id, sourceType: "admin", sourceId: `${randomUUID()}` });
  redirect(`/admin/grant?ok=1&user=${encodeURIComponent(profile.id)}&points=${points}&stamps=${stamps}`);
}

/** 매장 미션 등록(캐치랭크 매장 방문·저장·리뷰). 인증코드는 4~8자 */
export async function createStoreMissionAction(fd: FormData) {
  await requireAdmin();
  const storeName = str(fd, "storeName");
  const title = str(fd, "title");
  const code = str(fd, "code");
  const kind = str(fd, "kind") as StoreMission["kind"];
  if (!storeName || !title || code.length < 4) return;
  const m: StoreMission = {
    id: `sm-${randomUUID().slice(0, 8)}`,
    storeName,
    kind: ["visit", "save", "review"].includes(kind) ? kind : "visit",
    title,
    description: str(fd, "description") || undefined,
    rewardPoints: Math.max(0, num(fd, "rewardPoints", 300)),
    code,
    capacity: Math.max(0, num(fd, "capacity", 0)),
    active: true,
    sort: num(fd, "sort", 99),
    createdAt: new Date().toISOString(),
  };
  await getRepo().createStoreMission(m);
  revalidatePath("/admin/stores");
}

export async function toggleStoreMissionAction(fd: FormData) {
  await requireAdmin();
  await getRepo().updateStoreMission(str(fd, "id"), { active: fd.get("active") === "1" });
  revalidatePath("/admin/stores");
}

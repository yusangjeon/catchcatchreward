import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { getRepo } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * 관리자 CSV 내보내기(/admin/export — 관리자 쿠키 path=/admin 과 맞춤) — type=segments: 유저별 배지·태그 점수(광고주 타깃 리스트 원천, 익명 id).
 * 관리자 쿠키 필요. UTF-8 BOM 으로 엑셀 한글 호환.
 */
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, code: "FORBIDDEN" }, { status: 403 });
  const type = new URL(req.url).searchParams.get("type") ?? "segments";
  const repo = getRepo();
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const rows: (string | number)[][] = [];
  if (type === "segments") {
    const [profiles, badges, userBadges, tagScores] = await Promise.all([repo.listProfiles(10000), repo.listBadges(), repo.listAllUserBadges(), repo.listAllTagScores()]);
    const tags = [...new Set(tagScores.map((t) => t.tag))].sort();
    const byUserBadge = new Map<string, string[]>();
    for (const ub of userBadges) (byUserBadge.get(ub.userId) ?? byUserBadge.set(ub.userId, []).get(ub.userId)!).push(badges.find((b) => b.code === ub.badgeCode)?.name ?? ub.badgeCode);
    const byUserTag = new Map<string, Map<string, number>>();
    for (const t of tagScores) (byUserTag.get(t.userId) ?? byUserTag.set(t.userId, new Map()).get(t.userId)!).set(t.tag, t.score);
    const balances = await Promise.all(profiles.map((p) => repo.getBalance(p.id)));
    rows.push(["user_id", "created_at", "balance", "badges", ...tags]);
    profiles.forEach((p, i) => rows.push([p.id, p.createdAt, balances[i], (byUserBadge.get(p.id) ?? []).join("|"), ...tags.map((t) => byUserTag.get(p.id)?.get(t) ?? 0)]));
  } else {
    return NextResponse.json({ ok: false, code: "BAD_TYPE" }, { status: 400 });
  }
  const csv = "﻿" + rows.map((r) => r.map(esc).join(",")).join("\r\n");
  return new NextResponse(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="ccr-${type}-${new Date().toISOString().slice(0, 10)}.csv"` } });
}

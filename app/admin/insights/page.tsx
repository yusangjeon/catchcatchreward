import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getRepo } from "@/lib/db";

/**
 * 세그먼트 인사이트 — 배지(세그먼트)별 유저 수·비율, 세그먼트 안에서 함께 강한 태그, 태그 전체 분포.
 * 광고주에게 "이 세그먼트는 N명이고 이런 취향이 같이 있다"를 보여주는 화면. (플라이휠: 취향 데이터 → 타깃 보상 판매)
 */
export default async function AdminInsights() {
  await requireAdmin();
  const repo = getRepo();
  const [badges, userBadges, tagScores, profiles] = await Promise.all([repo.listBadges(), repo.listAllUserBadges(), repo.listAllTagScores(), repo.listProfiles(10000)]);
  const totalUsers = profiles.length || 1;
  const usersByBadge = new Map<string, Set<string>>();
  for (const ub of userBadges) (usersByBadge.get(ub.badgeCode) ?? usersByBadge.set(ub.badgeCode, new Set()).get(ub.badgeCode)!).add(ub.userId);
  const scoresByUser = new Map<string, Map<string, number>>();
  for (const t of tagScores) (scoresByUser.get(t.userId) ?? scoresByUser.set(t.userId, new Map()).get(t.userId)!).set(t.tag, t.score);
  const tagTotals = new Map<string, number>();
  for (const t of tagScores) tagTotals.set(t.tag, (tagTotals.get(t.tag) ?? 0) + t.score);
  const tagUsers = new Map<string, number>();
  for (const t of tagScores) if (t.score > 0) tagUsers.set(t.tag, (tagUsers.get(t.tag) ?? 0) + 1);
  const respondents = scoresByUser.size || 1;
  const fmt = (n: number) => n.toLocaleString("ko-KR");
  const pct = (a: number, b: number) => `${Math.round((a / Math.max(1, b)) * 100)}%`;

  const segments = badges.map((b) => {
    const users = usersByBadge.get(b.code) ?? new Set<string>();
    const coTags = new Map<string, number>();
    for (const uid of users) for (const [tag, score] of scoresByUser.get(uid) ?? []) if (tag !== b.rule.tag && score > 0) coTags.set(tag, (coTags.get(tag) ?? 0) + 1);
    const top = [...coTags.entries()].sort((x, y) => y[1] - x[1]).slice(0, 4);
    return { b, n: users.size, top };
  }).sort((x, y) => y.n - x.n);
  const topTags = [...tagTotals.entries()].sort((x, y) => y[1] - x[1]).slice(0, 16);
  const maxTag = topTags[0]?.[1] ?? 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold">세그먼트 인사이트 <span className="ml-2 text-[13px] font-medium text-[#8b94a0]">유저 {fmt(totalUsers)}명 · 응답 유저 {fmt(scoresByUser.size)}명 · 배지 보유 {fmt(new Set(userBadges.map((u) => u.userId)).size)}명</span></h1>
        <a href="/admin/export?type=segments" className="rounded-lg border border-[#dee2e9] bg-white px-4 py-2 text-[13px] font-bold text-[#191f28]">세그먼트 CSV 내보내기</a>
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-[16px] font-bold">배지 세그먼트</h2>
        <p className="mt-1 text-[12px] text-[#8b94a0]">세그먼트 = 배지 보유 유저. &ldquo;함께 강한 취향&rdquo;은 그 유저들이 같이 고른 태그 상위 4개(유저 수 기준). 타깃 퀴즈·광고 상품 단위.</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-[#f8f9fc] text-[12px] text-[#8b94a0]"><tr><th className="px-3 py-2">배지</th><th className="px-3 py-2">유저</th><th className="px-3 py-2">전체 대비</th><th className="px-3 py-2">함께 강한 취향</th><th className="px-3 py-2">액션</th></tr></thead>
            <tbody>
              {segments.map(({ b, n, top }) => (
                <tr key={b.code} className="border-t border-[#f1f3f8]">
                  <td className="px-3 py-2">{b.emoji} {b.name} <span className="text-[11px] text-[#b0b8c1]">{b.code}</span></td>
                  <td className="px-3 py-2 tabular-nums font-semibold">{fmt(n)}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2"><div className="h-2 w-28 overflow-hidden rounded-full bg-[#eef0f4]"><div className="h-full rounded-full bg-[#427cff]" style={{ width: pct(n, totalUsers) }} /></div><span className="tabular-nums text-[12px] text-[#5c6573]">{pct(n, totalUsers)}</span></div>
                  </td>
                  <td className="px-3 py-2 text-[12px]">{top.length ? top.map(([tag, c]) => <span key={tag} className="mr-1 inline-block rounded-full bg-[#f0f4ff] px-2 py-0.5 text-[#427cff]">{tag} {pct(c, n)}</span>) : <span className="text-[#b0b8c1]">-</span>}</td>
                  <td className="px-3 py-2 text-[12px]"><Link href="/admin/quizzes" className="text-[#427cff]">타깃 퀴즈 등록 →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-[16px] font-bold">취향 태그 분포</h2>
        <p className="mt-1 text-[12px] text-[#8b94a0]">선택지 태그 누적(응답 수 기준). 괄호는 해당 태그를 1번이라도 고른 유저 비율.</p>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {topTags.map(([tag, total]) => (
            <li key={tag} className="flex items-center gap-3 text-[13px]">
              <span className="w-28 shrink-0 font-mono text-[12px]">{tag}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#eef0f4]"><div className="h-full rounded-full bg-[#9fbcff]" style={{ width: `${Math.round((total / maxTag) * 100)}%` }} /></div>
              <span className="w-24 shrink-0 text-right tabular-nums text-[#5c6573]">{fmt(total)} <span className="text-[11px] text-[#b0b8c1]">({pct(tagUsers.get(tag) ?? 0, respondents)})</span></span>
            </li>
          ))}
          {topTags.length === 0 && <li className="text-[13px] text-[#8b94a0]">아직 응답이 없어요</li>}
        </ul>
      </section>
    </div>
  );
}

import { requireAdmin } from "@/lib/admin/auth";
import { getRepo } from "@/lib/db";

export default async function AdminBadges() {
  await requireAdmin();
  const repo = getRepo();
  const [badges, counts, stats] = await Promise.all([repo.listBadges(), repo.countUserBadges(), repo.adminStats("1970-01-01")]);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[22px] font-bold">취향 배지 · 유저 세그먼트</h1>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-[var(--color-bg)] text-[12px] text-[#8b94a0]"><tr><th className="px-4 py-3">배지</th><th className="px-4 py-3">코드</th><th className="px-4 py-3">규칙</th><th className="px-4 py-3">보유 유저</th><th className="px-4 py-3">비율</th></tr></thead>
          <tbody>
            {badges.map((b) => {
              const n = counts[b.code] ?? 0;
              return (
                <tr key={b.code} className="border-t border-[var(--color-bg-2)]">
                  <td className="px-4 py-3">{b.emoji} {b.name}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-[#5c6573]">{b.code}</td>
                  <td className="px-4 py-3 text-[#5c6573]">태그 <code>{b.rule.tag}</code> ≥ {b.rule.min}</td>
                  <td className="px-4 py-3 tabular-nums font-semibold">{n.toLocaleString("ko-KR")}</td>
                  <td className="px-4 py-3 tabular-nums">{stats.users ? `${Math.round((n / stats.users) * 1000) / 10}%` : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[12px] text-[#8b94a0]">배지 보유 유저 = 오퍼월·캠페인 광고주에게 팔 타깃 세그먼트. 배지 정의는 시드(lib/quiz/seed.ts · supabase/seed.sql)에서 관리.</p>
    </div>
  );
}

import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getRepo } from "@/lib/db";

/** 유저 조회 — 잔액·스탬프·배지·초대·가입일. id 클릭 → 수동 지급 */
export default async function AdminUsers() {
  await requireAdmin();
  const repo = getRepo();
  const [profiles, badges] = await Promise.all([repo.listProfiles(200), repo.listBadges()]);
  const byCode = new Map(badges.map((b) => [b.code, b]));
  const rows = await Promise.all(
    profiles.map(async (p) => {
      const [balance, stamps, mine, invites, completions] = await Promise.all([
        repo.getBalance(p.id), repo.countUnconsumedStamps(p.id), repo.listUserBadges(p.id), repo.listReferralsByInviter(p.id), repo.listCompletions(p.id),
      ]);
      return { p, balance, stamps, badges: mine.map((b) => byCode.get(b.badgeCode)?.name ?? b.badgeCode), invites: invites.length, completions: completions.length };
    }),
  );
  const fmt = (n: number) => n.toLocaleString("ko-KR");
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[22px] font-bold">유저 <span className="ml-2 text-[13px] font-medium text-[#8b94a0]">{rows.length}명 (최신 200)</span></h1>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-[var(--color-bg)] text-[12px] text-[#8b94a0]">
            <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">가입</th><th className="px-4 py-3">잔액</th><th className="px-4 py-3">스탬프</th><th className="px-4 py-3">세트 완료</th><th className="px-4 py-3">배지</th><th className="px-4 py-3">초대코드</th><th className="px-4 py-3">초대</th><th className="px-4 py-3">추천인</th></tr>
          </thead>
          <tbody>
            {rows.map(({ p, balance, stamps, badges, invites, completions }) => (
              <tr key={p.id} className="border-t border-[var(--color-bg-2)]">
                <td className="px-4 py-3 font-mono text-[12px]"><Link href={`/admin/users/${p.id}`} className="text-[var(--color-myb)]">{p.id.slice(0, 8)}…</Link></td>
                <td className="px-4 py-3 text-[12px] text-[#5c6573]">{new Date(p.createdAt).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                <td className="px-4 py-3 tabular-nums">{fmt(balance)}P</td>
                <td className="px-4 py-3 tabular-nums">{stamps}</td>
                <td className="px-4 py-3 tabular-nums">{completions}</td>
                <td className="px-4 py-3 text-[12px]">{badges.length ? badges.join(", ") : <span className="text-[#b0b8c1]">-</span>}</td>
                <td className="px-4 py-3 font-mono text-[12px]">{p.inviteCode}</td>
                <td className="px-4 py-3 tabular-nums">{invites}</td>
                <td className="px-4 py-3 font-mono text-[12px] text-[#5c6573]">{p.referredBy ? `${p.referredBy.slice(0, 8)}…` : "-"}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={9} className="px-4 py-6 text-center text-[#8b94a0]">아직 유저가 없어요</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

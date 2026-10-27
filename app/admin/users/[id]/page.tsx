import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getRepo } from "@/lib/db";
import { PRODUCTS } from "@/lib/exchange/products";

const REASON: Record<string, string> = { signup: "가입 보너스", quiz_answer: "퀴즈 보상", quiz_bonus: "보너스", mission: "미션", rush: "러쉬", store_mission: "매장 미션", roulette: "룰렛", redeem: "교환", admin_adjust: "운영 조정", referral: "친구초대" };

/** 유저 360 — 프로필·잔액·배지·태그 점수·원장·세트 완료·교환·초대 */
export default async function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const repo = getRepo();
  const p = await repo.findProfile(id);
  if (!p) notFound();
  const [balance, stamps, badges, allBadges, scores, ledger, completions, sets, redemptions, invites, referral] = await Promise.all([
    repo.getBalance(p.id), repo.countUnconsumedStamps(p.id), repo.listUserBadges(p.id), repo.listBadges(), repo.getTagScores(p.id), repo.listLedger(p.id, 50), repo.listCompletions(p.id), repo.listAllSets(), repo.listRedemptions(p.id), repo.listReferralsByInviter(p.id), repo.findReferralByInvitee(p.id),
  ]);
  const byCode = new Map(allBadges.map((b) => [b.code, b]));
  const setTitle = new Map(sets.map((s) => [s.id, s.title]));
  const fmt = (n: number) => n.toLocaleString("ko-KR");
  const dt = (iso: string) => new Date(iso).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const topTags = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 10);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold">유저 <span className="font-mono text-[14px] text-[#5c6573]">{p.id}</span></h1>
        <Link href={`/admin/grant?target=${p.id}`} className="rounded-lg bg-[#191f28] px-4 py-2 text-[13px] font-bold text-white">수동 지급</Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[["잔액", `${fmt(balance)}P`], ["미사용 스탬프", fmt(stamps)], ["세트 완료", fmt(completions.length)], ["가입", dt(p.createdAt)], ["초대코드", p.inviteCode], ["추천인", p.referredBy ? p.referredBy.slice(0, 8) + "…" : "-"], ["초대한 친구", `${invites.length}명`], ["초대코드 적용", referral ? referral.status === "rewarded" ? "완료(보상)" : "완료" : "-"]].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-[12px] text-[#8b94a0]">{k}</p><p className="mt-1 truncate text-[18px] font-bold tabular-nums">{v}</p></div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-[15px] font-bold">배지 · 취향 태그</h2>
          <p className="mt-2 text-[14px]">{badges.length ? badges.map((b) => `${byCode.get(b.badgeCode)?.emoji ?? ""} ${byCode.get(b.badgeCode)?.name ?? b.badgeCode}`).join(" · ") : <span className="text-[#b0b8c1]">배지 없음</span>}</p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {topTags.map(([tag, score]) => (
              <li key={tag} className="flex items-center gap-2 text-[12px]"><span className="w-24 font-mono">{tag}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-[#eef0f4]"><div className="h-full rounded-full bg-[#427cff]" style={{ width: `${Math.min(100, score * 10)}%` }} /></div><span className="w-6 text-right tabular-nums">{score}</span></li>
            ))}
            {topTags.length === 0 && <li className="text-[12px] text-[#b0b8c1]">응답 없음</li>}
          </ul>
        </section>
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-[15px] font-bold">완료한 퀴즈 세트</h2>
          <ul className="mt-2 flex flex-col gap-1 text-[13px]">
            {completions.sort((a, b) => b.completedAt.localeCompare(a.completedAt)).map((c) => <li key={c.id} className="flex justify-between"><span className="truncate">{setTitle.get(c.setId) ?? c.setId}</span><span className="shrink-0 text-[#8b94a0]">{dt(c.completedAt)}</span></li>)}
            {completions.length === 0 && <li className="text-[#b0b8c1]">없음</li>}
          </ul>
          <h2 className="mt-5 text-[15px] font-bold">교환 신청</h2>
          <ul className="mt-2 flex flex-col gap-1 text-[13px]">
            {redemptions.map((r) => <li key={r.id} className="flex justify-between"><span>{PRODUCTS.find((x) => x.kind === r.kind)?.name ?? r.kind} · {fmt(r.amountPoints)}P</span><span className="text-[#8b94a0]">{r.status}</span></li>)}
            {redemptions.length === 0 && <li className="text-[#b0b8c1]">없음</li>}
          </ul>
        </section>
      </div>
      <section className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[#f8f9fc] text-[12px] text-[#8b94a0]"><tr><th className="px-4 py-3">시각</th><th className="px-4 py-3">구분</th><th className="px-4 py-3">메모</th><th className="px-4 py-3 text-right">포인트</th></tr></thead>
          <tbody>
            {ledger.map((e) => (
              <tr key={e.id} className="border-t border-[#f1f3f8]">
                <td className="px-4 py-2 text-[#5c6573]">{dt(e.createdAt)}</td>
                <td className="px-4 py-2">{REASON[e.reason] ?? e.reason}</td>
                <td className="px-4 py-2 text-[#8b94a0]">{e.memo ?? e.refType ?? ""}</td>
                <td className={`px-4 py-2 text-right tabular-nums font-semibold ${e.delta >= 0 ? "text-[#427cff]" : "text-[#ff3939]"}`}>{e.delta >= 0 ? "+" : ""}{fmt(e.delta)}</td>
              </tr>
            ))}
            {ledger.length === 0 && <tr><td colSpan={4} className="px-4 py-4 text-center text-[#b0b8c1]">원장 없음</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}

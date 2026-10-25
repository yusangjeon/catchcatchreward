import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getRepo } from "@/lib/db";
import { kstDayKey } from "@/lib/time";

export default async function AdminHome() {
  await requireAdmin();
  const repo = getRepo();
  const [stats, badges, counts, prizes] = await Promise.all([repo.adminStats(kstDayKey()), repo.listBadges(), repo.countUserBadges(), repo.listPrizes()]);
  const total = prizes.reduce((s, p) => s + p.weight, 0) || 1;
  const ev = prizes.reduce((s, p) => s + (p.kind === "none" ? 0 : p.value) * (p.weight / total), 0);
  const fmt = (n: number) => n.toLocaleString("ko-KR");
  const cards = [
    ["누적 유저", fmt(stats.users)],
    ["오늘 세트 완료", fmt(stats.completionsToday)],
    ["총 적립 P", fmt(stats.pointsIssued)],
    ["총 차감 P", fmt(stats.pointsRedeemed)],
    ["미사용 스탬프", fmt(stats.freeStamps)],
    ["룰렛 스핀", fmt(stats.spins)],
    ["교환 대기", fmt(stats.redemptionsRequested)],
    ["룰렛 기대값", `${Math.round(ev)}원`],
  ];
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[22px] font-bold">대시보드 <span className="ml-2 text-[13px] font-medium text-[#8b94a0]">{kstDayKey()} KST</span></h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-[12px] text-[#8b94a0]">{k}</p>
            <p className="mt-1 text-[22px] font-bold tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold">배지별 유저 수 (세그먼트)</h2>
          <Link href="/admin/badges" className="text-[13px] text-[#427cff]">자세히</Link>
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
          {badges.map((b) => (
            <li key={b.code} className="flex items-center justify-between rounded-xl bg-[#f8f9fc] px-3 py-2 text-[14px]">
              <span>{b.emoji} {b.name}</span><b className="tabular-nums">{fmt(counts[b.code] ?? 0)}</b>
            </li>
          ))}
        </ul>
      </section>
      {stats.redemptionsRequested > 0 && (
        <Link href="/admin/redemptions" className="rounded-2xl border border-[#ffd8a8] bg-[#fff7ec] p-4 text-[14px] text-[#9a5b00]">처리 대기 중인 교환 신청이 {stats.redemptionsRequested}건 있어요 →</Link>
      )}
    </div>
  );
}

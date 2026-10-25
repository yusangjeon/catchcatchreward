import { requireAdmin } from "@/lib/admin/auth";
import { getRepo } from "@/lib/db";
import { createPrizeAction, updatePrizeAction } from "../actions";

export default async function AdminRoulette() {
  await requireAdmin();
  const prizes = await getRepo().listAllPrizes();
  const total = prizes.filter((p) => p.active).reduce((s, p) => s + p.weight, 0) || 1;
  const ev = prizes.filter((p) => p.active).reduce((s, p) => s + (p.kind === "none" ? 0 : p.value) * (p.weight / total), 0);
  const input = "h-9 w-full rounded-lg border border-[#dee2e9] px-2 text-[14px]";
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <h1 className="text-[22px] font-bold">룰렛 확률 테이블</h1>
        <p className="text-[14px] text-[#5c6573]">활성 가중치 합 <b>{total}</b> · 1회 기대값 <b className="text-[#427cff]">{Math.round(ev).toLocaleString("ko-KR")}원</b> (스탬프 10개당)</p>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-[#f8f9fc] text-[12px] text-[#8b94a0]">
            <tr><th className="px-3 py-3">이름</th><th className="px-3 py-3">종류</th><th className="px-3 py-3">값</th><th className="px-3 py-3">가중치</th><th className="px-3 py-3">확률</th><th className="px-3 py-3">정렬</th><th className="px-3 py-3">활성</th><th className="px-3 py-3"></th></tr>
          </thead>
          <tbody>
            {prizes.map((p) => (
              <tr key={p.id} className="border-t border-[#f1f3f8]">
                <td colSpan={8} className="p-0">
                  <form action={updatePrizeAction} className="grid grid-cols-[1.6fr_.8fr_.8fr_.8fr_.7fr_.6fr_.6fr_.8fr] items-center gap-2 px-3 py-2">
                    <input type="hidden" name="id" value={p.id} />
                    <input name="name" defaultValue={p.name} className={input} />
                    <span className="text-[13px] text-[#5c6573]">{p.kind}</span>
                    <input name="value" type="number" defaultValue={p.value} className={input} />
                    <input name="weight" type="number" min={0} defaultValue={p.weight} className={input} />
                    <span className="tabular-nums">{p.active ? `${Math.round((p.weight / total) * 1000) / 10}%` : "-"}</span>
                    <input name="sort" type="number" defaultValue={p.sort} className={input} />
                    <input name="active" type="checkbox" defaultChecked={p.active} className="h-4 w-4" />
                    <button type="submit" className="h-9 rounded-lg bg-[#191f28] text-[13px] font-semibold text-white">저장</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form action={createPrizeAction} className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-6">
        <h2 className="col-span-full text-[16px] font-bold">경품 추가</h2>
        <input name="name" required placeholder="이름" className={input} />
        <select name="kind" className={input}><option value="points">points</option><option value="gifticon">gifticon</option><option value="none">none(꽝)</option></select>
        <input name="value" type="number" placeholder="값(P 또는 원)" className={input} />
        <input name="weight" type="number" min={0} defaultValue={1} placeholder="가중치" className={input} />
        <input name="sort" type="number" defaultValue={99} placeholder="정렬" className={input} />
        <button type="submit" className="h-9 rounded-lg bg-[#427cff] text-[13px] font-bold text-white">추가</button>
      </form>
      <p className="text-[12px] text-[#8b94a0]">확률 = 가중치 / 활성 가중치 합. 변경 즉시 다음 스핀부터 적용(서버 추첨). 인메모리 저장소에서는 서버 재시작 시 시드로 돌아가요.</p>
    </div>
  );
}

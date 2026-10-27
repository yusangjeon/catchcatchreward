import { requireAdmin } from "@/lib/admin/auth";
import { getRepo } from "@/lib/db";
import { KIND_LABEL } from "@/lib/missions/service";
import { createStoreMissionAction, toggleStoreMissionAction } from "../actions";

/** 매장 미션(캐치랭크 Axis A) 등록·현황. 인증코드는 여기서만 보인다 */
export default async function AdminStores() {
  await requireAdmin();
  const repo = getRepo();
  const [missions, counts] = await Promise.all([repo.listStoreMissions(false), repo.countStoreCompletionsByMission()]);
  const input = "h-10 rounded-lg border border-[#dee2e9] px-3 text-[14px]";
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[22px] font-bold">매장 미션 <span className="ml-2 text-[13px] font-medium text-[#8b94a0]">캐치랭크 제휴 매장 방문·저장·리뷰 → 포인트 + 스탬프</span></h1>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-[#f8f9fc] text-[12px] text-[#8b94a0]">
            <tr><th className="px-4 py-3">매장</th><th className="px-4 py-3">종류</th><th className="px-4 py-3">미션</th><th className="px-4 py-3">보상</th><th className="px-4 py-3">인증코드</th><th className="px-4 py-3">완료/정원</th><th className="px-4 py-3">상태</th></tr>
          </thead>
          <tbody>
            {missions.map((m) => (
              <tr key={m.id} className="border-t border-[#f1f3f8]">
                <td className="px-4 py-3">{m.storeName}</td>
                <td className="px-4 py-3">{KIND_LABEL[m.kind]}</td>
                <td className="px-4 py-3">{m.title}</td>
                <td className="px-4 py-3 tabular-nums">{m.rewardPoints}P</td>
                <td className="px-4 py-3 font-mono">{m.code}</td>
                <td className="px-4 py-3 tabular-nums">{counts[m.id] ?? 0} / {m.capacity || "∞"}</td>
                <td className="px-4 py-3">
                  <form action={toggleStoreMissionAction} className="inline">
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="active" value={m.active ? "0" : "1"} />
                    <button type="submit" className={`rounded-full px-3 py-1 text-[12px] font-semibold ${m.active ? "bg-[#e9f7ef] text-[#1aa260]" : "bg-[#f2f3f5] text-[#8b94a0]"}`}>{m.active ? "진행 중" : "중지"}</button>
                  </form>
                </td>
              </tr>
            ))}
            {missions.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-[#8b94a0]">등록된 매장 미션이 없어요</td></tr>}
          </tbody>
        </table>
      </div>
      <form action={createStoreMissionAction} className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-[16px] font-bold">매장 미션 등록</h2>
        <div className="grid grid-cols-2 gap-3">
          <input name="storeName" required placeholder="매장명 (예: 엠플리파이 카페 성수점)" className={input} />
          <select name="kind" className={input}>
            <option value="visit">방문</option><option value="save">플레이스 저장</option><option value="review">리뷰</option>
          </select>
        </div>
        <input name="title" required placeholder="미션 제목 (예: 매장 방문하고 인증코드 입력)" className={input} />
        <input name="description" placeholder="안내 문구 (선택)" className={input} />
        <div className="grid grid-cols-4 gap-3">
          <input name="rewardPoints" type="number" defaultValue={300} placeholder="보상 P" className={input} />
          <input name="code" required minLength={4} maxLength={8} placeholder="인증코드(4~8자)" className={input} />
          <input name="capacity" type="number" defaultValue={0} placeholder="정원(0=무제한)" className={input} />
          <input name="sort" type="number" defaultValue={99} placeholder="정렬" className={input} />
        </div>
        <button type="submit" className="h-10 self-start rounded-lg bg-[#191f28] px-5 text-[14px] font-bold text-white">등록</button>
      </form>
    </div>
  );
}

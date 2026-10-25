import { requireAdmin } from "@/lib/admin/auth";
import { getRepo } from "@/lib/db";
import { productByKind } from "@/lib/exchange/products";
import { updateRedemptionAction } from "../actions";

const STATUS: Record<string, string> = { requested: "신청", processing: "처리 중", done: "발송 완료", rejected: "반려(환불)" };

export default async function AdminRedemptions() {
  await requireAdmin();
  const reds = await getRepo().listRedemptions();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[22px] font-bold">교환 신청 <span className="ml-2 text-[14px] font-medium text-[#8b94a0]">1차 수동 발송</span></h1>
      {reds.length === 0 && <p className="rounded-2xl bg-white p-6 text-[14px] text-[#8b94a0] shadow-sm">신청 내역이 없어요.</p>}
      <div className="flex flex-col gap-3">
        {reds.map((r) => (
          <form key={r.id} action={updateRedemptionAction.bind(null, r.id, "processing")} className="grid grid-cols-1 items-center gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-[1.4fr_1fr_.8fr_1.2fr_auto]">
                        <div>
              <p className="text-[14px] font-semibold">{productByKind(r.kind)?.name ?? r.kind}</p>
              <p className="text-[12px] text-[#8b94a0]">{new Date(r.requestedAt).toLocaleString("ko-KR")} · {r.amountPoints.toLocaleString("ko-KR")}P</p>
            </div>
            <p className="truncate font-mono text-[12px] text-[#5c6573]" title={r.userId}>유저 {r.userId}</p>
            <span className={`w-fit rounded-full px-3 py-1 text-[12px] font-semibold ${r.status === "done" ? "bg-[#e7faf5] text-[#00b795]" : r.status === "rejected" ? "bg-[#ffecf1] text-[#ff3d71]" : r.status === "processing" ? "bg-[#fff4e0] text-[#ff9500]" : "bg-[#f0f4ff] text-[#427cff]"}`}>{STATUS[r.status]}</span>
            <input name="memo" defaultValue={r.memo ?? ""} placeholder="메모(기프티콘 번호·사유)" className="h-9 rounded-lg border border-[#dee2e9] px-2 text-[13px]" />
            <div className="flex gap-1">
              {r.status !== "done" && r.status !== "rejected" && (
                <>
                  <button type="submit" formAction={updateRedemptionAction.bind(null, r.id, "processing")} className="h-9 rounded-lg border border-[#dee2e9] px-3 text-[12px]">처리 중</button>
                  <button type="submit" formAction={updateRedemptionAction.bind(null, r.id, "done")} className="h-9 rounded-lg bg-[#427cff] px-3 text-[12px] font-semibold text-white">발송 완료</button>
                  <button type="submit" formAction={updateRedemptionAction.bind(null, r.id, "rejected")} className="h-9 rounded-lg bg-[#ff3d71] px-3 text-[12px] font-semibold text-white">반려·환불</button>
                </>
              )}
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}

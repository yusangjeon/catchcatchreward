import { requireAdmin } from "@/lib/admin/auth";
import { grantAction } from "../actions";

export default async function AdminGrant({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string; user?: string; points?: string; stamps?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const input = "h-10 rounded-lg border border-[#dee2e9] px-3 text-[14px]";
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="text-[22px] font-bold">수동 지급 · 조정</h1>
      {sp.ok && <p className="rounded-xl bg-[#e7faf5] p-3 text-[14px] text-[#00b795]">유저 {sp.user?.slice(0, 8)}… 에게 포인트 {sp.points}P · 스탬프 {sp.stamps}개 지급했어요.</p>}
      {sp.error === "notfound" && <p className="rounded-xl bg-[#ffecf1] p-3 text-[14px] text-[#ff3d71]">유저를 찾을 수 없어요. 프로필 id 또는 anonKey(쿠키 ccr_uid 값)를 확인하세요.</p>}
      <form action={grantAction} className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm">
        <input name="target" required placeholder="유저 id 또는 anonKey" className={input} />
        <div className="grid grid-cols-2 gap-2">
          <input name="points" type="number" defaultValue={0} placeholder="포인트(±)" className={input} />
          <input name="stamps" type="number" min={0} defaultValue={0} placeholder="스탬프(+)" className={input} />
        </div>
        <input name="memo" placeholder="메모 (원장 memo, 유저 내역에 노출)" className={input} />
        <button type="submit" className="h-10 rounded-lg bg-[#427cff] text-[14px] font-bold text-white">지급</button>
      </form>
      <p className="text-[12px] leading-5 text-[#8b94a0]">포인트는 원장 reason=admin_adjust 로 기록돼 유저 내역에 &quot;운영 조정&quot;으로 보여요. 스탬프는 sourceType=admin. 개발용 /api/dev/stamps 대신 이 화면을 쓰세요.</p>
    </div>
  );
}

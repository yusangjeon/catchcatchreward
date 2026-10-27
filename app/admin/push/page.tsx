import { requireAdmin } from "@/lib/admin/auth";
import { getRepo } from "@/lib/db";
import { pushEnabled } from "@/lib/push/service";
import { broadcastPushAction } from "../actions";

/** 푸시 — 구독 현황·전체 발송. 일일 리마인드는 Vercel Cron(/api/push/cron, 09:00 KST) */
export default async function AdminPush({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const subs = await getRepo().listPushSubscriptions();
  const users = new Set(subs.map((s) => s.userId)).size;
  const input = "h-10 w-full rounded-lg border border-[#dee2e9] px-3 text-[14px]";
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[22px] font-bold">푸시 알림 <span className="ml-2 text-[13px] font-medium text-[#8b94a0]">웹푸시(VAPID) · 매일 09:00 KST 자동 리마인드</span></h1>
      {!pushEnabled() && <p className="rounded-xl bg-[#fff6e5] px-4 py-3 text-[13px] text-[#9a5b00]">VAPID 키가 없어 비활성 상태예요. 터미널에서 <code>pnpm push:keys</code> 로 키를 만들어 Vercel 환경변수 VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY 에 넣고 Redeploy 하세요.</p>}
      {sp.sent !== undefined && <p className="rounded-xl bg-[#e9f7ef] px-4 py-3 text-[13px] text-[#1aa260]">발송 {sp.sent}건 · 실패 {sp.failed}건 · 만료 삭제 {sp.removed}건</p>}
      <div className="grid grid-cols-3 gap-3">
        {[["구독 기기", subs.length], ["구독 유저", users], ["상태", pushEnabled() ? "활성" : "비활성"]].map(([k, v]) => (
          <div key={String(k)} className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-[12px] text-[#8b94a0]">{k}</p><p className="mt-1 text-[22px] font-bold">{v}</p></div>
        ))}
      </div>
      <form action={broadcastPushAction} className="flex max-w-[520px] flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-[15px] font-bold">전체 발송</p>
        <input name="title" required maxLength={60} placeholder="제목 (예: 오늘만 퀴즈 보상 2배!)" className={input} />
        <input name="body" required maxLength={140} placeholder="본문" className={input} />
        <input name="url" placeholder="열 경로 (기본 /)" className={input} />
        <button type="submit" disabled={!pushEnabled()} className="h-10 rounded-lg bg-[#427cff] text-[14px] font-bold text-white disabled:opacity-40">구독자 전체에게 보내기</button>
      </form>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[#f8f9fc] text-[12px] text-[#8b94a0]"><tr><th className="px-4 py-3">유저</th><th className="px-4 py-3">기기</th><th className="px-4 py-3">등록</th></tr></thead>
          <tbody>
            {subs.slice(0, 100).map((s) => <tr key={s.id} className="border-t border-[#f1f3f8]"><td className="px-4 py-2 font-mono text-[12px]">{s.userId.slice(0, 8)}</td><td className="max-w-[360px] truncate px-4 py-2 text-[#5c6573]">{s.userAgent ?? "-"}</td><td className="px-4 py-2 tabular-nums">{s.createdAt.slice(0, 16).replace("T", " ")}</td></tr>)}
            {subs.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-[#8b94a0]">구독 기기가 없어요</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

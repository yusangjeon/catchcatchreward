import { requireAdmin } from "@/lib/admin/auth";
import { repoKind } from "@/lib/db";
import { dbStatus, maskDbUrl } from "@/lib/db/migrate";
import { migrateDbAction } from "../actions";

/** DB 연결 상태·테이블 행 수, 스키마 적용 + 시드 버튼 */
export default async function AdminDb({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const url = process.env.DATABASE_URL;
  let status: Awaited<ReturnType<typeof dbStatus>> | null = null;
  if (url) {
    const { pgClient } = await import("@/lib/db/postgres");
    status = await dbStatus(pgClient(url), url);
  }
  const missing = status ? status.tables.filter((t) => !t.exists).length : 0;
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-[22px] font-bold">DB <span className="ml-2 text-[13px] font-medium text-[#8b94a0]">저장소: {repoKind()}</span></h1>
      {sp.ok && <p className="rounded-xl bg-[#e7faf5] p-3 text-[14px] text-[#00b795]">스키마 적용 완료. 새로 넣은 시드: {sp.ok}</p>}
      {sp.error && <p className="rounded-xl bg-[#ffecf1] p-3 text-[14px] text-[#ff3d71]">{sp.error === "nourl" ? "DATABASE_URL 이 없어요." : `실패: ${sp.error}`}</p>}
      {!url ? (
        <section className="rounded-2xl bg-white p-5 text-[14px] leading-7 shadow-sm">
          <p className="font-bold">인메모리 저장소로 동작 중 — 서버 인스턴스가 바뀌면 데이터가 초기화돼요.</p>
          <ol className="mt-2 list-decimal pl-5 text-[#5c6573]">
            <li>supabase.com 에서 프로젝트 생성(리전 Northeast Asia · Seoul)</li>
            <li>Project Settings → Database → Connection string → <b>URI</b> 탭, Mode <b>Transaction</b>(6543) 값을 복사하고 [YOUR-PASSWORD] 를 DB 비밀번호로 교체</li>
            <li>Vercel → Settings → Environment Variables 에 <code className="rounded bg-[#f4f6fa] px-1">DATABASE_URL</code> 로 저장 → Redeploy</li>
            <li>다시 이 화면에 들어와 <b>스키마 적용 + 시드</b> 클릭</li>
          </ol>
        </section>
      ) : (
        <>
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-[14px]">연결: <code className="rounded bg-[#f4f6fa] px-1 text-[12px]">{maskDbUrl(url)}</code> · {status?.connected ? <span className="text-[#00b795]">정상</span> : <span className="text-[#ff3d71]">실패 — {status?.error}</span>}</p>
            {status?.connected && (
              <p className="mt-2 text-[13px] text-[#5c6573]">{missing > 0 ? `테이블 ${missing}개가 아직 없어요. 아래 버튼으로 스키마를 적용하세요.` : "모든 테이블이 준비됐어요."}</p>
            )}
            <form action={migrateDbAction} className="mt-4">
              <button type="submit" className="h-10 rounded-lg bg-[#191f28] px-5 text-[14px] font-bold text-white">스키마 적용 + 시드</button>
              <span className="ml-3 text-[12px] text-[#8b94a0]">여러 번 눌러도 안전(없는 것만 생성)</span>
            </form>
          </section>
          {status?.connected && (
            <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-[#f8f9fc] text-[12px] text-[#8b94a0]"><tr><th className="px-4 py-3">테이블</th><th className="px-4 py-3">상태</th><th className="px-4 py-3">행 수</th></tr></thead>
                <tbody>
                  {status.tables.map((t) => (
                    <tr key={t.name} className="border-t border-[#f1f3f8]">
                      <td className="px-4 py-2 font-mono text-[12px]">{t.name}</td>
                      <td className="px-4 py-2">{t.exists ? <span className="text-[#00b795]">있음</span> : <span className="text-[#ff3d71]">없음</span>}</td>
                      <td className="px-4 py-2 tabular-nums">{t.rows.toLocaleString("ko-KR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

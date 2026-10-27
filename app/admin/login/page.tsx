import { adminEnabled, isAdmin } from "@/lib/admin/auth";
import { redirect } from "next/navigation";
import { loginAction } from "../actions";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;
  return (
    <div className="mx-auto mt-16 max-w-sm rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-[20px] font-bold">관리자 로그인</h1>
      {!adminEnabled() ? (
        <p className="mt-4 text-[14px] leading-6 text-[#5c6573]">
          관리자가 비활성 상태예요. 배포 환경변수에 <code className="rounded bg-[var(--color-bg-2)] px-1">ADMIN_KEY</code>를 설정하면 열려요. 로컬 QA는 <code className="rounded bg-[var(--color-bg-2)] px-1">CCR_DEV_TOOLS=1</code>.
        </p>
      ) : (
        <form action={loginAction} className="mt-4 flex flex-col gap-3">
          <input name="key" type="password" placeholder="ADMIN_KEY" autoComplete="current-password" className="h-11 rounded-xl border border-[#dee2e9] px-3 text-[14px]" />
          {error && (
            <p className="text-[13px] text-[#ff3939]">
              키가 올바르지 않아요.
              <span className="mt-1 block text-[11px] text-[#8b94a0]">
                서버에 설정된 키 길이 {(process.env.ADMIN_KEY ?? "").trim().length}자 · 배포 {(process.env.VERCEL_GIT_COMMIT_SHA ?? "local").slice(0, 7)}
              </span>
            </p>
          )}
          <button type="submit" className="h-11 rounded-xl bg-[var(--color-myb)] text-[15px] font-bold text-white">로그인</button>
        </form>
      )}
    </div>
  );
}

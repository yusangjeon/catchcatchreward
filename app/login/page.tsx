import Link from "next/link";
import { kakaoEnabled } from "@/lib/auth/kakao";

/** 로그인 — 카카오 1클릭. 익명으로 쌓은 기록은 로그인 시 그대로 이어진다 */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const kakao = kakaoEnabled();
  const dev = process.env.CCR_DEV_TOOLS === "1";
  return (
    <div className="min-h-dvh bg-white px-6 pb-10 pt-14 text-[#191f28]">
      <Link href="/" className="text-[14px] text-[#8b94a0]">← 홈</Link>
      <h1 className="mt-8 text-[26px] font-bold leading-[34px]">로그인하면<br />포인트를 안전하게 지켜요</h1>
      <p className="mt-3 text-[14px] leading-[21px] text-[#5c6573]">지금까지 모은 포인트·스탬프·배지는 로그인해도 그대로 이어져요. 폰을 바꿔도, 앱을 지워도 계정으로 돌아옵니다.</p>
      {error && <p className="mt-4 rounded-xl bg-[#ffecf1] px-4 py-3 text-[13px] text-[#ff3d71]">{error === "not_configured" ? "카카오 로그인이 아직 설정되지 않았어요." : error === "state" ? "로그인 요청이 만료됐어요. 다시 시도해 주세요." : "로그인에 실패했어요. 다시 시도해 주세요."}</p>}
      <div className="mt-8 flex flex-col gap-3">
        {kakao ? (
          <a href="/api/auth/kakao" className="myb-press flex h-[54px] items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-[16px] font-bold text-[#191600]">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden><path fill="#191600" d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7L5.6 21.5c-.1.3.3.6.6.4l4.3-2.9c.5.1 1 .1 1.5.1 5.5 0 10-3.6 10-8.1S17.5 3 12 3Z" /></svg>
            카카오로 3초 만에 시작하기
          </a>
        ) : (
          <div className="flex h-[54px] items-center justify-center rounded-xl bg-[#FEE500]/50 text-[15px] font-bold text-[#191600]/60">카카오 로그인 (설정 대기 중)</div>
        )}
        {dev && (
          <form action="/api/auth/dev" method="post" className="mt-4 flex flex-col gap-2 rounded-xl border border-dashed border-[#dee2e9] p-4">
            <p className="text-[12px] font-semibold text-[#8b94a0]">개발용 모의 로그인 (CCR_DEV_TOOLS)</p>
            <input name="id" placeholder="계정 id (예: tester1)" className="h-10 rounded-lg border border-[#dee2e9] px-3 text-[14px]" />
            <input name="nickname" placeholder="닉네임 (선택)" className="h-10 rounded-lg border border-[#dee2e9] px-3 text-[14px]" />
            <button type="submit" className="h-10 rounded-lg bg-[#191f28] text-[14px] font-bold text-white">모의 로그인</button>
          </form>
        )}
      </div>
      <p className="mt-6 text-[11px] leading-[17px] text-[#b0b8c1]">로그인 시 <Link href="/terms" className="underline">이용약관</Link>과 <Link href="/terms#privacy" className="underline">개인정보처리방침</Link>에 동의한 것으로 봅니다.</p>
    </div>
  );
}

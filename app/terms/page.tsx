import { GameHeader } from "@/components/games/GameHeader";

/** 이용약관·개인정보처리방침 (베타용 요약본 — 정식 오픈 전 법률 검토 필요) */
export default function TermsPage() {
  const h = "mt-5 text-[15px] font-bold";
  const p = "mt-2 text-[13px] leading-[21px] text-[#5c6573]";
  return (
    <div className="min-h-dvh bg-[#f8f9fc] pb-10 text-[#191f28]">
      <GameHeader title="약관 · 개인정보" />
      <div className="px-5 pt-[64px]">
        <section className="rounded-[20px] bg-white p-5" style={{ boxShadow: "0 5px 16px 0 rgba(0, 43, 141, 0.1)" }}>
          <h2 className="text-[17px] font-extrabold">이용약관 (베타)</h2>
          <h3 className={h}>1. 서비스</h3><p className={p}>캐치캐치리워드(이하 서비스)는 엠플리파이가 운영하는 리워드 서비스로, 퀴즈·미션·게임 참여에 따라 포인트를 지급합니다. 베타 기간 중 기능과 보상 정책은 사전 고지 후 변경될 수 있습니다.</p>
          <h3 className={h}>2. 포인트</h3><p className={p}>포인트는 서비스 내 교환에만 사용할 수 있으며 현금으로 지급되지 않습니다. 최소 교환 단위, 상품 종류, 처리 기간은 교환 화면에 표시된 기준을 따릅니다. 마지막 이용일로부터 1년간 이용이 없으면 포인트가 소멸될 수 있습니다.</p>
          <h3 className={h}>3. 부정 이용</h3><p className={p}>다중 계정, 자동화 프로그램, 타인 명의 이용, 인증코드 무단 공유 등이 확인되면 보상을 회수하고 이용을 제한할 수 있습니다.</p>
          <h3 className={h}>4. 제휴 서비스</h3><p className={p}>쇼핑적립·광고 참여 등 제휴 서비스는 각 제휴사의 정책을 따르며, 적립 확정은 제휴사 확인 후 반영됩니다.</p>
          <h2 id="privacy" className="mt-8 text-[17px] font-extrabold">개인정보처리방침 (베타)</h2>
          <h3 className={h}>수집 항목</h3><p className={p}>익명 식별자(쿠키), 소셜 로그인 시 제공자 식별자·닉네임·프로필 사진, 퀴즈 응답·참여 기록, 포인트 원장, 기프티콘 발송을 위한 연락처(교환 시).</p>
          <h3 className={h}>이용 목적</h3><p className={p}>포인트 지급·정산, 취향 기반 콘텐츠 추천(배지·세그먼트), 부정 이용 방지, 고객 문의 대응. 세그먼트 정보는 식별 불가능한 통계 형태로만 광고주에게 제공됩니다.</p>
          <h3 className={h}>보관·파기</h3><p className={p}>회원 탈퇴 또는 목적 달성 후 지체 없이 파기하며, 관계 법령에 따라 보관이 필요한 거래 기록은 해당 기간 보관합니다.</p>
          <h3 className={h}>문의</h3><p className={p}>개인정보 관련 문의: amplify15813@gmail.com</p>
          <p className="mt-6 text-[11px] text-[#b0b8c1]">시행일 2026-10-27 · 정식 오픈 전 법률 검토를 거쳐 전문으로 교체 예정</p>
        </section>
      </div>
    </div>
  );
}

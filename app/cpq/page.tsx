import { ComingSoon } from "@/components/ComingSoon";

export default function CpqPage() {
  return <ComingSoon title="초간단적립" desc="앱 설치·회원가입 같은 간단 참여 적립은 제휴사 연동 후 열려요. 지금은 퀴즈·출석·매장 미션으로 바로 적립할 수 있어요." image="/brand/qm_store.webp" alt={[{ label: "매장 미션", href: "/missions", sub: "매장 방문·저장·리뷰 인증하고 포인트" }, { label: "출석체크", href: "/attendance", sub: "매일 10P, 7일 연속 +50P" }, { label: "친구 초대", href: "/invite", sub: "친구 300P · 나는 500P" }]} />;
}

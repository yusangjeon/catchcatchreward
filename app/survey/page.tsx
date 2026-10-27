import { ComingSoon } from "@/components/ComingSoon";

export default function SurveyPage() {
  return <ComingSoon title="설문 보상" desc="설문 보상은 설문 제휴사 연동 후 열려요. 취향 퀴즈는 지금 바로 참여하고 포인트를 받을 수 있어요." icon="chat" alt={[{ label: "취향 퀴즈", href: "/quiz", sub: "2~4지선다, 정답 없음, 세트당 포인트 + 스탬프" }, { label: "3일 혜택", href: "/newbie", sub: "가입 3일 동안 매일 퀴즈 3개 → 최대 1,500P" }, { label: "월간 도전 과제", href: "/monthly", sub: "이번 달 최대 3,300P" }]} />;
}

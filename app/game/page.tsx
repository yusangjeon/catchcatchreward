import { ComingSoon } from "@/components/ComingSoon";

export default function GamePage() {
  return <ComingSoon title="게임적립" desc="게임 설치·플레이 보상은 제휴사(오퍼월) 연동 후 열려요. 지금은 미니게임으로 매일 포인트를 모을 수 있어요." image="/brand/qm_games.webp" alt={[{ label: "미니게임", href: "/games", sub: "틀린그림찾기·2048·복권·가위바위보·카드 뒤집기" }, { label: "취향 퀴즈", href: "/quiz", sub: "퀴즈 1세트 = 포인트 + 스탬프" }, { label: "무료 룰렛", href: "/roulette", sub: "스탬프 10개로 최대 5,000원 상품권" }]} />;
}

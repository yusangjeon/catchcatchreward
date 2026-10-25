export interface BenefitGame {
  id: string;
  title: string;
  icon: string;
  missionText: string;
  missionPoint: number;
  bonusPoint: number; // "+1,000 추가 보상"
  totalPoint: number;
}

export interface BenefitSurvey {
  id: string;
  title: string;
  loi: number; // 소요 분
  reward: number;
  label: { text: string; color: string; bg: string } | null;
}

export interface EarnMenu {
  key: string;
  icon: string;
  title: string;
  sub: string;
  hot?: boolean;
  href: string;
}

export interface BenefitPayload {
  balance: number;
  /** 비포인트 러쉬 종료 시각(ISO). 매주 일요일 23:59 KST */
  rushEndsAt: string;
  hero: BenefitGame;
  games: BenefitGame[];
  surveys: BenefitSurvey[];
  earnMenu: EarnMenu[];
}

/**
 * 보상 지급 오버레이 이벤트 버스. 어느 화면에서든 showReward() 를 호출하면
 * 레이아웃에 마운트된 <RewardLayer/> 가 마이비 실측 타임라인으로 연출한다.
 *  - big   : 딤 0.13s → 잔액 알약 슬롯 롤링 0.87s → "보상 지급!" → 발광 코인 → "P n 를 받았어요!" → 2.5s 유지 → 0.3s 페이드
 *  - small : 딤 0.07s → 타이틀 + 캐릭터(코인 한아름) + 빛줄기 1.2s → 0.2s 해제 → (호출측) 잔액 비행
 */
export type RewardOpts = {
  variant?: "big" | "small";
  points: number;
  /** 롤링 전/후 잔액(big). 없으면 to-points → to */
  from?: number;
  to?: number;
  title?: string;
  subtitle?: string;
  /** 보상 오브젝트 이미지. 기본 big=코인 더미, small=코인 안은 마스코트 */
  image?: string;
  /** 자동 종료까지(ms). big 2500 / small 1200 */
  holdMs?: number;
  /** 보상 단위 라벨. 기본 "P" */
  unit?: string;
};

export const REWARD_EVENT = "ccr:reward";

export function showReward(opts: RewardOpts): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  return new Promise((resolve) => {
    window.dispatchEvent(new CustomEvent(REWARD_EVENT, { detail: { ...opts, resolve } }));
  });
}

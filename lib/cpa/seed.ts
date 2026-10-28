/** 고보상·간편 참여(CPA: 팔로우·구독·가입) 목업 — 마이비 native-easy 캡처 구조(제목·설명·보상·안내). 제휴 연동 전 미리보기 */
export interface CpaItem { id: string; title: string; action: string; reward: number; kind: "follow" | "subscribe" | "signup" | "install" | "visit"; hot?: boolean }
export const CPA_ITEMS: CpaItem[] = [
  { id: "c1", title: "약속스타그램", action: "인스타그램 팔로우하고 보상 받기", reward: 180, kind: "follow" },
  { id: "c2", title: "프로미TV", action: "유튜브 구독하고 보상 받기", reward: 180, kind: "subscribe" },
  { id: "c3", title: "대전일보 뉴스", action: "네이버 뉴스 구독하고 보상 받기", reward: 150, kind: "subscribe" },
  { id: "c4", title: "스트레스솔루션", action: "회원가입하고 보상 받기", reward: 480, kind: "signup", hot: true },
  { id: "c5", title: "JDC면세점", action: "회원가입하고 보상 받기", reward: 490, kind: "signup", hot: true },
  { id: "c6", title: "라이프플래닛 정기보험", action: "보험료 계산하고 보상 받기", reward: 1200, kind: "visit", hot: true },
  { id: "c7", title: "오늘의집", action: "앱 설치하고 첫 실행", reward: 350, kind: "install" },
  { id: "c8", title: "카카오페이 증권", action: "계좌 개설하고 보상 받기", reward: 3000, kind: "signup", hot: true },
  { id: "c9", title: "브랜드 카페 채널", action: "네이버 카페 가입하고 글 작성", reward: 64, kind: "follow" },
  { id: "c10", title: "로컬 맛집 플레이스", action: "플레이스 저장하고 보상 받기", reward: 20, kind: "visit" },
];
export const CPA_GOAL = { goalPoint: 1000, rewardPoint: 100 }; // 누적 1,000P 참여 시 +100P 보너스(마이비 high-reward/mission 구조)
export const KIND_LABEL: Record<CpaItem["kind"], string> = { follow: "팔로우", subscribe: "구독", signup: "가입", install: "설치", visit: "방문" };
export const KIND_ICON: Record<CpaItem["kind"], string> = { follow: "invite", subscribe: "bell", signup: "doc", install: "games", visit: "store" };

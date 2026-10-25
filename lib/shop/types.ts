export interface Merchant {
  id: string;
  name: string;
  logo: string; // 가로 로고(133×32 박스)
  logoCircle: string; // 원형 로고
  rate: number; // 최대 적립률(%). 쿠팡은 0(정액 P)
  recommendIndex: number;
  isNew: boolean;
}

export interface GuideToken {
  text: string;
  accent: boolean;
}

export interface MerchantDetail {
  guide: GuideToken[][]; // "지금 구매하면" 번호 안내
  description: { left: string; right: string; postfix: string }[]; // 적립 대상 표
  deny: string[]; // 꼭 읽어보세요!
  buttons: { id: string; label: string }[]; // 쿠팡: 2만원/5만원 이상 구매
}

export interface ShopPayload {
  pendingPoint: number; // 적립 예정 포인트
  asOf: string; // "2026.10.25 05:36:50"
  topBanner: { image: string; title: string; description: string; merchantId: string };
  favorites: string[]; // 즐겨찾는 쇼핑몰 id
  recommended: string[]; // 오늘 여기서 쇼핑 어때요? (4개)
  merchants: Merchant[];
  notices: string[];
  firstPurchaseTarget: boolean; // 첫 구매 두 배 팝업
}

export interface MerchantPayload {
  merchant: Merchant;
  isFavorite: boolean; // 즐겨찾기(핀) 여부 → 별 노란색
  detail: MerchantDetail;
  nudge: Merchant[]; // 이 쇼핑몰도 추천해요!
  notices: string[];
}

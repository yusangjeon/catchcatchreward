/** 쇼핑적립 시드 — 마이비 shop.myb.im 캡처(2026-10-25) /v1/api/cps/* 응답값. 아이콘은 각 쇼핑몰 공식 파비콘(public/shop/icons, 96px) */
import type { Merchant, MerchantDetail } from "./types";

/** 전체 쇼핑몰(인기 쇼핑몰 순 = API 응답 순서). 쿠팡은 "오늘 여기서 쇼핑 어때요?"에만 노출 */
export const MERCHANTS: Merchant[] = [
  { id: "coupang_pincrux_group", name: "쿠팡", logo: "/shop/icons/coupang_pincrux_group.png", logoCircle: "/shop/icons/coupang_pincrux_group.png", rate: 0, recommendIndex: 2, isNew: false },
  { id: "naver_plus_store_adbc", name: "네이버+스토어", logo: "/shop/icons/naver_plus_store_adbc.png", logoCircle: "/shop/icons/naver_plus_store_adbc.png", rate: 1.2, recommendIndex: 3, isNew: true },
  { id: "gmarket", name: "G마켓", logo: "/shop/icons/gmarket.png", logoCircle: "/shop/icons/gmarket.png", rate: 1.7, recommendIndex: 6, isNew: false },
  { id: "aliexpress", name: "알리익스프레스", logo: "/shop/icons/aliexpress.png", logoCircle: "/shop/icons/aliexpress.png", rate: 6.3, recommendIndex: 0, isNew: false },
  { id: "ohouse", name: "오늘의집", logo: "/shop/icons/ohouse.png", logoCircle: "/shop/icons/ohouse.png", rate: 3.6, recommendIndex: 0, isNew: false },
  { id: "ssg", name: "SSG", logo: "/shop/icons/ssg.png", logoCircle: "/shop/icons/ssg.png", rate: 3, recommendIndex: 0, isNew: false },
  { id: "emartmall", name: "이마트몰", logo: "/shop/icons/emartmall.png", logoCircle: "/shop/icons/emartmall.png", rate: 3, recommendIndex: 0, isNew: false },
  { id: "ctrip", name: "트립닷컴", logo: "/shop/icons/ctrip.png", logoCircle: "/shop/icons/ctrip.png", rate: 3.85, recommendIndex: 0, isNew: false },
  { id: "agoda", name: "아고다", logo: "/shop/icons/agoda.png", logoCircle: "/shop/icons/agoda.png", rate: 5.6, recommendIndex: 0, isNew: false },
  { id: "yanolja", name: "NOL", logo: "/shop/icons/yanolja.png", logoCircle: "/shop/icons/yanolja.png", rate: 2.8, recommendIndex: 10, isNew: false },
  { id: "hotelskr", name: "호텔스닷컴", logo: "/shop/icons/hotelskr.png", logoCircle: "/shop/icons/hotelskr.png", rate: 4.4, recommendIndex: 0, isNew: false },
  { id: "expedia", name: "익스피디아", logo: "/shop/icons/expedia.png", logoCircle: "/shop/icons/expedia.png", rate: 3.5, recommendIndex: 0, isNew: false },
  { id: "himart", name: "롯데하이마트", logo: "/shop/icons/himart.png", logoCircle: "/shop/icons/himart.png", rate: 1.26, recommendIndex: 0, isNew: false },
  { id: "auction", name: "옥션", logo: "/shop/icons/auction.png", logoCircle: "/shop/icons/auction.png", rate: 0.6, recommendIndex: 6, isNew: false },
  { id: "wconcept", name: "W컨셉", logo: "/shop/icons/wconcept.png", logoCircle: "/shop/icons/wconcept.png", rate: 2.1, recommendIndex: 0, isNew: false },
  { id: "11st", name: "11번가", logo: "/shop/icons/11st.png", logoCircle: "/shop/icons/11st.png", rate: 0.7, recommendIndex: 0, isNew: false },
  { id: "kbbook", name: "인터넷교보문고", logo: "/shop/icons/kbbook.png", logoCircle: "/shop/icons/kbbook.png", rate: 2.1, recommendIndex: 0, isNew: false },
  { id: "gseshop", name: "GS SHOP", logo: "/shop/icons/gseshop.png", logoCircle: "/shop/icons/gseshop.png", rate: 1.6, recommendIndex: 0, isNew: false },
  { id: "woori", name: "롯데홈쇼핑", logo: "/shop/icons/woori.png", logoCircle: "/shop/icons/woori.png", rate: 1.2, recommendIndex: 0, isNew: false },
  { id: "cjbrand", name: "CJ더마켓", logo: "/shop/icons/cjbrand.png", logoCircle: "/shop/icons/cjbrand.png", rate: 2.1, recommendIndex: 0, isNew: false },
];

/** 쇼핑적립 유의사항(메인 하단 19항목, DOM 원문) */
export const NOTICES: string[] = [
  "캐치캐치리워드에서 쇼핑몰로 이동한 뒤 결제한 건만 적립돼요. 이동 전에 담아 둔 장바구니는 적립이 안 될 수 있어요.",
  "적립 기준 금액은 쿠폰·포인트·배송비·부가세를 뺀 실결제 금액이에요.",
  "적립률과 적립 시점은 쇼핑몰 정책에 따라 바뀔 수 있어요.",
  "쇼핑몰 이동 후 가격비교·다른 앱·'앱으로 보기'로 옮겨가면 적립이 끊길 수 있어요. 같은 브라우저에서 결제까지 끝내 주세요.",
  "광고 차단, VPN, 쿠키 차단, 광고 추적 비허용 상태에서는 적립이 되지 않아요.",
  "적립은 배송 완료·구매 확정 뒤 순차 지급돼요. 취소·환불·교환 건은 제외돼요.",
  "쇼핑몰별 적립 제외 품목(상품권·도서정가제·디지털 콘텐츠 등)은 적립되지 않아요.",
  "연속으로 구매할 때는 브라우저를 닫고 캐치캐치리워드에서 다시 이동해 주세요.",
];

/** 상세 안내 — 쿠팡·네이버+스토어는 제휴 조건 기준으로 우리 문구로 정리, 나머지는 네이버+스토어 템플릿에 적립률만 치환 */
export const DETAILS: Record<string, MerchantDetail> = {
  "coupang_pincrux_group": { guide: [[{"text": "쿠팡 쇼핑혜택 푸시 수신 동의", "accent": false}], [{"text": "2만원 / 5만원 이상", "accent": true}, {"text": " 상품 구입", "accent": false}], [{"text": "구매확정 후 ", "accent": false}, {"text": " 1회 즉시 지급!", "accent": true}]], description: [{"left": "디지털 제품", "right": "500P / 1,100P", "postfix": "즉시적립"}, {"left": "일반 제품", "right": "500P / 1,100P", "postfix": "즉시적립"}, {"left": "프레쉬 제품", "right": "500P / 1,100P", "postfix": "즉시적립"}], deny: ["쿠팡 앱 로그인 후 마케팅 정보 수집 및 이용 동의가 필요합니다.", "쿠팡에서 5만원 이상 구매시 포인트가 지급됩니다. (배송비 제외)", "광고 ID를 임의로 변경할 경우 보상이 지급되지 않을 수 있습니다.", "보상 미지급 시, 구매일로부터 7일 이내에 문의해주세요.", "쿠팡 관련 문의는 캐치캐치리워드 [MY > 고객센터]를 통해 남겨주세요. (쿠팡 고객센터에서는 확인 및 처리가 불가합니다.)", "포인트가 지급된 이후 단순 변심에 의한 취소 및 환불은 불가합니다.", "상품 주문·배송·환불 등의 책임은 각 판매자에게 있습니다.", "구매를 취소하면 일정 기간 캠페인 참여가 제한될 수 있습니다."], buttons: [{"id": "coupang_20000_pincrux", "label": "2만원 이상 구매"}, {"id": "coupang_50000_pincrux", "label": "5만원 이상 구매"}] },
  "naver_plus_store_adbc": { guide: [[{"text": "구매확정 후", "accent": false}, {"text": " 실시간", "accent": true}, {"text": "으로 캐치캐치리워드에서 확인!", "accent": false}], [{"text": "3개월", "accent": true}, {"text": " 내 포인트로 지급 완료!", "accent": false}]], description: [{"left": "모든 상품", "right": "1.2%", "postfix": "적립"}], deny: ["캐치캐치리워드를 거치지 않고 구매 시 적립 불가능", "앱 내 구매만 실적 인정", "앱 설치 시 캐치캐치리워드에서 다시 이동해야 실적 인정", "구매 후 추가 구매 시 캐치캐치리워드에서 다시 이동 해야 실적 인정", "도서정가제 대상 상품 / 디지털 콘텐츠 / e쿠폰 및 환금성 카테고리 / 골드바 및 순금-기념품·바·귀걸이·목걸이 등/상품권 전체 적립 불가능", "할인쿠폰, 배송비(을)를 차감한 금액으로 인정"], buttons: [] },
};

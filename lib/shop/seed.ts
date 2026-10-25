/** 쇼핑적립 시드 — 마이비 shop.myb.im 캡처(2026-10-25) /v1/api/cps/* 응답값. 로고는 resource.myb.im 원본을 public/myb/res 에 보관 */
import type { Merchant, MerchantDetail } from "./types";

/** 전체 쇼핑몰(인기 쇼핑몰 순 = API 응답 순서). 쿠팡은 "오늘 여기서 쇼핑 어때요?"에만 노출 */
export const MERCHANTS: Merchant[] = [
  { id: "coupang_pincrux_group", name: "쿠팡", logo: "/myb/res/img_shopping_coupang.webp", logoCircle: "/myb/res/img_shopping_round_coupang.png", rate: 0, recommendIndex: 2, isNew: false },
  { id: "naver_plus_store_adbc", name: "네이버+스토어", logo: "/myb/res/naverpay_text_logo.png", logoCircle: "/myb/res/naverpay_circle.png", rate: 1.2, recommendIndex: 3, isNew: true },
  { id: "gmarket", name: "G마켓", logo: "/myb/res/img_shopping_gmarket.png", logoCircle: "/myb/res/img_shopping_round_gmarket.png", rate: 1.7, recommendIndex: 6, isNew: false },
  { id: "aliexpress", name: "알리익스프레스", logo: "/myb/res/img_shopping_ali.png", logoCircle: "/myb/res/img_shopping_round_ali.png", rate: 6.3, recommendIndex: 0, isNew: false },
  { id: "ohouse", name: "오늘의집", logo: "/myb/res/img_shopping_house.webp", logoCircle: "/myb/res/img_shopping_round_house.webp", rate: 3.6, recommendIndex: 0, isNew: false },
  { id: "ssg", name: "SSG", logo: "/myb/res/img_shopping_ssg.png", logoCircle: "/myb/res/img_shopping_round_ssg.png", rate: 3, recommendIndex: 0, isNew: false },
  { id: "emartmall", name: "이마트몰", logo: "/myb/res/img_shopping_emart.png", logoCircle: "/myb/res/img_shopping_round_emart.png", rate: 3, recommendIndex: 0, isNew: false },
  { id: "ctrip", name: "트립닷컴", logo: "/myb/res/img_shopping_trip.png", logoCircle: "/myb/res/img_shopping_round_trip.png", rate: 3.85, recommendIndex: 0, isNew: false },
  { id: "agoda", name: "아고다", logo: "/myb/res/img_shopping_agoda.png", logoCircle: "/myb/res/img_shopping_round_agoda.png", rate: 5.6, recommendIndex: 0, isNew: false },
  { id: "yanolja", name: "NOL", logo: "/myb/res/img_shopping_yanolja.png", logoCircle: "/myb/res/img_shopping_round_yanolja.png", rate: 2.8, recommendIndex: 10, isNew: false },
  { id: "hotelskr", name: "호텔스닷컴", logo: "/myb/res/img_shopping_hotelscom.webp", logoCircle: "/myb/res/img_shopping_round_hotelscom.webp", rate: 4.4, recommendIndex: 0, isNew: false },
  { id: "expedia", name: "익스피디아", logo: "/myb/res/img_shopping_expedia.webp", logoCircle: "/myb/res/img_shopping_round_expedia.webp", rate: 3.5, recommendIndex: 0, isNew: false },
  { id: "himart", name: "롯데하이마트", logo: "/myb/res/img_shopping_himart.webp", logoCircle: "/myb/res/img_shopping_round_himart.webp", rate: 1.26, recommendIndex: 0, isNew: false },
  { id: "auction", name: "옥션", logo: "/myb/res/img_shopping_auction.png", logoCircle: "/myb/res/img_shopping_round_auction.png", rate: 0.6, recommendIndex: 6, isNew: false },
  { id: "wconcept", name: "W컨셉", logo: "/myb/res/img_shopping_wconcept.webp", logoCircle: "/myb/res/img_shopping_round_wconcept.webp", rate: 2.1, recommendIndex: 0, isNew: false },
  { id: "11st", name: "11번가", logo: "/myb/res/img_shopping_11street.png", logoCircle: "/myb/res/img_shopping_round_11street.png", rate: 0.7, recommendIndex: 0, isNew: false },
  { id: "kbbook", name: "인터넷교보문고", logo: "/myb/res/img_shopping_kyobo.png", logoCircle: "/myb/res/img_shopping_round_kyobo.png", rate: 2.1, recommendIndex: 0, isNew: false },
  { id: "gseshop", name: "GS SHOP", logo: "/myb/res/img_shopping_gsshop.png", logoCircle: "/myb/res/img_shopping_round_gsshop.png", rate: 1.6, recommendIndex: 0, isNew: false },
  { id: "woori", name: "롯데홈쇼핑", logo: "/myb/res/img_shopping_lotteshopping.png", logoCircle: "/myb/res/img_shopping_round_lotteshopping.png", rate: 1.2, recommendIndex: 0, isNew: false },
  { id: "cjbrand", name: "CJ더마켓", logo: "/myb/res/img_shopping_cjthemarket.webp", logoCircle: "/myb/res/img_shopping_round_cjthemarket.webp", rate: 2.1, recommendIndex: 0, isNew: false },
];

/** 쇼핑적립 유의사항(메인 하단 19항목, DOM 원문) */
export const NOTICES: string[] = [
  "적립은 마이비 앱을 통해 지정된 경로로 접속하여 결제한 거래에 한하여 적용됩니다.",
  "적립금은 다음 항목을 제외한 실 결제 금액(=쿠폰, 포인트, 할인, 배송비, 부가세 제외 금액)을 기준으로 산정됩니다.",
  "장바구니에 미리 담은 상품을 쇼핑적립을 경유하여 장바구니 결제만 진행 할 경우 적립이 누락될 수 있습니다.",
  "각 제휴사 및 쇼핑몰의 정책에 따라 적립률 및 적립 시점은 수시로 변동될 수 있으며, 이에 따라 적립이 제한되거나 변동될 수 있습니다.",
  "장바구니에 상품을 담기 전에 반드시 마이비를 먼저 경유해야 하며, 경유 이전에 담긴 상품은 적립 대상에서 제외될 수 있습니다.",
  "마이비 경유 이후 외부 링크(가격비교 사이트, 제휴 마케팅 링크 등)를 클릭하거나 다른 앱을 통해 접속한 경우, 적립이 누락될 수 있습니다.",
  "광고 차단 프로그램(Adblock), VPN, 서버 우회, 쿠키 비허용 등의 설정이 되어 있을 경우 적립이 정상적으로 이뤄지지 않으니, 광고 차",
  "쇼핑몰 접속 후 “앱으로 보기” 기능을 이용할 경우 적립 실적이 인정되지 않을 수 있으므로, 마이비 앱을 통한 브라우저 경유를 유지하시기 바랍니",
  "언어나 통화, 지역 설정 변경 등 앱 또는 웹사이트 환경을 변경할 경우, 일부 쇼핑몰에서 적립이 제한될 수 있습니다.",
  "적립금은 상품 배송 완료 및 구매 확정 이후 순차적으로 적립됩니다.",
  "구매 취소, 환불, 교환, 예약 변경, No-show 등의 사유 발생 시 적립 대상에서 제외됩니다.",
  "제휴 쇼핑몰의 적립 제외 품목 구매 시 적립 대상에서 제외됩니다.",
  "해외 쇼핑을 통해 구매한 내역은 구매와 적립시점의 환율 차이로 인해 적립금액이 달라지거나, 제한될 수 있습니다.",
  "1회 이상 연속 구매 시에도 기존 웹브라우저를 닫고, 마이비 쇼핑적립을 재경유하여 구매하셔야 안전하게 적립처리가 됩니다.",
  "구매 후 취소를 반복하는 경우, 포인트 적립이 제한될 수 있습니다.",
  "브라우저 및 모바일 기기 내 광고 추적 미허용 시 적립금 지급되지 않을 수 있습니다.",
  "참여방법 미숙지로 인한 리워드 미지급 책임은 유저 본인에게 있습니다.",
];

/** 상세 안내 — 쿠팡·네이버+스토어는 캡처 원문, 나머지는 네이버+스토어 템플릿에 적립률만 치환 */
export const DETAILS: Record<string, MerchantDetail> = {
  "coupang_pincrux_group": { guide: [[{"text": "쿠팡 쇼핑혜택 푸시 수신 동의", "accent": false}], [{"text": "2만원 / 5만원 이상", "accent": true}, {"text": " 상품 구입", "accent": false}], [{"text": "구매확정 후 ", "accent": false}, {"text": " 1회 즉시 지급!", "accent": true}]], description: [{"left": "디지털 제품", "right": "500P / 1,100P", "postfix": "즉시적립"}, {"left": "일반 제품", "right": "500P / 1,100P", "postfix": "즉시적립"}, {"left": "프레쉬 제품", "right": "500P / 1,100P", "postfix": "즉시적립"}], deny: ["쿠팡 앱 로그인 후 마케팅 정보 수집 및 이용 동의가 필요합니다.", "쿠팡에서 5만원 이상 구매시 포인트가 지급됩니다. (배송비 제외)", "광고 ID를 임의로 변경할 경우 보상이 지급되지 않을 수 있습니다.", "보상 미지급 시, 구매일로부터 7일 이내에 문의해주세요.", "쿠팡 관련 문의는 마이비 앱 내 [내정보 > 고객센터]를 통해 남겨주세요. (쿠팡 고객센터에서는 확인 및 처리가 불가합니다.)", "포인트가 지급된 이후 단순 변심에 의한 취소 및 환불은 불가합니다.", "상품 주문·배송·환불 등의 책임은 각 판매자에게 있습니다.", "구매를 취소하면 일정 기간 캠페인 참여가 제한될 수 있습니다."], buttons: [{"id": "coupang_20000_pincrux", "label": "2만원 이상 구매"}, {"id": "coupang_50000_pincrux", "label": "5만원 이상 구매"}] },
  "naver_plus_store_adbc": { guide: [[{"text": "구매확정 후", "accent": false}, {"text": " 실시간", "accent": true}, {"text": "으로 마이비에서 확인 가능!", "accent": false}], [{"text": "3개월", "accent": true}, {"text": " 내 B포인트로 지급 완료!", "accent": false}]], description: [{"left": "모든 상품", "right": "1.2%", "postfix": "적립"}], deny: ["마이비를 경유하지 않고 구매 시 적립 불가능", "앱 내 구매만 실적 인정", "앱 설치 시 마이비를 통해 재접속해야 실적 인정", "구매 후 추가 구매 시 마이비를 통해 재접속 해야 실적 인정", "도서정가제 대상 상품 / 디지털 콘텐츠 / e쿠폰 및 환금성 카테고리 / 골드바 및 순금-기념품·바·귀걸이·목걸이 등/상품권 전체 적립 불가능", "할인쿠폰, 배송비(을)를 차감한 금액으로 인정"], buttons: [] },
};

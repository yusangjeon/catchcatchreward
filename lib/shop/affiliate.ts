/**
 * 제휴 아웃링크. 환경변수로 덮어쓰기: AFFILIATE_URL_<MERCHANT_ID 대문자, 비영숫자→_> (예: AFFILIATE_URL_COUPANG_PINCRUX_GROUP)
 * 쿠팡 파트너스: COUPANG_PARTNERS_URL 에 파트너스에서 발급한 링크(https://link.coupang.com/a/xxxx 또는 AFFSDP lptag 링크)를 넣으면 쿠팡 계열 전부에 적용.
 * 실제 구매 추적(포스트백)은 각 제휴사 리포트에서 수동 대사 → 1차는 "방문 적립"(하루 1회 5P)만 자동.
 */
const HOME: Record<string, string> = {
  coupang_pincrux_group: "https://www.coupang.com/",
  naver_plus_store_adbc: "https://shopping.naver.com/",
  gmarket: "https://www.gmarket.co.kr/",
  aliexpress: "https://ko.aliexpress.com/",
  auction: "https://www.auction.co.kr/",
  "11st": "https://www.11st.co.kr/",
  ssg: "https://www.ssg.com/",
  musinsa: "https://www.musinsa.com/",
  oliveyoung: "https://www.oliveyoung.co.kr/",
  kurly: "https://www.kurly.com/",
  lotteon: "https://www.lotteon.com/",
  wemakeprice: "https://www.wemakeprice.com/",
  tmon: "https://www.tmon.co.kr/",
  yes24: "https://www.yes24.com/",
  kyobo: "https://www.kyobobook.co.kr/",
  himart: "https://www.e-himart.co.kr/",
  temu: "https://www.temu.com/kr",
  shein: "https://kr.shein.com/",
  ohou: "https://ohou.se/",
  zigzag: "https://zigzag.kr/",
  ohouse: "https://ohou.se/",
  emartmall: "https://emart.ssg.com/",
  ctrip: "https://kr.trip.com/",
  agoda: "https://www.agoda.com/ko-kr/",
  yanolja: "https://nol.yanolja.com/",
  hotelskr: "https://kr.hotels.com/",
  expedia: "https://www.expedia.co.kr/",
  wconcept: "https://www.wconcept.co.kr/",
  kbbook: "https://www.kyobobook.co.kr/",
  gseshop: "https://www.gsshop.com/",
  woori: "https://www.lotteimall.com/",
  cjbrand: "https://www.cjthemarket.com/",
};

export const SHOP_CLICK_POINTS = 5;

export function outboundUrl(merchantId: string, name: string, seedUrl?: string): string {
  const envKey = `AFFILIATE_URL_${merchantId.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
  if (process.env[envKey]) return process.env[envKey]!;
  if (merchantId.includes("coupang") && process.env.COUPANG_PARTNERS_URL) return process.env.COUPANG_PARTNERS_URL;
  if (seedUrl) return seedUrl;
  const home = Object.entries(HOME).find(([k]) => merchantId.includes(k))?.[1];
  return home ?? `https://search.naver.com/search.naver?query=${encodeURIComponent(name)}`;
}

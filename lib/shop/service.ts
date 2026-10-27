import "server-only";
import { outboundUrl, SHOP_CLICK_POINTS } from "./affiliate";
import { DETAILS, MERCHANTS, NOTICES } from "./seed";
import type { MerchantDetail, MerchantPayload, ShopPayload } from "./types";

function asOfKst(now = new Date()): string {
  const k = new Date(now.getTime() + 9 * 3600_000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${k.getUTCFullYear()}.${p(k.getUTCMonth() + 1)}.${p(k.getUTCDate())} ${p(k.getUTCHours())}:${p(k.getUTCMinutes())}:${p(k.getUTCSeconds())}`;
}

/** 쇼핑적립 메인 — 캡처 당시 cps/main/banner · cps/user/me(pinned: 네이버+스토어) · cps/merchants 조합 */
export function getShop(): ShopPayload {
  return {
    pendingPoint: 0,
    asOf: asOfKst(),
    topBanner: { image: "/myb/res/img_shopping_round_coupang.png", title: "오늘의 쇼핑 추천", description: "쿠팡 최대 1,100P 적립", merchantId: "coupang_pincrux_group" },
    favorites: ["naver_plus_store_adbc"],
    recommended: ["coupang_pincrux_group", "naver_plus_store_adbc", "gmarket", "auction"],
    merchants: MERCHANTS,
    notices: NOTICES,
    firstPurchaseTarget: true,
  };
}

/** 상세가 없는 쇼핑몰은 네이버+스토어 템플릿에 적립률만 치환 */
function detailFor(id: string, rate: number): MerchantDetail {
  if (DETAILS[id]) return DETAILS[id];
  const base = DETAILS["naver_plus_store_adbc"];
  return { ...base, description: [{ left: "모든 상품", right: `${rate}%`, postfix: "적립" }], buttons: [] };
}

export function getMerchant(id: string): MerchantPayload | null {
  const merchant = MERCHANTS.find((m) => m.id === id);
  if (!merchant) return null;
  // nudgeMerchantList(캡처): 롯데홈쇼핑, GS SHOP, 11번가, 옥션, 이마트몰, SSG, 오늘의집, 알리, G마켓, 쿠팡 순
  const order = ["woori", "gseshop", "11st", "auction", "emartmall", "ssg", "ohouse", "aliexpress", "gmarket", "coupang_pincrux_group"];
  const nudge = order.map((k) => MERCHANTS.find((m) => m.id === k)!).filter((m) => m && m.id !== id);
  return { merchant, outHref: `/api/shop/out?merchant=${encodeURIComponent(merchant.id)}`, clickPoints: SHOP_CLICK_POINTS, isFavorite: getShop().favorites.includes(id), detail: detailFor(id, merchant.rate), nudge, notices: NOTICES };
}

/** 제휴 아웃링크 URL(서버 전용) */
export function merchantOutUrl(id: string): string | null {
  const m = MERCHANTS.find((x) => x.id === id);
  return m ? outboundUrl(m.id, m.name, m.outUrl) : null;
}

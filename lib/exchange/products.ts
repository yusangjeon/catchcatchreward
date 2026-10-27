/** 교환 상품 카탈로그 — 1차는 운영자 수동 발송. 포인트 = 원 1:1 + 수수료 가산(마이비 상품 구매 탭 가격 그대로) */
export interface Product {
  kind: string;
  name: string;
  points: number;
  emoji: string;
  bg: string;
  img?: string; // 실사 상품 이미지(/products/<kind>.webp)
  category: "포인트" | "식품" | "상품권" | "현금";
}

export const MIN_REDEEM_POINTS = 1000;

export const PRODUCTS: Product[] = [
  { kind: "npay_10000", img: "/products/npay_10000.webp", name: "네이버페이 포인트 10,000원", points: 12000, emoji: "🟢", bg: "#f6f7fb", category: "포인트" },
  { kind: "pizza_small_set", img: "/products/pizza_small_set.webp", name: "포테이토 피자 스몰 세트", points: 9900, emoji: "🍕", bg: "#f6f7fb", category: "식품" },
  { kind: "cash_15000", img: "/products/cash_15000.webp", name: "현금 15,000원", points: 18000, emoji: "💵", bg: "#fff8e6", category: "현금" },
  { kind: "americano_tall", img: "/products/americano_tall.webp", name: "아이스 카페 아메리카노 T", points: 6956, emoji: "🥤", bg: "#f6f7fb", category: "식품" },
  { kind: "ssg_10000", img: "/products/ssg_10000.webp", name: "신세계 상품권 10,000원", points: 14900, emoji: "🎫", bg: "#f6f7fb", category: "상품권" },
  { kind: "banana_milk", img: "/products/banana_milk.webp", name: "빙그레 바나나우유 240ML", points: 1900, emoji: "🍌", bg: "#f6f7fb", category: "식품" },
  { kind: "bburinkle_cola", img: "/products/bburinkle_cola.webp", name: "뿌링클+콜라 1.25L", points: 24900, emoji: "🍗", bg: "#f6f7fb", category: "식품" },
  { kind: "cu_5000", img: "/products/cu_5000.webp", name: "편의점 5,000원권", points: 5900, emoji: "🏪", bg: "#f6f7fb", category: "상품권" },
];

export const productByKind = (kind: string) => PRODUCTS.find((p) => p.kind === kind);

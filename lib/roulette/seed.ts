import type { RoulettePrize } from "@/lib/types";

/** 룰렛 경품 — supabase/seed.sql 과 동일. 확률 = weight / 합(100). 기대값 ≈ 50×.5+100×.3+300×.12+1000×.05+5000×.02 = 241원 */
export const SEED_PRIZES: RoulettePrize[] = [
  { id: "pz-50", name: "50P", kind: "points", value: 50, weight: 50, active: true, sort: 1 },
  { id: "pz-100", name: "100P", kind: "points", value: 100, weight: 30, active: true, sort: 2 },
  { id: "pz-300", name: "300P", kind: "points", value: 300, weight: 12, active: true, sort: 3 },
  { id: "pz-1000", name: "1,000P", kind: "points", value: 1000, weight: 5, active: true, sort: 4 },
  { id: "pz-cvs5000", name: "편의점 5,000원권", kind: "gifticon", value: 5000, weight: 2, active: true, sort: 5 },
  { id: "pz-none", name: "꽝 (다음 기회에)", kind: "none", value: 0, weight: 1, active: true, sort: 6 },
];

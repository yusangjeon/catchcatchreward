import type { StoreMission } from "@/lib/types";

/**
 * 캐치랭크(Axis A) 매장 미션 시드. 실제 운영은 관리자 화면에서 등록.
 * 인증코드는 매장 POS/안내문에 붙이는 4자리 숫자(1차). 2차: 플레이스 저장/리뷰 API 검증으로 교체.
 */
export const SEED_STORE_MISSIONS: StoreMission[] = [
  { id: "sm-01", storeName: "엠플리파이 카페 성수점", kind: "visit", title: "매장 방문하고 인증코드 입력", description: "카운터의 '캐치캐치' 안내문에 적힌 4자리 코드를 입력하면 완료", rewardPoints: 300, code: "1234", capacity: 100, active: true, sort: 1, createdAt: "2026-10-27T00:00:00.000Z" },
  { id: "sm-02", storeName: "엠플리파이 카페 성수점", kind: "save", title: "네이버 플레이스 저장하기", description: "플레이스 '저장' 후 직원에게 보여주면 코드를 알려드려요", rewardPoints: 200, code: "5678", capacity: 0, active: true, sort: 2, createdAt: "2026-10-27T00:00:00.000Z" },
  { id: "sm-03", storeName: "온앤온 헤어 강남점", kind: "review", title: "방문 리뷰 남기기", description: "영수증 리뷰 작성 후 받은 코드를 입력하세요", rewardPoints: 500, code: "2468", capacity: 30, active: true, sort: 3, createdAt: "2026-10-27T00:00:00.000Z" },
];

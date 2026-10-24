import type { Badge, Quiz } from "@/lib/types";

/** 인메모리 저장소용 시드. supabase/seed.sql 과 같은 배지 규칙을 유지한다. */
export const SEED_BADGES: Badge[] = [
  { code: "spicy_lover", name: "매운맛러버", description: "매운 선택지를 3번 이상 골랐어요", emoji: "🌶️", rule: { tag: "spicy", min: 3 } },
  { code: "cafe_lover", name: "카페러버", description: "카페·디저트 선택지를 3번 이상 골랐어요", emoji: "☕", rule: { tag: "cafe", min: 3 } },
  { code: "night_owl", name: "야행성", description: "밤 시간대 선택지를 3번 이상 골랐어요", emoji: "🦉", rule: { tag: "late_night", min: 3 } },
  { code: "home_body", name: "집순이·집돌이", description: "집에서 보내는 선택지를 3번 이상 골랐어요", emoji: "🏠", rule: { tag: "home", min: 3 } },
  { code: "smart_shopper", name: "알뜰쇼퍼", description: "가성비 선택지를 3번 이상 골랐어요", emoji: "🛒", rule: { tag: "value", min: 3 } },
  { code: "fitness", name: "운동러", description: "운동 선택지를 3번 이상 골랐어요", emoji: "💪", rule: { tag: "fitness", min: 3 } },
];

type SeedOption = [label: string, emoji: string, tags: string[]];

function q(id: string, question: string, options: SeedOption[], sort: number): Quiz {
  return {
    id,
    question,
    kind: options.length === 2 ? 2 : 4,
    active: true,
    sort,
    options: options.map(([label, emoji, tags], i) => ({
      id: `${id}-${String.fromCharCode(97 + i)}`,
      label,
      emoji,
      tags,
      sort: i,
    })),
  };
}

export const SEED_QUIZZES: Quiz[] = [
  q("q01", "오늘 저녁, 둘 중 하나만 고른다면?", [
    ["불닭볶음면", "🔥", ["spicy", "convenience"]],
    ["크림 파스타", "🍝", ["mild", "western"]],
  ], 1),
  q("q02", "주말 오후 2시, 나는 어디에?", [
    ["동네 카페", "☕", ["cafe", "outdoor"]],
    ["침대 위", "🛏️", ["home", "rest"]],
    ["헬스장", "🏋️", ["fitness", "outdoor"]],
    ["쇼핑몰", "🛍️", ["shopping", "outdoor"]],
  ], 2),
  q("q03", "치킨 시킬 때 나의 선택은?", [
    ["매운 양념", "🌶️", ["spicy", "delivery"]],
    ["후라이드", "🍗", ["mild", "delivery"]],
  ], 3),
  q("q04", "같은 물건, 어디서 살래?", [
    ["최저가 검색해서 온라인", "💻", ["value", "online_shopping"]],
    ["바로 집 앞 편의점", "🏪", ["convenience"]],
  ], 4),
  q("q05", "밤 11시, 지금 뭐 해?", [
    ["야식 주문 중", "🍜", ["late_night", "delivery"]],
    ["넷플릭스", "📺", ["late_night", "home"]],
    ["이미 잠듦", "😴", ["early_bird", "rest"]],
    ["운동 또는 산책", "🏃", ["late_night", "fitness"]],
  ], 7),
  q("q06", "디저트 하나만 고른다면?", [
    ["달달한 케이크", "🍰", ["cafe", "sweet"]],
    ["아메리카노로 충분", "☕", ["cafe", "coffee"]],
  ], 6),
  q("q07", "떡볶이 맵기, 나는?", [
    ["순한맛", "😊", ["mild"]],
    ["보통", "🙂", ["mild"]],
    ["매운맛", "🥵", ["spicy"]],
    ["극한맵기 도전", "💀", ["spicy", "challenge"]],
  ], 5), // 첫날 5문제 안에 매운맛 3회(q01·q03·q07) 가능 → 배지 체감
  q("q08", "갑자기 생긴 5만원, 어디에?", [
    ["맛집 탐방", "🍽️", ["dining_out", "outdoor"]],
    ["저축·투자", "💰", ["value", "saving"]],
  ], 8),
  q("q09", "친구가 \"나와\"라고 하면?", [
    ["바로 나감", "🚶", ["outdoor", "social"]],
    ["집에서 보자고 함", "🏠", ["home", "social"]],
  ], 9),
  q("q10", "운동, 얼마나 해?", [
    ["거의 매일", "💪", ["fitness"]],
    ["주 1~2회", "🙂", ["fitness"]],
    ["가끔 생각날 때", "🤔", ["rest"]],
    ["숨쉬기 운동", "😅", ["home", "rest"]],
  ], 10),
];

import type { Badge, Quiz, QuizSet } from "@/lib/types";

/** 인메모리 저장소용 시드. supabase/seed.sql 과 동일 내용을 유지한다. */
export const SEED_BADGES: Badge[] = [
  { code: "spicy_lover", name: "매운맛러버", description: "매운 선택지를 3번 이상 골랐어요", emoji: "🌶️", rule: { tag: "spicy", min: 3 } },
  { code: "cafe_lover", name: "카페러버", description: "카페·디저트 선택지를 3번 이상 골랐어요", emoji: "☕", rule: { tag: "cafe", min: 3 } },
  { code: "night_owl", name: "야행성", description: "밤 시간대 선택지를 3번 이상 골랐어요", emoji: "🦉", rule: { tag: "late_night", min: 3 } },
  { code: "home_body", name: "집순이·집돌이", description: "집에서 보내는 선택지를 3번 이상 골랐어요", emoji: "🏠", rule: { tag: "home", min: 3 } },
  { code: "smart_shopper", name: "알뜰쇼퍼", description: "가성비 선택지를 3번 이상 골랐어요", emoji: "🛒", rule: { tag: "value", min: 3 } },
  { code: "fitness", name: "운동러", description: "운동 선택지를 3번 이상 골랐어요", emoji: "💪", rule: { tag: "fitness", min: 3 } },
];

const img = (seed: string, w = 600, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

type SeedOption = [label: string, tags: string[], imageSeed?: string];

function q(setId: string, n: number, question: string, options: SeedOption[]): Quiz {
  const id = `${setId}-q${n}`;
  return {
    id,
    setId,
    question,
    kind: options.length === 2 ? 2 : 4,
    active: true,
    sort: n,
    options: options.map(([label, tags, seed], i) => ({
      id: `${id}-${String.fromCharCode(97 + i)}`,
      label,
      tags,
      imageUrl: seed ? img(seed, 400, 400) : undefined,
      sort: i,
    })),
  };
}

export const SEED_SETS: QuizSet[] = [
  { id: "s01", title: "알쏭달쏭 경제용어 탐험, 함께 도전해봐요!", imageUrl: img("safe"), rewardPoints: 590, capacity: 5000, baseParticipants: 1201, todayOnly: true, active: true, sort: 1 },
  { id: "s02", title: "당신의 소파 취향을 알려주세요 🛋️", imageUrl: img("sofa"), rewardPoints: 30, capacity: 10000, baseParticipants: 8888, todayOnly: false, active: true, sort: 2 },
  { id: "s03", title: "드라마 \"형제들의 식탁\" 어디까지 봤나요?", imageUrl: img("drama"), rewardPoints: 55, capacity: 3000, baseParticipants: 1201, todayOnly: false, active: true, sort: 3 },
  { id: "s04", title: "짜장면이 더 좋나요? 짬뽕이 더 좋나요?", imageUrl: img("noodle"), rewardPoints: 100, capacity: 5000, baseParticipants: 3205, todayOnly: false, active: true, sort: 4 },
  { id: "s05", title: "어떤 스마트 워치를 사용하고 계시나요?", imageUrl: img("watch"), rewardPoints: 240, capacity: 1000, baseParticipants: 3205, todayOnly: false, active: true, sort: 5 },
  { id: "s06", title: "식재료 구입 시 어떤 앱을 사용하세요?", imageUrl: img("veggie"), rewardPoints: 500, capacity: 993, baseParticipants: 1201, todayOnly: false, active: true, sort: 6 },
  { id: "s07", title: "어떤 장르의 게임을 좋아하시나요?", imageUrl: img("gamer"), rewardPoints: 450, capacity: 5000, baseParticipants: 3205, todayOnly: false, active: true, sort: 7 },
  { id: "s08", title: "어떤 음악 스트리밍앱을 사용하세요?", imageUrl: img("music"), rewardPoints: 240, capacity: 1000, baseParticipants: 3205, todayOnly: false, active: true, sort: 8 },
];

export const SEED_QUIZZES: Quiz[] = [
  q("s01", 1, "월급이 들어오면 가장 먼저 하는 일은?", [["저축·투자", ["value", "saving"]], ["맛집 가기", ["dining_out"]], ["쇼핑", ["shopping"]], ["일단 둠", ["rest"]]]),
  q("s01", 2, "'복리'하면 떠오르는 건?", [["눈덩이", ["saving"]], ["이자", ["saving"]], ["모르겠어요", ["rest"]], ["투자", ["value"]]]),
  q("s01", 3, "갑자기 생긴 5만원, 어디에?", [["맛집 탐방", ["dining_out", "outdoor"]], ["저축·투자", ["value", "saving"]]]),

  q("s02", 1, "주말 오후 2시, 나는 어디에?", [["동네 카페", ["cafe", "outdoor"]], ["소파 위", ["home", "rest"]], ["헬스장", ["fitness", "outdoor"]], ["쇼핑몰", ["shopping", "outdoor"]]]),
  q("s02", 2, "소파에서 주로 하는 건?", [["넷플릭스", ["late_night", "home"]], ["낮잠", ["home", "rest"]]]),

  q("s03", 1, "밤 11시, 지금 뭐 해?", [["야식 주문 중", ["late_night", "delivery"]], ["드라마 정주행", ["late_night", "home"]], ["이미 잠듦", ["early_bird", "rest"]], ["운동 또는 산책", ["late_night", "fitness"]]]),
  q("s03", 2, "드라마는 어떻게 봐?", [["본방 사수", ["home"]], ["몰아보기", ["late_night", "home"]]]),

  q("s04", 1, "짜장면이 더 좋나요?\n짬뽕이 더 좋나요?", [["짜장면", ["mild"], "jajang"], ["짬뽕", ["spicy"], "jjamppong"]]),
  q("s04", 2, "치킨 시킬 때 나의 선택은?", [["매운 양념", ["spicy", "delivery"], "chicken1"], ["후라이드", ["mild", "delivery"], "chicken2"]]),
  q("s04", 3, "떡볶이 맵기, 나는?", [["순한맛", ["mild"]], ["보통", ["mild"]], ["매운맛", ["spicy"]], ["극한맵기 도전", ["spicy", "challenge"]]]),

  q("s05", 1, "어떤 스마트 워치를 사용하고 계시나요?", [["애플 워치", ["apple", "tech"]], ["갤럭시 워치", ["samsung", "tech"]]]),
  q("s05", 2, "운동, 얼마나 해?", [["거의 매일", ["fitness"]], ["주 1~2회", ["fitness"]], ["가끔 생각날 때", ["rest"]], ["숨쉬기 운동", ["home", "rest"]]]),

  q("s06", 1, "같은 물건, 어디서 살래?", [["최저가 검색해서 온라인", ["value", "online_shopping"]], ["바로 집 앞 편의점", ["convenience"]]]),
  q("s06", 2, "식재료는 주로 어디서?", [["새벽배송 앱", ["online_shopping", "convenience"]], ["대형마트", ["value"]], ["동네 마트", ["convenience"]], ["시장", ["value"]]]),

  q("s07", 1, "어떤 장르의 게임을 좋아하시나요?", [["RPG", ["game", "home"]], ["FPS", ["game", "challenge"]], ["퍼즐", ["game", "rest"]], ["안 해요", ["rest"]]]),
  q("s07", 2, "게임은 언제?", [["밤에 몰아서", ["late_night", "home"]], ["출퇴근길 짬짬이", ["convenience"]]]),

  q("s08", 1, "어떤 음악 스트리밍앱을 사용하세요?", [["멜론", ["music"]], ["유튜브 뮤직", ["music", "value"]], ["스포티파이", ["music"]], ["애플 뮤직", ["music", "apple"]]]),
  q("s08", 2, "디저트 하나만 고른다면?", [["달달한 케이크", ["cafe", "sweet"], "cake"], ["아메리카노로 충분", ["cafe", "coffee"], "coffee"]]),
];

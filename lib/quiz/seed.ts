import type { Badge, Quiz, QuizSet } from "@/lib/types";

/** 인메모리 저장소용 시드. supabase/seed.sql 과 동일 내용을 유지한다. */
export const SEED_BADGES: Badge[] = [
  { code: "spicy_lover", name: "매운맛러버", description: "매운 선택지를 3번 이상 골랐어요", emoji: "🌶️", rule: { tag: "spicy", min: 3 } },
  { code: "cafe_lover", name: "카페러버", description: "카페·디저트 선택지를 3번 이상 골랐어요", emoji: "☕", rule: { tag: "cafe", min: 3 } },
  { code: "night_owl", name: "야행성", description: "밤 시간대 선택지를 3번 이상 골랐어요", emoji: "🦉", rule: { tag: "late_night", min: 3 } },
  { code: "home_body", name: "집순이·집돌이", description: "집에서 보내는 선택지를 3번 이상 골랐어요", emoji: "🏠", rule: { tag: "home", min: 3 } },
  { code: "smart_shopper", name: "알뜰쇼퍼", description: "가성비 선택지를 3번 이상 골랐어요", emoji: "🛒", rule: { tag: "value", min: 3 } },
  { code: "fitness", name: "운동러", description: "운동 선택지를 3번 이상 골랐어요", emoji: "💪", rule: { tag: "fitness", min: 3 } },
  { code: "traveler", name: "여행러", description: "여행·나들이 선택지를 3번 이상 골랐어요", emoji: "✈️", rule: { tag: "travel", min: 3 } },
  { code: "pet_lover", name: "반려인", description: "반려동물 선택지를 2번 이상 골랐어요", emoji: "🐶", rule: { tag: "pet", min: 2 } },
  { code: "beauty", name: "뷰티러버", description: "뷰티·스킨케어 선택지를 3번 이상 골랐어요", emoji: "💄", rule: { tag: "beauty", min: 3 } },
  { code: "fashionista", name: "패션피플", description: "패션 선택지를 3번 이상 골랐어요", emoji: "👗", rule: { tag: "fashion", min: 3 } },
  { code: "investor", name: "재테크러", description: "저축·투자 선택지를 3번 이상 골랐어요", emoji: "📈", rule: { tag: "saving", min: 3 } },
  { code: "foodie", name: "맛집탐험가", description: "외식·맛집 선택지를 3번 이상 골랐어요", emoji: "🍽️", rule: { tag: "dining_out", min: 3 } },
  { code: "car_owner", name: "드라이버", description: "자동차 선택지를 2번 이상 골랐어요", emoji: "🚗", rule: { tag: "car", min: 2 } },
  { code: "wellness", name: "건강러", description: "건강 관리 선택지를 3번 이상 골랐어요", emoji: "🥗", rule: { tag: "health", min: 3 } },
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
      imageUrl: seed ? (seed.startsWith("/") ? seed : img(seed, 400, 400)) : undefined,
      sort: i,
    })),
  };
}

export const SEED_SETS: QuizSet[] = [
  { id: "s01", title: "알쏭달쏭 경제용어 탐험, 함께 도전해봐요!", imageUrl: "/quiz/covers/s01.webp", rewardPoints: 590, capacity: 5000, baseParticipants: 1201, todayOnly: true, active: true, sort: 1 },
  { id: "s02", title: "당신의 소파 취향을 알려주세요 🛋️", imageUrl: "/quiz/covers/s02.webp", rewardPoints: 30, capacity: 10000, baseParticipants: 8888, todayOnly: false, active: true, sort: 2 },
  { id: "s03", title: "드라마 \"형제들의 식탁\" 어디까지 봤나요?", imageUrl: "/quiz/covers/s03.webp", rewardPoints: 55, capacity: 3000, baseParticipants: 1201, todayOnly: false, active: true, sort: 3 },
  { id: "s04", title: "짜장면이 더 좋나요? 짬뽕이 더 좋나요?", imageUrl: "/quiz/covers/s04.webp", rewardPoints: 100, capacity: 5000, baseParticipants: 3205, todayOnly: false, active: true, sort: 4 },
  { id: "s05", title: "어떤 스마트 워치를 사용하고 계시나요?", imageUrl: "/quiz/covers/s05.webp", rewardPoints: 240, capacity: 1000, baseParticipants: 3205, todayOnly: false, active: true, sort: 5 },
  { id: "s06", title: "식재료 구입 시 어떤 앱을 사용하세요?", imageUrl: "/quiz/covers/s06.webp", rewardPoints: 500, capacity: 993, baseParticipants: 1201, todayOnly: false, active: true, sort: 6 },
  { id: "s07", title: "어떤 장르의 게임을 좋아하시나요?", imageUrl: "/quiz/covers/s07.webp", rewardPoints: 450, capacity: 5000, baseParticipants: 3205, todayOnly: false, active: true, sort: 7 },
  { id: "s08", title: "어떤 음악 스트리밍앱을 사용하세요?", imageUrl: "/quiz/covers/s08.webp", rewardPoints: 240, capacity: 1000, baseParticipants: 3205, todayOnly: false, active: true, sort: 8 },
  { id: "s09", title: "이번 연휴, 어디로 떠날까요? ✈️", imageUrl: "/quiz/covers/s09.webp", rewardPoints: 120, capacity: 8000, baseParticipants: 2410, todayOnly: false, active: true, sort: 9 },
  { id: "s10", title: "우리 집 반려동물 이야기 🐾", imageUrl: "/quiz/covers/s10.webp", rewardPoints: 80, capacity: 6000, baseParticipants: 1930, todayOnly: false, active: true, sort: 10 },
  { id: "s11", title: "아침 스킨케어 루틴, 몇 단계?", imageUrl: "/quiz/covers/s11.webp", rewardPoints: 150, capacity: 4000, baseParticipants: 2877, todayOnly: false, active: true, sort: 11 },
  { id: "s12", title: "올가을 옷장, 뭐부터 채울까요?", imageUrl: "/quiz/covers/s12.webp", rewardPoints: 90, capacity: 7000, baseParticipants: 4120, todayOnly: false, active: true, sort: 12 },
  { id: "s13", title: "월급 관리, 나는 어떤 타입?", imageUrl: "/quiz/covers/s13.webp", rewardPoints: 200, capacity: 3000, baseParticipants: 1555, todayOnly: false, active: true, sort: 13 },
  { id: "s14", title: "점심 메뉴 결정 장애 테스트 🍱", imageUrl: "/quiz/covers/s14.webp", rewardPoints: 60, capacity: 10000, baseParticipants: 6210, todayOnly: false, active: true, sort: 14 },
  { id: "s15", title: "주말 드라이브 코스 추천받기 🚗", imageUrl: "/quiz/covers/s15.webp", rewardPoints: 130, capacity: 5000, baseParticipants: 980, todayOnly: false, active: true, sort: 15 },
  { id: "s16", title: "건강 챙기기, 어디까지 해봤나요?", imageUrl: "/quiz/covers/s16.webp", rewardPoints: 110, capacity: 5000, baseParticipants: 2040, todayOnly: false, active: true, sort: 16 },
];

export const SEED_QUIZZES: Quiz[] = [
  q("s01", 1, "월급이 들어오면 가장 먼저 하는 일은?", [["저축·투자", ["value", "saving"]], ["맛집 가기", ["dining_out"]], ["쇼핑", ["shopping"]], ["일단 둠", ["rest"]]]),
  q("s01", 2, "'복리'하면 떠오르는 건?", [["눈덩이", ["saving"]], ["이자", ["saving"]], ["모르겠어요", ["rest"]], ["투자", ["value"]]]),
  q("s01", 3, "갑자기 생긴 5만원, 어디에?", [["맛집 탐방", ["dining_out", "outdoor"]], ["저축·투자", ["value", "saving"]]]),

  q("s02", 1, "주말 오후 2시, 나는 어디에?", [["동네 카페", ["cafe", "outdoor"]], ["소파 위", ["home", "rest"]], ["헬스장", ["fitness", "outdoor"]], ["쇼핑몰", ["shopping", "outdoor"]]]),
  q("s02", 2, "소파에서 주로 하는 건?", [["넷플릭스", ["late_night", "home"]], ["낮잠", ["home", "rest"]]]),

  q("s03", 1, "밤 11시, 지금 뭐 해?", [["야식 주문 중", ["late_night", "delivery"]], ["드라마 정주행", ["late_night", "home"]], ["이미 잠듦", ["early_bird", "rest"]], ["운동 또는 산책", ["late_night", "fitness"]]]),
  q("s03", 2, "드라마는 어떻게 봐?", [["본방 사수", ["home"]], ["몰아보기", ["late_night", "home"]]]),

  q("s04", 1, "짜장면이 더 좋나요?\n짬뽕이 더 좋나요?", [["짜장면", ["mild"], "/myb/native/opt_jjajang.png"], ["짬뽕", ["spicy"], "/myb/native/opt_jjamppong.png"]]),
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

  q("s09", 1, "연휴 3일, 나의 선택은?", [["해외 여행", ["travel", "outdoor"]], ["국내 당일치기", ["travel", "outdoor"]], ["집에서 푹 쉬기", ["home", "rest"]], ["친구들과 맛집", ["dining_out", "outdoor"]]]),
  q("s09", 2, "여행 가면 꼭 하는 것은?", [["현지 맛집 투어", ["travel", "dining_out"], "foodtour"], ["인생샷 찍기", ["travel", "beauty"], "photo"]]),
  q("s09", 3, "숙소는 어떻게 고르나요?", [["가성비 최우선", ["value", "travel"]], ["위치·전망 우선", ["travel"]], ["호캉스 그 자체", ["travel", "rest"]], ["캠핑·차박", ["travel", "car", "outdoor"]]]),

  q("s10", 1, "반려동물, 키우고 있나요?", [["강아지", ["pet"], "dog"], ["고양이", ["pet"], "cat"]]),
  q("s10", 2, "반려동물 용품은 주로 어디서?", [["온라인 정기배송", ["pet", "online_shopping"]], ["동네 펫샵", ["pet", "convenience"]], ["대형마트", ["pet", "value"]], ["아직 안 키워요", ["rest"]]]),

  q("s11", 1, "아침 스킨케어는 몇 단계?", [["세안만", ["rest"]], ["2~3단계", ["beauty"]], ["5단계 이상", ["beauty"]], ["선크림은 필수", ["beauty", "outdoor"]]]),
  q("s11", 2, "화장품은 주로 어디서 사나요?", [["올리브영", ["beauty", "convenience"]], ["온라인 최저가", ["beauty", "value", "online_shopping"]], ["백화점·브랜드샵", ["beauty"]], ["다이소", ["beauty", "value"]]]),
  q("s11", 3, "지금 가장 신경 쓰는 피부 고민은?", [["보습", ["beauty"], "moist"], ["모공·트러블", ["beauty"], "pore"]]),

  q("s12", 1, "옷은 주로 어디서?", [["무신사·온라인", ["fashion", "online_shopping"]], ["SPA 매장", ["fashion", "value"]], ["백화점", ["fashion"]], ["빈티지·구제", ["fashion", "value"]]]),
  q("s12", 2, "가을 아우터 하나만 고른다면?", [["트렌치코트", ["fashion"], "trench"], ["가죽 재킷", ["fashion"], "leather"]]),
  q("s12", 3, "옷 살 때 가장 중요한 건?", [["디자인", ["fashion"]], ["가격", ["value"]], ["편안함", ["rest", "home"]], ["브랜드", ["fashion"]]]),

  q("s13", 1, "월급날, 나는?", [["자동이체로 저축 먼저", ["saving", "value"]], ["카드값 정산", ["value"]], ["일단 쇼핑", ["shopping"]], ["주식·코인 매수", ["saving", "challenge"]]]),
  q("s13", 2, "비상금은 어디에?", [["파킹통장·CMA", ["saving"]], ["그냥 통장", ["rest"]], ["ETF·펀드", ["saving", "challenge"]], ["없어요", ["rest"]]]),
  q("s13", 3, "가계부 쓰나요?", [["앱으로 자동", ["saving", "tech"], "ledger"], ["안 써요", ["rest"], "noledger"]]),

  q("s14", 1, "오늘 점심은?", [["한식", ["dining_out"], "korean"], ["양식·파스타", ["dining_out", "cafe"], "pasta"]]),
  q("s14", 2, "점심 예산은?", [["8천원 이하", ["value"]], ["1만원 안팎", ["dining_out"]], ["1만 5천원 이상도 OK", ["dining_out"]], ["도시락·집밥", ["home", "value"]]]),
  q("s14", 3, "배달 vs 외식", [["배달", ["delivery", "home"]], ["나가서 먹기", ["dining_out", "outdoor"]]]),

  q("s15", 1, "차가 있나요?", [["내 차 있음", ["car"]], ["카셰어링 이용", ["car", "value"]], ["대중교통파", ["convenience"]], ["도보·자전거", ["fitness", "outdoor"]]]),
  q("s15", 2, "주말 드라이브, 어디로?", [["바다", ["car", "travel", "outdoor"], "sea"], ["산·계곡", ["car", "travel", "outdoor"], "mountain"]]),
  q("s15", 3, "주유는 주로?", [["가장 싼 주유소 찾아서", ["car", "value"]], ["가까운 곳 아무데나", ["car", "convenience"]], ["전기차 충전", ["car", "tech"]], ["해당 없음", ["rest"]]]),

  q("s16", 1, "건강을 위해 하는 것은?", [["규칙적인 운동", ["fitness"]], ["영양제 챙기기", ["health"]], ["일찍 자기", ["early_bird", "rest"]], ["아무것도 안 함", ["rest"]]]),
  q("s16", 2, "하루 물 섭취량은?", [["2L 이상", ["health", "fitness"], "water"], ["커피가 물", ["cafe", "coffee"], "coffeecup"]]),
  q("s16", 3, "건강검진은?", [["매년 꼬박꼬박", ["health"]], ["회사에서 할 때만", ["health"]], ["안 받은 지 오래", ["rest"]], ["다음 달 예약함", ["health"]]]),
];

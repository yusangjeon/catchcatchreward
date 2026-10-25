/** 혜택 탭 시드 — 마이비 benefit-hub 캡처(2026-10-25) 응답값. 게임 아이콘은 저작권 자산이라 benefit-hub 자체 이미지로 대체 */
import type { BenefitGame, BenefitSurvey } from "./types";

export const GAMES: BenefitGame[] = [
  { id: "cab33ec3-af0a-4806-bdb8-ccb63da7aca0", title: "Royal Kingdom", icon: "/myb/bh/img_adjoe_game_01.webp", missionText: "레벨 9를 완료하세요", missionPoint: 252, bonusPoint: 1000, totalPoint: 93548 },
  { id: "708ea9f2-6c55-4f29-88db-acf2f00c5ff1", title: "씨사이드 익스케이프: 합성 & 스토리 게임", icon: "/myb/bh/img_adjoe_game_02.webp", missionText: "레벨 7을 완료하세요", missionPoint: 382, bonusPoint: 1000, totalPoint: 141818 },
  { id: "4dca10fb-4004-4753-9d6b-9de796d97267", title: "핫레스토랑: 머지&쿠킹", icon: "/myb/bh/img_adjoe_game_03.webp", missionText: "2일차에 도달하세요", missionPoint: 286, bonusPoint: 1000, totalPoint: 165649 },
  { id: "67d08291-257f-4c42-bdf5-7c6241fe59ce", title: "나사 풀기 대작전", icon: "/myb/bh/img_adjoe_game_04.webp", missionText: "레벨 2를 완료하세요", missionPoint: 72, bonusPoint: 1000, totalPoint: 46778 },
  { id: "3eb84428-b902-46ac-a328-c3ea66399b6e", title: "Travel Town - Merge Adventure", icon: "/myb/bh/img_adjoe_game_05.webp", missionText: "레벨 3 달성", missionPoint: 1168, bonusPoint: 1000, totalPoint: 457218 },
  { id: "e2be477a-389d-4b22-b7b4-704811b8997a", title: "PIGGY CASH - 솔리티어 & 타일 매치", icon: "/myb/bh/img_adjoe_game_06.webp", missionText: "솔리테어 또는 타일 1회 클리어", missionPoint: 72, bonusPoint: 1000, totalPoint: 27444 },
  { id: "4d6c268c-a168-4925-b417-346180d33313", title: "오피스 퀸 키우기", icon: "/myb/bh/img_adjoe_game_01.webp", missionText: "캐릭터를 생성하세요", missionPoint: 538, bonusPoint: 1000, totalPoint: 108936 },
  { id: "ee18f6b0-7bf7-4a62-b968-985cd582ee90", title: "꿈의 마을 (Township)", icon: "/myb/bh/img_adjoe_game_02.webp", missionText: "레벨 4에 도달하세요", missionPoint: 352, bonusPoint: 1000, totalPoint: 87688 },
];

/** 벤핏허브 "지금 가장 Hot한 설문" 5개(캡처 당시 DOM 순서·값) */
export const SURVEYS: BenefitSurvey[] = [
  { id: "81259621", title: "[12문항] 설문 참여하고 포인트 받기", loi: 12, reward: 3239, label: { text: "보상+20%", color: "#FFFC51", bg: "linear-gradient(90deg, #B818FD 0%, #DA57FF 100%)" } },
  { id: "81255452", title: "[13문항] 포인트 퍼주는 설문 참여하기", loi: 13, reward: 3225, label: { text: "보상+20%", color: "#FFFC51", bg: "linear-gradient(90deg, #B818FD 0%, #DA57FF 100%)" } },
  { id: "81210993", title: "[쾌적] 포인트 받는 설문, 지금 참여하기", loi: 10, reward: 2688, label: { text: "⚡️보상UP", color: "#8B42FF", bg: "#F6F0FF" } },
  { id: "81188484", title: "[9문항] 설문 참여하고 포인트 받기", loi: 9, reward: 572, label: { text: "보상+20%", color: "#FFFC51", bg: "linear-gradient(90deg, #B818FD 0%, #DA57FF 100%)" } },
  { id: "81190112", title: "[1문항] 포인트 퍼주는 설문 참여하기", loi: 1, reward: 978, label: { text: "보상+20%", color: "#FFFC51", bg: "linear-gradient(90deg, #B818FD 0%, #DA57FF 100%)" } },
];

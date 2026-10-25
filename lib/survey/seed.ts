/** 설문 보상 시드 — 마이비 survey.myb.im 캡처(2026-10-25) /v1/api/cpx 응답(profiling·curation1~3·surveys) */
import type { SurveyItem } from "./types";

export const TOTAL_AVAILABLE = 92225; // "오늘 설문 참여하면 92,225 적립 가능"
export const PROFILING: SurveyItem[] = [
  {"id": "SOP_PROFILING_SURVEY", "title": "귀하의 생년월일은 어떻게 되십니까?", "loi": 5, "reward": 100, "labels": [{"text": "💡필수설문", "color": "#427CFF", "bg": "#ECF2FF"}, {"text": "⚡️간단해요", "color": "#00B795", "bg": "#E7FAF5"}], "participants": null},
  {"id": "2709144", "title": "환영 설문조사", "loi": 1, "reward": 30, "labels": [{"text": "💡필수설문", "color": "#427CFF", "bg": "#ECF2FF"}, {"text": "⚡️간단해요", "color": "#00B795", "bg": "#E7FAF5"}], "participants": null},
];
export const FEATURED: SurveyItem[] = [
  {"id": "81259621", "title": "[12문항] 설문 참여하고 포인트 받기", "loi": 12, "reward": 3239, "labels": [{"text": "추천해요", "color": "#FF9500", "bg": "#FFF4E0"}, {"text": "보상+20%", "color": "#FFFC51", "bg": "linear-gradient(90deg, #B818FD 0%, #DA57FF 100%)"}], "participants": 233195},
  {"id": "81255452", "title": "[13문항] 포인트 퍼주는 설문 참여하기", "loi": 13, "reward": 3225, "labels": [{"text": "추천해요", "color": "#FF9500", "bg": "#FFF4E0"}, {"text": "보상+20%", "color": "#FFFC51", "bg": "linear-gradient(90deg, #B818FD 0%, #DA57FF 100%)"}], "participants": 99951},
  {"id": "81188484", "title": "[9문항] 설문 참여하고 포인트 받기", "loi": 9, "reward": 572, "labels": [{"text": "추천해요", "color": "#FF9500", "bg": "#FFF4E0"}, {"text": "보상+20%", "color": "#FFFC51", "bg": "linear-gradient(90deg, #B818FD 0%, #DA57FF 100%)"}], "participants": 100031},
];
export const LIGHT: SurveyItem[] = [
  {"id": "81239985", "title": "[1문항] 포인트 퍼주는 설문 참여하기", "loi": 1, "reward": 978, "labels": [{"text": "🌟추천해요", "color": "#FF9500", "bg": "#FFF4E0"}, {"text": "🌟보상+20%", "color": "#FFFC51", "bg": "linear-gradient(90deg, #B818FD 0%, #DA57FF 100%)"}], "participants": null},
  {"id": "81239986", "title": "[1문항] 간편한 설문 응답하고 포인트 받기", "loi": 1, "reward": 971, "labels": [{"text": "🌟추천해요", "color": "#FF9500", "bg": "#FFF4E0"}, {"text": "🌟보상+20%", "color": "#FFFC51", "bg": "linear-gradient(90deg, #B818FD 0%, #DA57FF 100%)"}], "participants": null},
  {"id": "81239984", "title": "[1문항] 설문 참여하고 포인트 받기", "loi": 1, "reward": 971, "labels": [{"text": "🌟추천해요", "color": "#FF9500", "bg": "#FFF4E0"}, {"text": "🌟보상+20%", "color": "#FFFC51", "bg": "linear-gradient(90deg, #B818FD 0%, #DA57FF 100%)"}], "participants": null},
  {"id": "81239939", "title": "[1문항] 간편한 설문 응답하고 포인트 받기", "loi": 1, "reward": 1197, "labels": [{"text": "🌟추천해요", "color": "#FF9500", "bg": "#FFF4E0"}, {"text": "🌟보상+20%", "color": "#FFFC51", "bg": "linear-gradient(90deg, #B818FD 0%, #DA57FF 100%)"}], "participants": null},
];
export const HOT: SurveyItem[] = [
  {"id": "81259621", "title": "[12문항] 설문 참여하고 포인트 받기", "loi": 12, "reward": 3239, "labels": [{"text": "추천해요", "color": "#FF9500", "bg": "#FFF4E0"}, {"text": "보상+20%", "color": "#FFFC51", "bg": "linear-gradient(90deg, #B818FD 0%, #DA57FF 100%)"}], "participants": 233195},
  {"id": "81255452", "title": "[13문항] 포인트 퍼주는 설문 참여하기", "loi": 13, "reward": 3225, "labels": [{"text": "추천해요", "color": "#FF9500", "bg": "#FFF4E0"}, {"text": "보상+20%", "color": "#FFFC51", "bg": "linear-gradient(90deg, #B818FD 0%, #DA57FF 100%)"}], "participants": 99951},
  {"id": "4974289_3515589", "title": "[쾌적] 포인트 받는 설문, 지금 참여하기", "loi": 10, "reward": 2688, "labels": [{"text": "New", "color": "#FF3D71", "bg": "#FFECF1"}, {"text": "⚡️보상UP", "color": "#8B42FF", "bg": "#F6F0FF"}], "participants": null},
  {"id": "81188484", "title": "[9문항] 설문 참여하고 포인트 받기", "loi": 9, "reward": 572, "labels": [{"text": "추천해요", "color": "#FF9500", "bg": "#FFF4E0"}, {"text": "보상+20%", "color": "#FFFC51", "bg": "linear-gradient(90deg, #B818FD 0%, #DA57FF 100%)"}], "participants": 100031},
  {"id": "81239985", "title": "[1문항] 포인트 퍼주는 설문 참여하기", "loi": 1, "reward": 978, "labels": [{"text": "추천해요", "color": "#FF9500", "bg": "#FFF4E0"}, {"text": "보상+20%", "color": "#FFFC51", "bg": "linear-gradient(90deg, #B818FD 0%, #DA57FF 100%)"}], "participants": null},
];
export const ALL: SurveyItem[] = [
  {"id": "SOP_PROFILING_SURVEY", "title": "귀하의 생년월일은 어떻게 되십니까?", "loi": 0, "reward": 100, "labels": [{"text": "💡필수설문", "color": "#427CFF", "bg": "#ECF2FF"}, {"text": "⚡️간단해요", "color": "#00B795", "bg": "#E7FAF5"}], "participants": null},
  {"id": "2709144", "title": "환영 설문조사", "loi": 0, "reward": 30, "labels": [{"text": "💡필수설문", "color": "#427CFF", "bg": "#ECF2FF"}, {"text": "⚡️간단해요", "color": "#00B795", "bg": "#E7FAF5"}], "participants": null},
  {"id": "4974289_3515589", "title": "[쾌적] 포인트 받는 설문, 지금 참여하기", "loi": 10, "reward": 2688, "labels": [{"text": "New", "color": "#FF3D71", "bg": "#FFECF1"}, {"text": "⚡️보상UP", "color": "#8B42FF", "bg": "#F6F0FF"}], "participants": null},
  {"id": "5464657_5120707", "title": "[쉬운] 참여하면 포인트가 쌓이는 설문", "loi": 11, "reward": 1176, "labels": [{"text": "New", "color": "#FF3D71", "bg": "#FFECF1"}, {"text": "⚡️보상UP", "color": "#8B42FF", "bg": "#F6F0FF"}], "participants": null},
  {"id": "6521098_5085575", "title": "[쾌적] 설문 응답하고 포인트 챙기기", "loi": 8, "reward": 679, "labels": [{"text": "New", "color": "#FF3D71", "bg": "#FFECF1"}, {"text": "🌱할만해요", "color": "#4DC066", "bg": "#E6F9EA"}], "participants": null},
  {"id": "6467948_5032242", "title": "[쾌적] 참여하면 포인트가 쌓이는 설문", "loi": 15, "reward": 2233, "labels": [{"text": "New", "color": "#FF3D71", "bg": "#FFECF1"}, {"text": "⚡️보상UP", "color": "#8B42FF", "bg": "#F6F0FF"}], "participants": null},
  {"id": "5464658_5120715", "title": "[쉬운] 참여하면 포인트가 쌓이는 설문", "loi": 11, "reward": 1596, "labels": [{"text": "New", "color": "#FF3D71", "bg": "#FFECF1"}, {"text": "⚡️보상UP", "color": "#8B42FF", "bg": "#F6F0FF"}], "participants": null},
  {"id": "5480907_4034489", "title": "[쉬운] 참여하면 포인트가 쌓이는 설문", "loi": 7, "reward": 763, "labels": [{"text": "New", "color": "#FF3D71", "bg": "#FFECF1"}, {"text": "🌱할만해요", "color": "#4DC066", "bg": "#E6F9EA"}], "participants": null},
  {"id": "6374223_4938059", "title": "[간편] 참여하면 포인트가 쌓이는 설문", "loi": 10, "reward": 763, "labels": [{"text": "New", "color": "#FF3D71", "bg": "#FFECF1"}], "participants": null},
  {"id": "4165500_5033943", "title": "[쾌적] 설문 응답하고 포인트 챙기기", "loi": 10, "reward": 763, "labels": [{"text": "New", "color": "#FF3D71", "bg": "#FFECF1"}], "participants": null},
  {"id": "6533162_5097708", "title": "[쉬운] 참여하면 포인트가 쌓이는 설문", "loi": 12, "reward": 1014, "labels": [{"text": "New", "color": "#FF3D71", "bg": "#FFECF1"}, {"text": "⚡️보상UP", "color": "#8B42FF", "bg": "#F6F0FF"}], "participants": null},
  {"id": "25c14d60-497a-4776-af9c-25889dfa6406", "title": "[1문항] 참여하면 포인트가 쌓이는 설문", "loi": 1, "reward": 940, "labels": [{"text": "🌟추천해요", "color": "#FF9500", "bg": "#FFF4E0"}, {"text": "🌟보상+20%", "color": "#FFFC51", "bg": "linear-gradient(90deg, #B818FD 0%, #DA57FF 100%)"}], "participants": null},
];

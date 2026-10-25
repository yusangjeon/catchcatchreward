export interface SurveyLabel {
  text: string;
  color: string;
  bg: string;
}
export interface SurveyItem {
  id: string;
  title: string;
  loi: number;
  reward: number;
  labels: SurveyLabel[];
  participants: number | null;
}
export interface SurveyPayload {
  totalAvailable: number;
  featured: SurveyItem[]; // 기간 한정 보상 이벤트 캐러셀
  profiling: SurveyItem[]; // 기초 설문
  light: SurveyItem[]; // 가볍게 참여해 보세요
  hot: SurveyItem[]; // 지금 가장 Hot한 설문
  all: SurveyItem[]; // 전체 설문 리스트
}

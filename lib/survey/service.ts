import "server-only";
import { ALL, FEATURED, HOT, LIGHT, PROFILING, TOTAL_AVAILABLE } from "./seed";
import type { SurveyPayload } from "./types";

export function getSurvey(): SurveyPayload {
  return { totalAvailable: TOTAL_AVAILABLE, featured: FEATURED, profiling: PROFILING, light: LIGHT, hot: HOT, all: ALL.slice(0, 10) };
}

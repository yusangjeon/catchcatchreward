import { NextResponse } from "next/server";
import { getSurvey } from "@/lib/survey/service";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json(getSurvey());
}

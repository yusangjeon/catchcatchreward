import { NextResponse } from "next/server";
import { getGame } from "@/lib/game/service";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json(getGame());
}

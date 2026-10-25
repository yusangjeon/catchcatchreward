import { NextResponse } from "next/server";
import { getShop } from "@/lib/shop/service";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getShop());
}

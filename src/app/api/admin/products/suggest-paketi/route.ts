import { NextResponse } from "next/server";
import { suggestPaketiForAllProducts } from "@/lib/cms/repo";

export async function POST() {
  const count = await suggestPaketiForAllProducts();
  return NextResponse.json({ count });
}

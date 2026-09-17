import { NextResponse } from "next/server";
import { setCampaignProduct } from "@/lib/ads/repo";
import { str } from "@/lib/cms/sanitize";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  await setCampaignProduct(id, str(body.productName, 200));
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { publishHome } from "@/lib/home/repo";

export async function POST() {
  const res = await publishHome();
  if (!res.ok) return NextResponse.json({ errors: res.errors }, { status: 400 });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

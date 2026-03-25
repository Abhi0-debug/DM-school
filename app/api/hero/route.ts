import { NextResponse } from "next/server";
import { fallbackHeroSlides } from "@/lib/constants";
import { getDynamicHero } from "@/lib/media-provider";

export const runtime = "nodejs";

export async function GET() {
  const slides = await getDynamicHero(fallbackHeroSlides);
  return NextResponse.json({ slides });
}

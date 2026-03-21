import { NextResponse } from "next/server";
import { getHeroSlides } from "@/lib/data";
import { getDynamicHero } from "@/lib/media-provider";

export const runtime = "nodejs";

export async function GET() {
  const configuredSlides = await getHeroSlides();
  const slides = await getDynamicHero(configuredSlides);
  return NextResponse.json({ slides });
}

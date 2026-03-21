import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";
import { HeroSlide } from "@/lib/types";
import { heroSlideSchema, reorderSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const slides = await readJsonFile<HeroSlide[]>("hero.json", []);
  return NextResponse.json({ slides });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = heroSlideSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid hero slide payload." },
      { status: 400 }
    );
  }

  const slides = await readJsonFile<HeroSlide[]>("hero.json", []);
  const slide: HeroSlide = {
    id: `hero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...parsed.data
  };

  slides.unshift(slide);
  await writeJsonFile("hero.json", slides);

  return NextResponse.json({ message: "Hero slide added.", slide });
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = reorderSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid reorder payload." }, { status: 400 });
  }

  const slides = await readJsonFile<HeroSlide[]>("hero.json", []);

  if (parsed.data.ids.length !== slides.length) {
    return NextResponse.json(
      { message: "Reorder list must include all slide IDs." },
      { status: 400 }
    );
  }

  const slideMap = new Map(slides.map((slide) => [slide.id, slide]));
  const reordered = parsed.data.ids
    .map((id) => slideMap.get(id))
    .filter((slide): slide is HeroSlide => Boolean(slide));

  if (reordered.length !== slides.length) {
    return NextResponse.json({ message: "Reorder payload has unknown IDs." }, { status: 400 });
  }

  await writeJsonFile("hero.json", reordered);
  return NextResponse.json({ message: "Hero slides reordered.", slides: reordered });
}

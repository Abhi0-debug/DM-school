import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";
import { HeroSlide } from "@/lib/types";
import { heroSlideSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const payload = await request.json();
  const parsed = heroSlideSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid hero slide payload." },
      { status: 400 }
    );
  }

  const slides = await readJsonFile<HeroSlide[]>("hero.json", []);
  const index = slides.findIndex((slide) => slide.id === id);

  if (index === -1) {
    return NextResponse.json({ message: "Hero slide not found." }, { status: 404 });
  }

  const updated: HeroSlide = { id, ...parsed.data };
  slides[index] = updated;
  await writeJsonFile("hero.json", slides);

  return NextResponse.json({ message: "Hero slide updated.", slide: updated });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const slides = await readJsonFile<HeroSlide[]>("hero.json", []);
  const filtered = slides.filter((slide) => slide.id !== id);

  if (filtered.length === slides.length) {
    return NextResponse.json({ message: "Hero slide not found." }, { status: 404 });
  }

  await writeJsonFile("hero.json", filtered);
  return NextResponse.json({ message: "Hero slide deleted." });
}

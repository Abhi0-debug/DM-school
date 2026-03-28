import { NextRequest, NextResponse } from "next/server";
import { fallbackHeroSlides } from "@/lib/constants";
import { isAdminAuthorized } from "@/lib/admin-auth";
import {
  getDefaultAdmissionsText,
  getHeroContent,
  updateHeroAdmissionsText
} from "@/lib/hero-content-service";
import { getDynamicHero } from "@/lib/media-provider";
import { heroContentSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [slides, heroContent] = await Promise.all([
      getDynamicHero(fallbackHeroSlides),
      getHeroContent()
    ]);

    return NextResponse.json({
      slides,
      admissionsText: heroContent.admissionsText || getDefaultAdmissionsText()
    });
  } catch {
    const slides = await getDynamicHero(fallbackHeroSlides);
    return NextResponse.json({
      slides,
      admissionsText: getDefaultAdmissionsText()
    });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const parsed = heroContentSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message:
            parsed.error.issues[0]?.message ?? "Invalid hero content payload."
        },
        { status: 400 }
      );
    }

    const content = await updateHeroAdmissionsText(parsed.data.admissionsText);
    return NextResponse.json({
      message: "Hero admissions text updated.",
      admissionsText: content.admissionsText,
      heroContent: content
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to update hero admissions text."
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";
import { NavConfig } from "@/lib/types";
import { navConfigSchema } from "@/lib/validation";

export const runtime = "nodejs";

const fallbackConfig: NavConfig = {
  home: true,
  gallery: true,
  events: true,
  notices: true,
  staff: true,
  contact: true
};

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const config = await readJsonFile<NavConfig>("nav-config.json", fallbackConfig);
  return NextResponse.json({ config });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = navConfigSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid navbar config payload." },
      { status: 400 }
    );
  }

  await writeJsonFile("nav-config.json", parsed.data);
  return NextResponse.json({ message: "Navbar visibility updated.", config: parsed.data });
}

import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";
import { ContactMessage, ContactSettings } from "@/lib/types";
import { contactSettingsSchema } from "@/lib/validation";
import { siteConfig } from "@/lib/site-config";

export const runtime = "nodejs";

const fallbackSettings: ContactSettings = {
  email: siteConfig.contact.email,
  phone: siteConfig.contact.phone,
  address: siteConfig.contact.address
};

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const [settings, messages] = await Promise.all([
    readJsonFile<ContactSettings>("contact-settings.json", fallbackSettings),
    readJsonFile<ContactMessage[]>("messages.json", [])
  ]);

  const sortedMessages = [...messages].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );

  return NextResponse.json({ settings, messages: sortedMessages });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = contactSettingsSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid contact settings payload." },
      { status: 400 }
    );
  }

  await writeJsonFile("contact-settings.json", parsed.data);
  return NextResponse.json({ message: "Contact settings updated.", settings: parsed.data });
}

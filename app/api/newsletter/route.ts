import { NextResponse } from "next/server";
import { newsletterSchema } from "@/lib/validation";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";

export const runtime = "nodejs";

interface NewsletterItem {
  email: string;
  subscribedAt: string;
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = newsletterSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid email." },
      { status: 400 }
    );
  }

  const existing = await readJsonFile<NewsletterItem[]>("newsletter.json", []);
  if (existing.some((entry) => entry.email === parsed.data.email)) {
    return NextResponse.json({ message: "Already subscribed." });
  }

  existing.push({
    email: parsed.data.email,
    subscribedAt: new Date().toISOString()
  });

  await writeJsonFile("newsletter.json", existing);

  return NextResponse.json({ message: "Thanks for subscribing to DMPS updates." });
}

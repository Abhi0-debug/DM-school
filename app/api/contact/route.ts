import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { sendContactEmail } from "@/lib/mailer";
import { readJsonFile, writeJsonFile } from "@/lib/file-store";

export const runtime = "nodejs";

interface StoredMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = contactSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid form data." },
      { status: 400 }
    );
  }

  if (parsed.data.captchaAnswer !== parsed.data.captchaExpected) {
    return NextResponse.json({ message: "Captcha validation failed." }, { status: 400 });
  }

  const { name, email, phone, message } = parsed.data;

  const saveLocally = String(process.env.STORE_MESSAGES_LOCALLY ?? "true") === "true";

  if (saveLocally) {
    const messages = await readJsonFile<StoredMessage[]>("messages.json", []);
    messages.push({
      id: `msg-${Date.now()}`,
      name,
      email,
      phone,
      message,
      createdAt: new Date().toISOString()
    });
    await writeJsonFile("messages.json", messages);
  }

  const emailStatus = await sendContactEmail({ name, email, phone, message });

  return NextResponse.json({
    message: emailStatus.delivered
      ? "Message sent successfully. We will contact you soon."
      : "Message recorded successfully. Email delivery is not configured yet."
  });
}

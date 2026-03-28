import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { createDocument, listDocuments } from "@/lib/documents-service";
import { documentTextSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    const documents = await listDocuments();
    return NextResponse.json({ documents });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to fetch documents."
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const parsed = documentTextSchema.safeParse({ title });

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid document title." },
        { status: 400 }
      );
    }

    const fileEntry = formData.get("file");
    const file = fileEntry instanceof File ? fileEntry : null;

    if (!file) {
      return NextResponse.json({ message: "PDF file is required." }, { status: 400 });
    }

    const document = await createDocument({
      title: parsed.data.title,
      file
    });

    return NextResponse.json({ message: "Document uploaded successfully.", document });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to upload document."
      },
      { status: 500 }
    );
  }
}


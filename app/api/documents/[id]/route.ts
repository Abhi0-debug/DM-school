import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { deleteDocument, updateDocument } from "@/lib/documents-service";
import { documentTextSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
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
    const document = await updateDocument(id, { title: parsed.data.title, file });

    if (!document) {
      return NextResponse.json({ message: "Document not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Document updated.", document });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to update document."
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const document = await deleteDocument(id);

    if (!document) {
      return NextResponse.json({ message: "Document not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Document deleted." });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to delete document."
      },
      { status: 500 }
    );
  }
}


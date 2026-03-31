import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { deleteTeacher, parseTeacherFormData, updateTeacher } from "@/lib/teacher-service";
import { removeStaffPdfForStaff } from "@/lib/staff-pdf-service";
import { teacherTextSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const contentType = request.headers.get("content-type") ?? "";

  try {
    let payload: {
      name: string;
      subject: string;
      description: string;
      imageFile: File | null;
    };

    if (contentType.includes("multipart/form-data")) {
      payload = parseTeacherFormData(await request.formData());
    } else {
      const json = (await request.json()) as {
        name?: string;
        subject?: string;
        bio?: string;
        description?: string;
      };
      payload = {
        name: String(json.name ?? "").trim(),
        subject: String(json.subject ?? "").trim(),
        description: String(json.description ?? json.bio ?? "").trim(),
        imageFile: null
      };
    }

    const parsedText = teacherTextSchema.safeParse(payload);
    if (!parsedText.success) {
      return NextResponse.json(
        { message: parsedText.error.issues[0]?.message ?? "Invalid staff payload." },
        { status: 400 }
      );
    }

    const updated = await updateTeacher(id, {
      ...parsedText.data,
      imageFile: payload.imageFile
    });

    if (!updated) {
      return NextResponse.json({ message: "Staff member not found." }, { status: 404 });
    }

    const member = {
      id: updated.id,
      name: updated.name,
      subject: updated.subject,
      bio: updated.description,
      photo: updated.imageUrl,
      publicId: updated.publicId,
      pdfUrl: updated.pdfUrl,
      pdfTitle: updated.pdfTitle
    };

    return NextResponse.json({ message: "Staff member updated.", member });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update staff member.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const removed = await deleteTeacher(id);
    if (!removed) {
      return NextResponse.json({ message: "Staff member not found." }, { status: 404 });
    }

    await removeStaffPdfForStaff(id).catch(() => undefined);

    return NextResponse.json({ message: "Staff member deleted." });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete staff member.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

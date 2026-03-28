import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { deleteTeacher, parseTeacherFormData, updateTeacher } from "@/lib/teacher-service";
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
    let parsedForm: {
      name: string;
      subject: string;
      description: string;
      imageFile: File | null;
    };

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      parsedForm = parseTeacherFormData(formData);
    } else {
      const payload = (await request.json()) as {
        name?: string;
        subject?: string;
        description?: string;
        bio?: string;
      };

      parsedForm = {
        name: String(payload.name ?? "").trim(),
        subject: String(payload.subject ?? "").trim(),
        description: String(payload.description ?? payload.bio ?? "").trim(),
        imageFile: null
      };
    }

    const parsedText = teacherTextSchema.safeParse(parsedForm);
    if (!parsedText.success) {
      return NextResponse.json(
        { message: parsedText.error.issues[0]?.message ?? "Invalid teacher payload." },
        { status: 400 }
      );
    }

    const teacher = await updateTeacher(id, {
      ...parsedText.data,
      imageFile: parsedForm.imageFile
    });

    if (!teacher) {
      return NextResponse.json({ message: "Teacher not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Teacher updated.", teacher });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update teacher.";
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
      return NextResponse.json({ message: "Teacher not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Teacher deleted.", teacher: removed });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete teacher.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

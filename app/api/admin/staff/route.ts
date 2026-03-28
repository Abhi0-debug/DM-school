import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import {
  createTeacher,
  listTeacherStaffMembers,
  parseTeacherFormData
} from "@/lib/teacher-service";
import { teacherTextSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const staff = await listTeacherStaffMembers();
    return NextResponse.json({ staff });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load staff.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { message: "Use multipart/form-data to create teacher." },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();
    const parsedForm = parseTeacherFormData(formData, { requireImage: true });
    const parsedText = teacherTextSchema.safeParse(parsedForm);

    if (!parsedText.success) {
      return NextResponse.json(
        { message: parsedText.error.issues[0]?.message ?? "Invalid staff payload." },
        { status: 400 }
      );
    }

    if (!parsedForm.imageFile) {
      return NextResponse.json(
        { message: "Teacher image file is required." },
        { status: 400 }
      );
    }

    const teacher = await createTeacher({
      ...parsedText.data,
      imageFile: parsedForm.imageFile
    });

    const member = {
      id: teacher.id,
      name: teacher.name,
      subject: teacher.subject,
      bio: teacher.description,
      photo: teacher.imageUrl,
      publicId: teacher.publicId
    };

    return NextResponse.json({ message: "Staff member added.", member });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to add staff member.";
    const status = message.includes("required") ? 400 : 500;
    return NextResponse.json({ message }, { status });
  }
}

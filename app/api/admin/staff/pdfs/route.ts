import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import {
  removeStaffPdfForStaff,
  upsertStaffPdfForStaff
} from "@/lib/staff-pdf-service";
import { listTeacherStaffMembers } from "@/lib/teacher-service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { message: "Use multipart/form-data to upload staff PDF." },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();
    const staffId = String(formData.get("staffId") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const fileEntry = formData.get("file");
    const file = fileEntry instanceof File ? fileEntry : null;

    if (!staffId) {
      return NextResponse.json({ message: "Staff member is required." }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ message: "PDF file is required." }, { status: 400 });
    }

    const staff = await listTeacherStaffMembers();
    const selected = staff.find((item) => item.id === staffId);
    if (!selected) {
      return NextResponse.json({ message: "Staff member not found." }, { status: 404 });
    }

    const record = await upsertStaffPdfForStaff(staffId, title || selected.name, file);
    const member = {
      ...selected,
      pdfUrl: record.publicUrl,
      pdfTitle: record.title
    };

    return NextResponse.json({
      message: "Staff PDF uploaded.",
      member
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload staff PDF.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const staffId = url.searchParams.get("staffId")?.trim() ?? "";
    if (!staffId) {
      return NextResponse.json({ message: "Staff member is required." }, { status: 400 });
    }

    const removed = await removeStaffPdfForStaff(staffId);
    if (!removed) {
      return NextResponse.json({ message: "PDF not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Staff PDF removed." });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to remove staff PDF.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

import { Teacher as PrismaTeacher } from "@prisma/client";
import {
  deleteImageFromCloudinary,
  getOptimizedCloudinaryImageUrl,
  uploadImageToCloudinary
} from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { StaffMember, Teacher } from "@/lib/types";

interface TeacherInput {
  name: string;
  subject: string;
  description: string;
}

interface TeacherUpdateInput extends TeacherInput {
  imageFile?: File | null;
}

function normalizeText(value: string) {
  return value.trim();
}

function getTeachersFolder() {
  const baseFolder = process.env.CLOUDINARY_FOLDER ?? "dm-public-school";
  return `${baseFolder}/teachers`;
}

function toTeacher(record: PrismaTeacher): Teacher {
  return {
    id: record.id,
    name: record.name,
    subject: record.subject,
    description: record.description,
    imageUrl: record.imageUrl,
    publicId: record.publicId
  };
}

function toStaffMember(record: PrismaTeacher): StaffMember {
  return {
    id: record.id,
    name: record.name,
    subject: record.subject,
    bio: record.description,
    photo: record.imageUrl,
    publicId: record.publicId
  };
}

export function parseTeacherFormData(
  formData: FormData,
  options?: { requireImage?: boolean }
) {
  const name = normalizeText(String(formData.get("name") ?? ""));
  const subject = normalizeText(String(formData.get("subject") ?? ""));
  const description = normalizeText(
    String(formData.get("description") ?? formData.get("bio") ?? "")
  );

  const fileEntry = formData.get("image") ?? formData.get("file");
  const imageFile = fileEntry instanceof File ? fileEntry : null;

  if (options?.requireImage && !imageFile) {
    throw new Error("Teacher image file is required.");
  }

  return { name, subject, description, imageFile };
}

export async function listTeachers(): Promise<Teacher[]> {
  const records = await prisma.teacher.findMany({
    orderBy: [{ createdAt: "desc" }]
  });

  return records.map(toTeacher);
}

export async function listTeacherStaffMembers(): Promise<StaffMember[]> {
  const records = await prisma.teacher.findMany({
    orderBy: [{ createdAt: "desc" }]
  });

  return records.map(toStaffMember);
}

export async function createTeacher(input: TeacherInput & { imageFile: File }) {
  const uploaded = await uploadImageToCloudinary(input.imageFile, {
    title: input.name,
    category: "teacher",
    folder: getTeachersFolder()
  });

  const imageUrl = getOptimizedCloudinaryImageUrl(uploaded.publicId);

  try {
    const created = await prisma.teacher.create({
      data: {
        name: normalizeText(input.name),
        subject: normalizeText(input.subject),
        description: normalizeText(input.description),
        imageUrl,
        publicId: uploaded.publicId
      }
    });

    return toTeacher(created);
  } catch (error) {
    await deleteImageFromCloudinary(uploaded.publicId).catch(() => undefined);
    throw error;
  }
}

export async function updateTeacher(id: string, input: TeacherUpdateInput) {
  const existing = await prisma.teacher.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }

  let nextImageUrl = existing.imageUrl;
  let nextPublicId = existing.publicId;
  let uploadedPublicId: string | null = null;

  if (input.imageFile) {
    const uploaded = await uploadImageToCloudinary(input.imageFile, {
      title: input.name,
      category: "teacher",
      folder: getTeachersFolder()
    });

    uploadedPublicId = uploaded.publicId;
    nextPublicId = uploaded.publicId;
    nextImageUrl = getOptimizedCloudinaryImageUrl(uploaded.publicId);
  }

  try {
    const updated = await prisma.teacher.update({
      where: { id },
      data: {
        name: normalizeText(input.name),
        subject: normalizeText(input.subject),
        description: normalizeText(input.description),
        imageUrl: nextImageUrl,
        publicId: nextPublicId
      }
    });

    if (uploadedPublicId) {
      await deleteImageFromCloudinary(existing.publicId).catch(() => undefined);
    }

    return toTeacher(updated);
  } catch (error) {
    if (uploadedPublicId) {
      await deleteImageFromCloudinary(uploadedPublicId).catch(() => undefined);
    }
    throw error;
  }
}

export async function deleteTeacher(id: string) {
  const existing = await prisma.teacher.findUnique({ where: { id } });
  if (!existing) {
    return null;
  }

  await deleteImageFromCloudinary(existing.publicId);
  await prisma.teacher.delete({ where: { id } });
  return toTeacher(existing);
}

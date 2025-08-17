import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// 🔄 PATCH : mettre à jour un étudiant
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const data = await req.json();

    // Only update fields that are provided and valid
    const updateData: any = {};

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.age !== undefined) updateData.age = data.age;
    if (data.contact !== undefined) updateData.contact = data.contact;
    if (data.grade !== undefined) updateData.grade = data.grade;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phoneNumber !== undefined)
      updateData.phoneNumber = data.phoneNumber;
    if (data.profilePhoto !== undefined)
      updateData.profilePhoto = data.profilePhoto;
    if (data.onboardingCompleted !== undefined)
      updateData.onboardingCompleted = data.onboardingCompleted;
    if (data.hourlyRate !== undefined) updateData.hourlyRate = data.hourlyRate;

    // Always update lastActivity
    updateData.lastActivity = new Date();

    const updated = await prisma.student.update({
      where: { id: String(id) },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH_STUDENT]", err);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

// ❌ DELETE : supprimer un étudiant
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const studentId = id;

  try {
    await prisma.student.delete({ where: { id: studentId } });
    return NextResponse.json({ message: "Étudiant supprimé" });
  } catch (err) {
    console.error("[DELETE_STUDENT]", err);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}

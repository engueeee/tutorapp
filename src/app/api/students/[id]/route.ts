import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// 🔄 PATCH : mettre à jour un étudiant
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    const { id } = params;

    const updated = await prisma.student.update({
      where: { id: String(id) },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        contact: data.contact,
        grade: data.grade,
        email: data.email,
        phoneNumber: data.phoneNumber,
        profilePhoto: data.profilePhoto,
        onboardingCompleted: data.onboardingCompleted,
        hourlyRate: data.hourlyRate,
        lastActivity: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

// ❌ DELETE : supprimer un étudiant
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const studentId = params.id;

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

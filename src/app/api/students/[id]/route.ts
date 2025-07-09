import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 🔄 PATCH : mettre à jour un étudiant
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const studentId = params.id; // ✅ sans await

  const { firstName, lastName, age, email, grade } = await req.json();

  console.log("PATCH student with data:", {
    firstName,
    lastName,
    age,
    email,
    grade,
  });

  try {
    const updated = await prisma.student.update({
      where: { id: studentId },
      data: { firstName, lastName, age, email, grade },
    });
    console.log("Student updated successfully:", updated);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH_STUDENT]", err);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
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

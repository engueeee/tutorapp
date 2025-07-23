import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: fetch user data including onboarding fields
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phoneNumber: true,
        profilePhoto: true,
        onboardingCompleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("[GET_USER]", err);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'utilisateur" },
      { status: 500 }
    );
  }
}

// PATCH: update a user (tutor) onboarding/profile fields
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = id;
  const {
    firstName,
    lastName,
    phoneNumber,
    profilePhoto,
    onboardingCompleted,
  } = await req.json();

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phoneNumber,
        profilePhoto,
        onboardingCompleted,
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH_USER]", err);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil utilisateur" },
      { status: 500 }
    );
  }
}

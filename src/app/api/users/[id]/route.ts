import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: fetch user data including onboarding fields
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = id;
  const { searchParams } = new URL(req.url);
  const includeAll = searchParams.get("includeAll") === "true";

  try {
    // Base fields that are always included
    const baseSelect = {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      onboardingCompleted: true,
    };

    // Additional fields that can be included
    const extendedSelect = includeAll
      ? {
          ...baseSelect,
          phoneNumber: true,
          profilePhoto: true,
          bio: true,
          subjects: true,
          experience: true,
          education: true,
          createdAt: true,
          updatedAt: true,
        }
      : baseSelect;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: extendedSelect,
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
    bio,
    subjects,
    experience,
    education,
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
        bio,
        subjects,
        experience,
        education,
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

// Fichier : /src/app/api/auth/register/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Fira_Code } from "next/font/google";

// Assure-toi que JWT_SECRET est bien déclaré dans le fichier .env
const JWT_SECRET = process.env.JWT_SECRET!;

// 🌐 Route POST /api/auth/register
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role, lastName, firstName } = body;

    console.log("Registration attempt for:", {
      email,
      role,
      firstName,
      lastName,
    });

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email déjà utilisé" },
        { status: 409 }
      );
    }

    // Check if a student record already exists with this email (created by a tutor)
    let existingStudent = await prisma.student.findFirst({
      where: { email: email },
      include: {
        tutor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    console.log(
      "Existing student found:",
      existingStudent
        ? {
            id: existingStudent.id,
            firstName: existingStudent.firstName,
            lastName: existingStudent.lastName,
            tutorId: existingStudent.tutorId,
            tutor: existingStudent.tutor,
          }
        : "None"
    );

    const hashedPassword = await bcrypt.hash(password, 10);

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
          lastName,
          firstName,
        },
      });

      console.log("User created:", {
        id: user.id,
        email: user.email,
        role: user.role,
      });

      let studentId = null;
      let linkingType = null;

      // If a student exists with this email, link it to the new user
      if (existingStudent) {
        console.log("Linking existing student to new user account");

        const updatedStudent = await tx.student.update({
          where: { id: existingStudent.id },
          data: {
            userId: user.id,
            // Update student info with user info if user info is more complete
            firstName: firstName || existingStudent.firstName,
            lastName: lastName || existingStudent.lastName,
          },
          include: {
            tutor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        studentId = updatedStudent.id;
        linkingType = "linked_to_existing";

        console.log("Student linked successfully:", {
          studentId: updatedStudent.id,
          tutorId: updatedStudent.tutorId,
          tutor: updatedStudent.tutor,
        });
      } else if (role === "student") {
        // If not, create a new student record and link it
        console.log("Creating new student record for self-registered user");

        const newStudent = await tx.student.create({
          data: {
            firstName: firstName || "",
            lastName: lastName || "",
            email: email,
            userId: user.id,
          },
        });

        studentId = newStudent.id;
        linkingType = "created_new";

        console.log("New student created:", { id: newStudent.id });
      }

      return { user, studentId, linkingType };
    });

    return NextResponse.json({
      message: "Utilisateur créé",
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        lastName: result.user.lastName,
        firstName: result.user.firstName,
        phoneNumber: result.user.phoneNumber,
        profilePhoto: result.user.profilePhoto,
        onboardingCompleted: result.user.onboardingCompleted,
      },
      linkedStudent: result.studentId,
      linkingType: result.linkingType,
    });
  } catch (error) {
    console.error("[REGISTER]", error);
    return new NextResponse("Erreur interne serveur", { status: 500 });
  }
}

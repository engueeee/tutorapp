// Fichier : /src/app/api/auth/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

const RegisterSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["tutor", "student"]),
  phoneNumber: z.string().optional(),
});

// Assure-toi que JWT_SECRET est bien déclaré dans le fichier .env
const JWT_SECRET = process.env.JWT_SECRET!;

// 🌐 Route POST /api/auth/register
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = RegisterSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password, role, phoneNumber } =
      validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        phoneNumber,
        onboardingCompleted: false,
      },
    });

    // Check if there's an existing student with this email
    const existingStudent = await prisma.student.findFirst({
      where: { email },
    });

    if (existingStudent) {
      // Link existing student to new user account
      await prisma.student.update({
        where: { id: existingStudent.id },
        data: { userId: user.id },
      });
    } else if (role === "student") {
      // Only create student record for users with student role
      await prisma.student.create({
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          tutorId: user.id, // Self-registered users become their own tutor
          userId: user.id,
          onboardingCompleted: false,
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      message: "User registered successfully",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("[REGISTER_ERROR]", err);
    return NextResponse.json(
      {
        error: "Failed to register user",
        details:
          process.env.NODE_ENV === "development" ? String(err) : undefined,
      },
      { status: 500 }
    );
  }
}

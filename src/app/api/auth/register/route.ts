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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        lastName,
        firstName,
      },
    });

    return NextResponse.json({
      message: "Utilisateur créé",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        lastName: user.lastName,
        firstName: user.firstName,
      },
    });
  } catch (error) {
    console.error("[REGISTER]", error);
    return new NextResponse("Erreur interne serveur", { status: 500 });
  }
}

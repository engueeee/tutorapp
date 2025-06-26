// Fichier : /src/app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// 🌐 Route POST /api/auth/login
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Champs requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Mot de passe incorrect" },
        { status: 401 }
      );
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // ✅ Renvoie les champs complets du User
    const { id, email: userEmail, role, firstName, lastName } = user;

    return NextResponse.json({
      token,
      user: {
        id,
        email: userEmail,
        role,
        firstName,
        lastName,
      },
    });
  } catch (err) {
    console.error("[LOGIN]", err);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}

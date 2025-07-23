// 📂 Fichier : /src/lib/prisma.ts

import { PrismaClient } from "@prisma/client";

// Évite de créer plusieurs instances de Prisma en dev (hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

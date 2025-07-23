import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();

    // Test a simple query
    const userCount = await prisma.user.count();

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      userCount,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    console.error("[DB_TEST_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
        details: String(error),
        env: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          nodeEnv: process.env.NODE_ENV,
        },
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

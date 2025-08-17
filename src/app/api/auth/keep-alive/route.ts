import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Simple endpoint to keep the session alive
    // This prevents the session from timing out during long operations
    return NextResponse.json({
      status: "alive",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Keep-alive error:", error);
    return NextResponse.json({ error: "Keep-alive failed" }, { status: 500 });
  }
}

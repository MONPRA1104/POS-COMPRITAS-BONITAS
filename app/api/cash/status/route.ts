import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  // Force Next.js to NEVER evaluate this statically (must be outside try/catch)
  cookies();

  try {
    const cashRegister = await db.cashRegister.findFirst({
      where: { status: "OPEN" },
    });

    return NextResponse.json({
      success: true,
      cashRegister: cashRegister
        ? {
            id: cashRegister.id,
            expectedCash: cashRegister.expectedCash,
            status: cashRegister.status,
          }
        : null,
    });
  } catch (err) {
    // Return 200 during build so Next.js doesn't fail "Failed to collect page data"
    return NextResponse.json({ success: false, cashRegister: null }, { status: 200 });
  }
}

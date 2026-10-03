import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Force Next.js to NEVER evaluate this statically
    cookies();

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
    return NextResponse.json({ success: false, cashRegister: null }, { status: 500 });
  }
}

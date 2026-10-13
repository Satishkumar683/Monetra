import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { passkey } = body || {};

    if (!passkey || typeof passkey !== "string") {
      return NextResponse.json(
        { success: false, message: "Admin Access ID is required." },
        { status: 400 }
      );
    }

    const expectedPasskey = (process.env.ADMIN_PASSKEY || "MONETRA-ADMIN-7700").trim();
    const providedPasskey = passkey.trim();

    if (providedPasskey !== expectedPasskey) {
      return NextResponse.json(
        { success: false, message: "Invalid Admin Access ID. Access denied." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin authentication successful. Desk unlocked.",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Verification server error." },
      { status: 500 }
    );
  }
}

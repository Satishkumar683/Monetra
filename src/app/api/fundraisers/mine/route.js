import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Fundraiser from "@/models/Fundraiser";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const fundraisers = await Fundraiser.find({ owner: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, fundraisers });
  } catch (err) {
    console.error("GET /api/fundraisers/mine error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch your fundraisers." },
      { status: 500 }
    );
  }
}
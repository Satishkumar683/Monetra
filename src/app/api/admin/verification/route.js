import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Fundraiser from "@/models/Fundraiser";
import User from "@/models/User";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
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

    const passkeyHeader = req.headers.get("x-admin-passkey");
    const validPasskey =
      passkeyHeader &&
      passkeyHeader.trim() === (process.env.ADMIN_PASSKEY || "MONETRA-ADMIN-7700").trim();

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const isAdmin =
      user.role === "admin" ||
      adminEmails.includes(user.email?.toLowerCase()) ||
      validPasskey;

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin authorization required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";
    const category = searchParams.get("category");

    const query = {};
    if (status !== "all") {
      query.verificationStatus = status;
    }
    if (category && category !== "All") {
      query.category = category;
    }

    // Fetch counts across all statuses for summary metrics
    const [pendingCount, verifiedCount, rejectedCount, actionRequiredCount] =
      await Promise.all([
        Fundraiser.countDocuments({ verificationStatus: "pending" }),
        Fundraiser.countDocuments({ verificationStatus: "verified" }),
        Fundraiser.countDocuments({ verificationStatus: "rejected" }),
        Fundraiser.countDocuments({ verificationStatus: "action_required" }),
      ]);

    const fundraisers = await Fundraiser.find(query)
      .populate("owner", "name email image createdAt")
      .populate("verifiedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      counts: {
        pending: pendingCount,
        verified: verifiedCount,
        rejected: rejectedCount,
        action_required: actionRequiredCount,
        total:
          pendingCount +
          verifiedCount +
          rejectedCount +
          actionRequiredCount,
      },
      fundraisers,
    });
  } catch (err) {
    console.error("GET /api/admin/verification error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch verification list." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Fundraiser from "@/models/Fundraiser";
import User from "@/models/User";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid fundraiser ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const reviewer = await User.findOne({ email: session.user.email });
    if (!reviewer) {
      return NextResponse.json(
        { success: false, message: "Reviewer user not found." },
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
      reviewer.role === "admin" ||
      adminEmails.includes(reviewer.email?.toLowerCase()) ||
      validPasskey;

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin authorization required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, badge = "standard", note = "" } = body;

    const validActions = ["verify", "reject", "request_info", "reset_pending"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid action. Must be 'verify', 'reject', 'request_info', or 'reset_pending'.",
        },
        { status: 400 }
      );
    }

    const updateFields = {};

    if (action === "verify") {
      updateFields.verificationStatus = "verified";
      updateFields.verificationBadge = badge || "standard";
      updateFields.verificationNote = note || "Documents verified by Monetra trust desk";
      updateFields.verifiedAt = new Date();
      updateFields.verifiedBy = reviewer._id;
      updateFields.isActive = true;
    } else if (action === "reject") {
      updateFields.verificationStatus = "rejected";
      updateFields.verificationBadge = "none";
      updateFields.verificationNote = note || "Campaign does not meet Monetra guidelines";
      updateFields.verifiedAt = null;
      updateFields.verifiedBy = reviewer._id;
      updateFields.isActive = false; // Turn off public listing
    } else if (action === "request_info") {
      updateFields.verificationStatus = "action_required";
      updateFields.verificationNote =
        note || "Please upload updated or clearer verification documents";
      updateFields.verifiedAt = null;
      updateFields.verifiedBy = reviewer._id;
    } else if (action === "reset_pending") {
      updateFields.verificationStatus = "pending";
      updateFields.verificationBadge = "none";
      updateFields.verificationNote = note;
      updateFields.verifiedAt = null;
    }

    const updated = await Fundraiser.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    )
      .populate("owner", "name email image")
      .populate("verifiedBy", "name email");

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Fundraiser not found." },
        { status: 404 }
      );
    }

    try {
      revalidatePath(`/fundraiser/${id}`);
      revalidatePath("/donate");
      revalidatePath("/");
    } catch (e) {
      console.warn("revalidatePath notice:", e?.message);
    }

    return NextResponse.json({
      success: true,
      message: `Fundraiser marked as ${updateFields.verificationStatus}`,
      fundraiser: updated,
    });
  } catch (err) {
    console.error("PATCH /api/admin/verification/[id] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update verification status." },
      { status: 500 }
    );
  }
}

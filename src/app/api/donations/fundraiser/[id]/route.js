import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Donation from "@/models/Donation";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid fundraiser ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const donations = await Donation.find({ fundraiser: id, status: "Success" })
      .sort({ createdAt: -1 })
      .populate("donor", "name image")
      .lean();

    // Strip donor identity for anonymous donations before sending to client.
    const sanitized = donations.map((d) => ({
      ...d,
      donor: d.anonymous ? null : d.donor,
    }));

    return NextResponse.json({ success: true, donations: sanitized });
  } catch (err) {
    console.error("GET /api/donations/fundraiser/[id] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch donations." },
      { status: 500 }
    );
  }
}
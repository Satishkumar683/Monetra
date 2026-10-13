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

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "recent"; // "top" | "recent"
    const limitParam = parseInt(searchParams.get("limit") || "30", 10);
    const limit = Math.min(Math.max(limitParam, 1), 100);

    await connectDB();

    const sortCriteria =
      filter === "top"
        ? { amount: -1, createdAt: -1 }
        : { createdAt: -1 };

    const donations = await Donation.find({ fundraiser: id, status: "Success" })
      .sort(sortCriteria)
      .limit(limit)
      .populate("donor", "name image")
      .lean();

    // Strip donor identity for anonymous donations before sending to client.
    const sanitized = donations.map((d) => ({
      ...d,
      donor: d.anonymous ? null : d.donor,
    }));

    return NextResponse.json(
      { success: true, donations: sanitized, filter },
      {
        headers: {
          "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("GET /api/donations/fundraiser/[id] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch donations." },
      { status: 500 }
    );
  }
}
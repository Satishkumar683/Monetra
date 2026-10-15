import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Fundraiser from "@/models/Fundraiser";
import Donation from "@/models/Donation";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID or username is required" },
        { status: 400 }
      );
    }

    let user = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      user = await User.findById(id).select("-email").lean();
    }

    if (!user) {
      user = await User.findOne({ username: id.toLowerCase() }).select("-email").lean();
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Fetch user's created campaigns
    const fundraisers = await Fundraiser.find({ owner: user._id, isActive: true })
      .select("title description targetAmount currentAmount category coverImage isUrgent verificationStatus createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Fetch user's non-anonymous donations
    const donations = await Donation.find({ donor: user._id, status: "Success", anonymous: false })
      .populate("fundraiser", "title category coverImage")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Calculate donor metrics
    const totalDonatedAgg = await Donation.aggregate([
      { $match: { donor: user._id, status: "Success" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    const totalDonated = totalDonatedAgg[0]?.total || 0;
    const donationsCount = totalDonatedAgg[0]?.count || 0;
    const totalRaised = fundraisers.reduce((sum, f) => sum + (f.currentAmount || 0), 0);

    return NextResponse.json({
      success: true,
      user,
      fundraisers,
      donations,
      stats: {
        totalDonated,
        donationsCount,
        totalRaised,
        fundraisersCount: fundraisers.length,
      },
    });
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

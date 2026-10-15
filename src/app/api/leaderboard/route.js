import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Donation from "@/models/Donation";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    // Aggregate top donors across all successful donations
    const topDonors = await Donation.aggregate([
      { $match: { status: "Success" } },
      {
        $group: {
          _id: "$donor",
          totalDonated: { $sum: "$amount" },
          donationCount: { $sum: 1 },
          fundraisersSupported: { $addToSet: "$fundraiser" },
          lastDonatedAt: { $max: "$createdAt" },
        },
      },
      { $sort: { totalDonated: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 1,
          totalDonated: 1,
          donationCount: 1,
          causesCount: { $size: "$fundraisersSupported" },
          lastDonatedAt: 1,
          user: {
            name: "$userDetails.name",
            username: "$userDetails.username",
            image: "$userDetails.image",
            city: "$userDetails.city",
            country: "$userDetails.country",
          },
        },
      },
    ]);

    // Format and assign tiers & ranks
    const rankedDonors = topDonors.map((item, index) => {
      const rank = index + 1;
      let tier = "Community Angel";
      let tierBadge = "🥉";
      let badgeStyle = "bg-amber-100 text-amber-900 border-amber-300";

      if (rank === 1) {
        tier = "Grand Philanthropist";
        tierBadge = "👑";
        badgeStyle = "bg-amber-400 text-slate-950 border-black";
      } else if (rank <= 3) {
        tier = "Gold Champion";
        tierBadge = "🥇";
        badgeStyle = "bg-yellow-300 text-slate-950 border-black";
      } else if (rank <= 10) {
        tier = "Silver Benefactor";
        tierBadge = "🥈";
        badgeStyle = "bg-slate-200 text-slate-950 border-black";
      }

      return {
        rank,
        donorId: item._id,
        user: item.user,
        totalDonated: item.totalDonated,
        donationCount: item.donationCount,
        causesCount: item.causesCount,
        lastDonatedAt: item.lastDonatedAt,
        tier,
        tierBadge,
        badgeStyle,
      };
    });

    // Quick platform-wide stats
    const statsAgg = await Donation.aggregate([
      { $match: { status: "Success" } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalCount: { $sum: 1 },
          uniqueDonors: { $addToSet: "$donor" },
        },
      },
    ]);

    const stats = statsAgg[0]
      ? {
          totalAmount: statsAgg[0].totalAmount,
          totalCount: statsAgg[0].totalCount,
          uniqueDonorsCount: statsAgg[0].uniqueDonors.length,
        }
      : { totalAmount: 0, totalCount: 0, uniqueDonorsCount: 0 };

    return NextResponse.json({
      success: true,
      leaderboard: rankedDonors,
      stats,
    });
  } catch (error) {
    console.error("GET /api/leaderboard error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate donor leaderboard" },
      { status: 500 }
    );
  }
}

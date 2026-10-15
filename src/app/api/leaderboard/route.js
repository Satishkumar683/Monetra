import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Donation from "@/models/Donation";
import Fundraiser from "@/models/Fundraiser";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const search = (searchParams.get("search") || "").trim();
    const tab = searchParams.get("tab") || "donors"; // "donors" | "creators"

    let items = [];

    if (tab === "creators") {
      // Aggregate Top Fundraiser Organizers
      const pipeline = [
        { $match: { isActive: true } },
        {
          $group: {
            _id: "$owner",
            totalRaised: { $sum: "$currentAmount" },
            campaignsCount: { $sum: 1 },
            lastActiveAt: { $max: "$createdAt" },
          },
        },
        { $sort: { totalRaised: -1 } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: "$userDetails" },
      ];

      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { "userDetails.name": { $regex: search, $options: "i" } },
              { "userDetails.username": { $regex: search, $options: "i" } },
              { "userDetails.city": { $regex: search, $options: "i" } },
            ],
          },
        });
      }

      pipeline.push(
        { $limit: limit },
        {
          $project: {
            _id: 1,
            totalRaised: 1,
            campaignsCount: 1,
            lastActiveAt: 1,
            user: {
              name: "$userDetails.name",
              username: "$userDetails.username",
              image: "$userDetails.image",
              city: "$userDetails.city",
              country: "$userDetails.country",
            },
          },
        }
      );

      const topCreators = await Fundraiser.aggregate(pipeline);

      items = topCreators.map((item, index) => {
        const rank = index + 1;
        let tier = "Verified Organizer";
        let tierBadge = "🌱";
        let badgeStyle = "bg-emerald-100 text-emerald-950 border-emerald-300";

        if (rank === 1) {
          tier = "Top Impact Leader";
          tierBadge = "🌟";
          badgeStyle = "bg-[#e2ff3d] text-slate-950 border-black";
        } else if (rank <= 3) {
          tier = "Visionary Fundraiser";
          tierBadge = "⭐";
          badgeStyle = "bg-amber-300 text-slate-950 border-black";
        }

        return {
          rank,
          id: item._id,
          user: item.user,
          totalAmount: item.totalRaised,
          actionCount: item.campaignsCount,
          actionLabel: "campaigns organized",
          tier,
          tierBadge,
          badgeStyle,
        };
      });
    } else {
      // Default: Aggregate Top Donors
      const pipeline = [
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
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: "$userDetails" },
      ];

      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { "userDetails.name": { $regex: search, $options: "i" } },
              { "userDetails.username": { $regex: search, $options: "i" } },
              { "userDetails.city": { $regex: search, $options: "i" } },
            ],
          },
        });
      }

      pipeline.push(
        { $limit: limit },
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
        }
      );

      const topDonors = await Donation.aggregate(pipeline);

      items = topDonors.map((item, index) => {
        const rank = index + 1;
        let tier = "Community Angel";
        let tierBadge = "🥉";
        let badgeStyle = "bg-amber-100 text-amber-900 border-amber-300";

        if (rank === 1) {
          tier = "Grand Philanthropist";
          tierBadge = "👑";
          badgeStyle = "bg-[#e2ff3d] text-slate-950 border-black";
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
          id: item._id,
          user: item.user,
          totalAmount: item.totalDonated,
          actionCount: item.causesCount,
          actionLabel: "causes helped",
          donationCount: item.donationCount,
          tier,
          tierBadge,
          badgeStyle,
        };
      });
    }

    // Platform-wide quick metrics
    const [donationsAgg, fundraisersCount, creatorsCount] = await Promise.all([
      Donation.aggregate([
        { $match: { status: "Success" } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            totalCount: { $sum: 1 },
            uniqueDonors: { $addToSet: "$donor" },
          },
        },
      ]),
      Fundraiser.countDocuments({ isActive: true }),
      Fundraiser.distinct("owner", { isActive: true }),
    ]);

    const stats = {
      totalAmount: donationsAgg[0]?.totalAmount || 0,
      totalCount: donationsAgg[0]?.totalCount || 0,
      uniqueDonorsCount: donationsAgg[0]?.uniqueDonors?.length || 0,
      activeFundraisersCount: fundraisersCount || 0,
      activeCreatorsCount: creatorsCount.length || 0,
    };

    return NextResponse.json({
      success: true,
      tab,
      search,
      leaderboard: items,
      stats,
    });
  } catch (error) {
    console.error("GET /api/leaderboard error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate leaderboard" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Fundraiser from "@/models/Fundraiser";
import User from "@/models/User";
import { createFundraiserSchema, validateBody } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

const createFundraiserLimiter = rateLimit({ interval: 60 * 1000, max: 10 });

// CREATE FUNDRAISER
export async function POST(req) {
  try {
    const clientIp = getClientIp(req);
    const rateCheck = createFundraiserLimiter.check(clientIp);
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, message: "Too many campaign creation attempts. Please wait a minute." },
        { status: 429 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "You must be logged in to create a fundraiser." },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();
    const validation = validateBody(createFundraiserSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }
    const validatedData = validation.data;

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const fundraiser = await Fundraiser.create({
      ...validatedData,
      owner: user._id,
      verificationStatus: "pending",
      verificationBadge: "none",
    });

    return NextResponse.json({ success: true, fundraiser }, { status: 201 });
  } catch (err) {
    console.error("POST /api/fundraisers error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create fundraiser." },
      { status: 500 }
    );
  }
}

// GET ALL FUNDRAISERS (or fundraisers owned by a specific user)
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sort") || "recent";

    let query = { isActive: true };

    if (email) {
      const user = await User.findOne({ email }).lean();
      if (!user) {
        return NextResponse.json({
          success: true,
          fundraisers: [],
          total: 0,
          page: 1,
          totalPages: 0,
        });
      }
      query = { owner: user._id };
    }

    if (category && category !== "All") {
      query.category = category;
    }

    const urgent = searchParams.get("urgent");
    if (urgent === "true") {
      query.$or = [
        { isUrgent: true },
        { category: { $in: ["Healthcare", "Disaster Relief"] } },
      ];
    }

    if (search && search.trim()) {
      const cleanSearch = search.trim();
      const searchCondition = [
        { title: { $regex: cleanSearch, $options: "i" } },
        { description: { $regex: cleanSearch, $options: "i" } },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchCondition }];
        delete query.$or;
      } else {
        query.$or = searchCondition;
      }
    }

    // Sort order definition
    let sortOptions = { createdAt: -1 };
    if (sortBy === "urgent") {
      sortOptions = { isUrgent: -1, createdAt: -1 };
    } else if (sortBy === "mostRaised") {
      sortOptions = { currentAmount: -1 };
    } else if (sortBy === "highestGoal") {
      sortOptions = { targetAmount: -1 };
    } else if (sortBy === "oldest") {
      sortOptions = { createdAt: 1 };
    }

    const total = await Fundraiser.countDocuments(query);
    const hasPagination = searchParams.has("page") || searchParams.has("limit");

    if (!hasPagination) {
      const fundraisers = await Fundraiser.find(query)
        .populate("owner", "name image email")
        .sort(sortOptions)
        .lean();

      return NextResponse.json({
        success: true,
        fundraisers,
        total,
        page: 1,
        totalPages: total === 0 ? 0 : 1,
      });
    }

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "12", 10) || 12);
    const skip = (page - 1) * limit;

    const fundraisers = await Fundraiser.find(query)
      .populate("owner", "name image email")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        fundraisers,
        total,
        page,
        totalPages,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

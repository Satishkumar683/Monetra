import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Fundraiser from "@/models/Fundraiser";
import User from "@/models/User";

// CREATE FUNDRAISER
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "You must be logged in to create a fundraiser." },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();
    const { title, description, targetAmount, coverImage, category, documents } = body;

    if (!title || !description || !targetAmount || !coverImage) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const fundraiser = await Fundraiser.create({
      title,
      description,
      targetAmount,
      coverImage,
      category,
      owner: user._id,
      documents: Array.isArray(documents) ? documents : [],
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

// GET ALL FUNDRAISERS
// GET ALL FUNDRAISERS (or fundraisers owned by a specific user)
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    let query = {};
    if (email) {
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ success: true, fundraisers: [] });
      }
      query = { owner: user._id };
    }

    const fundraisers = await Fundraiser.find(query)
      .populate("owner", "name image email")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      fundraisers,
    });
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

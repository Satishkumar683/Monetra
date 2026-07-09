// src/app/api/fundraisers/[id]/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Fundraiser from "@/models/Fundraiser";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import User from "@/models/User";
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

    const fundraiser = await Fundraiser.findById(id)
      .populate("owner", "name email image bio")
      .lean();

    if (!fundraiser) {
      return NextResponse.json(
        { success: false, message: "Fundraiser not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, fundraiser });
  } catch (err) {
    console.error("GET /api/fundraisers/[id] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch fundraiser." },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const { id } =  await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid fundraiser ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    const fundraiser = await Fundraiser.findById(id);

    if (!fundraiser) {
      return NextResponse.json(
        { success: false, message: "Fundraiser not found." },
        { status: 404 }
      );
    }

    if (String(fundraiser.owner) !== String(user._id)) {
      return NextResponse.json(
        { success: false, message: "You don't have permission to delete this." },
        { status: 403 }
      );
    }

    await Fundraiser.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/fundraisers/[id] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to delete fundraiser." },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
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

    const user = await User.findOne({ email: session.user.email });
    const fundraiser = await Fundraiser.findById(id);

    if (!fundraiser) {
      return NextResponse.json(
        { success: false, message: "Fundraiser not found." },
        { status: 404 }
      );
    }

    if (String(fundraiser.owner) !== String(user._id)) {
      return NextResponse.json(
        { success: false, message: "You don't have permission to edit this." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, targetAmount, coverImage, category, documents } = body;

    if (!title || !description || !targetAmount || !coverImage) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    fundraiser.title = title;
    fundraiser.description = description;
    fundraiser.targetAmount = targetAmount;
    fundraiser.coverImage = coverImage;
    fundraiser.category = category;
    fundraiser.documents = Array.isArray(documents) ? documents : fundraiser.documents;

    await fundraiser.save();

    return NextResponse.json({ success: true, fundraiser });
  } catch (err) {
    console.error("PUT /api/fundraisers/[id] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update fundraiser." },
      { status: 500 }
    );
  }
}
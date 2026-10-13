import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Fundraiser from "@/models/Fundraiser";
import User from "@/models/User";
import { createUpdateSchema, validateBody } from "@/lib/validations";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid fundraiser ID" },
        { status: 400 }
      );
    }

    await connectDB();
    const fundraiser = await Fundraiser.findById(id).select("updates").lean();
    if (!fundraiser) {
      return NextResponse.json(
        { success: false, message: "Fundraiser not found" },
        { status: 404 }
      );
    }

    const updates = (fundraiser.updates || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return NextResponse.json(
      { success: true, updates },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (err) {
    console.error("GET /api/fundraisers/[id]/updates error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch updates" },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid fundraiser ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validation = validateBody(createUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const fundraiser = await Fundraiser.findById(id);
    if (!fundraiser) {
      return NextResponse.json(
        { success: false, message: "Fundraiser not found" },
        { status: 404 }
      );
    }

    // Authorization: only the campaign creator or an admin can post updates
    const isOwner = fundraiser.owner.toString() === user._id.toString();
    const isAdmin = user.role === "admin";
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Only the campaign organizer can post updates" },
        { status: 403 }
      );
    }

    const newUpdate = {
      title: validation.data.title,
      message: validation.data.message,
      createdAt: new Date(),
    };

    fundraiser.updates.push(newUpdate);
    await fundraiser.save();

    try {
      revalidatePath(`/fundraiser/${id}`);
    } catch (e) {
      console.warn("revalidatePath error:", e?.message);
    }

    return NextResponse.json({
      success: true,
      message: "Update posted successfully",
      updates: fundraiser.updates,
    });
  } catch (err) {
    console.error("POST /api/fundraisers/[id]/updates error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to post update" },
      { status: 500 }
    );
  }
}

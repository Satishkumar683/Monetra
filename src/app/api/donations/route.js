import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Donation from "@/models/Donation";
import Fundraiser from "@/models/Fundraiser";
import User from "@/models/User";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "You must be logged in to donate." },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();
    const { fundraiserId, amount, message, anonymous } = body;

    if (!fundraiserId || !mongoose.Types.ObjectId.isValid(fundraiserId)) {
      return NextResponse.json(
        { success: false, message: "Invalid fundraiser ID." },
        { status: 400 }
      );
    }

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, message: "Donation amount must be greater than zero." },
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

    const fundraiser = await Fundraiser.findById(fundraiserId);
    if (!fundraiser) {
      return NextResponse.json(
        { success: false, message: "Fundraiser not found." },
        { status: 404 }
      );
    }

    // NOTE: This is a simulated donation — no real payment gateway yet.
    // Once Razorpay is integrated (Phase 5), this route should only be
    // called AFTER server-side signature verification succeeds, and
    // paymentId below should be the real razorpay_payment_id.
    const donation = await Donation.create({
      donor: user._id,
      fundraiser: fundraiser._id,
      amount: Number(amount),
      message: message || "",
      anonymous: Boolean(anonymous),
      paymentId: null,
      status: "Success",
    });

    // Increment atomically rather than read-modify-write, to avoid
    // race conditions if multiple donations land at the same time.
    const updatedFundraiser = await Fundraiser.findByIdAndUpdate(
      fundraiser._id,
      { $inc: { currentAmount: Number(amount) } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      donation,
      fundraiser: updatedFundraiser,
    });
  } catch (err) {
    console.error("POST /api/donations error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to process donation." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const donations = await Donation.find({ donor: user._id })
      .sort({ createdAt: -1 })
      .populate("fundraiser", "title coverImage")
      .lean();

    return NextResponse.json({ success: true, donations });
  } catch (err) {
    console.error("GET /api/donations error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch donations." },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import crypto from "crypto";
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
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      fundraiserId,
      amount,
      message,
      anonymous,
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !fundraiserId ||
      !amount
    ) {
      return NextResponse.json(
        { success: false, message: "Missing payment verification fields." },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(fundraiserId)) {
      return NextResponse.json(
        { success: false, message: "Invalid fundraiser ID." },
        { status: 400 }
      );
    }

    // Recompute the expected signature server-side. Never trust the
    // frontend's claim that payment succeeded — verify it here.
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Payment verification failed. Signature mismatch." },
        { status: 400 }
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

    const fundraiser = await Fundraiser.findById(fundraiserId);
    if (!fundraiser) {
      return NextResponse.json(
        { success: false, message: "Fundraiser not found." },
        { status: 404 }
      );
    }

    // Only now — after verified payment — do we save the donation and
    // update the fundraiser's total, exactly as your roadmap doc specifies.
    const donation = await Donation.create({
      donor: user._id,
      fundraiser: fundraiser._id,
      amount: Number(amount),
      message: message || "",
      anonymous: Boolean(anonymous),
      paymentId: razorpay_payment_id,
      status: "Success",
    });

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
    console.error("POST /api/payment/verify error:", err);
    return NextResponse.json(
      { success: false, message: "Payment verification error." },
      { status: 500 }
    );
  }
}
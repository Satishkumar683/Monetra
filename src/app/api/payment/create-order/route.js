import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { razorpay } from "@/lib/razorpay";
import Fundraiser from "@/models/Fundraiser";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "You must be logged in to donate." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { fundraiserId, amount } = body;

    if (!fundraiserId || !mongoose.Types.ObjectId.isValid(fundraiserId)) {
      return NextResponse.json(
        { success: false, message: "Invalid fundraiser ID." },
        { status: 400 }
      );
    }

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, message: "Amount must be greater than zero." },
        { status: 400 }
      );
    }

    await connectDB();

    const fundraiser = await Fundraiser.findById(fundraiserId);
    if (!fundraiser) {
      return NextResponse.json(
        { success: false, message: "Fundraiser not found." },
        { status: 404 }
      );
    }

    // Razorpay expects amount in paise (smallest currency unit)
    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `dnt_${Date.now()}`,
      notes: {
        fundraiserId,
        userEmail: session.user.email,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("POST /api/payment/create-order error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create payment order." },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { razorpay } from "@/lib/razorpay";
import Fundraiser from "@/models/Fundraiser";
import { createOrderSchema, validateBody } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

const orderLimiter = rateLimit({ interval: 60 * 1000, max: 15 });

export async function POST(req) {
  try {
    const clientIp = getClientIp(req);
    const rateCheck = orderLimiter.check(clientIp);
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, message: "Too many payment attempts. Please wait a minute." },
        { status: 429 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "You must be logged in to donate." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = validateBody(createOrderSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }
    const { fundraiserId, amount, message, anonymous } = validation.data;

    if (!mongoose.Types.ObjectId.isValid(fundraiserId)) {
      return NextResponse.json(
        { success: false, message: "Invalid fundraiser ID." },
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

    if (!fundraiser.isActive) {
      return NextResponse.json(
        { success: false, message: "This fundraiser is currently inactive." },
        { status: 400 }
      );
    }

    if (fundraiser.verificationStatus !== "verified") {
      return NextResponse.json(
        {
          success: false,
          message:
            "This fundraiser is currently under review and is not yet eligible to accept donations.",
        },
        { status: 403 }
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
        message: message ? message.slice(0, 200) : "",
        anonymous: anonymous ? "true" : "false",
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
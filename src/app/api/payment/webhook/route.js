import { NextResponse } from "next/server";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Donation from "@/models/Donation";
import Fundraiser from "@/models/Fundraiser";
import User from "@/models/User";

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, message: "Missing webhook signature" },
        { status: 400 }
      );
    }

    const secret =
      process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      console.error("Razorpay webhook secret not configured.");
      return NextResponse.json(
        { success: false, message: "Server webhook configuration error" },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("Razorpay webhook signature verification failed.");
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    // Handle captured payments or paid orders
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const payment = event.payload?.payment?.entity;
      if (!payment) {
        return NextResponse.json({ success: true, message: "No payment payload" });
      }

      const paymentId = payment.id;
      const amount = Number(payment.amount) / 100; // Razorpay amounts are in paise
      const notes = payment.notes || {};
      const { fundraiserId, userEmail, message, anonymous } = notes;

      if (!fundraiserId || !paymentId) {
        return NextResponse.json({
          success: true,
          message: "Payment captured but missing fundraiserId",
        });
      }

      await connectDB();

      // Idempotency check: don't double count if verify endpoint already processed it
      const existing = await Donation.findOne({ paymentId });
      if (existing) {
        return NextResponse.json({
          success: true,
          message: "Donation already processed",
        });
      }

      // Find donor user by email from notes
      let donor = null;
      if (userEmail) {
        donor = await User.findOne({ email: userEmail });
      }

      const donation = await Donation.create({
        donor: donor ? donor._id : undefined,
        fundraiser: fundraiserId,
        amount,
        message: message || "",
        anonymous: anonymous === "true" || anonymous === true,
        paymentId,
        status: "Success",
      });

      // Atomically increment current amount
      await Fundraiser.findByIdAndUpdate(fundraiserId, {
        $inc: { currentAmount: amount },
      });

      // Edge cache invalidation
      try {
        revalidatePath(`/fundraiser/${fundraiserId}`);
        revalidatePath("/donate");
        revalidatePath("/");
      } catch (cacheErr) {
        console.warn("Webhook revalidatePath notice:", cacheErr?.message);
      }

      return NextResponse.json({
        success: true,
        message: "Payment webhook recorded successfully",
        donationId: donation._id,
      });
    }

    return NextResponse.json({ success: true, message: `Event ${eventType} received` });
  } catch (err) {
    console.error("Razorpay webhook error:", err);
    return NextResponse.json(
      { success: false, message: "Webhook processing error" },
      { status: 500 }
    );
  }
}

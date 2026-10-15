import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Message from "@/models/Message";
import User from "@/models/User";
import Fundraiser from "@/models/Fundraiser";
import { triggerPusherEvent } from "@/lib/pusher";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId") || "global";
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const session = await getServerSession(authOptions);

    // If private DM conversation, verify session user is part of the conversation
    if (conversationId !== "global") {
      if (!session) {
        return NextResponse.json(
          { success: false, message: "Unauthorized to view private messages" },
          { status: 401 }
        );
      }
      const currentUser = await User.findOne({ email: session.user.email }).select("_id").lean();
      if (!currentUser || !conversationId.includes(currentUser._id.toString())) {
        return NextResponse.json(
          { success: false, message: "Access denied to this conversation" },
          { status: 403 }
        );
      }
    }

    // Fetch messages sorted newest first, then reverse for chronological display
    const rawMessages = await Message.find({ conversationId })
      .populate("sender", "name username image role")
      .populate("campaignRef", "title coverImage targetAmount currentAmount category")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const messages = rawMessages.reverse();

    // Mark unread messages sent to current user as read
    if (session && conversationId !== "global") {
      const currentUser = await User.findOne({ email: session.user.email }).select("_id").lean();
      if (currentUser) {
        await Message.updateMany(
          { conversationId, recipient: currentUser._id, isRead: false },
          { $set: { isRead: true, readAt: new Date() } }
        );
      }
    }

    return NextResponse.json({
      success: true,
      conversationId,
      messages,
    });
  } catch (error) {
    console.error("GET /api/chat/messages error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load messages" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "You must be signed in to send messages" },
        { status: 401 }
      );
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email }).lean();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User account not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { text, recipientId, campaignId } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { success: false, message: "Message content cannot be empty" },
        { status: 400 }
      );
    }

    if (text.length > 1000) {
      return NextResponse.json(
        { success: false, message: "Message is too long (max 1000 characters)" },
        { status: 400 }
      );
    }

    let conversationId = "global";
    let recipientObjId = null;

    if (recipientId && recipientId !== "global") {
      if (!mongoose.Types.ObjectId.isValid(recipientId)) {
        return NextResponse.json(
          { success: false, message: "Invalid recipient ID" },
          { status: 400 }
        );
      }

      recipientObjId = new mongoose.Types.ObjectId(recipientId);
      const senderIdStr = currentUser._id.toString();
      const recipientIdStr = recipientObjId.toString();

      // Canonical conversation ID: sorted user IDs joined by underscore
      conversationId = [senderIdStr, recipientIdStr].sort().join("_");
    }

    // Verify campaignRef if provided
    let campaignRef = null;
    if (campaignId && mongoose.Types.ObjectId.isValid(campaignId)) {
      const exists = await Fundraiser.findById(campaignId).select("_id").lean();
      if (exists) campaignRef = exists._id;
    }

    const createdMsg = await Message.create({
      sender: currentUser._id,
      recipient: recipientObjId,
      conversationId,
      text: text.trim(),
      campaignRef,
    });

    const populatedMsg = await Message.findById(createdMsg._id)
      .populate("sender", "name username image role")
      .populate("campaignRef", "title coverImage targetAmount currentAmount category")
      .lean();

    // Broadcast over Pusher channel
    const channelName = `chat-${conversationId}`;
    await triggerPusherEvent(channelName, "new-message", populatedMsg);

    // If 1-on-1 DM, also notify the recipient on their personal channel
    if (recipientObjId) {
      const userChannel = `user-${recipientObjId.toString()}`;
      await triggerPusherEvent(userChannel, "dm-notification", {
        conversationId,
        message: populatedMsg,
      });
    }

    return NextResponse.json(
      { success: true, message: populatedMsg },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/chat/messages error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send message" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Message from "@/models/Message";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email }).select("_id").lean();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const currentUserId = currentUser._id;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();

    // If searching for users to start a conversation with
    if (search) {
      const regex = new RegExp(search, "i");
      const users = await User.find({
        _id: { $ne: currentUserId },
        $or: [{ name: regex }, { username: regex }, { email: regex }],
      })
        .select("name username image role isVerified")
        .limit(10)
        .lean();

      return NextResponse.json({
        success: true,
        users,
      });
    }

    // Aggregate DM conversations for current user
    const messages = await Message.find({
      conversationId: { $ne: "global" },
      $or: [{ sender: currentUserId }, { recipient: currentUserId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name username image role isVerified")
      .populate("recipient", "name username image role isVerified")
      .lean();

    // Group by conversationId to extract the latest message & unread count
    const conversationMap = new Map();

    for (const msg of messages) {
      const convId = msg.conversationId;
      if (!conversationMap.has(convId)) {
        // Determine the other participant
        const isCurrentSender = msg.sender?._id?.toString() === currentUserId.toString();
        const otherUser = isCurrentSender ? msg.recipient : msg.sender;

        if (otherUser) {
          conversationMap.set(convId, {
            conversationId: convId,
            otherUser,
            lastMessage: {
              text: msg.text,
              createdAt: msg.createdAt,
              senderId: msg.sender?._id,
            },
            unreadCount: 0,
          });
        }
      }

      // Count unread messages received by current user
      if (
        msg.recipient?._id?.toString() === currentUserId.toString() &&
        !msg.isRead
      ) {
        const conv = conversationMap.get(convId);
        if (conv) {
          conv.unreadCount += 1;
        }
      }
    }

    const conversations = Array.from(conversationMap.values());

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("GET /api/chat/conversations error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load conversations" },
      { status: 500 }
    );
  }
}

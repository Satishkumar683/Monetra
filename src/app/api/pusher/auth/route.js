import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getPusherServer } from "@/lib/pusher";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const pusher = getPusherServer();
    if (!pusher) {
      return NextResponse.json({ message: "Pusher not configured" }, { status: 503 });
    }

    let socketId;
    let channelName;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      socketId = body.socket_id;
      channelName = body.channel_name;
    } else {
      const rawText = await req.text();
      const params = new URLSearchParams(rawText);
      socketId = params.get("socket_id");
      channelName = params.get("channel_name");
    }

    if (!socketId || !channelName) {
      return NextResponse.json({ message: "Missing socket_id or channel_name" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).select("_id name").lean();
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // For presence channels or private channels
    const authData = pusher.authorizeChannel(socketId, channelName, {
      user_id: user._id.toString(),
      user_info: {
        name: user.name,
      },
    });

    return NextResponse.json(authData);
  } catch (error) {
    console.error("Pusher auth error:", error);
    return NextResponse.json({ message: "Authorization failed" }, { status: 500 });
  }
}

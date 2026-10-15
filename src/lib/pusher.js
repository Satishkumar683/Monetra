import PusherServer from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance
let pusherServerInstance = null;

export function getPusherServer() {
  if (pusherServerInstance) return pusherServerInstance;

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2";

  if (appId && key && secret) {
    try {
      pusherServerInstance = new PusherServer({
        appId,
        key,
        secret,
        cluster,
        useTLS: true,
      });
    } catch (err) {
      console.warn("Pusher server initialization failed:", err.message);
    }
  }

  return pusherServerInstance;
}

// Helper to broadcast events safely
export async function triggerPusherEvent(channel, event, data) {
  const server = getPusherServer();
  if (!server) return false;

  try {
    await server.trigger(channel, event, data);
    return true;
  } catch (err) {
    console.error(`Pusher trigger error on channel [${channel}]:`, err.message);
    return false;
  }
}

// Client-side Pusher instance singleton
let pusherClientInstance = null;

export function getPusherClient() {
  if (typeof window === "undefined") return null;
  if (pusherClientInstance) return pusherClientInstance;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2";

  if (!key) {
    // If not set up yet, returns null and triggers the polling fallback
    return null;
  }

  try {
    pusherClientInstance = new PusherClient(key, {
      cluster,
      authEndpoint: "/api/pusher/auth",
    });
    return pusherClientInstance;
  } catch (err) {
    console.warn("Pusher client connection error:", err);
    return null;
  }
}

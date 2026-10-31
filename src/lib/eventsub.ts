import WebSocket from "ws";
import { env } from "@/lib/env";
import { ingestChat, setConnection, setRuntimeSession } from "@/lib/store";
import { twitchFetch, validateToken } from "@/lib/twitch";
import type { TwitchSession } from "@/lib/types";

type TwitchMessage = {
  metadata: {
    message_id: string;
    message_type: string;
    subscription_type?: string;
  };
  payload: {
    session?: { id: string; reconnect_url?: string | null };
    event?: {
      message_id: string;
      broadcaster_user_id: string;
      broadcaster_user_name: string;
      chatter_user_id: string;
      chatter_user_name: string;
      message: { text: string };
    };
  };
};

const globalEventSub = globalThis as typeof globalThis & {
  crowdPulseSocket?: WebSocket;
};

async function subscribe(sessionId: string, session: TwitchSession) {
  await twitchFetch("https://api.twitch.tv/helix/eventsub/subscriptions", session.accessToken, {
    method: "POST",
    body: JSON.stringify({
      type: "channel.chat.message",
      version: "1",
      condition: {
        broadcaster_user_id: session.userId,
        user_id: session.userId,
      },
      transport: { method: "websocket", session_id: sessionId },
    }),
  });
}

function connect(session: TwitchSession, url = "wss://eventsub.wss.twitch.tv/ws?keepalive_timeout_seconds=30") {
  const socket = new WebSocket(url);
  globalEventSub.crowdPulseSocket = socket;
  setConnection({ connecting: true, connected: false, listenerError: undefined });

  socket.on("message", async (raw) => {
    const data = JSON.parse(raw.toString()) as TwitchMessage;
    try {
      if (data.metadata.message_type === "session_welcome" && data.payload.session) {
        await subscribe(data.payload.session.id, session);
        setConnection({
          connecting: false,
          connected: true,
          broadcasterId: session.userId,
          broadcasterName: session.displayName,
          listenerError: undefined,
        });
      }

      if (
        data.metadata.message_type === "notification" &&
        data.metadata.subscription_type === "channel.chat.message" &&
        data.payload.event
      ) {
        const event = data.payload.event;
        ingestChat({
          id: event.message_id ?? data.metadata.message_id,
          userId: event.chatter_user_id,
          userName: event.chatter_user_name,
          message: event.message.text,
          timestamp: new Date().toISOString(),
        });
      }

      if (data.metadata.message_type === "session_reconnect" && data.payload.session?.reconnect_url) {
        connect(session, data.payload.session.reconnect_url);
      }

      if (data.metadata.message_type === "revocation") {
        setConnection({ connected: false, listenerError: "Twitch revoked the EventSub subscription." });
      }
    } catch (error) {
      setConnection({
        connected: false,
        connecting: false,
        listenerError: error instanceof Error ? error.message : "EventSub handling failed",
      });
    }
  });

  socket.on("close", () => {
    if (globalEventSub.crowdPulseSocket === socket) {
      setConnection({ connected: false, connecting: false });
    }
  });
  socket.on("error", (error) => {
    setConnection({ connected: false, connecting: false, listenerError: error.message });
  });
}

export async function startEventSub(session: TwitchSession) {
  if (!env.TWITCH_CLIENT_ID) throw new Error("TWITCH_CLIENT_ID is not configured");
  const validated = await validateToken(session.accessToken);
  if (validated.user_id !== session.userId) throw new Error("Twitch token user mismatch");
  if (!validated.scopes.includes("user:read:chat")) {
    throw new Error("The Twitch connection is missing the user:read:chat scope");
  }
  stopEventSub();
  setRuntimeSession(session);
  connect(session);
}

export function stopEventSub() {
  const socket = globalEventSub.crowdPulseSocket;
  globalEventSub.crowdPulseSocket = undefined;
  if (socket && socket.readyState < WebSocket.CLOSING) socket.close();
  setRuntimeSession(undefined);
  setConnection({ connected: false, connecting: false });
}

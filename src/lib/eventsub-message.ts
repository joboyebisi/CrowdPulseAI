import type { ChatSignal } from "@/lib/types";

export type EventSubChatEnvelope = {
  subscription: { type: string };
  event: {
    message_id: string;
    broadcaster_user_id: string;
    broadcaster_user_name: string;
    chatter_user_id: string;
    chatter_user_name: string;
    message: { text: string };
  };
};

export function parseEventSubChat(
  payload: EventSubChatEnvelope,
  options: { timestamp?: string; simulated?: boolean } = {},
): ChatSignal | null {
  if (payload.subscription.type !== "channel.chat.message") return null;
  const event = payload.event;
  if (!event?.message_id || !event.chatter_user_id || !event.message?.text) return null;
  return {
    id: event.message_id,
    userId: event.chatter_user_id,
    userName: event.chatter_user_name || "Twitch viewer",
    message: event.message.text,
    timestamp: options.timestamp ?? new Date().toISOString(),
    simulated: options.simulated,
  };
}

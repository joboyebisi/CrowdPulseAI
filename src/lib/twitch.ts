import { env } from "@/lib/env";
import type { TwitchSession } from "@/lib/types";

export const TWITCH_SCOPES = ["user:read:chat", "clips:edit"] as const;

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string[];
};

export async function exchangeCode(code: string): Promise<TokenResponse> {
  if (!env.TWITCH_CLIENT_ID || !env.TWITCH_CLIENT_SECRET) {
    throw new Error("Twitch OAuth is not configured");
  }

  const body = new URLSearchParams({
    client_id: env.TWITCH_CLIENT_ID,
    client_secret: env.TWITCH_CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
    redirect_uri: env.TWITCH_REDIRECT_URI,
  });
  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Twitch token exchange failed (${response.status})`);
  return response.json() as Promise<TokenResponse>;
}

export async function refreshTwitchSession(session: TwitchSession): Promise<TwitchSession> {
  if (!env.TWITCH_CLIENT_ID || !env.TWITCH_CLIENT_SECRET) {
    throw new Error("Twitch OAuth is not configured");
  }
  const body = new URLSearchParams({
    client_id: env.TWITCH_CLIENT_ID,
    client_secret: env.TWITCH_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: session.refreshToken,
  });
  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Reconnect Twitch to refresh your creator session");
  const token = await response.json() as TokenResponse;
  return {
    ...session,
    accessToken: token.access_token,
    refreshToken: token.refresh_token || session.refreshToken,
    expiresAt: Date.now() + token.expires_in * 1000,
    scopes: token.scope,
  };
}

export async function validateToken(accessToken: string) {
  const response = await fetch("https://id.twitch.tv/oauth2/validate", {
    headers: { Authorization: `OAuth ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Twitch access token validation failed");
  return response.json() as Promise<{
    client_id: string;
    login: string;
    scopes: string[];
    user_id: string;
    expires_in: number;
  }>;
}

export async function getCurrentUser(accessToken: string) {
  const response = await twitchFetch("https://api.twitch.tv/helix/users", accessToken);
  const payload = (await response.json()) as {
    data: Array<{ id: string; login: string; display_name: string }>;
  };
  const user = payload.data[0];
  if (!user) throw new Error("Twitch user profile was not returned");
  return user;
}

export async function twitchFetch(url: string, accessToken: string, init: RequestInit = {}) {
  if (!env.TWITCH_CLIENT_ID) throw new Error("TWITCH_CLIENT_ID is not configured");
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  headers.set("Client-Id", env.TWITCH_CLIENT_ID);
  if (init.body) headers.set("Content-Type", "application/json");
  const response = await fetch(url, { ...init, headers, cache: "no-store" });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Twitch API ${response.status}: ${detail.slice(0, 280)}`);
  }
  return response;
}

export async function createClip(session: TwitchSession) {
  const url = new URL("https://api.twitch.tv/helix/clips");
  url.searchParams.set("broadcaster_id", session.userId);
  const response = await twitchFetch(url.toString(), session.accessToken, { method: "POST" });
  const payload = (await response.json()) as { data: Array<{ id: string; edit_url: string }> };
  const clip = payload.data[0];
  if (!clip) throw new Error("Twitch did not return a clip ID");
  return clip;
}

export async function waitForClip(clipId: string, accessToken: string) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const url = new URL("https://api.twitch.tv/helix/clips");
    url.searchParams.set("id", clipId);
    const response = await twitchFetch(url.toString(), accessToken);
    const payload = (await response.json()) as {
      data: Array<{ id: string; url: string; thumbnail_url: string; title: string }>;
    };
    if (payload.data[0]) return payload.data[0];
  }
  throw new Error("Twitch clip was not ready after 15 seconds");
}
